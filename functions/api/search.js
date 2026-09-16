// functions/api/search.js
// Cloudflare Pages Function: ค้นหาเบาะแสมิจฉาชีพ

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const searchTerm = (url.searchParams.get('q') || '').trim();

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: 'D1 Database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!searchTerm) {
      return new Response(JSON.stringify({ success: true, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (searchTerm.length < 4) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'กรุณากรอกอย่างน้อย 4 ตัวอักษรหรือ 4 ตัวเลข' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // บันทึกประวัติการค้นหา
    try {
      await db.prepare('INSERT INTO search_logs (search_term) VALUES (?)')
        .bind(searchTerm)
        .run();
    } catch (logErr) {
      console.error('Failed to log search:', logErr);
    }

    // ทำความสะอาดคำค้นหา (ตัดขีดและช่องว่างออกเพื่อค้นหาตัวเลข)
    const cleanTerm = searchTerm.replace(/[-\s]/g, '');
    const rawKeyword = `%${searchTerm}%`;
    const cleanKeyword = `%${cleanTerm}%`;

    // ค้นหาเฉพาะรายงานที่อนุมัติแล้ว (status = 'approved') พร้อมนับจำนวนครั้งที่ถูกรายงานและจำนวนบัญชีม้า
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
       AND (
         r.scammer_name LIKE ? 
         OR r.bank_account LIKE ? 
         OR r.phone_number LIKE ?
         OR REPLACE(REPLACE(r.bank_account, '-', ''), ' ', '') LIKE ?
         OR REPLACE(REPLACE(r.phone_number, '-', ''), ' ', '') LIKE ?
       ) 
       ORDER BY report_count DESC, r.created_at DESC`
    ).bind(rawKeyword, rawKeyword, rawKeyword, cleanKeyword, cleanKeyword).all();

    return new Response(JSON.stringify({
      success: true,
      searchTerm: searchTerm,
      results: results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'เกิดข้อผิดพลาดในการค้นหา: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
