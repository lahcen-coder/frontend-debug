import { useState, useRef } from 'react'
import { Upload, FileArchive, FileText, X } from 'lucide-react'

export default function UploadZone({ onFileReady }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const inputRef = useRef()

  const accept = (f) => {
    if (!f) return
    const isZip = f.name.endsWith('.zip') || f.type === 'application/zip'
    const isTxt = f.name.endsWith('.txt') || f.type === 'text/plain'
    if (!isZip && !isTxt) return
    const type = isZip ? 'instagram' : 'whatsapp'
    setFile({ file: f, type })
    onFileReady({ file: f, type })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    accept(e.dataTransfer.files[0])
  }

  const clear = () => { setFile(null); onFileReady(null) }

  return (
    <div>
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragging ? 'border-brand-500 bg-brand-500/10' : 'border-white/15 hover:border-brand-500/50 hover:bg-white/3'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" className="hidden" accept=".zip,.txt" onChange={(e) => accept(e.target.files[0])} />
          <Upload size={36} className="mx-auto text-slate-500 mb-3" />
          <p className="font-semibold text-slate-300 text-lg">Drop your chat export here</p>
          <p className="text-slate-500 text-sm mt-1">Instagram <span className="text-slate-600">(.zip)</span> or WhatsApp <span className="text-slate-600">(.txt)</span></p>
          <p className="mt-4 text-xs text-slate-600">Parsed 100% in your browser — your file never leaves your device</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 glass rounded-2xl">
          {file.type === 'instagram'
            ? <FileArchive size={28} className="text-brand-400 shrink-0" />
            : <FileText size={28} className="text-emerald-400 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{file.file.name}</p>
            <p className="text-xs text-slate-400 capitalize">{file.type} export • {(file.file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={clear} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 glass rounded-xl text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-1">Instagram</p>
          Settings → Your activity → Download your information → JSON format → Request download → Upload the ZIP
        </div>
        <div className="p-3 glass rounded-xl text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-1">WhatsApp</p>
          Open the chat → ⋮ → More → Export chat → Without media → Upload the .txt file
        </div>
      </div>
    </div>
  )
}
