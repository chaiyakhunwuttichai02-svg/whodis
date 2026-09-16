// functions/api/auth/reset-password.js
// Cloudflare Pages Function: รีเซ็ตรหัสผ่านโดยตรง (ไม่ต้องใช้ OTP)

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const email = (body.email || '').trim().toLowerCase();
    const username = (body.username || '').trim();
    const newPassword = body.newPassword || '';

    if (!email || !newPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'กรุณากรอกอีเมลและรหัสผ่านใหม่' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: 'D1 Database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ค้นหาบัญชีผู้ใช้จากอีเมล
    const user = await db.prepare('SELECT id, username, email FROM users WHERE LOWER(email) = LOWER(?)')
      .bind(email)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'ไม่พบบัญชีผู้ใช้ที่ลงทะเบียนด้วยอีเมลนี้ในระบบ' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // หากผู้ใช้กรอกชื่อผู้ใช้มา ให้ตรวจสอบว่าตรงกันไหม (หากจำไม่ได้และเว้นว่างไว้ ระบบจะอนุญาตให้ผ่านได้)
    if (username && user.username.trim().toLowerCase() !== username.toLowerCase()) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `ชื่อผู้ใช้ "${username}" ไม่ตรงกับบัญชีของอีเมลนี้ (ชื่อผู้ใช้ของคุณขึ้นต้นด้วย "${user.username.substring(0, 2)}***")` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // แฮชรหัสผ่านใหม่ด้วย SHA-256
    const hashedPassword = await hashPassword(newPassword);

    // อัปเดตรหัสผ่านใหม่ของผู้ใช้ในฐานข้อมูล D1
    await db.prepare('UPDATE users SET password = ? WHERE id = ?')
      .bind(hashedPassword, user.id)
      .run();

    return new Response(JSON.stringify({
      success: true,
      message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! กำลังพาคุณไปหน้าเข้าสู่ระบบ...'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'เกิดข้อผิดพลาด: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

