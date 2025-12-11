// Render Data Mahasiswa table on Data Mahasiswa page
function renderMahasiswaTable() {
  const tbody = document.querySelector('section[x-show="currentPage === \'page-data\'"] tbody');
  if (!tbody) return;
  fetch('/api/data/students')
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-gray-400">Tidak ada data mahasiswa</td></tr>';
        return;
      }
      data.forEach(m => {
        const status = m.has_encoding ? 'Sudah' : 'Belum';
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">${m.nim}</td>
            <td class="px-6 py-4 whitespace-nowrap">${m.nama}</td>
            <td class="px-6 py-4 whitespace-nowrap">${m.semester || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${m.kelas || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${m.jurusan || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button class="btn-outline text-xs">Detail</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-red-400">Gagal memuat data</td></tr>';
      console.error('Gagal fetch mahasiswa:', err);
    });
}

// Auto render table when Data Mahasiswa page is shown
window.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  // Render mahasiswa table if present
  if(document.querySelector('section[x-show="currentPage === \'page-data\'"] tbody')){
    renderMahasiswaTable();
  }
});
let videoEl = null;
let mediaStream = null;
let presenceInterval = null;
let smallVideo = null;

async function startCamera() {
  if (!videoEl) videoEl = document.getElementById('video');
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoEl.srcObject = mediaStream;
    return true;
  } catch (err) {
    console.error('camera error', err);
    alert('Cannot access camera: ' + err.message);
    return false;
  }
}

async function startSmallCamera(){
  if(!smallVideo) smallVideo = document.getElementById('small-video');
  try{
    const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio:false });
    smallVideo.srcObject = s; return true;
  }catch(e){console.warn('small cam error',e); return false}
}

function snapshotToBase64() {
  if (!videoEl) return null;
  const w = videoEl.videoWidth || 400;
  const h = videoEl.videoHeight || 300;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  return c.toDataURL('image/jpeg');
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({ ok: false, status: res.status }));
}

document.getElementById('toggle-camera').addEventListener('change', async (ev)=>{
  const checked = ev.target.checked;
  const status = document.getElementById('status');
  if(checked){
    status.textContent = 'Status: starting camera...';
    const ok = await startCamera();
    document.getElementById('btn-start-presence').disabled = !ok;
    status.textContent = ok ? 'Status: camera started' : 'Status: camera error';
  } else {
    // stop tracks
    if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; }
    document.getElementById('btn-start-presence').disabled = true;
    status.textContent = 'Status: camera stopped';
  }
});

// When student select changes, show selected info
const selectEl = document.getElementById('reg-select-nim');
if(selectEl){
  selectEl.addEventListener('change', async ()=>{
    const nim = selectEl.value;
    const statusEl = document.getElementById('reg-status');
    if(!nim){ statusEl.textContent = ''; return; }
    // optionally fetch detailed student info
    try{
      const r = await fetch('/api/data/students');
      const list = await r.json();
      const found = list.find(x=>x.nim === nim);
      statusEl.textContent = found ? `${found.nama} · ${found.kelas||''} ${found.jurusan||''}` : `Selected: ${nim}`;
      // fill kelas/jurusan fields if present
      const kelasEl = document.getElementById('reg-kelas');
      const jurEl = document.getElementById('reg-jurusan');
      if(found){ if(kelasEl) kelasEl.value = found.kelas||''; if(jurEl) jurEl.value = found.jurusan||''; }
    }catch(e){ statusEl.textContent = 'Gagal memuat data mahasiswa'; }
  });
}

// Move to capture area after filling data
const btnToCapture = document.getElementById('btn-to-capture');
if(btnToCapture){
  btnToCapture.onclick = async ()=>{
    const select = document.getElementById('reg-select-nim');
    const statusEl = document.getElementById('reg-status');
    if(!select){ statusEl.textContent = 'No student selector available'; return; }
    const nim = select.value;
    if(!nim){ statusEl.textContent = 'Pilih Mahasiswa dari daftar terlebih dulu'; return; }
    statusEl.textContent = 'Siap capture untuk NIM ' + nim;
    document.getElementById('capture-area').classList.remove('hidden');
    document.getElementById('capture-instructions').classList.remove('hidden');
    document.getElementById('capture-instructions').textContent = 'Instruksi: Tatap kamera, kedip mata untuk liveness, lalu lakukan 5 variasi pose.';
    await startSmallCamera();
  };
}

document.getElementById('btn-capture').onclick = async () => {
  const select = document.getElementById('reg-select-nim');
  const nim = select ? select.value : (document.getElementById('reg-nim') ? document.getElementById('reg-nim').value.trim() : '');
  const statusEl = document.getElementById('reg-status');
  if (!nim) { statusEl.textContent = 'NIM required'; return; }
  if (!mediaStream) {
    const ok = await startCamera(); if (!ok) return;
    await new Promise(r => setTimeout(r, 500));
  }
  const dataUrl = snapshotToBase64();
  const b64 = dataUrl.split(',')[1];
  statusEl.textContent = 'Uploading capture...';
  document.getElementById('btn-capture').disabled = true;
  try{
    const res = await postJSON('/api/register/capture', { nim, frame_b64: b64 });
    if(res && res.ok){
      statusEl.textContent = `Encodings added: ${res.encodings_added || 0}`;
    } else {
      statusEl.textContent = 'Error: ' + (res.message || JSON.stringify(res));
    }
  }catch(e){ statusEl.textContent = 'Upload failed'; }
  document.getElementById('btn-capture').disabled = false;
};

document.getElementById('btn-start-capture').onclick = async ()=>{
  const btn = document.getElementById('btn-start-capture');
  btn.disabled = true;
  const progressText = document.getElementById('progress-text');
  const fill = document.getElementById('progress-bar-fill');
  const frames = [];
  for(let i=0;i<5;i++){
    await new Promise(r=>setTimeout(r, 700));
    // capture from small video
    const sv = document.getElementById('small-video');
    const c = document.createElement('canvas'); c.width=sv.videoWidth||320; c.height=sv.videoHeight||240;
    c.getContext('2d').drawImage(sv,0,0,c.width,c.height);
    const dataUrl = c.toDataURL('image/jpeg');
    frames.push(dataUrl.split(',')[1]);
    const pct = Math.round(((i+1)/5)*100);
    fill.style.width = pct + '%';
    progressText.textContent = `Captured ${i+1}/5`;
  }
  document.getElementById('capture-statusbar').classList.remove('hidden');
  progressText.textContent = 'Mengirim ke server...';
  try{
    const select = document.getElementById('reg-select-nim');
    const nim = select ? select.value : (document.getElementById('reg-nim') ? document.getElementById('reg-nim').value.trim() : '');
    const res = await postJSON('/api/register/capture', { nim, frames_b64: frames });
    document.getElementById('capture-progress').textContent = res.ok ? `Selesai: ${res.encodings_added} encodings` : `Gagal: ${res.message}`;
  }catch(e){ document.getElementById('capture-progress').textContent = 'Upload gagal'; }
  btn.disabled = false;
  fill.style.width = '0%'; progressText.textContent='Selesai';
};

async function sendPresenceFrame() {
  if (!mediaStream) return;
  const statusEl = document.getElementById('status');
  const dataUrl = snapshotToBase64();
  const b64 = dataUrl.split(',')[1];
  statusEl.textContent = 'Sending frame...';
  const badge = document.getElementById('presence-badge');
  const presRes = document.getElementById('presence-result');
  try {
    const res = await postJSON('/api/presence/stream', { frame_b64: b64 });
    if(res && res.ok){
      statusEl.textContent = `Matched: ${res.nim} · distance ${res.distance?.toFixed?.(3) || res.distance}`;
      badge.textContent = 'Matched'; badge.classList.remove('presence-bad'); badge.classList.add('presence-good');
      // show details
      const pr = document.getElementById('presence-result');
      document.getElementById('presence-name').textContent = res.nim;
      document.getElementById('presence-meta').textContent = `distance: ${res.distance?.toFixed?.(3) || res.distance} · ${new Date().toLocaleTimeString()}`;
      pr.classList.remove('hidden');
    } else {
      statusEl.textContent = 'No match / liveness failed';
      badge.textContent = 'No Match'; badge.classList.remove('presence-good'); badge.classList.add('presence-bad');
    }
  } catch (err) {
    statusEl.textContent = 'Error: ' + (err.message || err);
    badge.textContent = 'Error'; badge.classList.remove('presence-good'); badge.classList.add('presence-bad');
  }
}

document.getElementById('btn-start-presence').onclick = async () => {
  if (!mediaStream) { const ok = await startCamera(); if (!ok) return; await new Promise(r => setTimeout(r, 500)); }
  if (presenceInterval) clearInterval(presenceInterval);
  presenceInterval = setInterval(sendPresenceFrame, 2500);
  document.getElementById('status').textContent = 'Presence: running';
  document.getElementById('overlay').textContent = 'Verifikasi Kehidupan...';
};

document.getElementById('btn-stop-presence').onclick = () => {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
  document.getElementById('status').textContent = 'Presence: stopped';
  document.getElementById('overlay').textContent = 'Idle';
};

// navigation
Array.from(document.querySelectorAll('.nav-btn')).forEach(b=>{
  b.addEventListener('click', ()=>{
    const target = b.getAttribute('data-target');
    document.querySelectorAll('[id^="page-"]').forEach(p=>p.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
  })
});

// fetch recent attendance for log
async function refreshLog(){
  try{
    const res = await fetch('/api/data/attendance?limit=5');
    const rows = await res.json();
    const list = document.getElementById('log-list'); list.innerHTML='';
    rows.forEach(r=>{
      const li = document.createElement('li');
      const time = r.waktu_masuk ? new Date(r.waktu_masuk).toLocaleTimeString() : r.tanggal;
      li.textContent = `[${time}] - ${r.nama||''} (${r.nim}) - ${r.status}`;
      list.appendChild(li);
    });
  }catch(e){console.warn('log refresh',e)}
}

setInterval(refreshLog, 5000);
refreshLog();

// Load students into select for quicker registration
// Only show students who have not registered face (photo_path/encoding missing)
async function loadStudentOptions() {
  try {
    const res = await fetch('/api/data/students');
    const students = await res.json();
    console.log('Mahasiswa dari backend:', students);
    const select = document.getElementById('reg-select-nim');
    if (!select) return;
    select.innerHTML = '<option value="">-- Pilih Mahasiswa --</option>';
    console.log('Mahasiswa dari backend (registrasi):', students);
    const filtered = students.filter(s => (!s.photo_path || s.photo_path === null || s.photo_path === '') && !s.has_encoding);
    console.log('Mahasiswa tanpa data wajah (registrasi):', filtered);
    filtered.forEach(s => {
      const option = document.createElement('option');
      option.value = s.nim;
      option.textContent = `${s.nama} - ${s.semester || ''} ${s.kelas || ''}`;
      select.appendChild(option);
    });
  } catch (e) {
    console.warn('Gagal memuat daftar mahasiswa', e);
  }
}
window.addEventListener('DOMContentLoaded', () => {
  function attachRegMahasiswaEvents() {
    const selectEl = document.getElementById('reg-select-nim');
    if(selectEl && !selectEl._listenerAttached){
      loadStudentOptions();
      selectEl.addEventListener('change', async ()=>{
        const nim = selectEl.value;
        const statusEl = document.getElementById('reg-status');
        if(!nim){ statusEl.textContent = ''; return; }
        try{
          const r = await fetch('/api/data/students');
          const list = await r.json();
          console.log('Mahasiswa dari backend (on select):', list);
          const found = list.find(x=>x.nim === nim);
          console.log('Mahasiswa dipilih:', found);
          statusEl.textContent = found ? `${found.nama} · ${found.kelas||''} ${found.jurusan||''}` : `Selected: ${nim}`;
        }catch(e){ statusEl.textContent = 'Gagal memuat data mahasiswa'; }
      });
      selectEl._listenerAttached = true;
    }
    // Fix btn-to-capture handler only if button exists
    const btnToCapture = document.getElementById('btn-to-capture');
    if(btnToCapture && !btnToCapture._listenerAttached){
      btnToCapture.onclick = async ()=>{
        const select = document.getElementById('reg-select-nim');
        const statusEl = document.getElementById('reg-status');
        if(!select){ statusEl.textContent = 'No student selector available'; return; }
        const nim = select.value;
        if(!nim){ statusEl.textContent = 'Pilih Mahasiswa dari daftar terlebih dulu'; return; }
        statusEl.textContent = 'Siap capture untuk NIM ' + nim;
        document.getElementById('capture-area').classList.remove('hidden');
        document.getElementById('capture-instructions').classList.remove('hidden');
        document.getElementById('capture-instructions').textContent = 'Instruksi: Tatap kamera, kedip mata untuk liveness, lalu lakukan 5 variasi pose.';
        await startSmallCamera();
      };
      btnToCapture._listenerAttached = true;
    }
  }

  // Initial attach
  attachRegMahasiswaEvents();

  // Observe DOM changes to re-attach when navigating
  const observer = new MutationObserver(() => {
    attachRegMahasiswaEvents();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Fix btn-to-capture handler only if button exists
  const btnToCapture = document.getElementById('btn-to-capture');
  if(btnToCapture){
    btnToCapture.onclick = async ()=>{
      const select = document.getElementById('reg-select-nim');
      const statusEl = document.getElementById('reg-status');
      if(!select){ statusEl.textContent = 'No student selector available'; return; }
      const nim = select.value;
      if(!nim){ statusEl.textContent = 'Pilih Mahasiswa dari daftar terlebih dulu'; return; }
      statusEl.textContent = 'Siap capture untuk NIM ' + nim;
      document.getElementById('capture-area').classList.remove('hidden');
      document.getElementById('capture-instructions').classList.remove('hidden');
      document.getElementById('capture-instructions').textContent = 'Instruksi: Tatap kamera, kedip mata untuk liveness, lalu lakukan 5 variasi pose.';
      await startSmallCamera();
    };
  }
});

// Dynamically load student options for registration select
async function loadStudentOptions() {
  try {
    const res = await fetch('/api/data/students');
    const students = await res.json();
    const select = document.getElementById('reg-select-nim');
    if (!select) return;
    select.innerHTML = '<option value="">-- Pilih Mahasiswa --</option>';
    // Only show students who have not registered face (photo_path/encoding missing)
    students.filter(s => !s.photo_path && !s.has_encoding).forEach(s => {
      const option = document.createElement('option');
      option.value = s.nim;
      option.textContent = `${s.nama} (${s.nim})`;
      select.appendChild(option);
    });
  } catch (e) {
    console.warn('Gagal memuat daftar mahasiswa', e);
  }
}
window.addEventListener('DOMContentLoaded', loadStudentOptions);

// Render student data table in Data Mahasiswa page
async function renderStudentTable() {
  const tbody = document.querySelector('section[x-show="currentPage === \'page-data\'"] tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-8">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/data/students');
    const students = await res.json();
    if (!Array.isArray(students) || students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-8">Tidak ada data mahasiswa.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    students.forEach(s => {
      const status = (s.status === 'active' || s.status === 'Active' || s.status === 1) ?
        `<span class=\"px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800\"><i class=\"fas fa-circle text-green-500 mr-1 text-xs\"></i>Active</span>` :
        `<span class=\"px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-500\"><i class=\"fas fa-circle text-gray-400 mr-1 text-xs\"></i>Nonaktif</span>`;
      tbody.innerHTML += `
        <tr class=\"hover:bg-gray-50\">
          <td class=\"px-6 py-4 text-sm text-gray-900 font-mono\">${s.nim}</td>
          <td class=\"px-6 py-4 text-sm text-gray-900 font-medium\">${s.nama}</td>
          <td class=\"px-6 py-4 text-sm text-gray-900\">${s.semester || ''}</td>
          <td class=\"px-6 py-4 text-sm text-gray-900\">${s.kelas || ''}</td>
          <td class=\"px-6 py-4 text-sm text-gray-900\">${s.jurusan || ''}</td>
          <td class=\"px-6 py-4\">${status}</td>
          <td class=\"px-6 py-4 text-sm text-gray-500\">
            <button class=\"btn-outline text-xs px-3 py-1\" disabled><i class=\"fas fa-edit mr-1\"></i>Edit</button>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-400 py-8">Gagal memuat data mahasiswa.</td></tr>';
  }
}

// Auto-render when Data Mahasiswa page is shown
document.addEventListener('DOMContentLoaded', () => {
  const navBtn = document.querySelector('button.nav-btn[onclick*="page-data"]');
  // If using Alpine.js, listen to page change
  window.renderStudentTable = renderStudentTable;
  // Try to render on load and on nav
  renderStudentTable();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.textContent.includes('Data Mahasiswa')) {
        renderStudentTable();
      }
    });
  });
});
