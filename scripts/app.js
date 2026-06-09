// Simple static login handler for demo purposes.
// In a real app, replace with real authentication.

const CREDENTIALS = {
  'customer@vetcare.test': { role: 'customer', name: 'Pelanggan Demo' },
  'doctor@vetcare.test':   { role: 'doctor', name: 'Dokter Demo' },
  'admin@vetcare.test':    { role: 'admin', name: 'Admin Demo' }
};

function handleLogin(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('email') || {}).value?.trim().toLowerCase();
  const password = (document.getElementById('password') || {}).value || '';
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  // Demo rule: password must be 'password' or 'demo123' to accept.
  if (!email || !password) {
    errorEl.textContent = 'Isi email dan password.'; errorEl.style.display = '';
    return;
  }

  const user = CREDENTIALS[email];
  if (!user || !['password','demo123'].includes(password)) {
    errorEl.textContent = 'Email atau password salah.'; errorEl.style.display = '';
    return;
  }

  // store minimal session info (for demo only)
  localStorage.setItem('vetcare_user', JSON.stringify({ email, role: user.role, name: user.name }));

  // redirect based on role
  if (user.role === 'customer') window.location.href = 'dashboard-customer.html';
  else if (user.role === 'doctor') window.location.href = 'dashboard-doctor.html';
  else if (user.role === 'admin') window.location.href = 'dashboard-admin.html';
  else window.location.href = 'index.html';
}

function ensureAuth(allowedRoles) {
  const raw = localStorage.getItem('vetcare_user');
  if (!raw) { window.location.href = 'login.html'; return null; }
  try {
    const u = JSON.parse(raw);
    if (allowedRoles && !allowedRoles.includes(u.role)) { window.location.href = 'login.html'; return null; }
    return u;
  } catch (err) { window.location.href = 'login.html'; return null; }
}

function logout() {
  localStorage.removeItem('vetcare_user');
  window.location.href = 'login.html';
}

/* ------------------------------------------------------------------
   View switching for dashboards (client-only, toggles sections)
   ------------------------------------------------------------------ */
function setActiveNav(viewId, pageKey) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    const fn = (el.getAttribute('onclick') || '');
    el.classList.toggle('active', fn.includes("'" + pageKey + "'"));
  });
}

// Customer
const CUST_PAGES = ['beranda','hewan','monitoring','appointment','riwayat','chat','invoice','profil'];
const CUST_TITLES = {
  beranda:'Beranda', hewan:'Hewan Saya', monitoring:'Monitoring Hewan',
  appointment:'Appointment', riwayat:'Riwayat Kunjungan',
  chat:'Konsultasi / Chat', invoice:'Invoice & Pembayaran', profil:'Profil & Pengaturan'
};
function showCustomerPage(p) {
  CUST_PAGES.forEach(pg => {
    const el = document.getElementById('cust-' + pg);
    if (el) el.style.display = (pg === p) ? '' : 'none';
  });
  const titleEl = document.getElementById('cust-page-title');
  const mainTitle = document.getElementById('pageTitle') || titleEl;
  if (mainTitle) mainTitle.textContent = CUST_TITLES[p] || p;
  setActiveNav('view-customer', p);
  if (window.lucide) lucide.createIcons();
}

// Doctor
const DOC_PAGES = ['beranda','antrian','rekam','jadwal','chat-dokter','riwayat-pasien','laporan'];
const DOC_TITLES = {
  beranda:'Beranda', antrian:'Antrian Hari Ini', rekam:'Input Rekam Medis',
  jadwal:'Jadwal Saya', 'chat-dokter':'Chat Konsultasi',
  'riwayat-pasien':'Riwayat Pasien', laporan:'Laporan Harian'
};
function showDoctorPage(p) {
  DOC_PAGES.forEach(pg => {
    const el = document.getElementById('doc-' + pg);
    if (el) el.style.display = (pg === p) ? '' : 'none';
  });
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = DOC_TITLES[p] || p;
  setActiveNav(null, p);
  if (window.lucide) lucide.createIcons();
}

// Admin
const ADM_PAGES = ['beranda','users','inventory','appointments','finance','reports'];
const ADM_TITLES = {
  beranda:'Beranda', users:'Manajemen User', inventory:'Inventory & Produk',
  appointments:'Manajemen Janji', finance:'Keuangan', reports:'Laporan'
};
function showAdminPage(p) {
  ADM_PAGES.forEach(pg => {
    const el = document.getElementById('admin-' + pg);
    if (el) el.style.display = (pg === p) ? '' : 'none';
  });
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = ADM_TITLES[p] || p;
  setActiveNav(null, p);
  if (window.lucide) lucide.createIcons();
}

// Initialize basic icons when script loaded
document.addEventListener('DOMContentLoaded', function() { if (window.lucide) lucide.createIcons(); });
