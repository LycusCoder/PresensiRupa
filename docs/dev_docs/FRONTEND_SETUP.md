# 🚀 PresensiRupa Frontend Setup Guide

## Overview

Professional React TypeScript frontend untuk PresensiRupa Smart Attendance System dengan Tailwind CSS, Shadcn UI, dan best practices modern.

## ✨ Stack Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.2.0 |
| **Language** | TypeScript | 5.2.2 |
| **Build Tool** | Vite | 5.0.8 |
| **Styling** | Tailwind CSS | 3.3.6 |
| **UI Components** | Custom + Radix UI | Latest |
| **Routing** | React Router | 6.20.0 |
| **State Management** | Zustand | 4.4.1 |
| **Form Handling** | React Hook Form | 7.48.0 |
| **Validation** | Zod | 3.22.4 |
| **HTTP Client** | Axios | 1.6.2 |
| **Icons** | Lucide React | 0.293.0 |

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Reusable button component
│   │   │   ├── Input.tsx           # Reusable input component
│   │   │   └── index.ts
│   │   ├── Navbar.tsx              # Navigation bar with user info
│   │   └── index.ts
│   ├── pages/
│   │   ├── LoginPage.tsx           # Authentication
│   │   ├── RegisterPage.tsx        # User registration
│   │   ├── DashboardPage.tsx       # Main dashboard
│   │   ├── ProfilePage.tsx         # User profile management
│   │   ├── FaceRegistrationPage.tsx # Face registration (5 photos)
│   │   ├── CheckInPage.tsx         # Attendance check-in (3 photos)
│   │   └── AttendanceHistoryPage.tsx # Attendance records
│   ├── services/
│   │   └── api.ts                  # API client with interceptors
│   ├── stores/
│   │   └── auth.ts                 # Zustand auth store (persistent)
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.tsx                     # Main app component with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles + Tailwind
├── index.html
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS for Tailwind
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── .env.example                    # Environment variables template
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Create .env.local file
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:8001
EOF
```

### 3. Start Development Server

```bash
npm run dev
```

Server akan run di `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Design System

### Color Palette

**Primary Colors (Sky Blue):**
- primary-50: #f0f9ff
- primary-600: #0ea5e9 (Main)
- primary-700: #0369a1 (Hover)

**Secondary Colors (Slate):**
- secondary-50: #f8fafc
- secondary-600: #475569 (Text)
- secondary-700: #334155 (Dark text)

### Typography

- Font: Inter (dari Google Fonts)
- Headings: Bold, tracking-tight
- Body: Regular 400px
- Small: 500px untuk emphasis

### Components

#### Button

```tsx
import { Button } from '@/components/ui/Button'

// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
<Button variant="primary" size="md" isLoading={false}>
  Masuk
</Button>
```

#### Input

```tsx
import { Input } from '@/components/ui/Input'

<Input
  label="Username"
  placeholder="Masukkan username"
  error={errors.username?.message}
  helperText="Min 3 characters"
/>
```

## 🔐 Authentication Flow

### Login Page (`/masuk`)

1. User memasukkan username & password
2. Submit ke POST `/autentikasi/masuk`
3. Simpan token ke localStorage
4. Store di Zustand auth store
5. Redirect ke `/dashboard`

### Register Page (`/daftar`)

1. Form fields:
   - Required: nama_pengguna, kata_sandi, nama_depan, nama_belakang, id_karyawan, jabatan, alamat_surel, tanggal_masuk
   - Optional: nik, foto_ktp
2. Submit ke POST `/autentikasi/daftar`
3. Auto-login atau redirect ke `/masuk`

### Protected Routes

Semua routes kecuali `/masuk` dan `/daftar` memerlukan valid token.

```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 📱 Pages Description

### 1. **LoginPage** (`/masuk`)
- Form validation dengan Zod
- Error handling dengan user-friendly messages
- Responsive design (mobile-first)
- Link ke halaman register

### 2. **RegisterPage** (`/daftar`)
- Multi-field form dengan step-by-step
- Optional KTP upload dengan OCR note
- Confirmation & terms
- Link back to login

### 3. **DashboardPage** (`/dashboard`)
- Welcome greeting dengan user name
- Quick stats (Hadir hari ini, Total absen bulan ini, etc)
- Navigation cards ke fitur utama:
  - ✅ Check-In
  - 👤 Profil
  - 🎯 Daftar Wajah
  - 📊 Riwayat
- Admin notes display (jika ada)
- Status kehadiran badge

### 4. **ProfilePage** (`/profil`)
- Display user info (read-only atau editable)
- Edit form untuk optional fields
- Show face registration status
- Change password option
- Logout button

### 5. **FaceRegistrationPage** (`/daftar-wajah`)
- Camera capture / file upload untuk 5 photos
- Photo preview sebelum submit
- Progress indicator
- Success message dengan next steps
- Guide untuk foto yang baik

### 6. **CheckInPage** (`/absen`)
- Camera capture untuk 3 photos
- Photo preview
- Live countdown timer
- 2-of-3 matching validation
- Real-time feedback (jumlah_cocok)
- Anti-dobel warning jika sudah absen hari ini
- Success/failure animations

### 7. **AttendanceHistoryPage** (`/riwayat`)
- Table/list dengan columns: tanggal, jam, status (SUKSES/GAGAL), tipe_kehadiran
- Filters: date range, status
- Sorting: default by date DESC
- Monthly/weekly stats
- Export to CSV (optional)

## 🔌 API Integration

### API Client Setup

Axios instance dengan:
- Base URL: `http://localhost:8001`
- Auto Bearer token injection
- Error interceptor (401 → logout)
- Type-safe requests

```tsx
import { apiService } from '@/services/api'

// Login
const response = await apiService.login({ nama_pengguna, kata_sandi })

// Register
const user = await apiService.register(formData)

// Check-in
const result = await apiService.checkIn({ foto_1, foto_2, foto_3 })
```

## 🎯 State Management (Zustand)

```tsx
import { useAuthStore } from '@/stores/auth'

// In component
const { user, token, logout, setUser } = useAuthStore()

// Persist to localStorage automatically
```

### Auth Store Structure

```ts
{
  token: string | null
  user: Pengguna | null
  isLoading: boolean
  error: string | null
  
  // Methods
  setToken(token)
  setUser(user)
  logout()
  reset()
}
```

## 📝 Form Validation

Menggunakan React Hook Form + Zod untuk type-safe validation:

```tsx
const schema = z.object({
  nama_pengguna: z.string().min(3),
  kata_sandi: z.string().min(8),
})

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## 🖼️ Image Upload Handling

### Face Registration (5 Photos)

```tsx
const [files, setFiles] = useState<File[]>([])

const handleUpload = async () => {
  await apiService.registerFace(files)
}
```

### Check-In (3 Photos)

```tsx
const handleCheckIn = async (foto_1: File, foto_2: File, foto_3: File) => {
  const result = await apiService.checkIn({
    foto_1,
    foto_2,
    foto_3
  })
  // result.status: 'SUKSES' | 'GAGAL'
  // result.jumlah_cocok: 0-3
}
```

## 🎬 Camera Integration (untuk fase kedua)

Rekomendasi library:
- **react-webcam** - untuk web camera access
- **browser-image-compression** - compress sebelum upload
- **face-api.js** - client-side face detection + blink detection

## 🌙 Dark Mode (Optional)

Tailwind sudah support dark mode. Tinggal tambahkan di `tailwind.config.js`:

```js
darkMode: 'class'
```

## 🧪 Testing Strategy

Rekomendasi:
- **Vitest** - unit testing
- **React Testing Library** - component testing
- **Playwright** - e2e testing

```bash
npm install -D vitest @testing-library/react
```

## 📦 Building & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output → `dist/` folder

### Preview Build

```bash
npm run preview
```

### Deploy Options

1. **Vercel** (Recommended untuk React)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

3. **Docker** (untuk deploy same machine dengan backend)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 5173
   CMD ["npm", "run", "preview"]
   ```

## 🔍 Troubleshooting

### CORS Issues

Ensure backend memiliki CORS setup:

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
)
```

### Token Expiration

Auto-logout ketika 401 error:

```tsx
// services/api.ts
if (error.response?.status === 401) {
  localStorage.removeItem('token')
  window.location.href = '/masuk'
}
```

### Vite Proxy

Untuk local development dengan backend di port 8001:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  }
}
```

## 📱 Mobile Responsiveness

Built with mobile-first approach:

```tsx
<div className="hidden sm:block">
  Desktop only
</div>

<div className="sm:hidden">
  Mobile only
</div>

{/* Responsive text size */}
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive Title
</h1>
```

## 🚀 Next Phase TODO

- [ ] Implement all page components dengan full functionality
- [ ] Setup camera integration (react-webcam)
- [ ] Add blink detection untuk face registration
- [ ] Implement photo compression
- [ ] Add loading skeletons
- [ ] Setup error boundaries
- [ ] Add toast notifications (sonner/react-hot-toast)
- [ ] Implement PWA features (offline support)
- [ ] Add performance monitoring (Sentry)
- [ ] Setup CI/CD pipeline

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 👤 Author

Lycus - [GitHub](https://github.com/LycusCoder)

## 📄 License

MIT
