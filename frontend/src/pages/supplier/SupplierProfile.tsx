import { useEffect, useRef, useState } from 'react'
import { FileUp, Save } from 'lucide-react'
import { FileText, FileUp, Save } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, ErrorBanner, GradeBadge, Spinner, VerifiedPill } from '../../components/ui'
import { suppliersApi } from '../../api/suppliers'
import { apiErrorMessage } from '../../api/client'
import { INDUSTRIES, type Industry, type SupplierDetailsResponse, type UpdateSupplierRequest } from '../../types'

export function SupplierProfile() {
  const [profile, setProfile] = useState<SupplierDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateSupplierRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    suppliersApi
      .getMyProfile()
      .then((p) => {
        setProfile(p)
        setForm({
          companyName: p.companyName,
          industry: p.industry,
          description: p.description ?? '',
          email: p.email,
          phone: p.phone ?? '',
        })
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your profile.')))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!form) return
    setError(null)
    setSaved(false)
    
    
    const descLen = form.description?.trim().length ?? 0
    if (descLen > 0 && (descLen < 50 || descLen > 800)) {
      setError('Description must be between 50 and 800 characters (or left empty).')
      return
    }
    if (form.phone && form.phone.trim() && !/^\+[1-9]\d{1,14}$/.test(form.phone.trim())) {
      setError('Phone must be in international format with no spaces, e.g. +77771234567.')
      return
    }


    setSaving(true)
    try {
      const updated = await suppliersApi.updateMyProfile(form)
      setProfile(updated)
      setSaved(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your profile.'))
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    try {
      await suppliersApi.uploadCertificate(file)
      setUploadedName(file.name)
    } catch (err) {
      setUploadError(apiErrorMessage(err, 'Could not upload this file.'))
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <Spinner />
  if (!form) return <ErrorBanner message={error ?? 'Profile unavailable.'} />

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Company Profile</h1>
          <p className={dash.pageSubtitle}>Keep your company details current — buyers see this on your listing page.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className={dash.grid2}>
        <div className={dash.card}>
          <div className={dash.cardHeader}>
            <span className={dash.cardTitle}>Company Details</span>
          </div>

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
              <label className={dash.formLabel}>Phone</label>
              <input
                className={dash.input}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+77771234567"
              />
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Optional — international format, no spaces (e.g. +77771234567).
              </span>
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

          <div className={dash.formRow}>
            <label className={dash.formLabel}>Description</label>
            <textarea
              className={dash.textarea}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does your company make or supply?"
            />
            <span
              style={{
                fontSize: '0.76rem',
                marginTop: '0.3rem',
                color:
                  (form.description?.trim().length ?? 0) > 0 &&
                  ((form.description?.trim().length ?? 0) < 50 || (form.description?.trim().length ?? 0) > 800)
                    ? '#b91c1c'
                    : 'var(--text-muted)',
              }}
            >
              Optional — if filled in, must be 50–800 characters ({form.description?.trim().length ?? 0} now).
            </span>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>GreenRatio Status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <GradeBadge grade={profile?.esgGrade} size="lg" />
              <div>
                <div style={{ fontWeight: 700 }}>{profile?.totalEsgScore != null ? profile.totalEsgScore : 'Not scored yet'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest ESG score</div>
              </div>
            </div>
            <VerifiedPill verified={profile?.isVerified ?? false} />
          </div>

          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>Certification</span>
            </div>
            <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Upload a sustainability certificate (PDF) to support your ESG questionnaire and speed up admin
              verification.
            </p>

            {uploadError && <ErrorBanner message={uploadError} />}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading} full>
              <FileUp size={15} /> {uploading ? 'Uploading…' : 'Upload Certificate PDF'}
            </Button>
            {uploadedName && (
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.6rem', fontWeight: 600 }}>
                Uploaded: {uploadedName}
              </p>
            )}

            {profile && (
              
                href={suppliersApi.certificateUrl(profile.id)}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem', textDecoration: 'none' }}
              >
                <FileText size={14} /> View current certificate on file
              </a>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
