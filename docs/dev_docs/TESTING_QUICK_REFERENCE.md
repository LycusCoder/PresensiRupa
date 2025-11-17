# 🎯 Quick Testing Reference Card

## 📝 Test Accounts (Ready to Use!)

```
═════════════════════════════════════════════════════════════
                    TEST CREDENTIALS
═════════════════════════════════════════════════════════════

1️⃣  ADMIN
   Username: admin
   Password: admin123
   Role: Administrator

2️⃣  JOHN (IT)
   Username: john_doe
   Password: john123
   Role: Software Engineer

3️⃣  JANE (Marketing)
   Username: jane_smith
   Password: jane123
   Role: Marketing Manager

4️⃣  BOB (HR)
   Username: bob_wilson
   Password: bob123
   Role: HR Specialist

5️⃣  ALICE (Student)
   Username: alice_chen
   Password: alice123
   Role: Mahasiswa

═════════════════════════════════════════════════════════════
```

## 🚀 Quick Start

```bash
# Terminal 1: Start everything
./dev.sh          # Linux/macOS
dev.bat          # Windows

# Then open browser
Frontend:  http://localhost:5173
Backend:   http://localhost:8000/docs
```

## ✅ Quick Test Cases

### Test 1: Login & Logout (5 min)
```
1. Open http://localhost:5173
2. Input: admin / admin123
3. Click "Masuk"
4. ✅ Should redirect to /dashboard
5. Click "Keluar"
6. ✅ Should redirect to /masuk
```

### Test 2: Protected Routes (3 min)
```
1. Clear localStorage (or open incognito)
2. Try to open http://localhost:5173/dashboard
3. ✅ Should redirect to /masuk
```

### Test 3: Token Persistence (3 min)
```
1. Login with any account
2. Refresh page (F5)
3. ✅ Should still be logged in
4. Check browser console: localStorage has token
```

### Test 4: Different Users (5 min)
```
1. Login with admin
2. Check navbar shows "Admin System"
3. Logout
4. Login with john_doe
5. Check navbar shows "John Doe"
```

### Test 5: Wrong Password (2 min)
```
1. Input: admin / wrongpassword
2. ✅ Should show error message
3. ✅ Should stay on login page
```

## 🔌 API Test (via Swagger)

```
1. Open http://localhost:8000/docs

2. Test Login:
   - Find: POST /autentikasi/masuk
   - Body: {"nama_pengguna": "admin", "kata_sandi": "admin123"}
   - ✅ Should get access_token

3. Test Profile:
   - Click "Authorize" button
   - Paste token
   - Find: GET /profil/saya
   - ✅ Should get user profile
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot GET /" | Frontend not running on 5173 |
| Login doesn't work | Backend not running on 8000 |
| Invalid token | Token expired (8 hours), re-login |
| 401 Unauthorized | Token missing/expired, re-login |
| "Username not found" | Use correct username (case-sensitive) |

## 📂 Key Files

```
insert_test_accounts.py    ← Create test users
TESTING_GUIDE.md          ← Full testing guide
frontend/src/pages/LoginPage.tsx  ← Login UI
app/api/autentikasi.py    ← Login backend
```

## 🎓 Next Steps After Basic Testing

- [ ] Implement RegisterPage
- [ ] Test registration
- [ ] Implement DashboardPage
- [ ] Implement ProfilePage
- [ ] Add camera integration
- [ ] Test face registration
- [ ] Test check-in

---

**Ready?** Start with `./dev.sh` and test login! 🚀

For detailed testing guide, see: `TESTING_GUIDE.md`
