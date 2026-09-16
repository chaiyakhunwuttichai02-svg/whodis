# คู่มือการนำระบบ Whodis ขึ้น Cloudflare Pages + Cloudflare D1 Database (ฟรี 100%)

ระบบ Whodis ได้รับการแปลงจาก PHP เป็น **HTML5 + JavaScript + Cloudflare Pages Functions** เรียบร้อยแล้ว พร้อมใช้งานบน Cloudflare แบบ 100%

---

## ขั้นตอนที่ 1: นำโค้ดขึ้น GitHub

1. เปิดโฟลเดอร์นี้ใน VS Code หรือใช้ Git Command Line
2. ทำการ Commit โค้ดทั้งหมดและ Push ขึ้นไปที่ GitHub Repository ของคุณ (สร้างเป็น Public หรือ Private ก็ได้)
   ```bash
   git add .
   git commit -m "Convert PHP to JS/HTML5 with Cloudflare Pages & D1"
   git push origin main
   ```

---

## ขั้นตอนที่ 2: สร้างฐานข้อมูล Cloudflare D1 บน Cloudflare Dashboard

1. เข้าสู่ระบบที่ [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. ที่เมนูด้านซ้าย เลือก **Storage & Databases** -> **D1 SQL Database**
3. คลิกปุ่ม **Create database**
4. ตั้งชื่อ Database: `whodis-db` แล้วกดปุ่ม **Create**
5. เมื่อสร้างเสร็จแล้ว คลิกเข้าไปที่ `whodis-db` เลือกแท็บ **Console**
6. เปิดไฟล์ [schema.sql](schema.sql) ในโปรเจกต์ คัดลอกโค้ด SQL ทั้งหมดไปวางในช่อง Console แล้วกด **Execute**
   *(ระบบจะสร้างตาราง `users`, `reports`, `search_logs`, `password_resets` และแอดมินเริ่มต้นให้อัตโนมัติ)*

---

## ขั้นตอนที่ 3: สร้างและเชื่อมต่อ Cloudflare Pages เข้ากับ GitHub

1. ที่เมนูด้านซ้ายของ Cloudflare Dashboard เลือก **Compute (Workers & Pages)**
2. คลิกปุ่ม **Create application** -> เลือกแท็บ **Pages** -> เลือก **Connect to Git**
3. ล็อกอินและเลือก GitHub Repository `whodis` ของคุณ แล้วกด **Begin setup**
4. ตั้งค่า Build Settings ดังนี้:
   * **Project name:** `whodis` (หรือชื่อตามต้องการ เว็บจะได้ URL เป็น `https://whodis.pages.dev`)
   * **Production branch:** `main` (หรือ master)
   * **Framework preset:** `None`
   * **Build command:** *(ปล่อยว่างไว้)*
   * **Build output directory:** `.` *(พิมพ์จุด หรือปล่อยว่าง)*
5. กดปุ่ม **Save and Deploy**
6. รอประมาณ 30-60 วินาที Cloudflare จะทำการ Build และ Deploy หน้าเว็บขึ้นออนไลน์ทันที

---

## ขั้นตอนที่ 4: ผูก D1 Database เข้ากับ Cloudflare Pages (สำคัญที่สุด!)

เพื่อให้ระบบ Functions ค้นหาและบันทึกข้อมูลลงในฐานข้อมูล D1 ได้:
1. ในหน้าโปรเจกต์ Pages บน Cloudflare ให้ไปที่แท็บ **Settings** -> เลือกเมนู **Functions** ด้านซ้าย
2. เลื่อนลงมาที่หัวข้อ **D1 database bindings** -> คลิก **Add binding**
3. กรอกข้อมูลดังนี้:
   * **Variable name:** `DB` *(ต้องเป็นตัวพิมพ์ใหญ่ตามนี้)*
   * **D1 database:** เลือก `whodis-db` (ฐานข้อมูลที่คุณสร้างไว้ในขั้นตอนที่ 2)
4. กดปุ่ม **Save**
5. ไปที่แท็บ **Deployments** ด้านบน กดปุ่มจุดสามจุด (...) ที่รายการ Deploy ล่าสุด แล้วกด **Retry deployment** 1 ครั้งเพื่อให้ค่า Binding มีผล

🎉 **เสร็จเรียบร้อย!** เว็บไซต์ของคุณจะออนไลน์ตลอด 24 ชั่วโมงพร้อมฐานข้อมูล D1 บน `https://whodis.pages.dev` ทันที!

---

## ข้อมูลเริ่มต้นสำหรับทดสอบระบบ

* **หน้าเข้าสู่ระบบ Admin:** เปิดไปที่ `https://whodis.pages.dev/login.html`
  * **อีเมล:** `admin@whodis.com`
  * **รหัสผ่าน:** `admin1234`
  * เมื่อล็อกอินแล้วจะเข้าสู่หน้าแอดมิน `admin_reports.html` เพื่ออนุมัติ/ปฏิเสธรายงานได้ทันที
* **การรีเซ็ตรหัสผ่านด้วย OTP:**
  * เข้าหน้า `forgot_password.html` กรอกอีเมลที่เคยสมัครไว้
  * ระบบจะสร้างรหัส OTP 6 หลักและส่งเข้าอีเมลทันที พร้อมแสดงรหัสตัวอย่างในกรณีทดสอบ
