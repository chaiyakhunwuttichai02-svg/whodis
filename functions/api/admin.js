// functions/api/admin.js
// Cloudflare Pages Function: ระบบจัดการรายงานและสมาชิกสำหรับ Admin

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const view = url.searchParams.get('view') || 'reports';
    const filter = url.searchParams.get('filter') || 'all';

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: 'D1 Database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (view === 'users') {
      const { results: users } = await db.prepare(
        'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
      ).all();

      return new Response(JSON.stringify({ success: true, users: users || [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // สถิติรายงาน
    const { results: allStatuses } = await db.prepare('SELECT status FROM reports').all();
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    (allStatuses || []).forEach(r => {
      const st = (r.status || '').toLowerCase();
      if (st.includes('under') || st.includes('investigation') || st.includes('pending')) {
        pendingCount++;
      } else if (st === 'approved') {
        approvedCount++;
      } else if (st === 'rejected') {
        rejectedCount++;
      }
    });

    const stats = {
      total: allStatuses.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    };

    // ดึงรายงานตาม Filter
    let query = 'SELECT * FROM reports';
    const params = [];

    if (filter === 'pending') {
      query += " WHERE status LIKE '%INVESTIGATION%' OR status = 'pending'";
    } else if (filter === 'approved') {
      query += " WHERE status = 'approved'";
    } else if (filter === 'rejected') {
      query += " WHERE status = 'rejected'";
    }

    query += ' ORDER BY created_at DESC';

    const { results: reports } = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({
      success: true,
      stats,
      reports: reports || []
    }), {
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

    const reportId = body.reportId;
    const action = (body.action || '').toLowerCase();

    if (!reportId || !action) {
      return new Response(JSON.stringify({ success: false, message: 'ข้อมูลไม่ครบถ้วน' }), {
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

    if (action === 'approve') {
      await db.prepare("UPDATE reports SET status = 'approved' WHERE id = ?").bind(reportId).run();
    } else if (action === 'reject') {
      await db.prepare("UPDATE reports SET status = 'rejected' WHERE id = ?").bind(reportId).run();
    } else if (action === 'delete') {
      await db.prepare("DELETE FROM reports WHERE id = ?").bind(reportId).run();
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: `ดำเนินการ ${action} สำเร็จ` }), {
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
