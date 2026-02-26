import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

const STATUS_CLASSES = {
  new: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

const STATUS_LABEL = {
  new: 'New',
  in_review: 'In Review',
  resolved: 'Resolved',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/reports/'), api.get('/companies/me/')])
      .then(([reportsRes, companyRes]) => {
        setReports(reportsRes.data)
        setCompany(companyRes.data)
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const reportingUrl = company ? `${window.location.origin}/report/${company.magic_link}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(reportingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'new').length,
    in_review: reports.filter(r => r.status === 'in_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <h1 className="text-xl font-bold text-blue-700">Report APP</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
            <span className="text-gray-500 text-xs">👤</span>
            <span className="text-gray-700 text-sm font-medium">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Company card + reporting link */}
        {company && (
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Your Company</p>
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-blue-100 text-sm mt-1">Share the link below with your employees</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 flex-1 min-w-0 max-w-lg">
                <p className="text-blue-200 text-xs mb-2 font-semibold uppercase tracking-wider">Reporting Link</p>
                <div className="flex items-center gap-2">
                  <a
                    href={reportingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:underline truncate flex-1"
                  >
                    {reportingUrl}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-white' },
            { label: 'New', value: stats.new, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'In Review', value: stats.in_review, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-700', bg: 'bg-green-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl shadow-sm border border-gray-100 p-4 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Reports list */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Reports</h2>
          {loading && <p className="text-gray-400 text-sm">Loading reports...</p>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          {!loading && reports.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-600 font-medium">No reports yet</p>
              <p className="text-gray-400 text-sm mt-1">Share your reporting link with employees to get started.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={`/dashboard/reports/${report.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all block group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition">{report.title}</span>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASSES[report.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[report.status] || report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                  {report.description.substring(0, 130)}{report.description.length > 130 ? '...' : ''}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{report.anonymous ? ' Anonymous' : 'Identified'}</span>
                  <span> {new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}