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

    // 1. นับจำนวนรายงานแยกตามสถานะ และยอดความเสียหายรวม
    const { results: reportStats } = await db.prepare(
      "SELECT " +
      "COUNT(*) as total_reports, " +
      "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_reports, " +
      "SUM(CASE WHEN status != 'approved' AND status != 'rejected' THEN 1 ELSE 0 END) as pending_reports, " +
      "SUM(CASE WHEN status = 'approved' THEN COALESCE(damage_amount, 0) ELSE 0 END) as total_damage " +
      "FROM reports"
    ).all();

    const totals = (reportStats && reportStats[0]) ? reportStats[0] : { total_reports: 0, approved_reports: 0, pending_reports: 0, total_damage: 0 };

    // 2. จำนวนการค้นหาทั้งหมดใน search_logs
    let totalSearches = 0;
    try {
      const { results: searchStats } = await db.prepare('SELECT COUNT(*) as total_searches FROM search_logs').all();
      totalSearches = (searchStats && searchStats[0]) ? searchStats[0].total_searches : 0;
    } catch (_) {}

    // 3. สถิติแยกตามประเภทกลโกง
    const { results: categoryRows } = await db.prepare(
      "SELECT COALESCE(category, 'อื่นๆ') as category, COUNT(*) as count FROM reports WHERE status = 'approved' GROUP BY category ORDER BY count DESC"
    ).all();

    const standardCategories = {
      'Online Shopping': 0,
      'Investment': 0,
      'Loan': 0,
      'Romance': 0,
      'Crypto': 0,
      'Call Center': 0,
      'อื่นๆ': 0
    };

    (categoryRows || []).forEach(row => {
      const cat = row.category || 'อื่นๆ';
      if (Object.prototype.hasOwnProperty.call(standardCategories, cat)) {
        standardCategories[cat] += row.count;
      } else {
        standardCategories['อื่นๆ'] += row.count;
      }
    });

    // 4. แนวโน้ม 6 เดือนล่าสุด
    const { results: monthlyRows } = await db.prepare(
      "SELECT strftime('%Y-%m', created_at) as month_label, COUNT(*) as count FROM reports GROUP BY month_label ORDER BY month_label DESC LIMIT 6"
    ).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        total_reports: totals.total_reports || 0,
        approved_reports: totals.approved_reports || 0,
        pending_reports: totals.pending_reports || 0,
        total_damage: totals.total_damage || 0,
        total_searches: totalSearches,
        categories: standardCategories,
        monthly_trend: monthlyRows || []
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
