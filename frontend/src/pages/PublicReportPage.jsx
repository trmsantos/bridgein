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
      if (form.anonymous) {
        payload.contact_info = ''
      }
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
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Report Submitted</h2>
          <p style={styles.successText}>
            Thank you for your report. It has been submitted confidentially and will be reviewed by the appropriate team.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Submit a Report</h1>
        <p style={styles.intro}>
          Your report will be handled confidentially. If you check "Anonymous", your contact information will not be stored.
        </p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Title <span style={styles.required}>*</span></label>
            <input
              style={styles.input}
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Brief summary of the issue"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description <span style={styles.required}>*</span></label>
            <textarea
              style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Describe the issue in detail..."
            />
          </div>
          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="anonymous"
                checked={form.anonymous}
                onChange={handleChange}
                style={styles.checkbox}
              />
              Submit anonymously
            </label>
          </div>
          {!form.anonymous && (
            <div style={styles.field}>
              <label style={styles.label}>Contact Information (optional)</label>
              <input
                style={styles.input}
                name="contact_info"
                type="text"
                value={form.contact_info}
                onChange={handleChange}
                placeholder="Your email or phone number"
              />
            </div>
          )}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '1rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '560px' },
  title: { margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#111827' },
  intro: { margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
  required: { color: '#dc2626' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' },
  checkboxField: { display: 'flex', alignItems: 'center' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#374151', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  button: { padding: '0.625rem', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  successIcon: { width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem', fontWeight: 'bold' },
  successTitle: { textAlign: 'center', margin: '0 0 1rem', fontSize: '1.25rem', color: '#111827' },
  successText: { textAlign: 'center', color: '#6b7280', lineHeight: '1.6', margin: 0 },
}
