import { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function PublicReportPage() {
  const { magic_link } = useParams()
  const [form, setForm] = useState({ title: '', description: '', contact_info: '', anonymous: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (form.anonymous) payload.contact_info = ''
      await api.post(`/reports/public/${magic_link}/`, payload)
      setSubmitted(true)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(messages.join(' | '))
      } else if (err.response?.status === 404) {
        setError('Invalid reporting link. Please check the URL.')
      } else {
        setError('Failed to submit report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Report Submitted</h2>
          <p className="text-gray-500 text-sm">
            Thank you for your report. It has been submitted confidentially and will be reviewed by the appropriate team.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Submit a Report</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your report will be handled confidentially. If you check "Anonymous", your contact information will not be stored.
        </p>
        {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="title" type="text" value={form.title} onChange={handleChange}
              required placeholder="Brief summary of the issue"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              name="description" value={form.description} onChange={handleChange}
              required placeholder="Describe the issue in detail..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" name="anonymous" id="anonymous"
              checked={form.anonymous} onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">Submit anonymously</label>
          </div>
          {!form.anonymous && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Contact Information</label>
              <input
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="contact_info" type="text" value={form.contact_info}
                onChange={handleChange} placeholder="Email or phone (optional)"
              />
            </div>
          )}
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition disabled:opacity-60"
            type="submit" disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}