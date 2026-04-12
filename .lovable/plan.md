

## Plan: Foto Finish Module (Revisado)

### Summary
Add a "Foto Finish" section to the reservation detail page with private storage, strict ownership validation, and clear provisional UI states.

---

### 1. Database Migration

```sql
-- Photo metadata table
CREATE TABLE public.reserva_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reserva_photos ENABLE ROW LEVEL SECURITY;

-- RLS: owner-scoped access only
CREATE POLICY "Owner select" ON public.reserva_photos FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY "Owner insert" ON public.reserva_photos FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON public.reserva_photos FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- PRIVATE bucket (public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('finish-photos', 'finish-photos', false);

-- Storage policies: scoped to profile_id path prefix
CREATE POLICY "Upload own photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Read own photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Delete own photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

Key change vs previous plan: **Bucket is private**. Storage policies enforce that users can only access files under their own `{profile_id}/` prefix.

---

### 2. Backend: `panel-crud` Updates

Four new actions. **All validate reserva ownership** by checking `profile_id` on the `reservas` table before proceeding:

- **`list-reserva-photos`**: Validates `reserva.profile_id === verified`, queries `reserva_photos`, generates **signed URLs** (60 min expiry) for each photo via `supabase.storage.from('finish-photos').createSignedUrl()`.
- **`add-reserva-photo`**: Validates ownership + max 5 photos check, inserts metadata row. The actual file upload happens client-side via Supabase Storage SDK (which respects RLS policies).
- **`delete-reserva-photo`**: Validates ownership of both the reserva and the photo record, deletes storage object + metadata row.
- **`send-finish-photos`**: Validates ownership, checks photos exist. Returns `{ success: true, pending: "email_integration" }`. Pure stub — no email sent.

---

### 3. New Component: `FotoFinishSection.tsx`

Located in `src/components/reserva/FotoFinishSection.tsx`.

**Visibility rule**: Only rendered when `reserva.status === 'confirmada'`. This is documented as provisional — when a dedicated "completada"/"finalizada" status is added later, the condition will update. A code comment will mark this explicitly.

Features:
- **Upload**: File input (jpeg/png/webp, max 5MB). Client uploads directly to `finish-photos/{profile_id}/{reserva_id}/{uuid}.ext` via Supabase Storage SDK. Then calls `add-reserva-photo` to register metadata.
- **Thumbnails**: Grid using signed URLs from `list-reserva-photos`. Each has a delete button with confirmation.
- **"Enviar Fotos" button**: Visually present but with a clear badge/label: **"Próximamente"** or **"Envío no disponible aún"**. Clicking shows an informational toast: "El envío por email se activará en una próxima actualización." No ambiguity about current capability.
- **Empty state**: Camera icon + "Sube las fotos de la sesión".

---

### 4. Integration into `ReservaDetailPage.tsx`

Insert `FotoFinishSection` between internal notes and actions footer. Conditionally rendered only for `status === 'confirmada'` with a comment documenting the provisional nature.

---

### 5. Fix Runtime Error

Fix `<SelectItem value="">` in `ReservasPage.tsx` — change to `value="none"`.

---

### 6. Files Changed

| File | Change |
|---|---|
| DB migration | `reserva_photos` table + private `finish-photos` bucket + scoped RLS/storage policies |
| `supabase/functions/panel-crud/index.ts` | 4 new actions with ownership validation + signed URLs |
| `src/components/reserva/FotoFinishSection.tsx` | NEW — upload, signed-URL thumbnails, delete, stub send |
| `src/pages/ReservaDetailPage.tsx` | Import and render FotoFinishSection (confirmada only) |
| `src/pages/ReservasPage.tsx` | Fix SelectItem empty value bug |

### Storage Structure

```text
finish-photos/          (PRIVATE bucket)
  {profile_id}/
    {reserva_id}/
      {uuid}.jpg
```

Access: signed URLs generated server-side, valid 60 minutes.

### What stays provisional (clearly marked)

- **Visibility**: Tied to `confirmada` status — needs a proper post-game status in the future.
- **Email sending**: Stub only. UI explicitly says "Próximamente".
- **Photo watermarking/branding**: Not included.

