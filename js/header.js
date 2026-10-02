// js/header.js - Navigation Header Component ที่คงสไตล์เดิม 100%

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderSosWidget();
  initKnockoutButtonEffect();
  initTosFooterLink();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  renderHeader();
  renderSosWidget();
  initKnockoutButtonEffect();
  initTosFooterLink();
}

function renderHeader() {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  // ฝังสไตล์ Global: ฟอนต์ไทยมีหัว (Sarabun), พื้นหลังขาวล้วน (#ffffff), แถบเมนู Hover/Active
  if (!document.getElementById('whodis-nav-custom-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'whodis-nav-custom-style';
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

      html, body {
        background-color: #ffffff !important;
        font-family: 'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }

      .bg-base-bg {
        background-color: #ffffff !important;
      }

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
    <!-- Floating Action Buttons Stack (Contact Developer + Emergency SOS) -->
    <div id="whodis-floating-actions" class="fixed z-[99999] flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none"
         style="bottom: max(1.25rem, env(safe-area-inset-bottom, 1.25rem)); right: max(1.25rem, env(safe-area-inset-right, 1.25rem));">
      
      <!-- 1. Floating Contact Developer Trigger Button (Top: Icon-Only Circle FAB) -->
      <button id="contact-dev-trigger-btn" onclick="toggleContactDevModal(true)" 
              class="btn-knockout pointer-events-auto group flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-[0_8px_25px_rgba(15,23,42,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-slate-700/60 cursor-pointer w-12 h-12 sm:w-13 sm:h-13"
              title="ติดต่อผู้พัฒนา (Whodisdetected@gmail.com)"
              aria-label="ติดต่อผู้พัฒนา">
        <span class="material-symbols-outlined text-[24px] sm:text-[26px] text-slate-200 group-hover:text-emerald-400 transition-colors">support_agent</span>
      </button>

      <!-- 2. Floating SOS Trigger Button (Bottom) -->
      <button id="sos-trigger-btn" onclick="toggleSosModal(true)" 
              class="btn-knockout pointer-events-auto group flex items-center justify-center bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/40 cursor-pointer w-13 h-13 sm:w-auto sm:h-auto sm:py-3 sm:px-5 gap-2.5"
              title="สายด่วนโทรอายัดบัญชีด่วนทุกธนาคาร 24 ชม.">
        <!-- Pulsing Beacon Indicator -->
        <span class="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto flex h-3.5 w-3.5 sm:h-2.5 sm:w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-2.5 sm:w-2.5 bg-amber-300 border-2 border-red-600 sm:border-0"></span>
        </span>
        <span class="material-symbols-outlined text-[24px] sm:text-[20px] text-white">e911_emergency</span>
        <span class="sos-btn-text text-[13.5px] tracking-wide whitespace-nowrap hidden sm:inline">สายด่วนอายัดบัญชี</span>
      </button>
    </div>

    <!-- Contact Developer Modal Backdrop & Dialog -->
    <div id="contact-dev-modal" class="hidden fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div class="relative w-full sm:max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative border-b border-slate-700/50">
          <button onclick="toggleContactDevModal(false)" class="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer" title="ปิดหน้าต่าง">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/20">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> พร้อมรับฟังและช่วยเหลือ
          </div>
          <h3 class="text-[19px] sm:text-[21px] font-bold leading-snug flex items-center gap-2">
            <span class="material-symbols-outlined text-[24px] text-emerald-400">support_agent</span> ติดต่อผู้พัฒนา Whodis
          </h3>
          <p class="text-slate-300 text-xs mt-1">ยินดีรับฟังข้อเสนอแนะ แจ้งปัญหาการใช้งาน หรือแลกเปลี่ยนเพื่อพัฒนาแพลตฟอร์ม</p>
        </div>

        <!-- Body Content (Scrollable) -->
        <div class="p-5 overflow-y-auto space-y-4 flex-1">
          
          <!-- Primary Email Card -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px] text-slate-500">mail</span> อีเมลทางการของผู้พัฒนา
              </span>
              <span class="text-[10.5px] text-emerald-700 bg-emerald-100/70 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Official Contact</span>
            </div>
            
            <div class="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
              <div class="min-w-0 flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">alternate_email</span>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] text-slate-400 font-medium">Developer & Admin Email</p>
                  <p class="text-[13px] sm:text-[14px] font-mono font-bold text-slate-800 truncate select-all">Whodisdetected@gmail.com</p>
                </div>
              </div>
              <button onclick="copyDevEmail()" class="btn-knockout px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer" title="คัดลอกอีเมล">
                <span class="material-symbols-outlined text-[16px]">content_copy</span>
                <span>คัดลอก</span>
              </button>
            </div>

            <!-- Mailto direct action button -->
            <a href="mailto:Whodisdetected@gmail.com?subject=%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%85%E0%B9%88%E0%B8%AD%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%9E%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B8%B2%20Whodis" 
               class="btn-knockout mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>เปิดแอปส่งอีเมลทันที (Mail App)</span>
            </a>
          </div>

          <!-- Common Topics (3 Topics) -->
          <div class="space-y-2">
            <p class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-slate-500">list_alt</span> หัวข้อที่สามารถติดต่อได้
            </p>
            <div class="space-y-2 text-xs">
              <div class="p-3 bg-white border border-slate-200/90 rounded-xl flex items-start gap-2.5 shadow-2xs">
                <span class="text-lg shrink-0">🐞</span>
                <div>
                  <p class="font-bold text-slate-800">แจ้งพบปัญหา</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">ระบบทำงานผิดปกติ หรือพบข้อผิดพลาดบนหน้าเว็บ</p>
                </div>
              </div>
              <div class="p-3 bg-white border border-slate-200/90 rounded-xl flex items-start gap-2.5 shadow-2xs">
                <span class="text-lg shrink-0">💡</span>
                <div>
                  <p class="font-bold text-slate-800">เสนอแนะฟีเจอร์ใหม่</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">ไอเดียปรับปรุง หรือฟังก์ชันที่อยากให้มีใน Whodis</p>
                </div>
              </div>
              <div class="p-3 bg-white border border-slate-200/90 rounded-xl flex items-start gap-2.5 shadow-2xs">
                <span class="text-lg shrink-0">🤝</span>
                <div>
                  <p class="font-bold text-slate-800">สนับสนุนโครงการ</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">ร่วมมือพัฒนาข้อมูล หรือแลกเปลี่ยนแนวทางป้องกันภัย</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <p class="text-[11px] text-slate-500">ทีมงานจะตอบกลับทางอีเมลโดยเร็วที่สุด • ปกติภายใน 24-48 ชั่วโมง</p>
        </div>
      </div>
    </div>

    <!-- SOS Modal Backdrop & Dialog -->
    <div id="sos-modal" class="hidden fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200">
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

    <!-- Terms of Service & Privacy Policy Modal Backdrop & Dialog -->
    <div id="whodis-tos-modal" class="hidden fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div class="relative w-full sm:max-w-[580px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-100">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative border-b border-slate-700/50">
          <button id="tos-close-btn" onclick="toggleTosModal(false)" class="hidden absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer" title="ปิดหน้าต่าง">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/20">
            <span class="material-symbols-outlined text-[14px]">policy</span> นโยบายและข้อกำหนด (Terms & Privacy)
          </div>
          <h3 class="text-[17px] sm:text-[19px] font-bold leading-snug">
            ข้อกำหนดและเงื่อนไขการใช้งาน และนโยบายความเป็นส่วนตัว
          </h3>
          <p class="text-slate-300 text-xs mt-0.5">(Terms of Service & Privacy Policy)</p>
        </div>

        <!-- Scrollable Terms Content -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-700 bg-slate-50/50 flex-1 divide-y divide-slate-200/70">
          <div class="text-slate-800 font-medium">
            ยินดีต้อนรับสู่ <strong class="font-bold text-slate-900">whodis</strong> กรุณาอ่านข้อกำหนด เงื่อนไขการใช้งาน และนโยบายความเป็นส่วนตัวอย่างละเอียดก่อนเข้าสู่ระบบและเริ่มใช้งาน การที่ท่านเข้าถึง ใช้งาน นำเข้า หรือส่งข้อมูลเข้ามายังเว็บไซต์ ถือว่าท่านได้รับทราบ ทำความเข้าใจ และตกลงยินยอมผูกพันตามข้อตกลงและเงื่อนไขทั้งหมดด้านล่างนี้โดยสมบูรณ์
          </div>

          <!-- 1. วัตถุประสงค์ การเก็บรวบรวม และการประมวลผลข้อมูล -->
          <div class="pt-3.5 space-y-2">
            <h4 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <span>1.</span> วัตถุประสงค์ การเก็บรวบรวม และการประมวลผลข้อมูล (Data Collection & Processing)
            </h4>
            <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600">
              <p>• วัตถุประสงค์เพื่อประโยชน์สาธารณะ: การจัดทำฐานข้อมูลนี้มีขึ้นเพื่อประโยชน์สาธารณะในการเฝ้าระวัง แจ้งเตือน และป้องกันภัยจากการหลอกลวงหรือฉ้อโกงทางออนไลน์ในสังคม</p>
              <p>• ความยินยอมในการเปิดเผยข้อมูล: ผู้ใช้งานรับทราบและยินยอมโดยชัดแจ้งให้ whodis จัดเก็บ ประมวลผล และเปิดเผยข้อมูลเบาะแส (รวมถึงชื่อ-นามสกุลที่เกี่ยวข้องกับธุรกรรม, เลขที่บัญชีธนาคาร, วอลเล็ต, หมายเลขโทรศัพท์, บัญชีสื่อสังคมออนไลน์, รูปภาพสลิปธุรกรรม, ภาพถ่ายหน้าจอการสนทนา และพฤติการณ์) ต่อสาธารณะและผู้ใช้งานอื่น เพื่อการตรวจสอบความปลอดภัย</p>
              <p>• ข้อมูลทางเทคนิคและประวัติการเข้าใช้งาน: ระบบมีการบันทึกข้อมูลจราจรทางคอมพิวเตอร์เบื้องต้น ได้แก่ หมายเลข IP Address, ข้อมูลอุปกรณ์/เบราว์เซอร์, บันทึกวันและเวลาที่ทำรายการ (Timestamps) รวมถึงคุกกี้ (Cookies) เพื่อรักษาเสถียรภาพความปลอดภัยของระบบ และใช้เป็นหลักฐานยืนยันความโปร่งใสตาม พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์</p>
            </div>
          </div>

          <!-- 2. ข้อจำกัดความรับผิดชอบและการสงวนสิทธิ์ทางกฎหมาย -->
          <div class="pt-3.5 space-y-2">
            <h4 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <span>2.</span> ข้อจำกัดความรับผิดชอบและการสงวนสิทธิ์ทางกฎหมาย (Limitation of Liability & Disclaimer)
            </h4>
            <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600">
              <p>• สถานะการเป็นผู้ให้บริการพื้นที่ตัวกลาง: whodis ทำหน้าที่เป็นเพียงแพลตฟอร์มกลางในการแบ่งปันและแลกเปลี่ยนข้อมูลเตือนภัยระหว่างภาคประชาชนเท่านั้น มิได้มีสถานะเป็นคู่สัญญา ตัวแทน หรือมีส่วนร่วมรู้เห็นกับการกระทำใดๆ ของบุคคลหรือนิติบุคคลที่ปรากฏในรายงาน</p>
              <p>• การไม่รับประกันความถูกต้องของข้อมูล: แม้ระบบจะมีกระบวนการตรวจสอบเบื้องต้น แต่ข้อมูลเกิดจากการนำเข้าโดยผู้ใช้งานอิสระ ทางเว็บไซต์มิได้รับประกันความถูกต้อง ความแท้จริง ความสมบูรณ์ หรือข้อเท็จจริงของข้อมูลทุกกรณี ผู้ใช้งานต้องใช้วิจารณญาณส่วนบุคคลอย่างรอบคอบก่อนตัดสินใจทำธุรกรรมใดๆ</p>
              <p>• การปฏิเสธความรับผิดชอบอย่างเด็ดขาด: whodis ตลอดจนผู้พัฒนา ผู้ดูแลระบบ และทีมงาน ขอปฏิเสธความรับผิดชอบต่อความสูญเสีย ความเสียหาย ทั้งทางตรง ทางอ้อม หรือค่าเสียหายต่อเนื่อง (รวมถึงการสูญเสียทรัพย์สิน การเสียโอกาสทางธุรกิจ ความเสียหายต่อชื่อเสียง หรือข้อพิพาททางคดีความ) ที่เกิดขึ้นจากการนำข้อมูลบนเว็บไซต์ไปใช้งาน อ้างอิง หรือการรายงานข้อมูล</p>
            </div>
          </div>

          <!-- 3. หน้าที่ ความซื่อสัตย์ และความรับผิดชอบตามกฎหมายของผู้ใช้งาน -->
          <div class="pt-3.5 space-y-2">
            <h4 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <span>3.</span> หน้าที่ ความซื่อสัตย์ และความรับผิดชอบตามกฎหมายของผู้ใช้งาน (User Responsibilities & Accountability)
            </h4>
            <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600">
              <p>• พันธกรณีในการให้ข้อมูลจริงและมีหลักฐาน: ผู้ใช้งานตกลงและรับรองว่าจะให้ข้อมูลที่เป็นความจริง มีมูลความจริงจากการติดต่อหรือทำธุรกรรม และมีพยานหลักฐานประกอบที่ตรวจสอบได้ เช่น สลิปโอนเงิน บันทึกการสนทนา หรือใบแจ้งความ</p>
              <p>• ข้อห้ามการกลั่นแกล้งและแจ้งข้อมูลเท็จ: ห้ามมิให้นำเข้าข้อมูลเท็จ ข้อมูลที่บิดเบือน หรือใช้ระบบเป็นเครื่องมือในการทวงหนี้ส่วนตัว กลั่นแกล้ง หมิ่นประมาท หรือทำลายชื่อเสียงของผู้อื่นโดยมิชอบ หากตรวจพบ ทางเว็บไซต์จะระงับการใช้งานทันที และพร้อมส่งมอบข้อมูลทางเทคนิคทั้งหมดให้แก่เจ้าหน้าที่ตำรวจเพื่อดำเนินคดีตามกฎหมายอย่างถึงที่สุด</p>
              <p>• ความรับผิดชอบตามกฎหมายส่วนบุคคล: ผู้ใช้งานตกลงว่าตนเองเป็นผู้รับผิดชอบต่อผลกระทบทางกฎหมายทุกประการ ทั้งทางแพ่งและทางอาญา จากข้อมูลที่ตนเองเป็นผู้นำเข้าแต่เพียงผู้เดียว และจะไม่เรียกร้องความรับผิดใดๆ ต่อเว็บไซต์และผู้พัฒนา</p>
            </div>
          </div>

          <!-- 4. สิทธิ์ในการกำกับดูแลเนื้อหาและกระบวนการยื่นคำร้องโต้แย้ง -->
          <div class="pt-3.5 space-y-2">
            <h4 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <span>4.</span> สิทธิ์ในการกำกับดูแลเนื้อหาและกระบวนการยื่นคำร้องโต้แย้ง (Content Moderation & Dispute Resolution)
            </h4>
            <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600">
              <p>• สิทธิ์เด็ดขาดในการจัดการเนื้อหา: เว็บไซต์สงวนสิทธิ์เด็ดขาดแต่เพียงผู้เดียวในการตรวจสอบ คัดกรอง ซ่อน ลบ แก้ไข หรือระงับการแสดงผลข้อมูล รายงาน หรือบัญชีผู้ใช้งานใดๆ ที่เห็นว่าไม่เหมาะสม มีข้อพิพาท หรือขัดต่อกฎหมาย โดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
              <p>• สิทธิในการยื่นคำร้องโต้แย้งสำหรับผู้ถูกพาดพิง: กรณีบุคคลใดเห็นว่าข้อมูลที่ปรากฏไม่ถูกต้อง คลาดเคลื่อน หรือได้รับการแก้ไขเยียวยาความเสียหายเรียบร้อยแล้ว สามารถติดต่อผู้พัฒนาผ่านช่องทางติดต่อเพื่อแสดงหลักฐานความบริสุทธิ์ใจ (เช่น สลิปโอนเงินคืน, บันทึกการถอนแจ้งความ) เพื่อให้ทีมงานตรวจสอบและพิจารณาปรับปรุงหรือนำข้อมูลออกจากระบบ</p>
              <p>• การปรับปรุงข้อกำหนด: เว็บไซต์ขอสงวนสิทธิ์ในการปรับปรุงแก้ไขข้อกำหนดนี้ได้ตลอดเวลาเพื่อให้สอดคล้องกับข้อกฎหมายและการให้บริการ โดยจะมีผลบังคับใช้ทันทีเมื่อเผยแพร่บนเว็บไซต์</p>
            </div>
          </div>
        </div>

        <!-- Footer / Acceptance Controls (Consent Mode) -->
        <div id="tos-consent-controls" class="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 space-y-3">
          <label class="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" id="tos-agree-checkbox" onchange="toggleTosAcceptBtn()" class="w-4 h-4 mt-0.5 accent-slate-900 rounded cursor-pointer">
            <span class="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
              ฉันได้อ่าน ทำความเข้าใจ และยอมรับข้อกำหนด เงื่อนไข และนโยบายความเป็นส่วนตัวทั้งหมดของ whodis
            </span>
          </label>
          <button id="tos-accept-btn" onclick="confirmAcceptTos()" disabled 
                  class="btn-knockout w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <span>ยอมรับและเข้าสู่เว็บไซต์</span>
          </button>
        </div>

        <!-- Footer for Read-Only Mode (Close Button) -->
        <div id="tos-readonly-controls" class="hidden p-4 bg-white border-t border-slate-200 text-center shrink-0">
          <button onclick="toggleTosModal(false)" class="btn-knockout w-full sm:w-auto px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer">
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(container);
  renderSosBankItems(SOS_BANKS);

  // Close modals when clicking backdrop
  const modal = document.getElementById('sos-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) toggleSosModal(false);
    });
  }

  const devModal = document.getElementById('contact-dev-modal');
  if (devModal) {
    devModal.addEventListener('click', (e) => {
      if (e.target === devModal) toggleContactDevModal(false);
    });
  }

  const tosModal = document.getElementById('whodis-tos-modal');
  if (tosModal) {
    tosModal.addEventListener('click', (e) => {
      const consentControls = document.getElementById('tos-consent-controls');
      const isConsentMode = consentControls && !consentControls.classList.contains('hidden');
      if (e.target === tosModal && !isConsentMode) {
        toggleTosModal(false);
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleSosModal(false);
      toggleContactDevModal(false);
      const consentControls = document.getElementById('tos-consent-controls');
      const isConsentMode = consentControls && !consentControls.classList.contains('hidden');
      if (!isConsentMode) {
        toggleTosModal(false);
      }
    }
  });

  initTosFooterLink();

  // If user is logged in but hasn't accepted ToS yet (and not currently on login.html), show consent modal
  setTimeout(() => {
    try {
      const user = (window.Auth && typeof window.Auth.getUser === 'function') ? window.Auth.getUser() : null;
      if (user && user.id) {
        const isAccepted = localStorage.getItem('whodis_tos_accepted_' + user.id);
        const path = window.location.pathname.toLowerCase();
        if (isAccepted !== 'true' && !path.includes('login')) {
          toggleTosModal(true, true);
        }
      }
    } catch (e) {}
  }, 120);
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

function toggleContactDevModal(show) {
  const modal = document.getElementById('contact-dev-modal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

let __whodisTosOnAccept = null;

function toggleTosModal(show, isConsentMode = false, onAccept = null) {
  const modal = document.getElementById('whodis-tos-modal');
  if (!modal) return;
  if (show) {
    __whodisTosOnAccept = onAccept;
    const consentControls = document.getElementById('tos-consent-controls');
    const readonlyControls = document.getElementById('tos-readonly-controls');
    const closeBtn = document.getElementById('tos-close-btn');
    const agreeCheckbox = document.getElementById('tos-agree-checkbox');
    const acceptBtn = document.getElementById('tos-accept-btn');

    if (isConsentMode) {
      if (consentControls) consentControls.classList.remove('hidden');
      if (readonlyControls) readonlyControls.classList.add('hidden');
      if (closeBtn) closeBtn.classList.add('hidden');
      if (agreeCheckbox) agreeCheckbox.checked = false;
      if (acceptBtn) acceptBtn.disabled = true;
    } else {
      if (consentControls) consentControls.classList.add('hidden');
      if (readonlyControls) readonlyControls.classList.remove('hidden');
      if (closeBtn) closeBtn.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    __whodisTosOnAccept = null;
  }
}

function toggleTosAcceptBtn() {
  const checkbox = document.getElementById('tos-agree-checkbox');
  const btn = document.getElementById('tos-accept-btn');
  if (checkbox && btn) {
    btn.disabled = !checkbox.checked;
  }
}

function confirmAcceptTos() {
  const user = (window.Auth && typeof window.Auth.getUser === 'function') ? window.Auth.getUser() : null;
  if (user && user.id) {
    localStorage.setItem('whodis_tos_accepted_' + user.id, 'true');
  } else {
    localStorage.setItem('whodis_tos_accepted_guest', 'true');
  }

  const cb = __whodisTosOnAccept;
  __whodisTosOnAccept = null;

  toggleTosModal(false);

  if (typeof cb === 'function') {
    try {
      cb();
    } catch (err) {
      console.error('Error executing ToS onAccept callback:', err);
      window.location.replace('index.html');
    }
  } else {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('login');
    if (isLoginPage) {
      const target = (user && (user.role || '').toLowerCase() === 'admin') ? 'admin_reports.html' : 'index.html';
      window.location.replace(target);
    }
  }
}

function initTosFooterLink() {
  if (document.getElementById('whodis-tos-footer-link')) return;
  const footerContainer = document.querySelector('footer > div') || document.querySelector('footer');
  if (!footerContainer) return;

  const linkDiv = document.createElement('div');
  linkDiv.id = 'whodis-tos-footer-link';
  linkDiv.className = 'mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-center gap-4 text-[11.5px] text-muted-text';
  linkDiv.innerHTML = `
    <button type="button" onclick="toggleTosModal(true, false)" class="hover:text-primary-text hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
      <span class="material-symbols-outlined text-[15px] text-slate-400">gavel</span>
      <span>ข้อกำหนดและนโยบายความเป็นส่วนตัว (Terms of Service & Privacy Policy)</span>
    </button>
  `;
  footerContainer.appendChild(linkDiv);
}

function copyDevEmail() {
  const email = 'Whodisdetected@gmail.com';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(() => {
      showWhodisToast('คัดลอกอีเมล ' + email + ' สำเร็จแล้ว!');
    }).catch(() => {
      fallbackCopyEmail(email);
    });
  } else {
    fallbackCopyEmail(email);
  }
}

function fallbackCopyEmail(text) {
  const temp = document.createElement('input');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showWhodisToast('คัดลอกอีเมล ' + text + ' สำเร็จแล้ว!');
  } catch (err) {
    prompt('คัดลอกอีเมลนี้:', text);
  }
  document.body.removeChild(temp);
}

function showWhodisToast(msg) {
  let toast = document.getElementById('whodis-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'whodis-global-toast';
    toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200000] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 pointer-events-none opacity-0 -translate-y-3 border border-slate-700/60';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span><span>${escapeHtml(msg)}</span>`;
  toast.classList.remove('opacity-0', '-translate-y-3');
  toast.classList.add('opacity-100', 'translate-y-0');
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-3');
  }, 2600);
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
      a.btn-green-solid,
      .whodis-ripple-target,
      a[href^="tel:"] {
        position: relative !important;
        overflow: hidden !important;
        isolation: isolate;
        -webkit-mask-image: -webkit-radial-gradient(white, black);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, filter 0.2s ease !important;
      }

      /* Viewport Fixed Stack Container for Action Buttons (Contact Dev + SOS) */
      #whodis-floating-actions {
        position: fixed !important;
        bottom: max(1.25rem, env(safe-area-inset-bottom, 1.25rem)) !important;
        right: max(1.25rem, env(safe-area-inset-right, 1.25rem)) !important;
        z-index: 999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-end !important;
        gap: 12px !important;
        pointer-events: none !important;
      }
      #whodis-floating-actions > * {
        pointer-events: auto !important;
      }

      /* Contact Developer Trigger Button (Circle Icon FAB) */
      #contact-dev-trigger-btn {
        width: 50px !important;
        height: 50px !important;
        min-width: 50px !important;
        min-height: 50px !important;
        border-radius: 9999px !important;
        background: #0f172a !important;
        color: #ffffff !important;
        border: 2px solid rgba(255, 255, 255, 0.25) !important;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.45) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease !important;
      }
      #contact-dev-trigger-btn:hover {
        transform: scale(1.08) !important;
        background: #1e293b !important;
        box-shadow: 0 6px 24px rgba(15, 23, 42, 0.6) !important;
      }
      #contact-dev-trigger-btn:active {
        transform: scale(0.95) !important;
      }

      /* SOS Trigger Button */
      #sos-trigger-btn {
        position: relative !important;
        bottom: auto !important;
        right: auto !important;
        z-index: 1 !important;
        overflow: hidden !important;
        isolation: isolate;
        -webkit-mask-image: -webkit-radial-gradient(white, black);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, filter 0.2s ease !important;
      }

      @media (max-width: 639px) {
        #whodis-floating-actions {
          bottom: max(1rem, env(safe-area-inset-bottom, 1rem)) !important;
          right: max(1rem, env(safe-area-inset-right, 1rem)) !important;
          gap: 10px !important;
        }
        #contact-dev-trigger-btn {
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          min-height: 48px !important;
        }
        #sos-trigger-btn {
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          min-height: 48px !important;
          padding: 0 !important;
        }
        #sos-trigger-btn .sos-btn-text {
          display: none !important;
        }
      }

      @media (min-width: 640px) {
        #sos-trigger-btn .sos-btn-text {
          display: inline !important;
        }
      }

      /* Subtle Cyber Silver Glow & Micro-Lift on Hover (Monochrome - No Green) */
      .btn-knockout:hover,
      .btn-green-solid:hover,
      button[type="submit"]:hover,
      #search-form button:hover,
      #sos-trigger-btn:hover,
      a.btn-green-solid:hover,
      .whodis-ripple-target:hover,
      a[href^="tel:"]:hover {
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.22), inset 0 0 0 1.5px rgba(255, 255, 255, 0.45) !important;
        filter: brightness(1.06);
      }

      /* Knockout Sweep Beam on Hover (Clean Silver Sheen - No Green) */
      .btn-knockout::before,
      .btn-green-solid::before,
      button[type="submit"]::before,
      #search-form button::before,
      #sos-trigger-btn::before,
      a.btn-green-solid::before,
      .whodis-ripple-target::before,
      a[href^="tel:"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: -130%;
        width: 60%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.24) 50%,
          transparent 100%
        );
        transform: skewX(-20deg);
        pointer-events: none;
        z-index: 10;
        transition: left 0s ease;
      }

      .btn-knockout:hover::before,
      .btn-green-solid:hover::before,
      button[type="submit"]:hover::before,
      #search-form button:hover::before,
      #sos-trigger-btn:hover::before,
      a.btn-green-solid:hover::before,
      .whodis-ripple-target:hover::before,
      a[href^="tel:"]:hover::before {
        left: 170%;
        transition: left 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Micro-Spring Tactile Press on Click */
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
      '.btn-knockout, .btn-green-solid, button[type="submit"], #search-form button, #sos-trigger-btn, #contact-dev-trigger-btn, a.btn-green-solid, .whodis-ripple-target, a[href^="tel:"]'
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


