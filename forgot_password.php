<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'db_connect.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if ($email === '') {
        $error = 'กรุณากรอกอีเมลของคุณ';
    } else {
        try {
            // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user) {
                // ในอนาคตสามารถเพิ่มโค้ดส่ง Token / OTP ไปที่อีเมลตรงนี้ได้
                $success = 'ระบบได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว (จำลองการส่งสำเร็จ)';
            } else {
                // เพื่อความปลอดภัย ไม่ควรบอกตรงๆ ว่าไม่มีอีเมลนี้ในระบบ แต่แสดงข้อความกลางๆ ไว้
                $success = 'หากอีเมลนี้มีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านเร็วๆ นี้';
            }
        } catch (PDOException $e) {
            $error = 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล';
        }
    }
}

function e(string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

include 'header.php';
?>

<main class="w-full pt-16 pb-24 bg-base-bg flex items-center justify-center">
    <div class="max-w-[440px] w-full mx-auto px-4">
        
        <!-- หัวข้อหน้า Forgot Password -->
        <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary-text text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">lock_reset</span>
            </div>
            <h1 class="text-[28px] font-bold text-primary-text mb-2">ลืมรหัสผ่านใช่ไหม?</h1>
            <p class="text-muted-text text-[14px]">กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับคำแนะนำในการรีเซ็ตรหัสผ่าน</p>
        </div>

        <!-- กล่องฟอร์ม -->
        <div class="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            
            <?php if ($error !== ''): ?>
                <div class="mb-6 p-4 bg-red-50 border border-red-200 text-danger rounded-xl text-[14px] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">error</span>
                    <span><?= e($error) ?></span>
                </div>
            <?php endif; ?>

            <?php if ($success !== ''): ?>
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-[14px] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">check_circle</span>
                    <span><?= e($success) ?></span>
                </div>
            <?php endif; ?>

            <form action="forgot_password.php" method="POST" class="space-y-5">
                <div>
                    <label class="block text-[13px] font-semibold text-primary-text mb-1.5">อีเมลที่ใช้สมัครสมาชิก</label>
                    <input type="email" name="email" required class="w-full h-[48px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-primary-text focus:bg-white transition-colors" placeholder="name@example.com">
                </div>

                <button type="submit" class="w-full h-[50px] bg-primary-text hover:bg-gray-800 text-white text-[15px] font-bold rounded-xl shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 mt-2">
                    ส่งลิงก์รีเซ็ตรหัสผ่าน <span class="material-symbols-outlined text-[18px]">send</span>
                </button>
            </form>

            <div class="mt-8 text-center pt-6 border-t border-gray-100">
                <p class="text-[14px] text-muted-text">
                    จำรหัสผ่านได้แล้ว? <a href="login.php" class="font-bold text-primary-text hover:underline">กลับไปหน้าเข้าสู่ระบบ</a>
                </p>
            </div>
        </div>

    </div>
</main>

<footer class="w-full pb-8 pt-4 border-t border-gray-200 mt-auto">
    <div class="max-w-[1000px] mx-auto px-4 text-center">
        <div class="flex items-center justify-center gap-1 mb-2">
            <span class="material-symbols-outlined text-[16px] text-primary-text">verified_user</span>
            <span class="font-bold text-[14px] text-primary-text">Whodis</span>
        </div>
        <p class="text-[12px] text-muted-text">Check Before You Pay — เช็กก่อนโอนทุกครั้ง ป้องกันดีกว่าแก้</p>
    </div>
</footer>

</body>
</html>