// functions/api/reports.js
// Cloudflare Pages Function: ดึงรายงาน และส่งรายงานเบาะแสมิจฉาชีพ

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: 'D1 Database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ดึงเฉพาะรายงานที่อนุมัติแล้วสำหรับบุคคลทั่วไป
    const { results } = await db.prepare(
      `SELECT id, scammer_name, bank_account, bank_name, incident_date, claim_amount, incident_details, evidence_file, status, created_at 
       FROM reports 
       WHERE status = 'approved' 
       ORDER BY created_at DESC 
       LIMIT ?`
    ).bind(limit).all();

    return new Response(JSON.stringify({ success: true, reports: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const userId = body.userId || null;
    const scammerName = (body.scammerName || '').trim();
    const bankAccount = (body.bankAccount || '').trim();
    const bankName = (body.bankName || '').trim();
    const incidentDate = body.incidentDate || '';
    const claimAmount = parseFloat(body.claimAmount || 0);
    const scamType = body.scamType || '';
    const incidentDetails = (body.incidentDetails || '').trim();
    const evidenceFile = body.evidenceFile || null; // Base64 data string

    if (!scammerName || !bankAccount || !incidentDetails) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อคนโกง, เลขบัญชี, รายละเอียดเหตุการณ์)' 
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

    const fullDetails = scamType ? `[${scamType}] ${incidentDetails}` : incidentDetails;

    await db.prepare(
      `INSERT INTO reports (user_id, scammer_name, bank_account, bank_name, incident_date, claim_amount, incident_details, evidence_file, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      scammerName,
      bankAccount,
      bankName,
      incidentDate,
      claimAmount,
      fullDetails,
      evidenceFile,
      'UNDER INVESTIGATION'
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'บันทึกรายงานเบาะแสของคุณเรียบร้อยแล้ว ข้อมูลจะถูกนำไปตรวจสอบต่อไป'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
