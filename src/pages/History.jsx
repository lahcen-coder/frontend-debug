import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAnalysisStore } from '../store/analysisStore'
import { Clock, ChevronRight, Zap, AlertCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const statusBadge = { completed: 'green', failed: 'rose', processing: 'amber', pending: 'slate' }
const sourceLabel = { instagram_json: 'Instagram', whatsapp_txt: 'WhatsApp' }

export default function History() {
  const { analyses, fetchAnalyses } = useAnalysisStore()

  useEffect(() => { fetchAnalyses() }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis History</h1>
          <p className="text-slate-400 text-sm mt-1">All your past relationship reports</p>
        </div>
        <Link to="/analyze">
          <Button>+ New analysis</Button>
        </Link>
      </div>

      {!analyses.length ? (
        <div className="card text-center py-16">
          <Clock size={36} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">No analyses yet.</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">Upload your first conversation to get started.</p>
          <Link to="/analyze"><Button>Start your first analysis</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <Link
              key={a.id}
              to={a.status === 'completed' ? `/dashboard/${a.id}` : '#'}
              className={`flex items-center gap-4 p-4 card hover:border-brand-500/30 transition-all group ${a.status !== 'completed' ? 'opacity-60 cursor-default' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-rose-500/20 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white text-sm truncate">{a.contact_label || 'Analysis'}</p>
                  <Badge color={statusBadge[a.status] || 'slate'}>{a.status}</Badge>
                  <Badge color="blue">{sourceLabel[a.source_type] || a.source_type}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {a.message_count?.toLocaleString()} messages •{' '}
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </p>
              </div>
              {a.status === 'completed' && <ChevronRight size={18} className="text-slate-600 group-hover:text-brand-400 transition-colors" />}
              {a.status === 'processing' && <Loader2 size={18} className="text-amber-400 animate-spin" />}
              {a.status === 'failed' && <AlertCircle size={18} className="text-rose-400" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
