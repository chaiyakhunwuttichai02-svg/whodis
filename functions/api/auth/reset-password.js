// functions/api/auth/reset-password.js
// Cloudflare Pages Function: ยืนยัน OTP และตั้งรหัสผ่านใหม่

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
    const otp = (body.otp || '').trim();
    const newPassword = body.newPassword || '';

    if (!email || !otp || !newPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, รหัส OTP, รหัสผ่านใหม่)' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' 
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

    // ตรวจสอบ OTP ล่าสุดที่ยังไม่ถูกใช้
    const resetRecord = await db.prepare(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = 0 ORDER BY id DESC LIMIT 1'
    ).bind(email, otp).first();

    if (!resetRecord) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'รหัส OTP ไม่ถูกต้อง หรือถูกใช้งานไปแล้ว' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ตรวจสอบวันหมดอายุ
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'รหัส OTP หมดอายุการใช้งานแล้ว กรุณากดขอรหัสใหม่' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // แฮชรหัสผ่านใหม่
    const hashedPassword = await hashPassword(newPassword);

    // อัปเดตรหัสผ่านของผู้ใช้
    await db.prepare('UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)')
      .bind(hashedPassword, email)
      .run();

    // ทำเครื่องหมายว่า OTP นี้ถูกใช้แล้ว
    await db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?')
      .bind(resetRecord.id)
      .run();

    return new Response(JSON.stringify({
      success: true,
      message: 'รีเซ็ตรหัสผ่านใหม่สำเร็จแล้ว! กำลังพาคุณไปหน้าเข้าสู่ระบบ...'
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
