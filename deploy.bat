@echo off
chcp 65001 >nul
title Whodis - Auto Deploy to Cloudflare
echo ====================================================================
echo   Whodis - เชื่อมต่อ Cloudflare และ Deploy อัตโนมัติ (ไม่ต้องหา Token)
echo ====================================================================
echo.
echo [ขั้นตอนที่ 1/3] กำลังเปิดหน้าต่างยืนยันสิทธิ์ Cloudflare บนเบราว์เซอร์ของคุณ...
echo (เมื่อเบราว์เซอร์เด้งขึ้นมา ให้คุณกดปุ่มสีฟ้า "Allow" บนหน้าจอได้เลยครับ)
echo.
call npx wrangler login

echo.
echo --------------------------------------------------------------------
echo [ขั้นตอนที่ 2/3] เข้าสู่ระบบสำเร็จ! กำลังสร้าง D1 Database (whodis-db)...
echo --------------------------------------------------------------------
call npx wrangler d1 create whodis-db
call npx wrangler d1 execute whodis-db --file=./schema.sql --remote -y

echo.
echo --------------------------------------------------------------------
echo [ขั้นตอนที่ 3/3] กำลัง Deploy หน้าเว็บทั้งหมดขึ้น Cloudflare Pages...
echo --------------------------------------------------------------------
call npx wrangler pages deploy . --project-name=whodis --branch=main

echo.
echo ====================================================================
echo   🎉 สำเร็จเรียบร้อย 100%! เว็บไซต์ของคุณออนไลน์แล้วที่:
echo   👉 https://whodis.pages.dev
echo.
echo   เข้าสู่ระบบ Admin ได้ที่: https://whodis.pages.dev/login.html
echo   อีเมล: adminwhodis@gmail.com
echo   รหัสผ่าน: adminwhodis159753
echo ====================================================================
echo.
pause
