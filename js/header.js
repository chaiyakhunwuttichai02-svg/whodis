// js/header.js - Navigation Header Component ที่คงสไตล์เดิม 100%

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
});

function renderHeader() {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin = user && (user.role || '').toLowerCase() === 'admin';

  const navItems = [
    { name: 'เช็กก่อนโอน', url: 'index.html' },
    { name: 'Scam Checker', url: 'checker.html' },
    { name: 'แจ้งมิจฉาชีพ', url: 'report.html' },
    { name: 'สถิติ Scam', url: 'stats.html' },
    { name: 'รู้จักการโกง', url: 'knowledge.html' },
    { name: 'ถูกโกงแล้วทำไง', url: 'emergency.html' }
  ];

  if (isAdmin) {
    navItems.push({ name: '🛡️ จัดการแอดมิน', url: 'admin_reports.html' });
  }

  const navLinksHtml = navItems.map(item => {
    const isActive = (currentPage === item.url || (currentPage === '' && item.url === 'index.html'));
    const classes = isActive 
      ? 'nav-link active' 
      : 'nav-link text-muted-text';
    return `<a href="${item.url}" class="${classes}">${item.name}</a>`;
  }).join('');

  const mobileNavLinksHtml = navItems.map(item => {
    const isActive = (currentPage === item.url || (currentPage === '' && item.url === 'index.html'));
    const classes = isActive 
      ? 'block py-2 px-3 bg-gray-900 text-white rounded-lg font-medium text-sm' 
      : 'block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg text-sm';
    return `<a href="${item.url}" class="${classes}">${item.name}</a>`;
  }).join('');

  let userActionHtml = '';
  let mobileUserHtml = '';

  if (user) {
    userActionHtml = `
      <span class="text-[13px] font-medium hidden md:inline">สวัสดี, ${escapeHtml(user.username)}</span>
      <button onclick="Auth.logout()" class="text-muted-text hover:text-danger flex items-center transition-colors" title="ออกจากระบบ">
        <span class="material-symbols-outlined text-[20px]">logout</span>
      </button>
    `;
    mobileUserHtml = `
      <div class="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-800">👤 ${escapeHtml(user.username)}</span>
        <button onclick="Auth.logout()" class="text-xs text-danger font-semibold flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">logout</span> ออกจากระบบ
        </button>
      </div>
    `;
  } else {
    userActionHtml = `
      <a href="login.html" class="btn-green-solid">
        เข้าสู่ระบบ
      </a>
    `;
    mobileUserHtml = `
      <div class="pt-4 mt-2 border-t border-gray-100">
        <a href="login.html" class="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm">
          เข้าสู่ระบบ
        </a>
      </div>
    `;
  }

  placeholder.innerHTML = `
    <header class="w-full bg-card-bg border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-text text-white rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <span class="text-[18px] font-bold text-primary-text">Whodis</span>
        </a>
        
        <nav class="hidden lg:flex items-center gap-1">
          ${navLinksHtml}
        </nav>

        <div class="flex items-center gap-3">
          ${userActionHtml}
          <!-- Mobile Menu Button -->
          <button id="mobile-menu-btn" class="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 focus:outline-none">
            <span class="material-symbols-outlined text-[26px]">menu</span>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      <div id="mobile-menu" class="hidden lg:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1 shadow-md">
        ${mobileNavLinksHtml}
        ${mobileUserHtml}
      </div>
    </header>
  `;

  // Toggle Mobile Menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
