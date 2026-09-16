// functions/api/news.js
// Cloudflare Pages Function: ดึงข่าวสารเตือนภัยมิจฉาชีพอัปเดตสดแบบเรียลไทม์ พร้อมรูปภาพปกข่าว

export async function onRequestGet(context) {
  function getPublisherImage(sourceName, sourceUrl) {
    const s = (sourceName || '').toLowerCase();
    const u = (sourceUrl || '').toLowerCase();

    // กรมประชาสัมพันธ์
    if (s.includes('กรมประชาสัมพันธ์') || u.includes('prd.go.th')) {
      return 'https://www.prd.go.th/images/logo/logo_prd.png';
    }
    // ศูนย์ต่อต้านข่าวปลอม
    if (s.includes('ข่าวปลอม') || u.includes('antifakenewscenter')) {
      return 'https://www.antifakenewscenter.com/wp-content/uploads/2021/08/logo-antifake.png';
    }
    // สวพ.FM91
    if (s.includes('fm91') || u.includes('fm91bkk.com')) {
      return 'https://fm91bkk.com/assets/images/logo_fm91.png';
    }
    // ตำรวจไซเบอร์ / PCT Police
    if (s.includes('ตำรวจ') || s.includes('ไซเบอร์') || u.includes('police.go.th')) {
      return 'https://pct.police.go.th/images/logo-pct.png';
    }
    // ไทยรัฐ
    if (s.includes('ไทยรัฐ') || u.includes('thairath.co.th')) {
      return 'https://static.thairath.co.th/media/4DQpjUtzLUwmJZZSClI6uWjL0v035WzO8p.png';
    }
    // เดลินิวส์
    if (s.includes('เดลินิวส์') || u.includes('dailynews.co.th')) {
      return 'https://www.dailynews.co.th/wp-content/themes/dailynews/assets/images/logo.png';
    }
    // มติชน
    if (s.includes('มติชน') || u.includes('matichon.co.th')) {
      return 'https://www.matichon.co.th/wp-content/uploads/2023/06/matichon-logo-white-bg.png';
    }
    // ข่าวสด
    if (s.includes('ข่าวสด') || u.includes('khaosod.co.th')) {
      return 'https://www.khaosod.co.th/wp-content/uploads/2021/04/khaosod-logo.png';
    }
    // ช่อง 7HD
    if (s.includes('ช่อง 7') || s.includes('ch7') || u.includes('ch7.com')) {
      return 'https://static.ch7.com/images/ch7hd_logo.png';
    }
    // PPTV HD 36
    if (s.includes('pptv') || u.includes('pptvhd36.com')) {
      return 'https://img.pptvhd36.com/images/default/pptv_logo_color.png';
    }
    // TNN
    if (s.includes('tnn') || u.includes('tnnthailand.com')) {
      return 'https://images.tnnthailand.com/assets/images/logo_tnn.png';
    }

    // Google High-Resolution Favicon / Logo by Website URL
    if (sourceUrl) {
      try {
        const domain = new URL(sourceUrl).hostname.replace(/^www\./, '');
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
      } catch (_) {}
    }

    return 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://news.google.com&size=128';
  }

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

  try {
    const query = encodeURIComponent('มิจฉาชีพ OR หลอกโอนเงิน OR บัญชีม้า OR ตำรวจไซเบอร์');
    const url = `https://news.google.com/rss/search?q=${query}&hl=th&gl=TH&ceid=TH:th`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

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
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const news = [];
    let match;

    while ((match = itemRegex.exec(text)) !== null && news.length < 6) {
      const itemContent = match[1];
      let rawTitle = (/<title>(.*?)<\/title>/.exec(itemContent) || [])[1] || '';
      const link = (/<link>(.*?)<\/link>/.exec(itemContent) || [])[1] || '';
      const pubDate = (/<pubDate>(.*?)<\/pubDate>/.exec(itemContent) || [])[1] || '';
      
      const sourceMatch = /<source\s+url="([^"]+)"[^>]*>(.*?)<\/source>/.exec(itemContent);
      const sourceUrl = sourceMatch ? sourceMatch[1] : '';
      const source = sourceMatch ? sourceMatch[2] : ((/<source[^>]*>(.*?)<\/source>/.exec(itemContent) || [])[1] || 'ข่าวสารเตือนภัย');

      const decodedSource = decodeHtml(source);
      if (decodedSource.toLowerCase().includes('facebook') || decodedSource.toLowerCase().includes('twitter') || decodedSource.toLowerCase().includes('tiktok')) {
        continue;
      }

      let title = decodeHtml(rawTitle);
      const lastDash = title.lastIndexOf(' - ');
      if (lastDash > 15) {
        title = title.substring(0, lastDash).trim();
      }
      title = title.replace(/\s*#\S+/g, '').replace(/https?:\/\/\S+/g, '').trim();

      if (!title || news.some(n => n.title === title || n.link === link)) continue;

      news.push({
        title,
        link,
        pubDate,
        timeAgo: formatTimeAgo(pubDate),
        source: decodedSource,
        sourceUrl,
        image: getPublisherImage(decodedSource, sourceUrl)
      });
    }

    if (news.length === 0) {
      throw new Error('No news items found');
    }

    return new Response(JSON.stringify({
      success: true,
      news,
      updatedAt: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600'
      }
    });

  } catch (err) {
    const fallbackNews = [
      {
        title: "รัฐบาลเร่งตั้ง 4 ระบบกลางสกัดเงินมิจฉาชีพ เชื่อมข้อมูลทุกหน่วยงาน “แจ้งครั้งเดียว–ตามเงินทัน–อายัดเร็ว”",
        link: "https://www.prd.go.th",
        source: "กรมประชาสัมพันธ์",
        sourceUrl: "https://www.prd.go.th",
        timeAgo: "วันนี้",
        image: "https://www.prd.go.th/images/logo/logo_prd.png"
      },
      {
        title: "เตือนภัย SMS แนบลิงก์แอบอ้าง “ใบสั่งจราจรค้างชำระ” หลอกกดลิงก์กรอกข้อมูลบัตรและดูดเงิน",
        link: "https://www.antifakenewscenter.com",
        source: "ศูนย์ต่อต้านข่าวปลอม",
        sourceUrl: "https://www.antifakenewscenter.com",
        timeAgo: "วันนี้",
        image: "https://www.antifakenewscenter.com/wp-content/uploads/2021/08/logo-antifake.png"
      },
      {
        title: "รวบบัญชีม้า แก๊งหลอกเหยื่อลงทุนธุรกิจออนไลน์แบบ Dropship สูญเงินกว่าครึ่งล้าน",
        link: "https://www.fm91bkk.com",
        source: "สวพ.FM91",
        sourceUrl: "https://www.fm91bkk.com",
        timeAgo: "วันนี้",
        image: "https://fm91bkk.com/assets/images/logo_fm91.png"
      },
      {
        title: "เตือนภัย! มิจฉาชีพหลอกรับซื้องานศิลปะ หลอกลงทุนผ่านแพลตฟอร์มปลอมสูญเงินแสน",
        link: "https://www.antifakenewscenter.com",
        source: "ศูนย์ต่อต้านข่าวปลอม",
        sourceUrl: "https://www.antifakenewscenter.com",
        timeAgo: "เมื่อวาน",
        image: "https://www.antifakenewscenter.com/wp-content/uploads/2021/08/logo-antifake.png"
      },
      {
        title: "สกัดเส้นเงินมิจฉาชีพ! ตำรวจไซเบอร์ผนึกกำลังทลายรังแก๊งคอลเซ็นเตอร์ข้ามชาติ",
        link: "https://pct.police.go.th",
        source: "ศูนย์ปราบปรามอาชญากรรมทางเทคโนโลยี",
        sourceUrl: "https://pct.police.go.th",
        timeAgo: "เมื่อวาน",
        image: "https://pct.police.go.th/images/logo-pct.png"
      },
      {
        title: "ระวังแก๊งอ้างเป็นเจ้าหน้าที่รัฐ โทรสั่งให้โอนเงินในบัญชีไปตรวจสอบ มิจฉาชีพ 100%",
        link: "https://pct.police.go.th",
        source: "ตำรวจไซเบอร์",
        sourceUrl: "https://pct.police.go.th",
        timeAgo: "เมื่อวาน",
        image: "https://pct.police.go.th/images/logo-pct.png"
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
