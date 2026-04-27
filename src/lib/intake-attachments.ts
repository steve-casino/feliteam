'use client'

/**
 * Intake attachments — files uploaded by Reps with a baby intake.
 * Backed by:
 *   - Supabase Storage bucket `intake-attachments` (private)
 *   - `intake_attachments` table for metadata
 *
 * Storage path: <intake_id>/<random>-<sanitized_filename>
 * Downloads go through short-lived signed URLs.
 */

import { getSupabase } from '@/lib/supabase/client'

export const INTAKE_ATTACHMENT_BUCKET = 'intake-attachments'
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB
export const MAX_FILES_PER_INTAKE = 20

export interface IntakeAttachment {
  id: string
  intake_id: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string | null
  uploaded_by: string | null
  uploaded_at: string
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  // Keep extension, replace anything weird with underscores.
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

function randomKey(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

function buildStoragePath(intakeId: string, fileName: string) {
  return `${intakeId}/${randomKey()}-${sanitizeFilename(fileName)}`
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ──────────────────────────────────────────────────────────────────
// CRUD
// ──────────────────────────────────────────────────────────────────

export async function listAttachments(
  intakeId: string
): Promise<{ ok: true; items: IntakeAttachment[] } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('intake_attachments')
      .select('*')
      .eq('intake_id', intakeId)
      .order('uploaded_at', { ascending: true })
    if (error) throw error
    return { ok: true, items: (data ?? []) as IntakeAttachment[] }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to list' }
  }
}

export async function uploadAttachment(
  intakeId: string,
  file: File,
  uploaderId: string | null
): Promise<{ ok: true; item: IntakeAttachment } | { ok: false; error: string }> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: `${file.name} is larger than 25 MB.` }
  }

  const supabase = getSupabase()
  const path = buildStoragePath(intakeId, file.name)

  // 1. Upload bytes.
  const { error: uploadErr } = await supabase.storage
    .from(INTAKE_ATTACHMENT_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
  if (uploadErr) {
    return { ok: false, error: uploadErr.message }
  }

  // 2. Record metadata.
  const { data: row, error: insertErr } = await supabase
    .from('intake_attachments')
    .insert({
      intake_id: intakeId,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
      uploaded_by: uploaderId,
    })
    .select('*')
    .single()
  if (insertErr) {
    // Try to clean up the orphaned object so we don't leak storage.
    await supabase.storage.from(INTAKE_ATTACHMENT_BUCKET).remove([path])
    return { ok: false, error: insertErr.message }
  }

  return { ok: true, item: row as IntakeAttachment }
}

export async function removeAttachment(
  attachment: Pick<IntakeAttachment, 'id' | 'storage_path'>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    const { error: storageErr } = await supabase.storage
      .from(INTAKE_ATTACHMENT_BUCKET)
      .remove([attachment.storage_path])
    if (storageErr) {
      // Continue — even if the bytes are gone we still want to clear the row.
      console.warn('[attachments] storage remove failed:', storageErr.message)
    }
    const { error: dbErr } = await supabase
      .from('intake_attachments')
      .delete()
      .eq('id', attachment.id)
    if (dbErr) throw dbErr
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}

/**
 * Issue a short-lived signed URL so the file can be downloaded /
 * previewed in the browser. Default lifetime: 60 seconds.
 */
export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds = 60
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.storage
      .from(INTAKE_ATTACHMENT_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds)
    if (error || !data?.signedUrl) {
      throw error ?? new Error('No URL returned')
    }
    return { ok: true, url: data.signedUrl }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Sign failed' }
  }
}
