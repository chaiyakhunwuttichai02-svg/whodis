// js/auth.js - จัดการสถานะการเข้าสู่ระบบและการเข้าถึงหน้าเว็บ (Auth Guard)

const Auth = {
  getUser() {
    try {
      const userStr = localStorage.getItem('whodis_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('whodis_user', JSON.stringify(user));
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  isAdmin() {
    const user = this.getUser();
    return user && (user.role || '').toLowerCase() === 'admin';
  },

  logout() {
    localStorage.removeItem('whodis_user');
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      const path = window.location.pathname;
      const page = (path.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
      const target = encodeURIComponent(page + window.location.search);
      window.location.replace(`login.html?redirect=${target}&reason=need_login`);
    }
  },

  requireAdmin() {
    const user = this.getUser();
    if (!user) {
      window.location.replace('login.html?redirect=admin_reports.html&reason=need_login');
    } else if ((user.role || '').toLowerCase() !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (สำหรับผู้ดูแลระบบเท่านั้น)');
      window.location.replace('index.html');
    }
  },

  // ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บอัตโนมัติ (Auth Guard)
  checkPageAccess() {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;
    let page = (path.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
    if (!page || page === '') page = 'index.html';
    const clean = page.replace(/\.html$/, '').replace(/\.php$/, '').toLowerCase();

    // หน้าที่อนุญาตให้ทุกคนเข้าได้โดยไม่ต้องล็อกอิน (Public Pages)
    const publicPages = ['index', 'checker', 'login', 'register', 'forgot_password'];

    // หน้าสำหรับผู้ดูแลระบบเท่านั้น
    if (clean === 'admin_reports') {
      this.requireAdmin();
      return;
    }

    // หากไม่ใช่หน้า Public และยังไม่ได้ล็อกอิน ให้ส่งไปหน้า Login ทันที
    if (!publicPages.includes(clean)) {
      if (!this.isLoggedIn()) {
        const target = encodeURIComponent(page + window.location.search);
        window.location.replace(`login.html?redirect=${target}&reason=need_login`);
      }
    }
  }
};

// รันตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บทันทีที่สคริปต์โหลด
Auth.checkPageAccess();

