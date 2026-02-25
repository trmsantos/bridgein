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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-500 text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Report Submitted</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Thank you for your report. It has been submitted confidentially and will be reviewed by the appropriate team.
          </p>
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-400">
            🔒 Your report is protected and handled with full confidentiality.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-700 rounded-xl mb-3">
            <span className="text-white text-xl"></span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Submit a Confidential Report</h1>
          <p className="text-gray-500 text-sm mt-1">Your identity is protected. Reports are handled with full confidentiality.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                name="title" type="text" value={form.title}
                onChange={handleChange} required placeholder="Brief summary of the issue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[140px] resize-y"
                name="description" value={form.description}
                onChange={handleChange} required placeholder="Describe the issue in detail..."
              />
            </div>

            {/* Anonymous toggle */}
            <div
              onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
              className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${
                form.anonymous
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.anonymous ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.anonymous ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Submit anonymously</p>
                <p className="text-xs text-gray-500">Your contact information will not be stored</p>
              </div>
            </div>

            {!form.anonymous && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Contact Information <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="contact_info" type="text" value={form.contact_info}
                  onChange={handleChange} placeholder="Email or phone number"
                />
              </div>
            )}

            <button
              className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit" disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : '🔒 Submit Report Securely'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by <span className="font-semibold text-blue-600">BridgeIn</span> · EU Whistleblowing Directive compliant
        </p>
      </div>
    </div>
  )
}