// functions/api/auth/login.js
// Cloudflare Pages Function: เข้าสู่ระบบ

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
    const password = body.password || '';

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน!' }), {
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

    // ค้นหาผู้ใช้จากอีเมล
    const user = await db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .bind(email)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ตรวจสอบรหัสผ่าน (รองรับทั้ง SHA-256 และ Plain Text สำรอง)
    const hashed = await hashPassword(password);
    const isValid = (user.password === hashed) || (user.password === password);

    if (!isValid) {
      return new Response(JSON.stringify({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.password === password) {
      try {
        await db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashed, user.id).run();
      } catch (e) {}
    }

    const userRole = (user.role || 'user').toLowerCase().trim();

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: userRole
      },
      message: 'เข้าสู่ระบบสำเร็จ'
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
