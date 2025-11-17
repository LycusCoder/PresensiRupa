# ✅ Vite Environment Setup - `process.env` to `import.meta.env`

## 🐛 Problem
When running the frontend with Vite, got this error:
```
Uncaught ReferenceError: process is not defined
    <anonymous> api.ts:4
```

**Cause**: Using `process.env` in browser code. `process` is a Node.js global that doesn't exist in browsers.

---

## ✅ Solution

### 1. Changed api.ts to use Vite's environment system
**Before** (❌ Wrong for Vite):
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8001'
```

**After** (✅ Correct for Vite):
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
```

### 2. Created Type Definition File
File: `frontend/src/vite-env.d.ts`
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

This tells TypeScript about `import.meta.env` so there are no type errors.

### 3. Created Environment Files

#### Development (`.env`)
```bash
VITE_API_URL=http://localhost:8001
```
Used when running `npm run dev` locally.

#### Production (`.env.production`)
```bash
VITE_API_URL=/api
```
Used when running `npm run build` for production. The `/api` route will be proxied to the backend.

#### Example (`.env.example`)
```bash
VITE_API_URL=http://localhost:8001
```
Template for team members to know what variables are needed.

### 4. Updated `.gitignore`
Added `.env` to the gitignore so local environment files don't get committed:
```
node_modules/
dist/
.env           ← Added this
.env.local
.DS_Store
*.log
```

---

## 📚 How Vite Environment Variables Work

### Development
When you run `npm run dev`:
1. Vite loads `.env` file
2. Vite replaces `import.meta.env.VITE_API_URL` at build time
3. Browser receives: `http://localhost:8001`

### Production
When you run `npm run build`:
1. Vite loads `.env.production` file
2. Vite replaces `import.meta.env.VITE_API_URL` at build time
3. Browser receives: `/api` (proxied to backend)

### Important Rules
- **All variables must start with `VITE_`** for Vite to expose them
- Non-VITE variables are not exposed (for security)
- Changes to `.env` files require restarting `npm run dev`

---

## ✨ Variable Naming Convention

| Environment | API_URL | Usage |
|------------|---------|-------|
| Local Development | `http://localhost:8001` | Direct backend calls |
| Production | `/api` | Proxied requests |

**Proxy in Vite Config** (`vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8001',
      changeOrigin: true,
      rewrite: (pathStr) => pathStr.replace(/^\/api/, ''),
    },
  },
}
```

---

## 🧪 Testing

### Test 1: Development
```bash
npm run dev
# Should see: "Local: http://localhost:5173"
# Should connect to "http://localhost:8001" for API
```

### Test 2: Production Build
```bash
npm run build
# Should succeed without errors
# API calls will use "/api" proxy
```

### Test 3: Type Checking
```bash
npm run type-check
# Should pass without errors about import.meta.env
```

---

## 📝 Files Changed

| File | Change | Status |
|------|--------|--------|
| `src/services/api.ts` | Changed `process.env` → `import.meta.env` | ✅ |
| `src/vite-env.d.ts` | Created type definition | ✅ |
| `.env` | Created development environment | ✅ |
| `.env.production` | Created production environment | ✅ |
| `.gitignore` | Added `.env` to ignored files | ✅ |

---

## 🎓 Key Takeaways

1. **Vite uses `import.meta.env`**, not `process.env`
2. **All env vars must start with `VITE_`** to be exposed
3. **Separate `.env` and `.env.production`** for different environments
4. **Create `vite-env.d.ts`** for TypeScript support
5. **Don't commit `.env` files** (add to `.gitignore`)

---

## 📖 Further Reading

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [import.meta Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
- [Node.js vs Browser API differences](https://vitejs.dev/guide/ssr.html#node-globals)

---

**Status**: ✅ COMPLETE  
**Tested**: ✅ YES (Services running successfully)  
**Ready for Commit**: ✅ YES
