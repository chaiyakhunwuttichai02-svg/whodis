// functions/api/stats.js
// Cloudflare Pages Function: ดึงข้อมูลสถิติรายงานจริงจาก Cloudflare D1

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const db = env.DB;

    if (!db) {
      return new Response(JSON.stringify({ success: false, message: 'D1 Database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. นับจำนวนรายงานแยกตามสถานะ และยอดความเสียหายรวมจริง
    const { results: reportStats } = await db.prepare(
      "SELECT " +
      "COUNT(*) as total_reports, " +
      "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_reports, " +
      "SUM(CASE WHEN status != 'approved' AND status != 'rejected' THEN 1 ELSE 0 END) as pending_reports, " +
      "SUM(COALESCE(claim_amount, 0)) as total_damage " +
      "FROM reports"
    ).all();

    const totals = (reportStats && reportStats[0]) ? reportStats[0] : { total_reports: 0, approved_reports: 0, pending_reports: 0, total_damage: 0 };

    // 2. จำนวนการค้นหาทั้งหมดใน search_logs จริง
    let totalSearches = 0;
    try {
      const { results: searchStats } = await db.prepare('SELECT COUNT(*) as total_searches FROM search_logs').all();
      totalSearches = (searchStats && searchStats[0]) ? searchStats[0].total_searches : 0;
    } catch (_) {}

    // 3. สถิติแยกตามประเภทกลโกงจริงจากตาราง reports
    // ดึงทั้งจากคอลัมน์ category หรือดึงจาก [ประเภทกลโกง] ใน incident_details
    const { results: categoryRows } = await db.prepare(
      `SELECT 
         CASE 
           WHEN category IS NOT NULL AND category != '' AND category != 'General Scam' THEN category
           WHEN incident_details LIKE '[%]%' THEN SUBSTR(incident_details, 2, INSTR(incident_details, ']') - 2)
           ELSE 'ทั่วไป / อื่นๆ'
         END as cat_name,
         COUNT(*) as count
       FROM reports 
       WHERE status != 'rejected'
       GROUP BY cat_name
       ORDER BY count DESC`
    ).all();

    const categoriesMap = {};
    if (categoryRows && categoryRows.length > 0) {
      categoryRows.forEach(row => {
        const name = (row.cat_name || 'ทั่วไป / อื่นๆ').trim();
        categoriesMap[name] = (categoriesMap[name] || 0) + row.count;
      });
    }

    // 4. แนวโน้ม 6 เดือนล่าสุดจริงจาก Database
    const { results: monthlyRows } = await db.prepare(
      "SELECT strftime('%Y-%m', created_at) as month_label, COUNT(*) as count FROM reports WHERE status != 'rejected' GROUP BY month_label ORDER BY month_label ASC LIMIT 6"
    ).all();

    // 5. สถิติเปรียบเทียบเดือนนี้ vs เดือนก่อน
    const { results: monthCompare } = await db.prepare(
      `SELECT 
         SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) as this_month,
         SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', '-1 month') THEN 1 ELSE 0 END) as last_month
       FROM reports WHERE status != 'rejected'`
    ).all();

    const thisMonth = (monthCompare && monthCompare[0] && monthCompare[0].this_month) ? Number(monthCompare[0].this_month) : 0;
    const lastMonth = (monthCompare && monthCompare[0] && monthCompare[0].last_month) ? Number(monthCompare[0].last_month) : 0;
    
    let momChange = 0;
    if (lastMonth > 0) {
      momChange = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    } else if (thisMonth > 0) {
      momChange = 100;
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        total_reports: totals.total_reports || 0,
        approved_reports: totals.approved_reports || 0,
        pending_reports: totals.pending_reports || 0,
        total_damage: totals.total_damage || 0,
        total_searches: totalSearches,
        categories: categoriesMap,
        this_month_reports: thisMonth,
        last_month_reports: lastMonth,
        month_change_percent: momChange,
        monthly_trend: monthlyRows || []
      }
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
