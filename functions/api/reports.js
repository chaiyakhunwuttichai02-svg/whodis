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

    // ดึงเฉพาะรายงานที่อนุมัติแล้วสำหรับบุคคลทั่วไป พร้อมนับจำนวนครั้งที่ถูกรายงาน
    const { results } = await db.prepare(
      `SELECT 
         r.id, r.scammer_name, r.bank_account, r.bank_name, r.phone_number, r.category,
         r.incident_date, r.claim_amount, r.incident_details, r.evidence_file, r.status, r.created_at,
         (
           SELECT COUNT(*) FROM reports r2 
           WHERE r2.status = 'approved' 
           AND (
             (r2.bank_account = r.bank_account AND r2.bank_account != '')
             OR (r2.phone_number = r.phone_number AND r2.phone_number IS NOT NULL AND r2.phone_number != '')
             OR (r2.scammer_name = r.scammer_name AND r2.scammer_name != '')
           )
         ) AS report_count,
         (
           SELECT COUNT(DISTINCT r3.bank_account) FROM reports r3
           WHERE r3.status = 'approved'
           AND r3.scammer_name = r.scammer_name
           AND r3.bank_account != ''
         ) AS multi_account_count
       FROM reports r 
       WHERE r.status = 'approved' 
       ORDER BY r.created_at DESC 
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
