'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export type UpdateNameState = { ok: boolean; message: string } | null

const MAX_NAME_LENGTH = 50

export async function updateName(
  _prev: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  // Validasi session di server — action ini endpoint publik, bukan cuma UI.
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const raw = formData.get('name')
  const name = typeof raw === 'string' ? raw.trim() : ''
  if (name.length === 0) return { ok: false, message: 'Nama tidak boleh kosong' }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, message: `Nama maksimal ${MAX_NAME_LENGTH} karakter` }
  }

  await prisma.user.update({ where: { id: sessionUser.id }, data: { name } })
  revalidatePath('/profile')
  return { ok: true, message: 'Nama berhasil diperbarui' }
}
