import {z} from 'zod';

export const MAX_RESUME_BYTES = 3 * 1024 * 1024;
export const MAX_APPLICATION_BYTES = MAX_RESUME_BYTES + 32 * 1024;
export const CAREERS_CONSENT_VERSION = 'careers-2026-09-20';
export const careersApplicationSchema = z.object({
  jobId: z.uuid(),
  requestKey: z.uuid(),
  name: z.string().trim().min(2).max(150),
  email: z.email().trim().max(254).transform(v => v.toLowerCase()),
  consent: z.literal('yes'),
  website: z.literal(''),
}).strict();

export interface PublicJob {
  id: string; business_id: string; slug: string; title: string;
  location: string; employment_type: string; description: string;
  requirements: string; openings: number;
}

// An explicit projection protects against an accidentally expanded RPC response.
export function publicJob(row: Record<string, unknown>): PublicJob {
  return {
    id: String(row.id), business_id: String(row.business_id), slug: String(row.slug),
    title: String(row.title), location: String(row.location || ''),
    employment_type: String(row.employment_type || ''), description: String(row.description || ''),
    requirements: String(row.requirements || ''), openings: Number(row.openings),
  };
}

export function validateResume(bytes: Uint8Array, type: string): string | null {
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES) return 'Choose a PDF resume smaller than 3 MB.';
  if (type !== 'application/pdf' || new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') return 'The resume must be a PDF file.';
  // Basic format checking only. Files remain private and are served as downloads.
  if (!new TextDecoder().decode(bytes.slice(-2048)).includes('%%EOF')) return 'The PDF appears incomplete. Export it again and retry.';
  return null;
}

export async function readBoundedBody(request: Request, max: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > max) throw new Error('BODY_TOO_LARGE');
  if (!request.body) throw new Error('EMPTY_BODY');
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > max) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
      parts.push(part.value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}
