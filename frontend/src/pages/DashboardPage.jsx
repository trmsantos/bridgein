import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

const STATUS_CLASSES = {
  new: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">BridgeIn</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👤 {user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {company && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{company.name}</h2>
            <p className="text-sm text-gray-500 mb-2">Employee Reporting Link:</p>
            <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <a
                href={reportingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline break-all"
              >
                {reportingUrl}
              </a>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports ({reports.length})</h2>
          {loading && <p className="text-gray-500">Loading reports...</p>}
          {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded text-sm mb-4">{error}</div>}
          {!loading && reports.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>No reports yet. Share your reporting link with employees to get started.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={`/dashboard/reports/${report.id}`}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{report.title}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLASSES[report.status] || 'bg-gray-100 text-gray-600'}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {report.description.substring(0, 120)}{report.description.length > 120 ? '...' : ''}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
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