// functions/api/check-ai.js
// Cloudflare Pages Function: ระบบวิเคราะห์มิจฉาชีพและสลิป/แชตด้วย AI

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const text = (body.text || '').trim();
    const imageBase64 = body.imageBase64 || '';

    if (!text && !imageBase64) {
      return new Response(JSON.stringify({
        success: false,
        message: 'กรุณากรอกข้อความหรืออัปโหลดรูปภาพเพื่อวิเคราะห์'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    let dbMatches = [];
    
    // 1. ดึงข้อมูลตัวเลข (เบอร์โทร / เลขบัญชี) จากข้อความมาค้นหาใน D1
    if (db && text) {
      const numbers = text.match(/\d{8,15}/g) || [];
      for (const num of numbers) {
        const cleanNum = num.replace(/[-\s]/g, '');
        try {
          const { results } = await db.prepare(
            "SELECT id, scammer_name, bank_account, phone_number, incident_details, status FROM reports WHERE status = 'approved' AND (REPLACE(REPLACE(bank_account, '-', ''), ' ', '') LIKE ? OR REPLACE(REPLACE(phone_number, '-', ''), ' ', '') LIKE ?) LIMIT 3"
          ).bind(`%${cleanNum}%`, `%${cleanNum}%`).all();
          if (results && results.length > 0) {
            dbMatches.push(...results);
          }
        } catch (_) {}
      }
    }

    // 2. ตรวจสอบด้วย External AI (Gemini หรือ Cloudflare Workers AI)
    let aiEngineUsed = 'Whodis NLP Engine';
    let aiResponse = null;

    if (env.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        const parts = [];
        if (text) {
          parts.push({ text: `วิเคราะห์ข้อความนี้ว่าเป็นมิจฉาชีพหรือการหลอกลวงหรือไม่: "${text}"` });
        }
        if (imageBase64) {
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.push({
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data
            }
          });
          parts.push({ text: 'วิเคราะห์รูปภาพนี้ (สลิปหรือภาพแชต) ว่ามีสัญญาณผิดปกติ สลิปปลอม หรือข้อความเร่งรัดโอนเงินหรือไม่' });
        }

        parts.push({
          text: `ตอบกลับในรูปแบบ JSON เท่านั้น:
{
  "risk_level": "low" | "medium" | "high",
  "risk_score": 0-100,
  "summary": "สรุปผลการวิเคราะห์กระชับ ชัดเจน",
  "red_flags": ["จุดสังเกต 1", "จุดสังเกต 2"],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2"]
}`
        });

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawJson = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            aiResponse = JSON.parse(rawJson);
            aiEngineUsed = 'Google Gemini 1.5 Flash';
          }
        }
      } catch (e) {
        console.error('Gemini error:', e);
      }
    } else if (env.AI && typeof env.AI.run === 'function') {
      try {
        const prompt = `วิเคราะห์ข้อความต่อไปนี้ว่ามีความเสี่ยงเป็นการหลอกลวง มิจฉาชีพ หรือเร่งเร้าให้โอนเงินหรือไม่: "${text}"
ตอบเป็น JSON เท่านั้น: {"risk_level": "low"|"medium"|"high", "risk_score": 0-100, "summary": "...", "red_flags": [...], "recommendations": [...]}`;
        const cfRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }]
        });
        if (cfRes && cfRes.response) {
          try {
            aiResponse = JSON.parse(cfRes.response);
            aiEngineUsed = 'Cloudflare Workers AI';
          } catch (_) {}
        }
      } catch (e) {
        console.error('CF AI error:', e);
      }
    }

    // 3. Fallback: Whodis Semantic NLP Engine
    if (!aiResponse) {
      aiResponse = analyzeScamContent(text, imageBase64, dbMatches);
    }

    // หากพบในฐานข้อมูล D1 ยกระดับเป็น High Risk ทันที
    if (dbMatches.length > 0) {
      aiResponse.risk_level = 'high';
      aiResponse.risk_score = Math.max(aiResponse.risk_score || 0, 95);
      if (!aiResponse.red_flags) aiResponse.red_flags = [];
      aiResponse.red_flags.unshift(`⚠️ พบประวัติในฐานข้อมูล Whodis ตรงกับรายงานที่อนุมัติแล้ว (${dbMatches[0].scammer_name || 'ชื่อตรงกัน'})`);
      aiResponse.recommendations.unshift('ระงับการทำธุรกรรมทันที เนื่องจากพบประวัติคนโกงที่ได้รับการยืนยันแล้ว');
    }

    return new Response(JSON.stringify({
      success: true,
      engine: aiEngineUsed,
      db_matched: dbMatches.length > 0,
      analysis: aiResponse
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

function analyzeScamContent(text, hasImage, dbMatches) {
  const content = (text || '').toLowerCase();
  let score = 12;
  const redFlags = [];
  const recommendations = [];

  const patterns = [
    {
      keywords: ['รีบโอน', 'ด่วน', 'จำกัดเวลา', 'ภายใน', 'นาที', 'ชั่วโมงนี้', 'หลุดจอง', 'สิทธิ์สุดท้าย', 'วันนี้วันเดียว', 'ก่อนหมด'],
      points: 25,
      flag: 'ตรวจพบการใช้จิตวิทยาเร่งรัดเวลา เพื่อให้เหยื่อไม่มีเวลาคิดหรือตรวจสอบ',
      rec: 'อย่าหลงเชื่อความเร่งด่วน มิจฉาชีพมักสร้างสถานการณ์ให้ตกใจหรือรีบตัดสินใจ'
    },
    {
      keywords: ['งานออนไลน์', 'กดรับออเดอร์', 'ภารกิจ', 'ปันผล', 'กำไรสูง', 'ทำงานที่บ้าน', 'ค่าคอม', 'ถอนเงินไม่ได้', 'ฝากเพิ่ม', 'สำรองจ่าย'],
      points: 40,
      flag: 'ตรวจพบรูปแบบกลโกงงานออนไลน์ / หลอกทำภารกิจโอนเงินสำรองจ่าย',
      rec: 'งานที่ให้โอนเงินสำรองก่อนเพื่อรับกำไร คือกลโกง 100% ห้ามโอนเด็ดขาด'
    },
    {
      keywords: ['ตำรวจ', 'สภ.', 'สอท.', 'ไซเบอร์', 'dsi', 'ปปง.', 'ศุลกากร', 'พัสดุตกค้าง', 'มีสิ่งผิดกฎหมาย', 'ฟอกเงิน', 'ออกหมายจับ', 'อายัดบัญชี'],
      points: 45,
      flag: 'ตรวจพบการแอบอ้างเจ้าหน้าที่รัฐ / ข่มขู่ดำเนินคดีเพื่อให้โอนเงินตรวจสอบ',
      rec: 'ตำรวจและเจ้าหน้าที่รัฐไม่มีนโยบายให้โอนเงินมาตรวจสอบผ่านแชตหรือโทรศัพท์เด็ดขาด'
    },
    {
      keywords: ['กู้เงิน', 'อนุมัติไว', 'ไม่ต้องค้ำ', 'สินเชื่อ', 'โอนค่ามัดจำ', 'ค่าค้ำประกัน', 'ค่าเอกสาร', 'ค่าปลดล็อค'],
      points: 35,
      flag: 'ตรวจพบรูปแบบเงินกู้นอกระบบออนไลน์ที่เรียกเก็บเงินก่อนกู้',
      rec: 'สินเชื่อถูกกฎหมายจะไม่มีการให้ผู้กู้โอนเงินค่าธรรมเนียมหรือค่ามัดจำก่อนเด็ดขาด'
    },
    {
      keywords: ['ถูกรางวัล', 'โชคดี', 'ผู้โชคดี', 'แจกทอง', 'แจกเงิน', 'ค่าภาษี', 'โอนค่าธรรมเนียมรับรางวัล'],
      points: 30,
      flag: 'ตรวจพบรูปแบบหลอกรับของรางวัลแล้วเรียกเก็บค่าธรรมเนียมล่วงหน้า',
      rec: 'ระวังการได้รับรางวัลที่ไม่ได้ร่วมกิจกรรมจริง และต้องไม่โอนเงินเพื่อแลกรางวัล'
    },
    {
      keywords: ['บัญชีม้า', 'บัญชีบุคคล', 'พร้อมเพย์', 'วอลเล็ท', 'truemoney', 'wallet'],
      points: 15,
      flag: 'พบการอ้างอิงบัญชีส่วนบุคคลหรือกระเป๋าเงินอิเล็กทรอนิกส์ ซึ่งมีความเสี่ยงเป็นบัญชีม้า',
      rec: 'ตรวจสอบชื่อบัญชีปลายทางให้ตรงกับชื่อนิติบุคคลหรือร้านค้าที่น่าเชื่อถือ'
    }
  ];

  for (const p of patterns) {
    const hits = p.keywords.filter(k => content.includes(k));
    if (hits.length > 0) {
      score += p.points;
      redFlags.push(p.flag + ` (คำที่ตรวจพบ: "${hits.slice(0, 3).join(', ')}")`);
      recommendations.push(p.rec);
    }
  }

  if (hasImage) {
    score += 15;
    redFlags.push('ตรวจพบรูปภาพแนบ: ตรวจสอบความผิดปกติของขนาดตัวอักษร วันเวลา และเลขอ้างอิงในสลิป/แชต');
    recommendations.push('สแกน QR Code บนสลิปโอนเงินผ่านแอปธนาคารจริงเพื่อเช็กสถานะการทำรายการ');
  }

  score = Math.min(Math.max(score, 10), 98);

  let riskLevel = 'low';
  let summary = 'ไม่พบสัญญาณบ่งชี้ความเสี่ยงที่ชัดเจน แต่ควรระมัดระวังตามหลักความปลอดภัย';

  if (score >= 65) {
    riskLevel = 'high';
    summary = 'พบสัญญาณอันตรายระดับสูง มีรูปแบบสอดคล้องกับพฤติกรรมมิจฉาชีพอย่างชัดเจน';
  } else if (score >= 35) {
    riskLevel = 'medium';
    summary = 'พบข้อความหรือพฤติกรรมที่มีความน่าสงสัยปานกลาง ควรตรวจสอบเพิ่มเติมก่อนโอนเงิน';
  }

  if (recommendations.length === 0) {
    recommendations.push('ตรวจสอบเลขบัญชีและชื่อผู้รับในหน้าค้นหาของ Whodis ก่อนยืนยันการโอน');
    recommendations.push('หากซื้อขายสินค้า ควรเลือกบริการเก็บเงินปลายทางหรือซื้อผ่านแพลตฟอร์มที่มีระบบคุ้มครองผู้ซื้อ');
  }

  return {
    risk_level: riskLevel,
    risk_score: score,
    summary,
    red_flags: redFlags,
    recommendations: [...new Set(recommendations)]
  };
}
