import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

const STATUS_COLORS = {
  new: { background: '#dbeafe', color: '#1d4ed8' },
  in_review: { background: '#fef3c7', color: '#d97706' },
  resolved: { background: '#dcfce7', color: '#16a34a' },
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/reports/'),
      api.get('/companies/me/'),
    ])
      .then(([reportsRes, companyRes]) => {
        setReports(reportsRes.data)
        setCompany(companyRes.data)
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const reportingUrl = company
    ? `${window.location.origin}/report/${company.magic_link}`
    : ''

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>BridgeIn</h1>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>👤 {user?.username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        {company && (
          <div style={styles.companyCard}>
            <h2 style={styles.companyName}>{company.name}</h2>
            <p style={styles.magicLinkLabel}>Employee Reporting Link:</p>
            <div style={styles.magicLinkBox}>
              <a href={reportingUrl} target="_blank" rel="noopener noreferrer" style={styles.magicLink}>
                {reportingUrl}
              </a>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Reports ({reports.length})</h2>
          {loading && <p>Loading reports...</p>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading && reports.length === 0 && (
            <div style={styles.empty}>
              <p>No reports yet. Share your reporting link with employees to get started.</p>
            </div>
          )}
          <div style={styles.reportsList}>
            {reports.map((report) => (
              <Link key={report.id} to={`/dashboard/reports/${report.id}`} style={styles.reportCard}>
                <div style={styles.reportHeader}>
                  <span style={styles.reportTitle}>{report.title}</span>
                  <span style={{ ...styles.badge, ...STATUS_COLORS[report.status] }}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={styles.reportDesc}>{report.description.substring(0, 120)}{report.description.length > 120 ? '...' : ''}</p>
                <div style={styles.reportMeta}>
                  <span>{report.anonymous ? '🔒 Anonymous' : '👤 Identified'}</span>
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' },
  header: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  logo: { margin: 0, fontSize: '1.5rem', color: '#1d4ed8' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userInfo: { fontSize: '0.875rem', color: '#6b7280' },
  logoutBtn: { padding: '0.375rem 0.75rem', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' },
  companyCard: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  companyName: { margin: '0 0 1rem', fontSize: '1.25rem', color: '#111827' },
  magicLinkLabel: { margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' },
  magicLinkBox: { background: '#f3f4f6', padding: '0.75rem', borderRadius: '4px', wordBreak: 'break-all' },
  magicLink: { color: '#1d4ed8', fontSize: '0.875rem', textDecoration: 'none' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1.125rem', color: '#111827' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#6b7280' },
  reportsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  reportCard: { display: 'block', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  reportTitle: { fontWeight: '600', fontSize: '0.95rem', color: '#111827' },
  badge: { padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', textTransform: 'capitalize' },
  reportDesc: { margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' },
  reportMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' },
}
