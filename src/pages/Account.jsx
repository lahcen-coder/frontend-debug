import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { Download, Trash2, CreditCard, User } from 'lucide-react'

export default function Account() {
  const { user, logout } = useAuthStore()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/account/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'debug-together-data.json'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Export failed.') }
    finally { setExporting(false) }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await api.post('/billing/portal')
      window.location.href = res.data.data.url
    } catch { toast.error('Could not open billing portal.') }
    finally { setPortalLoading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete('/account')
      toast.success('Account deleted.')
      logout()
    } catch { toast.error('Could not delete account.') }
    finally { setDeleting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <h1 className="text-2xl font-bold text-white">Account Settings</h1>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <User size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <p><span className="text-slate-500">Name:</span> {user?.name}</p>
          <p><span className="text-slate-500">Email:</span> {user?.email}</p>
          <p><span className="text-slate-500">Plan:</span> {user?.plan?.name || 'Free'}</p>
        </div>
      </Card>

      {/* Billing */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">Billing</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Manage your subscription, payment method, and invoices via the Stripe Customer Portal.</p>
        <Button variant="secondary" loading={portalLoading} onClick={handlePortal}>
          Open billing portal →
        </Button>
      </Card>

      {/* GDPR / Data */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Download size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">Your Data (GDPR)</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Download a copy of all the data we hold about you, or delete your account and all associated data permanently.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" loading={exporting} onClick={handleExport}>
            <Download size={14} /> Export my data
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} /> Delete account
          </Button>
        </div>
      </Card>

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <p className="text-sm text-slate-400 mb-4">This will <strong className="text-white">permanently</strong> delete your account, all your analyses, and all insights. This cannot be undone.</p>
        <div className="flex gap-2">
          <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>Yes, delete everything</Button>
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}
