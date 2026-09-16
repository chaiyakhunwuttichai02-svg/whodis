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

    // ค้นหาเฉพาะรายงานที่อนุมัติแล้ว (status = 'approved')
    const { results } = await db.prepare(
      `SELECT id, scammer_name, bank_account, bank_name, phone_number, category, incident_date, claim_amount, incident_details, evidence_file, status, created_at 
       FROM reports 
       WHERE status = 'approved' 
       AND (
         scammer_name LIKE ? 
         OR bank_account LIKE ? 
         OR phone_number LIKE ?
         OR REPLACE(REPLACE(bank_account, '-', ''), ' ', '') LIKE ?
         OR REPLACE(REPLACE(phone_number, '-', ''), ' ', '') LIKE ?
       ) 
       ORDER BY created_at DESC`
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
