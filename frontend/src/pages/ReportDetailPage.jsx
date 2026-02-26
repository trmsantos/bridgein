import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <span className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm">Loading report...</span>
      </div>
    </div>
  )

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-4xl mb-3"></p>
        <p className="text-gray-600 font-medium">Report not found.</p>
        <Link to="/dashboard" className="text-blue-600 text-sm hover:underline mt-2 block">← Back to Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl"></span>
          <h1 className="text-xl font-bold text-blue-700">Report APP</h1>
        </div>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <span></span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <span>✓</span> {success}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">{report.title}</h2>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_CLASSES[report.status] || 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABEL[report.status] || report.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                {report.anonymous ? ' Anonymous' : 'Identified'}
              </span>
              <span>Submitted: {new Date(report.created_at).toLocaleString()}</span>
              <span> Updated: {new Date(report.updated_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Contact info */}
          {!report.anonymous && report.contact_info && (
            <div className="p-6 border-b border-gray-100 bg-blue-50/40">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
              <p className="text-gray-700 text-sm">{report.contact_info}</p>
            </div>
          )}

          {/* Update status */}
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="flex items-center gap-3">
              <select
                className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="new">🔵 New</option>
                <option value="in_review">🟡 In Review</option>
                <option value="resolved">🟢 Resolved</option>
              </select>
              <button
                className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Update Status'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}