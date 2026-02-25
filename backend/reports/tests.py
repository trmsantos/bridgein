from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from companies.models import Company
from reports.models import Report


def create_company_and_manager(username, company_name, password='TestPass123!', email=''):
    """Helper to create a company and an associated manager user."""
    company = Company.objects.create(name=company_name)
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        company=company,
    )
    return company, user


class TenantIsolationTest(TestCase):
    """
    Critical security tests: managers must only see reports from their own company.
    """

    def setUp(self):
        self.client = APIClient()
        self.company_a, self.manager_a = create_company_and_manager(
            'manager_a', 'Company A', email='a@example.com'
        )
        self.company_b, self.manager_b = create_company_and_manager(
            'manager_b', 'Company B', email='b@example.com'
        )
        self.report_a = Report.objects.create(
            company=self.company_a,
            title='Report for A',
            description='Details for company A',
        )
        self.report_b = Report.objects.create(
            company=self.company_b,
            title='Report for B',
            description='Details for company B',
        )

    def _authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_manager_sees_only_own_company_reports_in_list(self):
        """Manager A must only see Company A reports in the list."""
        self._authenticate(self.manager_a)
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [r['id'] for r in response.data]
        self.assertIn(self.report_a.id, ids)
        self.assertNotIn(self.report_b.id, ids)

    def test_manager_cannot_access_other_company_report_detail(self):
        """Manager A must not be able to access Company B's report."""
        self._authenticate(self.manager_a)
        response = self.client.get(f'/api/reports/{self.report_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_manager_cannot_update_other_company_report(self):
        """Manager A must not be able to update Company B's report status."""
        self._authenticate(self.manager_a)
        response = self.client.patch(
            f'/api/reports/{self.report_b.id}/',
            {'status': 'resolved'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_user_cannot_list_reports(self):
        """Unauthenticated requests to the reports list must be rejected."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PublicReportSubmissionTest(TestCase):
    """
    Tests for the public anonymous report submission endpoint.
    """

    def setUp(self):
        self.client = APIClient()
        self.company, _ = create_company_and_manager('manager_c', 'Company C')

    def test_submit_report_with_valid_magic_link(self):
        """Submitting a report with a valid magic link must succeed."""
        url = f'/api/reports/public/{self.company.magic_link}/'
        payload = {
            'title': 'Test Report',
            'description': 'Something suspicious happened.',
            'anonymous': True,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.filter(company=self.company).count(), 1)

    def test_submit_report_with_invalid_magic_link(self):
        """Submitting a report with an invalid magic link must return 404."""
        url = '/api/reports/public/00000000-0000-0000-0000-000000000000/'
        payload = {
            'title': 'Test Report',
            'description': 'Something suspicious happened.',
            'anonymous': True,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_report_is_linked_to_correct_company(self):
        """Report submitted via magic link must be linked to the correct company."""
        url = f'/api/reports/public/{self.company.magic_link}/'
        payload = {
            'title': 'Linked Report',
            'description': 'Checking company assignment.',
            'anonymous': False,
            'contact_info': 'reporter@example.com',
        }
        self.client.post(url, payload, format='json')
        report = Report.objects.get(title='Linked Report')
        self.assertEqual(report.company, self.company)

    def test_default_status_is_new(self):
        """Newly submitted reports must have status 'new' by default."""
        url = f'/api/reports/public/{self.company.magic_link}/'
        payload = {
            'title': 'Status Test',
            'description': 'Checking default status.',
            'anonymous': True,
        }
        self.client.post(url, payload, format='json')
        report = Report.objects.get(title='Status Test')
        self.assertEqual(report.status, Report.STATUS_NEW)

    def test_submit_report_missing_required_fields(self):
        """Submitting a report without required fields must return 400."""
        url = f'/api/reports/public/{self.company.magic_link}/'
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticationTest(TestCase):
    """
    Tests for user registration and authentication.
    """

    def setUp(self):
        self.client = APIClient()

    def test_register_creates_user_and_company(self):
        """Registering a manager must create both a user and a company."""
        payload = {
            'username': 'newmanager',
            'email': 'new@example.com',
            'password': 'StrongPass123!',
            'company_name': 'New Company',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newmanager').exists())
        self.assertTrue(Company.objects.filter(name='New Company').exists())
        user = User.objects.get(username='newmanager')
        self.assertIsNotNone(user.company)

    def test_login_returns_tokens(self):
        """Valid credentials must return access and refresh JWT tokens."""
        User.objects.create_user(
            username='loginuser',
            password='TestPass123!',
            company=Company.objects.create(name='Login Corp'),
        )
        response = self.client.post('/api/auth/token/', {
            'username': 'loginuser',
            'password': 'TestPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_with_wrong_password_fails(self):
        """Wrong credentials must return 401."""
        User.objects.create_user(
            username='badlogin',
            password='CorrectPass123!',
            company=Company.objects.create(name='Bad Corp'),
        )
        response = self.client.post('/api/auth/token/', {
            'username': 'badlogin',
            'password': 'WrongPassword!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReportStatusUpdateTest(TestCase):
    """
    Tests for managers updating report status.
    """

    def setUp(self):
        self.client = APIClient()
        self.company, self.manager = create_company_and_manager(
            'status_manager', 'Status Corp', email='status@example.com'
        )
        self.report = Report.objects.create(
            company=self.company,
            title='Status Report',
            description='Testing status update.',
        )

    def test_manager_can_update_report_status(self):
        """Manager must be able to update a report status to in_review."""
        self.client.force_authenticate(user=self.manager)
        response = self.client.patch(
            f'/api/reports/{self.report.id}/',
            {'status': 'in_review'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'in_review')

    def test_manager_can_resolve_report(self):
        """Manager must be able to mark a report as resolved."""
        self.client.force_authenticate(user=self.manager)
        response = self.client.patch(
            f'/api/reports/{self.report.id}/',
            {'status': 'resolved'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'resolved')
