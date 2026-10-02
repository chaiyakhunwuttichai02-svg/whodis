// js/header.js - Navigation Header Component ที่คงสไตล์เดิม 100%

document.addEventListener('DOMContentLoaded', () => {
  initFavicon();
  renderHeader();
  renderSosWidget();
  initKnockoutButtonEffect();
  initTosFooterLink();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initFavicon();
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
    { name: 'แนวทางเมื่อถูกฉ้อโกง', url: 'emergency.html', isPublic: false }
  ];

  if (isAdmin) {
    navItems.push({ name: '⚙️ หลังบ้าน', url: 'admin_reports.html', isPublic: false });
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
  } else if (cleanCurrent === 'login') {
    userActionHtml = '';
    mobileUserHtml = '';
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
        <a href="index.html" class="flex items-center gap-2.5 group">
          <img src="assets/logo.png" alt="Whodis" class="w-8 h-8 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform">
          <span class="text-[18px] font-bold text-[#012b65] tracking-tight">Whodis</span>
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
        <div id="whodis-tos-scroll-body" onscroll="handleTosScroll()" class="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-[13px] leading-relaxed text-slate-700 bg-slate-50/50 flex-1">
          <!-- Language Precedence Clause -->
          <div class="p-3.5 bg-blue-50 border border-blue-200/90 rounded-2xl text-[12px] text-blue-950 leading-relaxed font-medium shadow-2xs">
            <span class="font-bold">⚠️ Language Precedence:</span> In the event of any inconsistency between the English and Thai versions of these Terms, the Thai version shall prevail. / ในกรณีที่มีข้อความขัดแย้งกันระหว่างข้อกำหนดฉบับภาษาไทยและภาษาอังกฤษ ให้ยึดถือฉบับภาษาไทยเป็นหลัก
          </div>

          <!-- ========================================== -->
          <!-- ENGLISH VERSION (ฉบับภาษาอังกฤษ) -->
          <!-- ========================================== -->
          <div class="space-y-4 pt-1">
            <div class="pb-2.5 border-b border-slate-200">
              <h4 class="font-black text-slate-900 text-sm sm:text-base">Terms and Conditions of Use</h4>
              <p class="text-[11px] text-slate-500 font-medium">English Version (ฉบับภาษาอังกฤษ)</p>
            </div>

            <div class="text-slate-700 leading-relaxed space-y-2">
              <p>Throughout this Website, the term <strong class="font-semibold text-slate-900">"User"</strong> refers to any person who accesses, uses, registers with, or submits content to this Website, whether directly or indirectly.</p>
              <p>The term <strong class="font-semibold text-slate-900">"Service Provider"</strong> refers to <strong class="font-bold text-slate-900">whodis</strong>, which operates this platform as a user-generated content system.</p>
              <p>This Website operates as a risk information platform. It is not a governmental authority, court of law, law enforcement agency, or dispute resolution body. The Website does not make legal determinations, judgments, or findings of guilt against any individual or entity.</p>
              <p>Use of this Website must comply with the following terms and conditions. By accessing or using this Website, Users acknowledge and agree to be legally bound by these Terms. If Users do not agree, they must immediately cease using the Website.</p>
            </div>

            <!-- EN 1. User Responsibilities -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>1.</span> User Responsibilities
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• Users must submit information that is accurate, truthful, and supported by sufficient evidence. If the Service Provider determines that a User has submitted false, misleading, or fraudulent information, the Service Provider may suspend, restrict, or terminate the User's access and remove content without prior notice.</p>
                <p>• Users are solely responsible for all content they submit. The Service Provider shall not be liable for any content submitted by Users under any circumstance.</p>
                <p>• Users must not use this Website for unlawful purposes, to defame others, or to cause harm for personal gain. Reporting in good faith for legitimate public interest is permitted.</p>
                <p>• Users represent and warrant that submitted information does not infringe on any intellectual property rights, privacy rights, or applicable laws.</p>
                <p>• By submitting content, Users grant whodis a non-exclusive, worldwide, royalty-free, perpetual license to store, reproduce, display, analyze, process, and publish such content to operate the Website.</p>
                <p>• Users agree to indemnify and hold harmless the Service Provider from any claims, damages, liabilities, or legal expenses arising from their submitted content or violation of these Terms.</p>
                <p>• If Users violate applicable Thai law (including the Computer Crime Act), the Service Provider reserves the right to disclose User information to competent authorities.</p>
              </div>
            </div>

            <!-- EN 2. Service Provider Rights and Limitations -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>2.</span> Service Provider Rights and Limitations
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• whodis provides this user-generated reporting platform free of charge.</p>
                <p>• The Service Provider reserves the right to modify, suspend, or discontinue any part of the Website without prior notice.</p>
                <p>• The Service Provider has no obligation to monitor all submitted content and does not assume responsibility for actively reviewing each submission prior to publication.</p>
                <p>• The Service Provider does not endorse, verify, or adopt any statements made by Users. All opinions and allegations are solely those of the respective Users.</p>
                <p>• The Service Provider reserves the right to remove, restrict, or modify any content that violates these Terms or lacks sufficient supporting evidence at its sole discretion.</p>
              </div>
            </div>

            <!-- EN 3. Intellectual Property -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>3.</span> Intellectual Property
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• All Website content, including software, databases, algorithms, trademarks, logos, and system architecture, is the intellectual property of whodis.</p>
                <p>• Users may not reproduce, copy, extract, scrape (including bulk data extraction), distribute, or commercially exploit any portion of the Website without prior written permission.</p>
              </div>
            </div>

            <!-- EN 4. Dispute Resolution & Reimbursement -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>4.</span> Dispute Resolution & Reimbursement
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• The Service Provider is not involved in any transactions. Transactions are strictly between the User and the seller/party. The Service Provider is not responsible for any damages arising from such transactions.</p>
                <p>• If a reported party wishes to take responsibility for damages to have their name removed, whodis will only facilitate the exchange of necessary contact information for direct resolution.</p>
                <p>• Once Users have received appropriate compensation (e.g., a refund or the product), it is the User's responsibility to request the removal of their report from the system.</p>
              </div>
            </div>

            <!-- EN 5. Disclaimer and Limitation of Liability -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>5.</span> Disclaimer and Limitation of Liability
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• All information on this Website is user-generated and is provided on an "as-is" and "as-available" basis. The Service Provider makes no representations or warranties regarding accuracy, completeness, or reliability.</p>
                <p>• The Service Provider shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use of the Website or reliance on submitted content.</p>
                <p>• Information on the Website constitutes "Risk Signals". Any use of this information should be subject to the user's own discretion and risk assessment.</p>
              </div>
            </div>

            <!-- EN 6. Governing Law & Privacy Policy (PDPA) -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>6.</span> Governing Law & Privacy Policy (PDPA)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Thailand.</p>
                <p>• By accepting these Terms, Users also agree to comply with the Personal Data Protection Act (PDPA) Policy of the Website, acknowledging that data is collected for verification and legal compliance purposes.</p>
              </div>
            </div>

            <!-- EN 7. Notice and Content Removal (Complaint) -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>7.</span> Notice and Content Removal (Complaint)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• If any individual believes that content published on this Website violates their legal rights, is false, or defamatory, they may submit a written complaint with supporting evidence through the designated contact channel.</p>
                <p>• Complaints must be submitted in good faith. The Service Provider reserves the right to restrict or remove content pending investigation.</p>
                <p class="font-semibold text-slate-800 pt-1">
                  Contact Administrator / File a Complaint: 
                  <a href="mailto:Whodisdetected@gmail.com" class="text-blue-600 hover:underline font-mono font-bold">Whodisdetected@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

          <!-- Divider between EN and TH -->
          <div class="my-6 border-t-2 border-dashed border-slate-300"></div>

          <!-- ========================================== -->
          <!-- THAI VERSION (ฉบับภาษาไทย) -->
          <!-- ========================================== -->
          <div class="space-y-4 pt-1">
            <div class="pb-2.5 border-b border-slate-200">
              <h4 class="font-black text-slate-900 text-sm sm:text-base">ข้อกำหนดและเงื่อนไขการใช้งานเบื้องต้น</h4>
              <p class="text-[11px] text-slate-500 font-medium">ฉบับภาษาไทย (Thai Version)</p>
            </div>

            <div class="text-slate-700 leading-relaxed space-y-2">
              <p>ตลอดเว็บไซต์นี้ คำว่า <strong class="font-semibold text-slate-900">"ผู้ใช้บริการ"</strong> หมายถึงบุคคลใดๆ ที่เข้าถึง ใช้งาน สมัครสมาชิก หรือส่งข้อมูลเข้าสู่ระบบของเว็บไซต์นี้ ไม่ว่าทางตรงหรือทางอ้อม</p>
              <p>คำว่า <strong class="font-semibold text-slate-900">"ผู้ให้บริการ"</strong> หมายถึงเว็บไซต์ <strong class="font-bold text-slate-900">whodis</strong> ซึ่งเป็นผู้พัฒนา ดูแล และให้บริการแพลตฟอร์มในลักษณะระบบข้อมูลที่สร้างโดยผู้ใช้งาน (User-generated Content Platform)</p>
              <p>เว็บไซต์นี้เป็นแพลตฟอร์มสำหรับการรวบรวมและแสดงข้อมูลที่ผู้ใช้บริการเป็นผู้นำเข้าสู่ระบบ โดยมีวัตถุประสงค์เพื่อเป็นระบบสัญญาณความเสี่ยง (Risk Information Platform) เว็บไซต์ whodis มิใช่หน่วยงานของรัฐ มิใช่ศาล มิใช่องค์กรบังคับใช้กฎหมาย และมิได้มีอำนาจในการตัดสินข้อพิพาทหรือชี้ขาดความผิดของบุคคลใด</p>
              <p>การใช้เว็บไซต์นี้ต้องเป็นไปตามข้อตกลงและเงื่อนไขการใช้บริการต่อไปนี้ การเข้าถึงหรือใช้งานเว็บไซต์ถือว่าผู้ใช้บริการยอมรับข้อกำหนดและเงื่อนไขทั้งหมด หากผู้ใช้บริการไม่ยอมรับข้อตกลง ผู้ใช้บริการต้องยุติการใช้เว็บไซต์นี้ทันที</p>
            </div>

            <!-- TH 1. หน้าที่และความรับผิดชอบของผู้ใช้บริการ -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>1.</span> หน้าที่และความรับผิดชอบของผู้ใช้บริการ (User Responsibilities)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• ผู้ใช้บริการต้องนำเข้าข้อมูลที่สุจริต ถูกต้อง เป็นความจริง และมีข้อมูลหลักฐานประกอบที่เพียงพอ หากผู้ให้บริการตรวจสอบพบว่าผู้ใช้บริการให้ข้อมูลอันเป็นเท็จ บิดเบือน หรือไม่สุจริต ผู้ให้บริการสามารถระงับการให้บริการ ลบข้อมูล หรือปิดบัญชีผู้ใช้ได้ทันทีโดยไม่ต้องแจ้งล่วงหน้า</p>
                <p>• ผู้ใช้บริการต้องรับผิดชอบต่อข้อมูลที่นำเข้าสู่ระบบแต่เพียงผู้เดียว ทางผู้ให้บริการไม่รับผิดชอบต่อข้อมูล รูปภาพ หรือเนื้อหาใดๆ ที่ผู้ใช้บริการนำเข้า ไม่ว่าในกรณีใดๆ</p>
                <p>• ผู้ใช้บริการต้องไม่ใช้เว็บไซต์นี้ในทางที่ผิดกฎหมาย เพื่อหมิ่นประมาทผู้อื่น หรือทำให้ผู้อื่นเสียหายเพื่อผลประโยชน์ส่วนตัว การนำเข้าข้อมูลอนุญาตเฉพาะการแจ้งเตือนภัยเพื่อประโยชน์สาธารณะโดยสุจริตเท่านั้น</p>
                <p>• ผู้ใช้บริการรับรองว่าข้อมูลที่นำเข้ามานั้นเป็นของตน หรือได้รับความยินยอมจากบุคคลที่เกี่ยวข้องแล้ว และไม่ละเมิดสิทธิในทรัพย์สินทางปัญญา สิทธิส่วนบุคคล หรือกฎหมายใดๆ</p>
                <p>• ผู้ใช้บริการตกลงให้สิทธิแก่ whodis แบบไม่จำกัดเขตพื้นที่ ไม่จำกัดระยะเวลา และไม่มีค่าตอบแทน (Non-exclusive, worldwide, royalty-free license) ในการจัดเก็บ แสดงผล ทำซ้ำ วิเคราะห์ ดัดแปลง และเผยแพร่ข้อมูลที่นำเข้าสู่ระบบ เพื่อวัตถุประสงค์ในการให้บริการของเว็บไซต์</p>
                <p>• หากผู้ใช้บริการก่อให้เกิดความเสียหาย การฟ้องร้อง หรือข้อพิพาททางกฎหมาย ผู้ใช้บริการตกลงชดใช้ค่าเสียหายและค่าใช้จ่ายทางกฎหมายทั้งหมดที่เกิดขึ้นแก่ผู้ให้บริการ (Indemnification)</p>
                <p>• หากละเมิดข้อตกลงหรือกระทำผิดกฎหมาย (รวมถึง พ.ร.บ. คอมพิวเตอร์) ผู้ให้บริการสงวนสิทธิ์ในการลบข้อมูล ปิดบัญชี และเปิดเผยข้อมูลแก่หน่วยงานที่มีอำนาจตามกฎหมาย</p>
              </div>
            </div>

            <!-- TH 2. สิทธิและข้อจำกัดของผู้ให้บริการ -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>2.</span> สิทธิและข้อจำกัดของผู้ให้บริการ (Service Provider)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• whodis ให้บริการแพลตฟอร์มสำหรับการสร้างและค้นหาข้อมูลโดยไม่คิดค่าบริการ</p>
                <p>• ผู้ให้บริการสงวนสิทธิ์ในการเปลี่ยนแปลง แก้ไข ระงับ หรือยกเลิกการให้บริการส่วนใดส่วนหนึ่งของเว็บไซต์ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
                <p>• เว็บไซต์อาจมีระบบตรวจสอบข้อมูลทั้งโดยทีมงานและระบบอัตโนมัติ (AI) เพื่อปรับรูปแบบข้อมูลให้ถูกต้องทางเทคนิค ซึ่งมิได้เป็นการรับรองความถูกต้องของเนื้อหา และผู้ให้บริการไม่รับประกันผลการวิเคราะห์ของระบบดังกล่าว</p>
                <p>• ผู้ให้บริการไม่มีหน้าที่ในการตรวจสอบหรือกลั่นกรองข้อมูลทุกชิ้นก่อนการเผยแพร่ และผู้ให้บริการมิได้ให้การรับรอง เห็นชอบ หรือยืนยันความถูกต้องของข้อกล่าวหาใดๆ ที่ผู้ใช้บริการนำเข้าสู่ระบบ</p>
                <p>• ผู้ให้บริการสงวนสิทธิ์ในการลบ ระงับ หรือแก้ไขข้อมูลที่ไม่เป็นไปตามเงื่อนไข หรือขาดหลักฐานที่เพียงพอ โดยเป็นไปตามดุลพินิจของผู้ให้บริการแต่เพียงผู้เดียว</p>
              </div>
            </div>

            <!-- TH 3. ทรัพย์สินทางปัญญา -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>3.</span> ทรัพย์สินทางปัญญา (Intellectual Property)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• เนื้อหา ซอฟต์แวร์ ฐานข้อมูล อัลกอริทึม เครื่องหมายการค้า โลโก้ และองค์ประกอบทั้งหมดของเว็บไซต์ whodis เป็นทรัพย์สินทางปัญญาของผู้ให้บริการ</p>
                <p>• ห้ามมิให้ผู้ใดทำซ้ำ คัดลอก ดึงข้อมูลจำนวนมาก (Automated scraping) หรือนำไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</p>
              </div>
            </div>

            <!-- TH 4. การรับผิดชอบความเสียหายและระงับข้อพิพาท -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>4.</span> การรับผิดชอบความเสียหายและระงับข้อพิพาท (Dispute & Reimbursement)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• ผู้ให้บริการ ไม่มีส่วนเกี่ยวข้องกับการทำธุรกรรมใดๆ ทั้งสิ้น ธุรกรรมเป็นเรื่องระหว่างผู้ซื้อและผู้ขาย หากเกิดความเสียหาย ผู้ใช้บริการต้องติดต่อคู่กรณีโดยตรง</p>
                <p>• หากผู้ถูกรายงาน (ผู้ขาย/คู่กรณี) ต้องการรับผิดชอบความเสียหายเพื่อขอลบประวัติออกจากระบบ whodis จะเป็นเพียงช่องทางอำนวยความสะดวกในการให้ข้อมูลการติดต่อที่จำเป็นเพื่อการไกล่เกลี่ยเท่านั้น</p>
                <p>• เมื่อผู้เสียหายได้รับการชดใช้ตามสมควรแล้ว (เช่น ได้เงินคืน หรือได้รับสินค้า) ผู้เสียหายมีหน้าที่และความรับผิดชอบในการลบรายงานของตนเองออกจากระบบ</p>
              </div>
            </div>

            <!-- TH 5. การปฏิเสธความรับผิดและข้อจำกัดความรับผิด -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>5.</span> การปฏิเสธความรับผิดและข้อจำกัดความรับผิด (Disclaimer and Limitation of Liability)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• ข้อมูลบนเว็บไซต์เป็นข้อมูลที่สร้างโดยผู้ใช้งานและให้บริการแบบ "ตามสภาพที่เป็นอยู่ (As-is)" และ "เท่าที่มีอยู่ (As-available)" ผู้ให้บริการไม่รับรองหรือรับประกันความถูกต้อง ความสมบูรณ์ ความน่าเชื่อถือ หรือความเป็นปัจจุบันของข้อมูล</p>
                <p>• ผู้ให้บริการจะไม่รับผิดชอบต่อความสูญเสียหรือความเสียหายใดๆ ไม่ว่าทางตรง ทางอ้อม หรือความเสียหายต่อเนื่อง ที่เกิดจากการใช้เว็บไซต์นี้ หรือจากการเชื่อถือข้อมูลที่ปรากฏบนเว็บไซต์</p>
                <p>• ข้อมูลบนเว็บไซต์เป็นเพียง "สัญญาณความเสี่ยง (Risk Signals)" การนำข้อมูลไปใช้ตัดสินใจควรอยู่ภายใต้ดุลพินิจและความเสี่ยงของผู้ใช้งานเอง</p>
              </div>
            </div>

            <!-- TH 6. กฎหมายที่บังคับใช้และการจัดการข้อมูลส่วนบุคคล -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>6.</span> กฎหมายที่บังคับใช้และการจัดการข้อมูลส่วนบุคคล (Governing Law & PDPA)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้การบังคับใช้และการตีความตามกฎหมายแห่งราชอาณาจักรไทย</p>
                <p>• การยอมรับข้อตกลงนี้ หมายถึงผู้ใช้บริการยินยอมตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของทางเว็บไซต์ โดยเว็บไซต์จะเก็บรวบรวมข้อมูลเท่าที่จำเป็นเพื่อการยืนยันตัวตนและป้องกันการกระทำผิดทางกฎหมาย</p>
              </div>
            </div>

            <!-- TH 7. การแจ้งเตือนและการลบเนื้อหา -->
            <div class="pt-3 space-y-2">
              <h5 class="font-bold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <span>7.</span> การแจ้งเตือนและการลบเนื้อหา (Notice and Content Removal / Complaint)
              </h5>
              <div class="pl-3.5 space-y-2 border-l-2 border-slate-300 text-slate-600 text-xs sm:text-[12.5px]">
                <p>• หากบุคคลใดพบว่าเนื้อหาบนเว็บไซต์ละเมิดสิทธิ์ของตน ไม่เป็นความจริง หรือเป็นการหมิ่นประมาท สามารถยื่นคำร้องเป็นลายลักษณ์อักษรพร้อมหลักฐานประกอบ ผ่านช่องทางติดต่อของเว็บไซต์</p>
                <p>• คำร้องต้องกระทำโดยสุจริต การพิจารณาลบเนื้อหาจะเป็นไปตามดุลพินิจของผู้ให้บริการในระหว่างการตรวจสอบ</p>
                <p class="font-semibold text-slate-800 pt-1">
                  ติดต่อผู้ดูแลระบบ / ร้องเรียนได้ที่: 
                  <a href="mailto:Whodisdetected@gmail.com" class="text-blue-600 hover:underline font-mono font-bold">Whodisdetected@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Single Dark Floating Button: Scroll to Bottom (Consent Mode Only) -->
        <button id="tos-floating-scroll-btn" type="button" onclick="scrollTosToBottom()" class="hidden absolute right-4 sm:right-6 bottom-[60px] sm:bottom-[65px] z-30 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs sm:text-[13px] font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-slate-700/60">
          <span>เลื่อนลงล่างสุด</span>
          <span class="material-symbols-outlined text-[16px]">arrow_downward</span>
        </button>

        <!-- Prompt to Scroll to Bottom Bar (Consent Mode Before Reaching Bottom) -->
        <div id="tos-scroll-prompt-bar" class="hidden p-3.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 shrink-0 text-center flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-[13px] font-medium">
          <span class="material-symbols-outlined text-[18px] text-slate-500 animate-bounce">arrow_downward</span>
          <span>กรุณาเลื่อนลงอ่านข้อกำหนดให้สุด เพื่อเปิดแถบกดยอมรับ</span>
        </div>

        <!-- Footer / Acceptance Controls (Consent Mode - Appears only after scrolled to bottom) -->
        <div id="tos-consent-controls" class="hidden p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 space-y-2.5 transition-all">
          <div class="flex items-center justify-between pb-0.5">
            <span class="text-[11.5px] text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              เลื่อนอ่านครบถ้วนแล้ว กรุณากดยอมรับเพื่อดำเนินการต่อ
            </span>
          </div>

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
      if (e.target === tosModal && !__whodisTosIsConsentMode) {
        toggleTosModal(false);
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleSosModal(false);
      toggleContactDevModal(false);
      if (!__whodisTosIsConsentMode) {
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
let __whodisTosReachedBottom = false;
let __whodisTosIsConsentMode = false;

function toggleTosModal(show, isConsentMode = false, onAccept = null) {
  const modal = document.getElementById('whodis-tos-modal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    __whodisTosOnAccept = onAccept;
    __whodisTosIsConsentMode = isConsentMode;
    __whodisTosReachedBottom = false;

    const consentControls = document.getElementById('tos-consent-controls');
    const promptBar = document.getElementById('tos-scroll-prompt-bar');
    const readonlyControls = document.getElementById('tos-readonly-controls');
    const closeBtn = document.getElementById('tos-close-btn');
    const agreeCheckbox = document.getElementById('tos-agree-checkbox');
    const acceptBtn = document.getElementById('tos-accept-btn');
    const floatingBtn = document.getElementById('tos-floating-scroll-btn');
    const scrollBody = document.getElementById('whodis-tos-scroll-body');

    if (scrollBody) scrollBody.scrollTop = 0;
    if (agreeCheckbox) agreeCheckbox.checked = false;
    if (acceptBtn) acceptBtn.disabled = true;

    if (isConsentMode) {
      if (closeBtn) closeBtn.classList.add('hidden');
      if (readonlyControls) readonlyControls.classList.add('hidden');
      if (consentControls) consentControls.classList.add('hidden');
      if (promptBar) promptBar.classList.remove('hidden');
      if (floatingBtn) floatingBtn.classList.remove('hidden');

      setTimeout(() => {
        handleTosScroll();
      }, 60);
    } else {
      if (closeBtn) closeBtn.classList.remove('hidden');
      if (readonlyControls) readonlyControls.classList.remove('hidden');
      if (consentControls) consentControls.classList.add('hidden');
      if (promptBar) promptBar.classList.add('hidden');
      if (floatingBtn) floatingBtn.classList.add('hidden');
    }
  } else {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    __whodisTosOnAccept = null;
    __whodisTosIsConsentMode = false;
    __whodisTosReachedBottom = false;
    const floatingBtn = document.getElementById('tos-floating-scroll-btn');
    if (floatingBtn) floatingBtn.classList.add('hidden');
  }
}

function handleTosScroll() {
  const scrollBody = document.getElementById('whodis-tos-scroll-body');
  const floatingBtn = document.getElementById('tos-floating-scroll-btn');
  const consentControls = document.getElementById('tos-consent-controls');
  const promptBar = document.getElementById('tos-scroll-prompt-bar');
  if (!scrollBody) return;

  if (!__whodisTosIsConsentMode) {
    if (floatingBtn) floatingBtn.classList.add('hidden');
    if (promptBar) promptBar.classList.add('hidden');
    return;
  }

  const distanceToBottom = scrollBody.scrollHeight - scrollBody.scrollTop - scrollBody.clientHeight;
  if (distanceToBottom < 60) {
    __whodisTosReachedBottom = true;
    if (floatingBtn) floatingBtn.classList.add('hidden');
    if (promptBar) promptBar.classList.add('hidden');
    if (consentControls) consentControls.classList.remove('hidden');
  } else if (!__whodisTosReachedBottom) {
    if (floatingBtn) floatingBtn.classList.remove('hidden');
    if (promptBar) promptBar.classList.remove('hidden');
    if (consentControls) consentControls.classList.add('hidden');
  }
}

function scrollTosToBottom() {
  const container = document.getElementById('whodis-tos-scroll-body');
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    setTimeout(() => {
      handleTosScroll();
    }, 450);
  }
}

function toggleTosAcceptBtn() {
  const checkbox = document.getElementById('tos-agree-checkbox');
  const btn = document.getElementById('tos-accept-btn');
  if (checkbox && btn) {
    if (!__whodisTosReachedBottom) {
      checkbox.checked = false;
      btn.disabled = true;
      alert('กรุณาเลื่อนอ่านข้อกำหนดลงมาให้สุดก่อนยอมรับ');
      return;
    }
    btn.disabled = !checkbox.checked;
  }
}

function confirmAcceptTos() {
  if (!__whodisTosReachedBottom) {
    alert('กรุณาเลื่อนอ่านข้อกำหนดลงมาให้สุดก่อนยอมรับ');
    return;
  }

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

function initFavicon() {
  let favicon = document.querySelector("link[rel*='icon']");
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = 'assets/logo.png';
    document.head.appendChild(favicon);
  } else {
    favicon.href = 'assets/logo.png';
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


