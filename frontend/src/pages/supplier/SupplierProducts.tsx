
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Package, Pencil, Plus, Trash2, X } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, Spinner } from '../../components/ui'
import { productsApi } from '../../api/products'
import { apiErrorMessage } from '../../api/client'
import { PRODUCT_CATEGORIES, type CreateProductRequest, type ProductCategory, type SupplierProductsCatalog } from '../../types'

const emptyForm: CreateProductRequest = {
  name: '',
  description: '',
  category: 'Other',
  price: 0,
  isActive: true,
}

export function SupplierProducts() {
  const [items, setItems] = useState<SupplierProductsCatalog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateProductRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    productsApi
      .listMine({ page: 1, pageSize: 50 })
      .then((r) => setItems(r.items))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your products.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setPhotoUrl(null)
    setPhotoError(null)
    setModalOpen(true)
  }

  const openEdit = async (id: string) => {
    setEditingId(id)
    setFormError(null)
    setPhotoUrl(null)
    setPhotoError(null)
    setModalOpen(true)
    try {
      const full = await productsApi.getById(id)
      setForm({
        name: full.name,
        description: full.description ?? '',
        category: full.category as ProductCategory,
        price: full.price,
        isActive: full.isActive,
      })
      setPhotoUrl(full.imageUrl)
    } catch (err) {
      setFormError(apiErrorMessage(err))
    }
  }

  const closeModal = () => setModalOpen(false)

  const handlePhotoFile = async (file: File) => {
    if (!editingId) return
    setPhotoError(null)
    setPhotoBusy(true)
    try {
      const updated = await productsApi.uploadPhoto(editingId, file)
      setPhotoUrl(updated.imageUrl)
      setItems((prev) => prev.map((p) => (p.id === editingId ? { ...p, imageUrl: updated.imageUrl } : p)))
    } catch (err) {
      setPhotoError(apiErrorMessage(err, 'Could not upload this photo.'))
    } finally {
      setPhotoBusy(false)
    }
  }

  const removePhoto = async () => {
    if (!editingId) return
    setPhotoError(null)
    setPhotoBusy(true)
    try {
      await productsApi.deletePhoto(editingId)
      setPhotoUrl(null)
      setItems((prev) => prev.map((p) => (p.id === editingId ? { ...p, imageUrl: null } : p)))
    } catch (err) {
      setPhotoError(apiErrorMessage(err, 'Could not remove this photo.'))
    } finally {
      setPhotoBusy(false)
    }
  }

  const submitForm = async () => {
    setFormError(null)
    if (!form.name.trim()) {
      setFormError('Product name is required.')
      return
    }
    if (form.price <= 0) {
      setFormError('Price must be greater than zero.')
      return
    }
    const descLen = form.description?.trim().length ?? 0
    if (descLen > 0 && (descLen < 50 || descLen > 800)) {
      setFormError('Description must be between 50 and 800 characters (or left empty).')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await productsApi.update(editingId, form)
      } else {
        await productsApi.create(form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not save this product.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await productsApi.remove(id)
      setItems((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete this product.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>My Products</h1>
          <p className={dash.pageSubtitle}>The bulk listings buyers see in the catalog under your company.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package size={32} strokeWidth={1.5} />}
          title="No products yet"
          body="Add your first bulk listing so buyers can find and order from you."
          action={
            <Button size="sm" onClick={openCreate} style={{ marginTop: '0.5rem' }}>
              <Plus size={15} /> Add Product
            </Button>
          }
        />
      ) : (
        <div className={dash.card}>
          <div className={dash.tableWrap}>
            <table className={dash.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: '3rem' }}>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.4rem', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '2.25rem',
                            height: '2.25rem',
                            borderRadius: '0.4rem',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Package size={16} color="var(--primary)" />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className={dash.chip}>{p.productCategory}</span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <div className={dash.tableActions}>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p.id)}>
                          <Pencil size={14} /> Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(p.id)} disabled={deletingId === p.id}>
                          {deletingId === p.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={dash.modalBackdrop} onClick={closeModal}>
          <div className={dash.modal} onClick={(e) => e.stopPropagation()}>
            <div className={dash.modalHeader}>
              <span className={dash.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</span>
              <button className={dash.modalCloseBtn} onClick={closeModal}>
                <X size={16} />
              </button>
            </div>

            {formError && <ErrorBanner message={formError} />}

            {editingId && (
              <div className={dash.formRow}>
                <label className={dash.formLabel}>Photo</label>
                {photoError && <ErrorBanner message={photoError} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Product"
                      style={{ width: '4.5rem', height: '4.5rem', borderRadius: '0.5rem', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '4.5rem',
                        height: '4.5rem',
                        borderRadius: '0.5rem',
                        background: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={22} color="var(--primary)" />
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoFile(file)
                      e.target.value = ''
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoBusy}
                  >
                    {photoBusy ? <Loader2 size={14} className="spin" /> : <ImagePlus size={14} />}
                    {photoUrl ? 'Replace' : 'Upload'}
                  </Button>
                  {photoUrl && (
                    <Button type="button" variant="danger" size="sm" onClick={removePhoto} disabled={photoBusy}>
                      <Trash2 size={14} /> Remove
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className={dash.formRow}>
              <label className={dash.formLabel}>Product Name</label>
              <input
                className={dash.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Recycled HDPE Pellets"
              />
            </div>

            <div className={dash.formRow}>
              <label className={dash.formLabel}>Description</label>
              <textarea
                className={dash.textarea}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description buyers will see"
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

            <div className={dash.formGrid2}>
              <div className={dash.formRow}>
                <label className={dash.formLabel}>Category</label>
                <select
                  className={dash.select}
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={dash.formRow}>
                <label className={dash.formLabel}>Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={dash.input}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className={dash.formRow}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Listing is active (visible to buyers)
              </label>
            </div>

            <div className={dash.modalActions}>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={submitForm} disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
