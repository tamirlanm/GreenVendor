import { useEffect, useState } from 'react'
import { Loader2, Package, Pencil, Plus, Trash2, X } from 'lucide-react'
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
    setModalOpen(true)
  }

  const openEdit = async (id: string) => {
    setEditingId(id)
    setFormError(null)
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
    } catch (err) {
      setFormError(apiErrorMessage(err))
    }
  }

  const closeModal = () => setModalOpen(false)

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
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
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
