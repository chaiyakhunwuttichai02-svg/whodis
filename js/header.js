// js/header.js - Navigation Header Component ที่คงสไตล์เดิม 100%

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
});

function renderHeader() {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  // ฝังสไตล์ Global สำหรับแถบเมนู: Hover เป็นวงสีดำอ่อน และ Active เป็นสีดำสนิท
  if (!document.getElementById('whodis-nav-custom-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'whodis-nav-custom-style';
    styleEl.textContent = `
      .nav-link {
        padding: 0.45rem 1.15rem !important;
        font-size: 13.5px !important;
        font-weight: 500 !important;
        border-radius: 9999px !important;
        color: #4b5563 !important;
        text-decoration: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .nav-link:hover {
        background-color: rgba(0, 0, 0, 0.07) !important;
        color: #000000 !important;
      }
      .nav-link.active {
        background-color: #000000 !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
      }
      .nav-link.active:hover {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  const currentPath = window.location.pathname;
  let pageName = (currentPath.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
  if (!pageName || pageName === '') pageName = 'index.html';
  const cleanCurrent = pageName.replace(/\.html$/, '').replace(/\.php$/, '').toLowerCase();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isLoggedIn = !!user;
  const isAdmin = user && (user.role || '').toLowerCase() === 'admin';

  const navItems = [
    { name: 'เช็กก่อนโอน', url: 'index.html', isPublic: true },
    { name: 'Scam Checker', url: 'checker.html', isPublic: true },
    { name: 'แจ้งมิจฉาชีพ', url: 'report.html', isPublic: false },
    { name: 'สถิติ Scam', url: 'stats.html', isPublic: false },
    { name: 'รู้จักการโกง', url: 'knowledge.html', isPublic: false },
    { name: 'ถูกโกงแล้วทำไง', url: 'emergency.html', isPublic: false }
  ];

  if (isAdmin) {
    navItems.push({ name: '🛡️ จัดการแอดมิน', url: 'admin_reports.html', isPublic: false });
  }

  const navLinksHtml = navItems.map(item => {
    const cleanItem = item.url.replace(/\.html$/, '').replace(/\.php$/, '').toLowerCase();
    const isActive = (cleanCurrent === cleanItem) || (cleanCurrent === 'index' && cleanItem === 'index');
    
    // หากยังไม่ล็อกอิน และเป็นหน้าที่ต้องล็อกอินก่อนเข้าชม ให้ส่งไปที่หน้า login.html?redirect=...
    const href = (!isLoggedIn && !item.isPublic) 
      ? `login.html?redirect=${encodeURIComponent(item.url)}&reason=need_login` 
      : item.url;

    const classes = isActive ? 'nav-link active' : 'nav-link';
    return `<a href="${href}" class="${classes}">${item.name}</a>`;
  }).join('');

  const mobileNavLinksHtml = navItems.map(item => {
    const cleanItem = item.url.replace(/\.html$/, '').replace(/\.php$/, '').toLowerCase();
    const isActive = (cleanCurrent === cleanItem) || (cleanCurrent === 'index' && cleanItem === 'index');

    const href = (!isLoggedIn && !item.isPublic) 
      ? `login.html?redirect=${encodeURIComponent(item.url)}&reason=need_login` 
      : item.url;

    const classes = isActive 
      ? 'block py-2.5 px-4 bg-black text-white rounded-xl font-semibold text-sm shadow-xs' 
      : 'block py-2.5 px-4 text-gray-700 hover:bg-black/5 hover:text-black rounded-xl text-sm font-medium transition-colors';
    return `<a href="${href}" class="${classes}">${item.name}</a>`;
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
