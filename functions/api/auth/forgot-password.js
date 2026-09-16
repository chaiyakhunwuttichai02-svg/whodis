// functions/api/auth/forgot-password.js
// Cloudflare Pages Function: ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่าน

async function sendEmailOtp(toEmail, otp, env) {
  const hasBrevo = Boolean(env && env.BREVO_API_KEY);
  const hasResend = Boolean(env && env.RESEND_API_KEY);

  if (!hasBrevo && !hasResend) {
    return {
      success: false,
      needApiKey: true,
      message: 'ยังไม่ได้ตั้งค่า Email API Key (Brevo หรือ Resend) ในระบบ จึงไม่สามารถส่งอีเมลได้จริง กรุณาใส่ API Key ใน Cloudflare Dashboard หรือแจ้งแอดมิน'
    };
  }

  // 1. ลองส่งผ่าน Brevo API หากมีการตั้งค่า BREVO_API_KEY
  if (hasBrevo) {
    try {
      const payload = {
        sender: { name: "Whodis Security", email: "adminwhodis@gmail.com" },
        to: [{ email: toEmail }],
        subject: `🔐 รหัส OTP สำหรับรีเซ็ตรหัสผ่าน Whodis: ${otp}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #0f172a; text-align: center; margin-bottom: 8px;">🔐 รีเซ็ตรหัสผ่าน Whodis</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">คุณได้ทำการขอรหัสผ่านใหม่สำหรับบัญชี Whodis กรุณานำรหัส OTP 6 หลักด้านล่างนี้ไปกรอกในหน้าเว็บ:</p>
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
            </div>
            <p style="color: #ef4444; font-size: 13px; text-align: center;">⏱️ รหัสนี้มีอายุการใช้งาน 10 นาที</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้</p>
          </div>
        `
      };

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": env.BREVO_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) return { success: true, provider: 'Brevo' };
      const errTxt = await res.text();
      console.error("Brevo API error:", errTxt);
    } catch (e) {
      console.error("Brevo error:", e);
    }
  }

  // 2. ลองส่งผ่าน Resend API หากมีการตั้งค่า RESEND_API_KEY
  if (hasResend) {
    try {
      const payload = {
        from: "Whodis Security <onboarding@resend.dev>",
        to: [toEmail],
        subject: `🔐 รหัส OTP สำหรับรีเซ็ตรหัสผ่าน Whodis: ${otp}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #0f172a; text-align: center; margin-bottom: 8px;">🔐 รีเซ็ตรหัสผ่าน Whodis</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">คุณได้ทำการขอรหัสผ่านใหม่สำหรับบัญชี Whodis กรุณานำรหัส OTP 6 หลักด้านล่างนี้ไปกรอกในหน้าเว็บ:</p>
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
            </div>
            <p style="color: #ef4444; font-size: 13px; text-align: center;">⏱️ รหัสนี้มีอายุการใช้งาน 10 นาที</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้</p>
          </div>
        `
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) return { success: true, provider: 'Resend' };

      const errTxt = await res.text();
      console.error("Resend API error:", errTxt);

      if (errTxt.includes('You can only send testing emails to your own email address')) {
        return {
          success: false,
          isResendRestriction: true,
          message: 'บัญชี Resend แบบทดสอบฟรี กำหนดให้ส่ง OTP ไปยังอีเมลของเจ้าของบัญชี Resend (chaiyakhunwuttichai02@gmail.com) เท่านั้นครับ (หากต้องการส่งหาทุกอีเมล สามารถใช้ Brevo API Key แทนได้ครับ)'
        };
      }

      return {
        success: false,
        message: `ผู้ให้บริการอีเมล Resend แจ้งเตือน: ${errTxt}`
      };
    } catch (e) {
      console.error("Resend error:", e);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเชื่อมต่อ Resend: ${e.message}`
      };
    }
  }

  return { success: false, message: 'ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' };
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: 'กรุณากรอกอีเมลของคุณ' }), {
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

    // ตรวจสอบว่ามีอีเมลในตาราง users หรือไม่
    const user = await db.prepare('SELECT id, username FROM users WHERE LOWER(email) = LOWER(?)')
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

    // สร้างรหัส OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // เคลียร์ OTP เก่าที่ยังไม่ได้ใช้ของอีเมลนี้
    await db.prepare('UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0')
      .bind(email)
      .run();

    // บันทึก OTP ใหม่
    await db.prepare('INSERT INTO password_resets (email, otp, expires_at, used) VALUES (?, ?, ?, 0)')
      .bind(email, otp, expiresAt)
      .run();

    // ส่งอีเมลจริงผ่าน Brevo หรือ Resend
    const sendResult = await sendEmailOtp(email, otp, env);

    if (!sendResult.success) {
      return new Response(JSON.stringify({
        success: false,
        needApiKey: sendResult.needApiKey || false,
        isResendRestriction: sendResult.isResendRestriction || false,
        message: sendResult.message || 'ไม่สามารถส่งอีเมลได้ในขณะนี้'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล ${email} เรียบร้อยแล้ว (มีอายุ 10 นาที)`,
      provider: sendResult.provider
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
