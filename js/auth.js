// js/auth.js - จัดการสถานะการเข้าสู่ระบบฝั่ง Client

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
      window.location.href = 'login.html';
    }
  },

  requireAdmin() {
    const user = this.getUser();
    if (!user || (user.role || '').toLowerCase() !== 'admin') {
      window.location.href = 'login.html';
    }
  }
};
