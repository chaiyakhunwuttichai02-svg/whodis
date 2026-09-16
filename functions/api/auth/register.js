// functions/api/auth/register.js
// Cloudflare Pages Function: สมัครสมาชิก

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

    const username = (body.username || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรขึ้นไป' }), {
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

    // ตรวจสอบว่าชื่อผู้ใช้หรืออีเมลซ้ำไหม
    const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first();

    if (existing) {
      return new Response(JSON.stringify({ success: false, message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานไปแล้ว' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // แฮชรหัสผ่านด้วย SHA-256
    const hashedPassword = await hashPassword(password);

    // บันทึกผู้ใช้ใหม่
    await db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
      .bind(username, email, hashedPassword, 'user')
      .run();

    return new Response(JSON.stringify({ success: true, message: 'สมัครสมาชิกสำเร็จ! กำลังพาคุณไปหน้าเข้าสู่ระบบ...' }), {
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
