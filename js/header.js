// js/header.js - Navigation Header Component ที่คงสไตล์เดิม 100%

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  initKnockoutButtonEffect();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initKnockoutButtonEffect();
}

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

  // Initialize SOS Emergency Hotline Widget
  renderSosWidget();
}

// ข้อมูลสายด่วนอายัดบัญชีฉุกเฉินทุกธนาคาร 24 ชม. พร้อมโลโก้จริง (ครอบคลุมทุกธนาคารในประเทศไทย)
const SOS_BANKS = [
  { id: 'aoc', name: 'ศูนย์ AOC (ตำรวจไซเบอร์)', desc: 'ระงับบัญชีทุกธนาคาร 24 ชม.', phone: '1441', rawPhone: '1441', logo: null, isAoc: true, keywords: 'aoc ตำรวจ ไซเบอร์ 1441 แจ้งความ ออนไลน์' },
  { id: 'kbank', name: 'ธนาคารกสิกรไทย (KBANK)', desc: 'ศูนย์รับแจ้งเหตุภัยออนไลน์ 24 ชม.', phone: '02-888-8888 กด 001', rawPhone: '028888888', logo: 'assets/banks/kbank.png', keywords: 'kbank กสิกร เขียว เคแบงก์ kplus' },
  { id: 'scb', name: 'ธนาคารไทยพาณิชย์ (SCB)', desc: 'สายด่วนภัยทางการเงิน 24 ชม.', phone: '02-777-7575', rawPhone: '027777575', logo: 'assets/banks/scb.png', keywords: 'scb ไทยพาณิชย์ ม่วง แม่มณี scbeasy' },
  { id: 'ktb', name: 'ธนาคารกรุงไทย (KTB)', desc: 'สายด่วนภัยไซเบอร์ 24 ชม.', phone: '02-111-1111 กด 111', rawPhone: '021111111', logo: 'assets/banks/ktb.png', keywords: 'ktb กรุงไทย ฟ้า เป๋าตัง krungthai next' },
  { id: 'bbl', name: 'ธนาคารกรุงเทพ (BBL)', desc: 'ศูนย์แจ้งเหตุฉุกเฉิน 24 ชม.', phone: '1333 หรือ 02-645-5555 กด *3', rawPhone: '1333', logo: 'assets/banks/bbl.png', keywords: 'bbl กรุงเทพ บัวหลวง น้ำเงิน bangkok bank' },
  { id: 'bay', name: 'ธนาคารกรุงศรีอยุธยา (BAY)', desc: 'สายด่วนรับแจ้งเหตุ 24 ชม.', phone: '1572 กด 5', rawPhone: '1572', logo: 'assets/banks/bay.png', keywords: 'bay กรุงศรี เหลือง krungsri kma' },
  { id: 'ttb', name: 'ธนาคารทหารไทยธนชาต (TTB)', desc: 'สายด่วนแจ้งภัยออนไลน์ 24 ชม.', phone: '1428 กด 03', rawPhone: '1428', logo: 'assets/banks/ttb.png', keywords: 'ttb ทหารไทย ธนชาต tmb thanachart touch' },
  { id: 'gsb', name: 'ธนาคารออมสิน (GSB)', desc: 'ศูนย์รับแจ้งภัยทางการเงิน 24 ชม.', phone: '1115 กด 6', rawPhone: '1115', logo: 'assets/banks/gsb.png', keywords: 'gsb ออมสิน ชมพู mymo' },
  { id: 'baac', name: 'ธ.ก.ส. (BAAC)', desc: 'ศูนย์รับแจ้งภัยทางการเงิน 24 ชม.', phone: '02-555-0555 กด *3', rawPhone: '025550555', logo: 'assets/banks/baac.png', keywords: 'baac ธกส เกษตร ธนาคารเพื่อการเกษตร baac mobile' },
  { id: 'ghb', name: 'ธนาคารอาคารสงเคราะห์ (ธอส. / GHB)', desc: 'ศูนย์รับแจ้งเหตุภัยทางการเงิน', phone: '02-645-9000 กด 33', rawPhone: '026459000', logo: 'assets/banks/ghb.png', keywords: 'ghb ธอส อาคารสงเคราะห์ ghmall' },
  { id: 'kkp', name: 'ธนาคารเกียรตินาคินภัทร (KKP)', desc: 'สายด่วนแจ้งเหตุภัยทางการเงิน 24 ชม.', phone: '02-165-5555 กด 6', rawPhone: '021655555', logo: 'assets/banks/kkp.png', keywords: 'kkp เกียรตินาคิน เกียรตินาคินภัทร dime edge' },
  { id: 'uob', name: 'ธนาคารยูโอบี (UOB)', desc: 'สายด่วนรับแจ้งภัยทุจริต 24 ชม.', phone: '02-344-9555', rawPhone: '023449555', logo: 'assets/banks/uob.png', keywords: 'uob ยูโอบี tmrw' },
  { id: 'cimb', name: 'ธนาคาร ซีไอเอ็มบี ไทย (CIMB)', desc: 'สายด่วนแจ้งเหตุฉุกเฉิน 24 ชม.', phone: '02-626-7777 กด 00', rawPhone: '026267777', logo: 'assets/banks/cimb.png', keywords: 'cimb ซีไอเอ็มบี แดง octo cimb thai' },
  { id: 'tisco', name: 'ธนาคารทิสโก้ (TISCO)', desc: 'ศูนย์รับแจ้งเหตุภัยทางการเงิน 24 ชม.', phone: '02-633-6000 กด *7', rawPhone: '026336000', logo: 'assets/banks/tisco.png', keywords: 'tisco ทิสโก้' },
  { id: 'lhb', name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)', desc: 'สายด่วนแจ้งระงับธุรกรรม 24 ชม.', phone: '02-359-0000 กด 8', rawPhone: '023590000', logo: 'assets/banks/lhb.png', keywords: 'lhb แลนด์ แอนด์ เฮ้าส์ lh bank m choice' },
  { id: 'tcrb', name: 'ธนาคารไทยเครดิต (Thai Credit)', desc: 'สายด่วนรับแจ้งเหตุภัยทางการเงิน 24 ชม.', phone: '02-697-5454 กด 0', rawPhone: '026975454', logo: 'assets/banks/tcrb.png', keywords: 'tcrb ไทยเครดิต เพื่อรายย่อย alpha' },
  { id: 'ibank', name: 'ธนาคารอิสลามแห่งประเทศไทย (iBank)', desc: 'สายด่วนรับแจ้งเหตุทางการเงิน 24 ชม.', phone: '02-204-2766 หรือ 1302 กด 003', rawPhone: '022042766', logo: 'assets/banks/ibank.png', keywords: 'ibank อิสลาม อิสลามแห่งประเทศไทย' },
  { id: 'icbc', name: 'ธนาคารไอซีบีซี (ไทย) (ICBC)', desc: 'สายด่วนรับแจ้งเหตุ 24 ชม.', phone: '02-629-5588 กด 4', rawPhone: '026295588', logo: 'assets/banks/icbc.png', keywords: 'icbc ไอซีบีซี จีน' },
  { id: 'citi', name: 'ซิตี้แบงก์ (Citi Thailand)', desc: 'สายด่วนแจ้งเหตุฉุกเฉิน 24 ชม.', phone: '02-232-2484', rawPhone: '022322484', logo: 'assets/banks/citi.png', keywords: 'citi ซิตี้แบงก์ ซิตี้ ซิตี้คอร์ป' },
  { id: 'truemoney', name: 'ทรูมันนี่ (TrueMoney Wallet)', desc: 'ศูนย์แจ้งเหตุภัยทางการเงิน 24 ชม.', phone: '1240 กด 6', rawPhone: '1240', logo: 'assets/banks/truemoney.png', keywords: 'truemoney ทรูมันนี่ วอลเล็ท wallet สแกน' },
  { id: 'bot', name: 'ศคง. ธนาคารแห่งประเทศไทย (BOT)', desc: 'คุ้มครองผู้ใช้บริการทางการเงิน / ปรึกษาภัยการเงิน', phone: '1213', rawPhone: '1213', logo: null, icon: 'account_balance', keywords: 'bot แบงก์ชาติ ธปท ศคง ร้องเรียน 1213' },
  { id: 'nbtc', name: 'สำนักงาน กสทช. (NBTC)', desc: 'รับแจ้งเบาะแส SMS หลอกลวง / เบอร์คอลเซ็นเตอร์', phone: '1200', rawPhone: '1200', logo: null, icon: 'cell_tower', keywords: 'nbtc กสทช sms คอลเซ็นเตอร์ เบอร์แปลก หลอกลวง 1200' }
];

function renderSosWidget() {
  if (document.getElementById('whodis-sos-widget')) return;

  const container = document.createElement('div');
  container.id = 'whodis-sos-widget';
  container.innerHTML = `
    <!-- Floating SOS Trigger Button -->
    <button id="sos-trigger-btn" onclick="toggleSosModal(true)" 
            class="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-4.5 sm:px-5 rounded-full shadow-[0_8px_25px_rgba(225,29,72,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30 cursor-pointer"
            title="สายด่วนโทรอายัดบัญชีด่วนทุกธนาคาร 24 ชม.">
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
      </span>
      <span class="material-symbols-outlined text-[20px]">e911_emergency</span>
      <span class="text-[13.5px] tracking-wide">สายด่วนอายัดบัญชี</span>
    </button>

    <!-- SOS Modal Backdrop & Dialog -->
    <div id="sos-modal" class="hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-200">
      <div class="relative w-full sm:max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 sm:p-6 shrink-0 relative">
          <button onclick="toggleSosModal(false)" class="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer" title="ปิดหน้าต่าง">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 text-xs font-bold mb-2">
            <span class="material-symbols-outlined text-[14px]">bolt</span> ช่วงเวลาทอง (Golden Hour)
          </div>
          <h3 class="text-[19px] sm:text-[21px] font-bold leading-snug">สายด่วนอายัดบัญชีฉุกเฉิน 24 ชม.</h3>
          <p class="text-white/90 text-xs mt-1">หากเพิ่งโอนเงินถูกหลอก โทรติดต่อระงับบัญชีปลายทางทันที</p>
        </div>

        <!-- Search Bank Input -->
        <div class="p-3.5 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div class="relative flex items-center">
            <span class="material-symbols-outlined absolute left-3.5 text-gray-400 text-[19px]">search</span>
            <input type="text" id="sos-search-input" oninput="filterSosBanks(this.value)"
                   placeholder="ค้นหาชื่อธนาคาร เช่น กสิกร, SCB, ออมสิน, กรุงไทย, ธอส..."
                   class="w-full h-[40px] pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-red-500 transition-colors">
          </div>
        </div>

        <!-- Bank List (Scrollable) -->
        <div id="sos-bank-list" class="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-gray-50 max-h-[50vh]">
          <!-- Populated by renderSosBankItems() -->
        </div>

        <!-- Footer -->
        <div class="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
          <p class="text-[11px] text-muted-text">โทรฟรีหรือตามอัตราค่าบริการเครือข่าย • ให้เตรียมเลขสลิปและเวลาโอนให้พร้อม</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  renderSosBankItems(SOS_BANKS);

  // Close modal when clicking backdrop
  const modal = document.getElementById('sos-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleSosModal(false);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleSosModal(false);
  });
}

function renderSosBankItems(banks) {
  const list = document.getElementById('sos-bank-list');
  if (!list) return;

  if (banks.length === 0) {
    list.innerHTML = `
      <div class="py-8 text-center text-muted-text text-xs">
        <span class="material-symbols-outlined text-[32px] text-gray-300 mb-1">search_off</span>
        <p>ไม่พบธนาคารที่ค้นหา</p>
      </div>
    `;
    return;
  }

  list.innerHTML = banks.map(b => {
    if (b.isAoc) {
      return `
        <div class="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs mb-1">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[24px]">local_police</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h4 class="text-[14px] font-bold text-red-900 truncate">${b.name}</h4>
                <span class="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">แนะนำ</span>
              </div>
              <p class="text-[11.5px] text-red-700 truncate">${b.desc}</p>
              <p class="text-[13px] font-mono font-bold text-red-600 mt-0.5">โทร. ${b.phone}</p>
            </div>
          </div>
          <a href="tel:${b.rawPhone}" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm transition-transform active:scale-95">
            <span>โทร</span> <span class="material-symbols-outlined text-[16px]">call</span>
          </a>
        </div>
      `;
    }

    const logoHtml = b.logo
      ? `<img src="${b.logo}" alt="${escapeHtml(b.name)}" class="w-full h-full object-contain rounded-lg">`
      : `<div class="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-700"><span class="material-symbols-outlined text-[20px]">${b.icon || 'account_balance'}</span></div>`;

    return `
      <div class="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-gray-50/80 p-2 rounded-xl transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
            ${logoHtml}
          </div>
          <div class="min-w-0">
            <h4 class="text-[13.5px] font-semibold text-primary-text truncate">${escapeHtml(b.name)}</h4>
            <p class="text-[11px] text-muted-text truncate">${escapeHtml(b.desc)}</p>
            <p class="text-[12px] font-mono font-bold text-gray-800 mt-0.5">${escapeHtml(b.phone)}</p>
          </div>
        </div>
        <a href="tel:${b.rawPhone}" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs transition-transform active:scale-95">
          <span>โทร</span> <span class="material-symbols-outlined text-[15px]">call</span>
        </a>
      </div>
    `;
  }).join('');
}

function toggleSosModal(show) {
  const modal = document.getElementById('sos-modal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('sos-search-input');
    if (input) {
      input.value = '';
      renderSosBankItems(SOS_BANKS);
      setTimeout(() => input.focus(), 150);
    }
  } else {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function filterSosBanks(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    renderSosBankItems(SOS_BANKS);
    return;
  }
  const filtered = SOS_BANKS.filter(b => 
    b.name.toLowerCase().includes(q) || 
    b.phone.toLowerCase().includes(q) || 
    b.desc.toLowerCase().includes(q) ||
    (b.keywords && b.keywords.toLowerCase().includes(q))
  );
  renderSosBankItems(filtered);
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

// =========================================================================
// Whodis Knockout Inverted Ripple Effect (Jhey Tompkins SVG Stencil Inspired)
// =========================================================================
function initKnockoutButtonEffect() {
  if (window.__whodisKnockoutInitialized) return;
  window.__whodisKnockoutInitialized = true;

  // 1. Inject SVG Filters into DOM (knockout-black & knockout-white)
  if (!document.getElementById('whodis-knockout-filters')) {
    const svgWrapper = document.createElement('div');
    svgWrapper.id = 'whodis-knockout-filters';
    svgWrapper.innerHTML = `
      <svg class="sr-only" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;">
        <defs>
          <filter id="knockout-black" color-interpolation-filters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -1 -1 -1 0 1"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
          <filter id="knockout-white" color-interpolation-filters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      1 1 1 0 0"
            />
            <feComposite in="SourceGraphic" operator="out" />
          </filter>
        </defs>
      </svg>
    `;
    document.body.appendChild(svgWrapper);
  }

  // 2. Inject Styles for Knockout Ripple & Shockwave
  if (!document.getElementById('whodis-knockout-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'whodis-knockout-styles';
    styleEl.textContent = `
      /* Knockout Host Preparation */
      .btn-knockout,
      .btn-green-solid,
      button[type="submit"],
      #search-form button,
      #sos-trigger-btn,
      a.btn-green-solid,
      .whodis-ripple-target,
      a[href^="tel:"] {
        position: relative !important;
        overflow: hidden !important;
        isolation: isolate;
        -webkit-mask-image: -webkit-radial-gradient(white, black);
      }

      /* Micro-Spring Tactile Press */
      .btn-knockout:active,
      .btn-green-solid:active,
      button[type="submit"]:active,
      #search-form button:active,
      #sos-trigger-btn:active,
      a[href^="tel:"]:active {
        transform: scale(0.96) !important;
        transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }

      /* The Inverted Cutout Stencil Ripple */
      .whodis-knockout-ripple {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        background-color: #ffffff;
        mix-blend-mode: difference;
        transform: scale(0);
        animation: whodisKnockoutAnim 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        z-index: 80;
        will-change: transform, opacity;
      }

      /* Glowing Shockwave Ring */
      .whodis-knockout-shockwave {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 14px rgba(255, 255, 255, 0.7), inset 0 0 6px rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: whodisShockwaveAnim 0.72s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        z-index: 85;
        will-change: transform, opacity;
      }

      @keyframes whodisKnockoutAnim {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        55% {
          opacity: 1;
        }
        100% {
          transform: scale(2.8);
          opacity: 0;
        }
      }

      @keyframes whodisShockwaveAnim {
        0% {
          transform: scale(0.05);
          opacity: 1;
        }
        100% {
          transform: scale(2.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 3. Pointerdown listener with delegation
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest(
      '.btn-knockout, .btn-green-solid, button[type="submit"], #search-form button, #sos-trigger-btn, a.btn-green-solid, .whodis-ripple-target, a[href^="tel:"]'
    );
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = (e.clientX && e.clientX > 0) ? (e.clientX - rect.left) : (rect.width / 2);
    const y = (e.clientY && e.clientY > 0) ? (e.clientY - rect.top) : (rect.height / 2);

    const maxDim = Math.max(rect.width, rect.height);
    const diameter = maxDim * 2.6;

    const ripple = document.createElement('span');
    ripple.className = 'whodis-knockout-ripple';
    ripple.style.width = diameter + 'px';
    ripple.style.height = diameter + 'px';
    ripple.style.left = (x - diameter / 2) + 'px';
    ripple.style.top = (y - diameter / 2) + 'px';

    const shockwave = document.createElement('span');
    shockwave.className = 'whodis-knockout-shockwave';
    shockwave.style.width = diameter + 'px';
    shockwave.style.height = diameter + 'px';
    shockwave.style.left = (x - diameter / 2) + 'px';
    shockwave.style.top = (y - diameter / 2) + 'px';

    btn.appendChild(ripple);
    btn.appendChild(shockwave);

    setTimeout(() => {
      ripple.remove();
      shockwave.remove();
    }, 750);
  }, { passive: true });
}


