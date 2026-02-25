import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', company_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password, form.company_name)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(messages.join(' | '))
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 flex-col items-center justify-center p-12 text-white">
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-4xl font-bold mb-4">BridgeIn</h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
            Set up your company's confidential reporting channel in minutes.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {['Free to get started', 'Unique reporting link per company', 'Full manager dashboard'].map((item) => (
            <div key={item} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <span className="text-green-300 text-lg">✓</span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">BridgeIn</h1>
            <p className="text-gray-500 text-sm mt-1">Secure whistleblowing platform</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
              <p className="text-gray-500 text-sm mt-1">Get started — it only takes a minute</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm flex items-center gap-2">
                <span></span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Company Name</label>
                <input
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="company_name" type="text" value={form.company_name}
                  onChange={handleChange} required placeholder="Acme Corp"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <input
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="username" type="text" value={form.username}
                  onChange={handleChange} required autoFocus placeholder="your_username"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="email" type="email" value={form.email}
                  onChange={handleChange} required placeholder="you@company.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="password" type="password" value={form.password}
                  onChange={handleChange} required placeholder="••••••••"
                />
              </div>
              <button
                className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                type="submit" disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}