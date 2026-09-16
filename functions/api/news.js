// functions/api/news.js
// Cloudflare Pages Function: ดึงข่าวสารเตือนภัยมิจฉาชีพอัปเดตสดแบบเรียลไทม์

export async function onRequestGet(context) {
  try {
    const query = encodeURIComponent('มิจฉาชีพ OR หลอกโอนเงิน OR บัญชีม้า OR ตำรวจไซเบอร์');
    const url = `https://news.google.com/rss/search?q=${query}&hl=th&gl=TH&ceid=TH:th`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google News returned status ${res.status}`);
    }

    const text = await res.text();

    function decodeHtml(html) {
      return (html || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    }

    function formatTimeAgo(pubDateStr) {
      if (!pubDateStr) return '';
      const date = new Date(pubDateStr);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return 'เมื่อสักครู่';
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHour < 24) return `${diffHour} ชม. ที่แล้ว`;
      if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    }

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const news = [];
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const itemContent = match[1];
      let rawTitle = (/<title>(.*?)<\/title>/.exec(itemContent) || [])[1] || '';
      const link = (/<link>(.*?)<\/link>/.exec(itemContent) || [])[1] || '';
      const pubDate = (/<pubDate>(.*?)<\/pubDate>/.exec(itemContent) || [])[1] || '';
      const source = (/<source[^>]*>(.*?)<\/source>/.exec(itemContent) || [])[1] || 'ข่าวสารเตือนภัย';

      const decodedSource = decodeHtml(source);
      // Filter out social networks
      if (decodedSource.toLowerCase().includes('facebook') || decodedSource.toLowerCase().includes('twitter') || decodedSource.toLowerCase().includes('tiktok')) {
        continue;
      }

      let title = decodeHtml(rawTitle);
      const lastDash = title.lastIndexOf(' - ');
      if (lastDash > 15) {
        title = title.substring(0, lastDash).trim();
      }
      title = title.replace(/\s*#\S+/g, '').replace(/https?:\/\/\S+/g, '').trim();

      if (!title) continue;

      news.push({
        title,
        link,
        pubDate,
        timeAgo: formatTimeAgo(pubDate),
        source: decodedSource
      });

      if (news.length >= 6) break;
    }

    return new Response(JSON.stringify({
      success: true,
      news,
      updatedAt: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900' // 15 minutes cache
      }
    });

  } catch (err) {
    // Fallback static news if Google RSS fetch encounters any issue
    const fallbackNews = [
      {
        title: "รัฐบาลเร่งตั้ง 4 ระบบกลางสกัดเงินมิจฉาชีพ เชื่อมข้อมูลทุกหน่วยงาน แจ้งครั้งเดียว–ตามเงินทัน–อายัดเร็ว",
        link: "https://www.thaigov.go.th",
        source: "กรมประชาสัมพันธ์",
        timeAgo: "วันนี้"
      },
      {
        title: "เตือนภัย SMS แนบลิงก์แอบอ้างหน่วยงานรัฐหรือค้างชำระค่าปรับ หลอกกดโอนเงิน",
        link: "https://www.antifakenewscenter.com",
        source: "ศูนย์ต่อต้านข่าวปลอม",
        timeAgo: "วันนี้"
      },
      {
        title: "ระวังกลโกงหลอกทำงานออนไลน์ กดรับออเดอร์ หรือสำรองจ่ายเงิน มิจฉาชีพ 100%",
        link: "https://pct.police.go.th",
        source: "ศูนย์ปราบปรามอาชญากรรมทางเทคโนโลยี",
        timeAgo: "วันนี้"
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      news: fallbackNews,
      fallback: true,
      error: err.message,
      updatedAt: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}
