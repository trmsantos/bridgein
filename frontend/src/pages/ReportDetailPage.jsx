import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

const STATUS_CLASSES = {
  new: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function ReportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get(`/reports/${id}/`)
      .then((res) => { setReport(res.data); setStatus(res.data.status) })
      .catch(() => setError('Failed to load report.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await api.patch(`/reports/${id}/`, { status })
      setReport((prev) => ({ ...prev, status: res.data.status }))
      setSuccess('Status updated successfully.')
    } catch {
      setError('Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>
  if (!report) return <div className="p-8 text-gray-500">Report not found.</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">BridgeIn</h1>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4 text-sm">{success}</div>}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{report.title}</h2>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLASSES[report.status] || 'bg-gray-100 text-gray-600'}`}>
              {report.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-6">
            <span>{report.anonymous ? '🔒 Anonymous' : '👤 Identified'}</span>
            <span>Submitted: {new Date(report.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(report.updated_at).toLocaleString()}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{report.description}</p>
          </div>

          {!report.anonymous && report.contact_info && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Contact Information</h3>
              <p className="text-gray-700 text-sm">{report.contact_info}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status} onChange={(e) => setStatus(e.target.value)}
              >
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded text-sm transition disabled:opacity-60"
                type="submit" disabled={saving}
              >
                {saving ? 'Saving...' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}