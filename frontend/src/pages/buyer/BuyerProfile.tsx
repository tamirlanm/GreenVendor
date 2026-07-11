import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, ErrorBanner, Spinner } from '../../components/ui'
import { buyersApi } from '../../api/buyers'
import { apiErrorMessage } from '../../api/client'
import { INDUSTRIES, type Industry, type UpdateBuyerRequest } from '../../types'

const GRADE_OPTIONS = ['', 'A', 'B', 'C', 'D', 'F']

export function BuyerProfile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateBuyerRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    buyersApi
      .getMyProfile()
      .then((p) =>
        setForm({
          companyName: p.companyName,
          industry: p.industry,
          email: p.email,
          preferredMinGrade: p.preferredMinGrade ?? '',
        }),
      )
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your profile.')))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!form) return
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      await buyersApi.updateMyProfile(form)
      setSaved(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your profile.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (!form) return <ErrorBanner message={error ?? 'Profile unavailable.'} />

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Company Profile</h1>
          <p className={dash.pageSubtitle}>Set your sourcing preferences to tailor the catalog to your needs</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className={dash.card} style={{ maxWidth: '32rem' }}>
        <div className={dash.formRow}>
          <label className={dash.formLabel}>Company Name</label>
          <input
            className={dash.input}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>

        <div className={dash.formGrid2}>
          <div className={dash.formRow}>
            <label className={dash.formLabel}>Industry</label>
            <select
              className={dash.select}
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value as Industry })}
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div className={dash.formRow}>
            <label className={dash.formLabel}>Preferred Minimum Grade</label>
            <select
              className={dash.select}
              value={form.preferredMinGrade ?? ''}
              onChange={(e) => setForm({ ...form, preferredMinGrade: e.target.value })}
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g || 'No preference'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={dash.formRow}>
          <label className={dash.formLabel}>Contact Email</label>
          <input
            type="email"
            className={dash.input}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {saved && (
          <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Profile saved.
          </p>
        )}

        <Button onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
