# PresensiRupa Frontend - Professional React Application 🚀

## Overview

Complete React TypeScript frontend untuk PresensiRupa Smart Attendance System dengan design system profesional menggunakan Tailwind CSS dan modern component architecture.

## Stack

- **Framework**: React 18.2.0 + TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8 (lightning-fast bundling)
- **Styling**: Tailwind CSS 3.3.6 + PostCSS
- **Routing**: React Router DOM 6.20.0
- **State Management**: Zustand 4.4.1
- **Form Handling**: React Hook Form 7.48.0
- **Validation**: Zod 3.22.4
- **HTTP Client**: Axios 1.6.2
- **UI Components**: Custom + Radix UI
- **Icons**: Lucide React 0.293.0

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx         # Reusable button (variants: primary/secondary/ghost/danger)
│   │   │   ├── Input.tsx          # Reusable input dengan label & error
│   │   │   └── index.ts
│   │   ├── Navbar.tsx             # Navigation bar dengan user info
│   │   └── index.ts
│   ├── pages/
│   │   ├── LoginPage.tsx          # /masuk - Authentication
│   │   ├── RegisterPage.tsx       # /daftar - User registration
│   │   ├── DashboardPage.tsx      # /dashboard - Main dashboard
│   │   ├── ProfilePage.tsx        # /profil - User profile management
│   │   ├── FaceRegistrationPage.tsx # /daftar-wajah - Register 5 face photos
│   │   ├── CheckInPage.tsx        # /absen - Attendance check-in
│   │   └── AttendanceHistoryPage.tsx # /riwayat - Attendance records
│   ├── services/
│   │   └── api.ts                 # Axios API client with auto token injection
│   ├── stores/
│   │   └── auth.ts                # Zustand auth store (persistent localStorage)
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces & types
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn, formatDate, getStatusBadgeColor)
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind directives
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration with proxy
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # TypeScript for build files
├── tailwind.config.js             # Tailwind customization
├── postcss.config.js              # PostCSS for Tailwind
├── package.json                   # Dependencies
├── .gitignore
├── .env.example                   # Environment variables template
└── FRONTEND_SETUP.md              # Detailed frontend documentation
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local if backend is on different URL
```

### 3. Start Development Server

```bash
npm run dev
```

Server: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview production build locally
```

## 🎨 Design System

### Colors

**Primary** (Sky Blue)
- 50: #f0f9ff
- 600: #0ea5e9 (Main CTA button)
- 700: #0369a1 (Hover state)

**Secondary** (Slate - Text & Borders)
- 50: #f8fafc
- 200: #e2e8f0 (Light borders)
- 600: #475569 (Body text)
- 900: #0f172a (Dark text)

### Components

#### Button Component

```tsx
<Button 
  variant="primary"      // primary | secondary | ghost | danger
  size="md"             // sm | md | lg
  isLoading={false}
  onClick={handleClick}
>
  Click Me
</Button>
```

Variants:
- **primary**: Blue button for main actions
- **secondary**: Light gray for secondary actions
- **ghost**: Text-only for less important actions
- **danger**: Red for destructive actions

#### Input Component

```tsx
<Input
  label="Username"
  placeholder="Masukkan username"
  type="text"
  error={errors.username?.message}  // Show error if exists
  helperText="Min 3 characters"
/>
```

### Typography

- Font Family: Inter (from Google Fonts)
- Headings: Bold with tracking-tight
- Body: Regular 400
- Labels: Medium 500

## 🔐 Authentication Flow

### Login Page (`/masuk`)

1. Form dengan username & password
2. Validasi dengan Zod schema
3. Submit ke `POST /autentikasi/masuk`
4. Store token di localStorage
5. Save user ke Zustand auth store
6. Redirect ke `/dashboard`

### Register Page (`/daftar`)

1. Multi-field form:
   - **Required**: username, password, name, employee ID, position, email, hire date
   - **Optional**: NIK, KTP photo
2. Submit ke `POST /autentikasi/daftar` (form-data)
3. Auto-login atau redirect to login

### Protected Routes

All routes except `/masuk` & `/daftar` require valid JWT token:

```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 📱 Pages Detail

### 1. LoginPage (`/masuk`)
- Username + password form
- Client-side validation (Zod)
- Error messages dalam bahasa Indonesia
- Link ke halaman register
- Responsive design (mobile-first)

### 2. RegisterPage (`/daftar`) 
*[Skeleton - To be implemented]*
- Multi-step registration form
- Optional KTP upload
- Confirmation page
- Success message

### 3. DashboardPage (`/dashboard`)
*[Skeleton - To be implemented]*
Features:
- Welcome greeting dengan user name
- Quick stats (Today's check-in, Monthly total, etc)
- Navigation cards ke fitur utama
- Display admin notes jika ada
- Status badge

### 4. ProfilePage (`/profil`)
*[Skeleton - To be implemented]*
Features:
- Display user information
- Edit form untuk optional fields
- Face registration status
- Change password
- Logout button

### 5. FaceRegistrationPage (`/daftar-wajah`)
*[Skeleton - To be implemented]*
Features:
- Upload/capture 5 photos
- Preview sebelum submit
- Progress indicator
- Success message

### 6. CheckInPage (`/absen`)
*[Skeleton - To be implemented]*
Features:
- Upload/capture 3 photos
- Preview
- Live countdown
- Real-time feedback (jumlah_cocok)
- Anti-dobel warning
- Success/failure animation

### 7. AttendanceHistoryPage (`/riwayat`)
*[Skeleton - To be implemented]*
Features:
- Table dengan attendance records
- Columns: date, time, status, type
- Filters & sorting
- Monthly statistics
- Export to CSV (optional)

## 🔌 API Integration

### API Client

```tsx
import { apiService } from '@/services/api'

// Auto-inject Bearer token
// Auto-logout on 401
// Type-safe requests

await apiService.login({ nama_pengguna, kata_sandi })
await apiService.register(formData)
await apiService.registerFace(files)
await apiService.checkIn({ foto_1, foto_2, foto_3 })
await apiService.getAttendanceHistory()
```

### State Management

```tsx
import { useAuthStore } from '@/stores/auth'

const { user, token, logout, setUser } = useAuthStore()

// Automatically persisted to localStorage
```

## 📝 Form Validation

React Hook Form + Zod untuk type-safe validation:

```tsx
const schema = z.object({
  nama_pengguna: z.string().min(3, 'Min 3 chars'),
  kata_sandi: z.string().min(8),
})

const { register, formState: { errors }, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

## 🎬 Future Enhancements

### Phase 2 - Camera Integration
- [ ] react-webcam untuk live camera
- [ ] browser-image-compression
- [ ] face-api.js untuk blink detection
- [ ] Real-time face detection feedback

### Phase 3 - Advanced Features
- [ ] Dark mode support
- [ ] PWA support (offline capability)
- [ ] Toast notifications (sonner)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Performance monitoring (Sentry)

### Phase 4 - Production
- [ ] E2E testing (Playwright)
- [ ] Unit testing (Vitest)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] CDN deployment

## 📋 Development Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Utilities
npm install              # Install dependencies
npm update               # Update packages
```

## 🌐 Deployment

### Vercel (Recommended for Frontend)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Docker

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

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend memiliki CORSMiddleware
- Check vite.config.ts proxy settings

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run type-check
npm install --save-dev @types/node
```

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Vite](https://vitejs.dev)

## 👤 Author

**Lycus** - [@LycusCoder](https://github.com/LycusCoder)

## 📄 License

MIT License
