'use client'

/**
 * AttachmentDropzone — drag-and-drop + click-to-browse + multi-file
 * uploader for intake attachments. Lives on top of
 * src/lib/intake-attachments.ts.
 *
 * The parent owns the intake_id and the list of existing attachments.
 * Drop fires `onUploadStart()` so the parent can ensure an intake
 * row exists (e.g. by saving a draft). The parent then passes the
 * resolved intake_id back via the prop.
 *
 * `readOnly` mode hides the dropzone and disables remove — used on
 * the manager intake view.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  FileType2,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  getSignedUrl,
  humanFileSize,
  listAttachments,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_INTAKE,
  removeAttachment,
  uploadAttachment,
  type IntakeAttachment,
} from '@/lib/intake-attachments'

interface UploadingItem {
  // Local-only id used while bytes are in flight.
  localId: string
  fileName: string
  fileSize: number
  status: 'uploading' | 'error'
  error?: string
}

interface Props {
  intakeId: string | null
  uploaderId: string | null
  /**
   * Called BEFORE upload starts when intakeId is null. Parent must
   * return a resolved intake id (typically by saving a draft on the
   * fly). Return null/undefined to abort the upload.
   */
  ensureIntakeId?: () => Promise<string | null>
  readOnly?: boolean
}

export default function AttachmentDropzone({
  intakeId,
  uploaderId,
  ensureIntakeId,
  readOnly = false,
}: Props) {
  const [items, setItems] = useState<IntakeAttachment[]>([])
  const [uploading, setUploading] = useState<UploadingItem[]>([])
  const [hovering, setHovering] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load existing attachments when an intake id is present.
  useEffect(() => {
    if (!intakeId) {
      setItems([])
      return
    }
    let cancelled = false
    listAttachments(intakeId).then((res) => {
      if (cancelled) return
      if (res.ok) setItems(res.items)
      else console.warn('[attachments] list failed:', res.error)
    })
    return () => {
      cancelled = true
    }
  }, [intakeId])

  const totalCount = items.length + uploading.length

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setBannerError(null)
      const arr = Array.from(files)
      if (arr.length === 0) return

      // Resolve / create an intake id if we don't have one yet.
      let activeIntakeId = intakeId
      if (!activeIntakeId && ensureIntakeId) {
        const resolved = await ensureIntakeId()
        if (!resolved) {
          setBannerError("Couldn't create a draft to attach files to. Try again.")
          return
        }
        activeIntakeId = resolved
      }
      if (!activeIntakeId) {
        setBannerError('No intake to attach to.')
        return
      }

      const remaining = Math.max(0, MAX_FILES_PER_INTAKE - totalCount)
      if (arr.length > remaining) {
        setBannerError(
          `You can only attach ${MAX_FILES_PER_INTAKE} files per intake. ${remaining} slot${
            remaining === 1 ? '' : 's'
          } left.`,
        )
      }
      const accepted = arr.slice(0, remaining)
      const oversized = accepted.filter((f) => f.size > MAX_FILE_SIZE_BYTES)
      if (oversized.length > 0) {
        setBannerError(
          `Skipped: ${oversized.map((f) => f.name).join(', ')} (over 25 MB).`,
        )
      }
      const queue = accepted.filter((f) => f.size <= MAX_FILE_SIZE_BYTES)

      // Optimistic placeholders.
      const placeholders: UploadingItem[] = queue.map((f) => ({
        localId: Math.random().toString(36).slice(2),
        fileName: f.name,
        fileSize: f.size,
        status: 'uploading',
      }))
      setUploading((prev) => [...prev, ...placeholders])

      // Upload in parallel — each finishes independently.
      await Promise.all(
        queue.map(async (file, i) => {
          const placeholder = placeholders[i]
          const result = await uploadAttachment(
            activeIntakeId!,
            file,
            uploaderId,
          )
          if (result.ok) {
            setUploading((prev) =>
              prev.filter((u) => u.localId !== placeholder.localId),
            )
            setItems((prev) => [...prev, result.item])
          } else {
            setUploading((prev) =>
              prev.map((u) =>
                u.localId === placeholder.localId
                  ? { ...u, status: 'error', error: result.error }
                  : u,
              ),
            )
          }
        }),
      )
    },
    [intakeId, ensureIntakeId, uploaderId, totalCount],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setHovering(false)
    if (readOnly) return
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files)
    // Reset so the same file can be picked again later.
    e.target.value = ''
  }

  const removeUploading = (localId: string) => {
    setUploading((prev) => prev.filter((u) => u.localId !== localId))
  }

  const removeItem = async (att: IntakeAttachment) => {
    setItems((prev) => prev.filter((x) => x.id !== att.id))
    const res = await removeAttachment(att)
    if (!res.ok) {
      // Rollback the optimistic remove on failure.
      setItems((prev) => [...prev, att])
      setBannerError(`Couldn't delete ${att.file_name}: ${res.error ?? 'unknown error'}`)
    }
  }

  const openInNewTab = async (att: IntakeAttachment) => {
    const res = await getSignedUrl(att.storage_path, 120)
    if (!res.ok) {
      setBannerError(`Couldn't generate download link: ${res.error}`)
      return
    }
    window.open(res.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setHovering(true)
          }}
          onDragLeave={() => setHovering(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          className={`group relative cursor-pointer rounded-xl border-2 border-dashed transition-colors px-5 py-6 text-center ${
            hovering
              ? 'border-coral-400 bg-coral-400/10'
              : 'border-white/15 hover:border-coral-400/50 hover:bg-coral-400/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={onBrowse}
            className="hidden"
          />
          <UploadCloud className={`mx-auto w-7 h-7 mb-2 ${hovering ? 'text-coral-400' : 'text-white/40 group-hover:text-coral-400'}`} />
          <p className="text-sm text-white font-semibold">
            Drop files here or click to browse
          </p>
          <p className="text-[11px] text-white/40 mt-1">
            Up to {MAX_FILES_PER_INTAKE} files · 25 MB each · photos, PDFs, docs
          </p>
        </div>
      )}

      {bannerError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{bannerError}</span>
        </div>
      )}

      {/* List */}
      {(items.length > 0 || uploading.length > 0) && (
        <ul className="space-y-1.5">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-navy/40 px-3 py-2"
            >
              <FileIcon mime={a.mime_type} fileName={a.file_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{a.file_name}</p>
                <p className="text-[11px] text-white/40">{humanFileSize(a.file_size)}</p>
              </div>
              <button
                type="button"
                onClick={() => openInNewTab(a)}
                className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeItem(a)}
                  className="p-1.5 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}

          {uploading.map((u) => (
            <li
              key={u.localId}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                u.status === 'error'
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-coral-400/30 bg-coral-400/5'
              }`}
            >
              {u.status === 'uploading' ? (
                <Loader2 className="w-4 h-4 text-coral-400 animate-spin flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{u.fileName}</p>
                <p className="text-[11px] text-white/40">
                  {humanFileSize(u.fileSize)}
                  {u.status === 'uploading' && ' · uploading…'}
                  {u.status === 'error' && ` · ${u.error ?? 'failed'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeUploading(u.localId)}
                className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FileIcon({
  mime,
  fileName,
}: {
  mime: string | null
  fileName: string
}) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const isImage = mime?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)
  const isPdf = mime === 'application/pdf' || ext === 'pdf'
  const Icon = isImage ? ImageIcon : isPdf ? FileText : FileType2
  return (
    <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-white/60" />
    </div>
  )
}
