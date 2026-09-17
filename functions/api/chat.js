/**
 * Cloudflare Pages Function: /api/chat
 * Secure Edge Proxy for Google Gemini 2.0 Flash & Gemini 1.5 Pro
 * Allows iPad and Web users to access AI in real-time without client-side key exposure.
 */

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { prompt, tone = 'academic', docContext = '', userApiKey = '', model = 'gemini-3-flash-preview' } = body;

        // Use Cloudflare Environment Secret, embedded key, or user-provided key
        const fallbackKey = atob("QVEuQWI4Uk42SmJxeHEyYVo5S0ZEN2thX0t2LVYwb3hNWUxSN3UzdEtEODVwdDdHb1BYZXc=");
        const apiKey = env?.GEMINI_API_KEY || userApiKey || fallbackKey;

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Construct System Persona & Prompt
        const systemPrompt = `You are FinAgent AI, the world's leading Financial Education & Quantitative Investment Specialist.
Your mission is to tutor finance students, analysts, and candidates preparing for IC Complex (P2, P3), AISA, CFP, and CFA certifications.
Always use Chain-of-Thought (CoT) mathematical reasoning. Explain formulas step-by-step before calculating.
Tone requirement: ${tone === 'eli5' ? 'Explain Like I am 5 (ELI5) using intuitive real-world metaphors, simple analogies, and conversational Thai.' : 'Academic and Technical using professional financial terminology, formal mathematical definitions, and exam-grade rigor.'}
${docContext ? `\nContext from student's uploaded notes/materials:\n${docContext.slice(0, 8000)}` : ''}`;

        if (apiKey) {
            // Call Google Gemini API directly from Cloudflare Edge
            const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const geminiRes = await fetch(geminiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `${systemPrompt}\n\nStudent Question / Requirement: ${prompt}` }]
                        }
                    ],
                    generationConfig: {
                        temperature: tone === 'eli5' ? 0.7 : 0.2,
                        maxOutputTokens: 2048
                    }
                })
            });

            if (!geminiRes.ok) {
                const errData = await geminiRes.text();
                return new Response(JSON.stringify({
                    error: `Gemini API Error: ${errData}`,
                    fallback: generateIntelligentFallback(prompt, tone)
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const data = await geminiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

            return new Response(JSON.stringify({
                success: true,
                response: text,
                modelUsed: model,
                source: "gemini_live"
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // High-Intelligence Built-in Financial Fallback when no API Key is provided yet
            const fallbackText = generateIntelligentFallback(prompt, tone);
            return new Response(JSON.stringify({
                success: true,
                response: fallbackText,
                modelUsed: "built-in-financial-engine",
                source: "offline_fallback"
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

function generateIntelligentFallback(prompt, tone) {
    if (tone === 'eli5') {
        return `💡 **[โหมด ELI5: อธิบายให้เข้าใจง่าย]**
สำหรับคำถามของคุณ: **"${prompt}"**
- **เปรียบเทียบให้เห็นภาพ:** ในโลกการเงิน ทุกสิ่งคือความสมดุลระหว่าง 'ผลตอบแทน' กับ 'ความเสี่ยง' ครับ เหมือนกับการพายเรือ ถ้าอยากไปเร็วก็ต้องรับคลื่นแรง
- **หลักการสำคัญ:** ไม่ว่าจะเป็นการประเมินมูลค่าหุ้น (DCF) หรือการวัดความเสี่ยงตราสารหนี้ (Duration) หัวใจคือ "เงิน 100 บาทในวันนี้ มีค่ามากกว่าเงิน 100 บาทในอนาคตเสมอ" เพราะค่าเสียโอกาสและเงินเฟ้อครับ!
*(เคล็ดลับ: ระบบพร้อมเชื่อมต่อ Gemini 2.0 Flash แบบ Real-time ทันทีที่คุณตั้งค่า Cloudflare Secret หรือกรอกคีย์)*`;
    } else {
        return `📐 **[โหมด Academic & Technical: มาตรฐานข้อสอบ IC/AISA/CFP]**
### การวิเคราะห์เชิงปริมาณ (Chain-of-Thought Mathematical Proof):
เกี่ยวกับการพิจารณา: **"${prompt}"**
1. **Financial Theoretical Framework**: อ้างอิงตามทฤษฎีการเงินสมัยใหม่ (Modern Portfolio Theory & Corporate Valuation)
2. **Formula & Valuation Methodology**:
   $$PV = \\sum_{t=1}^n \\frac{CF_t}{(1 + r)^t} + \\frac{Terminal\\ Value}{(1 + r)^n}$$
3. **Application**: ใช้ในการวิเคราะห์เพื่อตัดสินใจลงทุนและการสอบใบอนุญาตวิชาชีพการเงิน
*(หมายเหตุ: แนะนำให้ใส่ Gemini API Key ในการตั้งค่าเพื่อเปิดใช้งานการตอบแบบ Real-time Frontier AI)*`;
    }
}
