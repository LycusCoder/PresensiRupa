# 🔧 Fix Error Lokal - PresensiRupa

## ❌ Error yang Muncul:

```
Failed to resolve import "@/lib/utils" from "src/pages/LoginPage.tsx"
Expected ")" but found "persist" di auth.ts:23
```

---

## ✅ Solusi:

### 1. Fix Typo di `auth.ts`

Buka file: `frontend/src/stores/auth.ts`

**Cari line 23:**
```typescript
export const useAuthStore = create<AuthState>()(n  persist(
```

**Ganti menjadi:**
```typescript
export const useAuthStore = create<AuthState>()(persist(
```

(Hapus "n  " di depan "persist")

---

### 2. Buat File `utils.ts`

Buat folder dan file: `frontend/src/lib/utils.ts`

**Isi lengkapnya:**

```typescript
import { AxiosError } from 'axios'
import { ApiError } from '@/types'

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined
    
    if (data?.detail) {
      // Handle string detail
      if (typeof data.detail === 'string') {
        return data.detail
      }
      
      // Handle array detail (validation errors)
      if (Array.isArray(data.detail)) {
        return data.detail
          .map(err => err.msg)
          .join(', ')
      }
    }
    
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Terjadi kesalahan yang tidak diketahui'
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Format time to HH:MM
 */
export function formatTime(time: string): string {
  return time.substring(0, 5)
}

/**
 * Combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  
  if (statusLower.includes('sukses') || statusLower.includes('hadir')) {
    return 'bg-green-100 text-green-800 border-green-200'
  }
  
  if (statusLower.includes('gagal') || statusLower.includes('tidak')) {
    return 'bg-red-100 text-red-800 border-red-200'
  }
  
  if (statusLower.includes('pending') || statusLower.includes('menunggu')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200'
}
```

---

### 3. Pastikan File `.env` Ada

Buat/cek file: `frontend/.env`

```env
VITE_API_URL=http://localhost:8001
```

---

## 🚀 Setelah Fix:

1. **Stop semua service** (jalankan `scripts\kill.ps1`)
2. **Restart backend & frontend** (jalankan `scripts\dev.ps1`)
3. **Buka browser**: http://localhost:5173

---

## 📁 Struktur yang Harus Ada:

```
frontend/
├── .env                        ← Harus ada
├── src/
│   ├── lib/
│   │   └── utils.ts           ← File baru ini
│   ├── stores/
│   │   └── auth.ts            ← Fix typo di line 23
│   ├── pages/
│   │   └── LoginPage.tsx      ← Import dari @/lib/utils
│   └── components/
│       └── ui/
│           ├── Button.tsx     ← Import dari @/lib/utils
│           └── Input.tsx      ← Import dari @/lib/utils
```

---

## ✅ Setelah Fix, Error Akan Hilang!

Kalau masih ada error, pastikan:
- Folder `src/lib/` sudah ada
- File `utils.ts` ada di dalamnya
- Typo di `auth.ts` sudah diperbaiki
- Service sudah di-restart

---

**Happy Coding! 🚀**
