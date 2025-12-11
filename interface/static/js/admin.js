async function postJSON(url, body, token){
  return fetch(url, {method:'POST', headers: Object.assign({'Content-Type':'application/json'}, token?{'X-Admin-Token':token}:{}) , body: JSON.stringify(body)}).then(r=>r.json().catch(()=>({ok:false})))
}


// Show/hide panels based on auth
function showPanel(loggedIn) {
  document.getElementById('admin-login-card').classList.toggle('hidden', loggedIn);
  document.getElementById('admin-panel').classList.toggle('hidden', !loggedIn);
}

async function handleLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();
  const status = document.getElementById('admin-login-status');
  status.textContent = 'Logging in...';
  const res = await postJSON('/admin/login', {username:user, password:pass});
  if(res && res.ok){
    localStorage.setItem('admin_token', res.token);
    status.textContent = 'Login sukses';
    showPanel(true);
    loadDocs(res.token);
    loadStudents(res.token);
  } else {
    status.textContent = 'Login gagal: ' + (res.message||'');
  }
}

document.getElementById('btn-admin-login').addEventListener('click', handleLogin);


async function loadDocs(token){
  const status = document.getElementById('api-docs');
  status.textContent = 'Loading docs...';
  try{
    const r = await fetch('/admin/docs', { headers: {'X-Admin-Token': token} });
    const j = await r.json();
    status.innerHTML = '<pre>' + JSON.stringify(j, null, 2) + '</pre>';
  }catch(e){ status.textContent = 'Failed to load docs'; }
}

// Load students and show in table
async function loadStudents(token){
  const tbody = document.getElementById('students-tbody');
  if(!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400">Loading...</td></tr>';
  try{
    const r = await fetch('/api/data/students', token ? { headers: {'X-Admin-Token': token} } : {});
    const list = await r.json();
    tbody.innerHTML = '';
    if(!Array.isArray(list) || !list.length){
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400">Belum ada data</td></tr>';
      return;
    }
    for(const s of list){
      // Check if student has face encodings (registered)
      let registered = 'Belum';
      if(s.encodings_count && s.encodings_count > 0) registered = 'Sudah';
      tbody.innerHTML += `<tr>
        <td class="px-4 py-2 text-sm text-gray-900">${s.nim||''}</td>
        <td class="px-4 py-2 text-sm text-gray-900">${s.nama||''}</td>
        <td class="px-4 py-2 text-sm text-gray-900">${s.semester||''}</td>
        <td class="px-4 py-2 text-sm text-gray-900">${s.kelas||''}</td>
        <td class="px-4 py-2 text-sm text-gray-900">${s.jurusan||''}</td>
        <td class="px-4 py-2 text-sm">${registered}</td>
      </tr>`;
    }
  }catch(e){
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-400">Gagal memuat data</td></tr>';
  }
}

// create student

document.getElementById('btn-create-student').addEventListener('click', async ()=>{
  const nim = document.getElementById('s-nim').value.trim();
  const nama = document.getElementById('s-nama').value.trim();
  const semester = document.getElementById('s-semester').value.trim();
  const kelas = document.getElementById('s-kelas').value.trim();
  const jurusan = document.getElementById('s-jurusan').value.trim();
  const status = document.getElementById('create-status');
  status.textContent = 'Creating...';
  if(!nim || !nama){ status.textContent = 'NIM dan Nama required'; return; }
  const token = localStorage.getItem('admin_token');
  const res = await postJSON('/api/register/data', {nim, nama, semester, kelas, jurusan}, token);
  if(res && res.ok){
    status.textContent = 'Created: ' + res.nim;
    document.getElementById('s-nim').value = '';
    document.getElementById('s-nama').value = '';
    document.getElementById('s-semester').value = '';
    document.getElementById('s-kelas').value = '';
    document.getElementById('s-jurusan').value = '';
    loadStudents(token);
  } else status.textContent = 'Create failed: ' + (res.message||JSON.stringify(res));
});


// Logout
document.getElementById('btn-logout').addEventListener('click', ()=>{
  localStorage.removeItem('admin_token');
  showPanel(false);
});

// On load, check token
window.addEventListener('DOMContentLoaded', ()=>{
  const t = localStorage.getItem('admin_token');
  if(t){
    showPanel(true);
    loadDocs(t);
    loadStudents(t);
  }else{
    showPanel(false);
  }
});
