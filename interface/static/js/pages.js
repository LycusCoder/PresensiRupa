// Page loader untuk memuat komponen HTML dinamis
class PageLoader {
  constructor() {
    this.currentPage = null;
    this.pageCache = {};
  }

  async loadPage(pageName) {
    if (this.currentPage === pageName) return;
    
    const container = document.getElementById('page-container');
    if (!container) {
      console.error('Page container not found');
      return;
    }

    // Load dari cache atau fetch baru
    let pageHTML;
    if (this.pageCache[pageName]) {
      pageHTML = this.pageCache[pageName];
    } else {
      try {
        const response = await fetch(`/static/pages/${pageName}.html`);
        if (!response.ok) throw new Error(`Page ${pageName} not found`);
        pageHTML = await response.text();
        this.pageCache[pageName] = pageHTML;
      } catch (error) {
        console.error(`Error loading page ${pageName}:`, error);
        container.innerHTML = '<div class="text-center text-red-500">Gagal memuat halaman</div>';
        return;
      }
    }

    // Inject HTML
    container.innerHTML = pageHTML;
    this.currentPage = pageName;

    // Update navigation active state
    this.updateNavigation(pageName);

    // Trigger page-specific initialization
    this.initializePage(pageName);
  }

  updateNavigation(pageName) {
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to current page button
    const activeBtn = document.getElementById(`nav-${pageName}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  initializePage(pageName) {
    switch(pageName) {
      case 'registrasi':
        initRegistrasiPage();
        break;
      case 'data':
        initDataPage();
        break;
      case 'dashboard':
        initDashboardPage();
        break;
      case 'laporan':
        initLaporanPage();
        break;
    }
  }
}

// Initialize pages
const pageLoader = new PageLoader();

// Registrasi page initialization
function initRegistrasiPage() {
  console.log('[Registrasi] Initializing page');
  loadStudentOptions();
  attachCaptureHandlers();
}

// Load students untuk dropdown registrasi
async function loadStudentOptions() {
  try {
    const res = await fetch('/api/data/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    
    const students = await res.json();
    console.log('[Registrasi] Students from backend:', students);
    
    const select = document.getElementById('reg-select-nim');
    if (!select) {
      console.error('[Registrasi] Dropdown element not found!');
      return;
    }
    
    select.innerHTML = '<option value="">-- Pilih Mahasiswa --</option>';
    
    // Filter: hanya mahasiswa tanpa face data
    const filtered = students.filter(s => {
      return (!s.photo_path || s.photo_path === null || s.photo_path === '') && !s.has_encoding;
    });
    
    console.log('[Registrasi] Filtered students (no face data):', filtered);
    
    if (filtered.length === 0) {
      select.innerHTML += '<option disabled>Tidak ada mahasiswa yang perlu registrasi wajah</option>';
      return;
    }
    
    filtered.forEach(s => {
      const option = document.createElement('option');
      option.value = s.nim;
      option.textContent = `${s.nama} - ${s.semester || ''} ${s.kelas || ''}`.trim();
      select.appendChild(option);
    });
    
    console.log(`[Registrasi] Loaded ${filtered.length} students to dropdown`);
    
    // Attach change event
    select.addEventListener('change', handleStudentSelect);
    
  } catch (e) {
    console.error('[Registrasi] Failed to load students:', e);
    const select = document.getElementById('reg-select-nim');
    if (select) {
      select.innerHTML = '<option disabled>Gagal memuat data mahasiswa</option>';
    }
  }
}

async function handleStudentSelect(e) {
  const nim = e.target.value;
  const statusEl = document.getElementById('reg-status');
  
  if (!nim) {
    statusEl.textContent = '';
    return;
  }
  
  try {
    const res = await fetch('/api/data/students');
    const students = await res.json();
    const found = students.find(s => s.nim === nim);
    
    console.log('[Registrasi] Selected student:', found);
    
    if (found) {
      statusEl.textContent = `${found.nama} · Semester ${found.semester || '-'} · Kelas ${found.kelas || '-'}`;
    } else {
      statusEl.textContent = `NIM: ${nim}`;
    }
  } catch (e) {
    console.error('[Registrasi] Error fetching student details:', e);
    statusEl.textContent = 'Gagal memuat detail mahasiswa';
  }
}

function attachCaptureHandlers() {
  const btnToCapture = document.getElementById('btn-to-capture');
  if (btnToCapture) {
    btnToCapture.onclick = async () => {
      const select = document.getElementById('reg-select-nim');
      const statusEl = document.getElementById('reg-status');
      const nim = select?.value;
      
      if (!nim) {
        statusEl.textContent = 'Pilih Mahasiswa dari daftar terlebih dulu';
        return;
      }
      
      statusEl.textContent = 'Siap capture untuk NIM ' + nim;
      document.getElementById('capture-area').classList.remove('hidden');
      document.getElementById('capture-instructions').classList.remove('hidden');
      document.getElementById('capture-instructions').textContent = 'Instruksi: Tatap kamera, kedip mata untuk liveness, lalu lakukan 5 variasi pose.';
      
      await startSmallCamera();
    };
  }
}

// Data Mahasiswa page initialization
function initDataPage() {
  console.log('[Data] Initializing page');
  // Use setTimeout to ensure DOM is fully updated
  setTimeout(() => {
    console.log('[Data] About to call renderMahasiswaTable()');
    renderMahasiswaTable();
    console.log('[Data] Called renderMahasiswaTable()');
  }, 50);
}

async function renderMahasiswaTable() {
  console.log('[Data] renderMahasiswaTable() started');
  
  const tbody = document.getElementById('data-mahasiswa-tbody');
  console.log('[Data] tbody element:', tbody);
  
  if (!tbody) {
    console.error('[Data] Table body not found!');
    console.error('[Data] Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    return;
  }
  
  console.log('[Data] Fetching students from API...');
  
  try {
    const res = await fetch('/api/data/students');
    console.log('[Data] Response status:', res.status, res.statusText);
    
    if (!res.ok) throw new Error('Failed to fetch students');
    
    const data = await res.json();
    console.log('[Data] Students data:', data);
    console.log('[Data] Is array?', Array.isArray(data));
    console.log('[Data] Length:', data.length);
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(data)) {
      console.error('[Data] Data is not an array!', typeof data);
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-red-400">Error: Data format tidak valid</td></tr>';
      return;
    }
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-gray-400">Tidak ada data mahasiswa</td></tr>';
      return;
    }
    
    data.forEach(m => {
      const status = m.has_encoding ? 'Sudah' : 'Belum';
      const statusClass = m.has_encoding ? 'text-green-600' : 'text-gray-500';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${m.nim}</td>
        <td class="px-6 py-4 whitespace-nowrap">${m.nama}</td>
        <td class="px-6 py-4 whitespace-nowrap">${m.semester || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">${m.kelas || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">${m.jurusan || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap ${statusClass}">${status}</td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <button class="btn-outline text-xs">Detail</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    console.log(`[Data] Successfully rendered ${data.length} students`);
    
  } catch (error) {
    console.error('[Data] Error loading students:', error);
    console.error('[Data] Error stack:', error.stack);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-red-400">Gagal memuat data: ' + error.message + '</td></tr>';
  }
}

// Dashboard page initialization
function initDashboardPage() {
  console.log('[Dashboard] Initializing page');
  // Future: Load statistics, charts, etc.
}

// Laporan page initialization
function initLaporanPage() {
  console.log('[Laporan] Initializing page');
  // Set tanggal default ke hari ini
  const dateInput = document.getElementById('filter-tanggal');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

// Export untuk digunakan di app.js
window.pageLoader = pageLoader;
window.loadStudentOptions = loadStudentOptions;
window.renderMahasiswaTable = renderMahasiswaTable;
