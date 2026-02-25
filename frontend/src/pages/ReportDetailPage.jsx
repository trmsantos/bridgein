import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

const STATUS_COLORS = {
  new: { background: '#dbeafe', color: '#1d4ed8' },
  in_review: { background: '#fef3c7', color: '#d97706' },
  resolved: { background: '#dcfce7', color: '#16a34a' },
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
      .then((res) => {
        setReport(res.data)
        setStatus(res.data.status)
      })
      .catch(() => setError('Failed to load report.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (!report) return <div style={{ padding: '2rem' }}>Report not found.</div>

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>BridgeIn</h1>
        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
      </header>

      <main style={styles.main}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.reportTitle}>{report.title}</h2>
            <span style={{ ...styles.badge, ...STATUS_COLORS[report.status] }}>
              {report.status.replace('_', ' ')}
            </span>
          </div>

          <div style={styles.meta}>
            <span>{report.anonymous ? '🔒 Anonymous' : '👤 Identified'}</span>
            <span>Submitted: {new Date(report.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(report.updated_at).toLocaleString()}</span>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionLabel}>Description</h3>
            <p style={styles.description}>{report.description}</p>
          </div>

          {!report.anonymous && report.contact_info && (
            <div style={styles.section}>
              <h3 style={styles.sectionLabel}>Contact Information</h3>
              <p style={styles.description}>{report.contact_info}</p>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionLabel}>Update Status</h3>
            <form onSubmit={handleStatusUpdate} style={styles.statusForm}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.select}
              >
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
              <button style={styles.button} type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Status'}
              </button>
            </form>
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
  backLink: { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.875rem' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  success: { background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' },
  reportTitle: { margin: 0, fontSize: '1.25rem', color: '#111827' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize', whiteSpace: 'nowrap' },
  meta: { display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1.5rem', flexWrap: 'wrap' },
  section: { borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem', marginTop: '1.25rem' },
  sectionLabel: { margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  description: { margin: 0, color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  statusForm: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  select: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' },
  button: { padding: '0.5rem 1rem', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.875rem', cursor: 'pointer' },
}
