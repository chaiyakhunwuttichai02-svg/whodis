<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'db_connect.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if ($username === '' || $email === '' || $password === '' || $confirmPassword === '') {
        $error = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
    } elseif ($password !== $confirmPassword) {
        $error = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
    } elseif (mb_strlen($password, 'UTF-8') < 6) {
        $error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรขึ้นไป';
    } else {
        try {
            // ตรวจสอบว่าชื่อผู้ใช้หรืออีเมลซ้ำไหม
            $checkStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ? OR email = ?');
            $checkStmt->execute([$username, $email]);
            if ($checkStmt->fetchColumn() > 0) {
                $error = 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานไปแล้ว';
            } else {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
                $stmt->execute([$username, $email, $hashedPassword]);
                
                $success = 'สมัครสมาชิกสำเร็จ! กำลังพาคุณไปหน้าเข้าสู่ระบบ...';
                header('refresh:2;url=login.php');
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

<main class="w-full pt-12 pb-24 bg-base-bg flex items-center justify-center">
    <div class="max-w-[440px] w-full mx-auto px-4">
        
        <!-- หัวข้อหน้า Register -->
        <div class="text-center mb-8">
            <div class="w-12 h-12 bg-success text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <h1 class="text-[28px] font-bold text-primary-text mb-2">สร้างบัญชีผู้ใช้ใหม่</h1>
            <p class="text-muted-text text-[14px]">ร่วมเป็นส่วนหนึ่งในการปกป้องและแจ้งเตือนภัยมิจฉาชีพ</p>
        </div>

        <!-- กล่องฟอร์ม Register -->
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

            <form action="register.php" method="POST" class="space-y-4">
                <div>
                    <label class="block text-[13px] font-semibold text-primary-text mb-1.5">ชื่อผู้ใช้ (Username)</label>
                    <input type="text" name="username" required class="w-full h-[46px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-primary-text focus:bg-white transition-colors" placeholder="ตั้งชื่อผู้ใช้ของคุณ">
                </div>

                <div>
                    <label class="block text-[13px] font-semibold text-primary-text mb-1.5">อีเมล (Email)</label>
                    <input type="email5" name="email" required class="w-full h-[46px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-primary-text focus:bg-white transition-colors" placeholder="name@example.com">
                </div>

                <div>
                    <label class="block text-[13px] font-semibold text-primary-text mb-1.5">รหัสผ่าน (Password)</label>
                    <input type="password" name="password" required class="w-full h-[46px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-primary-text focus:bg-white transition-colors" placeholder="อย่างน้อย 6 ตัวอักษร">
                </div>

                <div>
                    <label class="block text-[13px] font-semibold text-primary-text mb-1.5">ยืนยันรหัสผ่าน</label>
                    <input type="password" name="confirm_password" required class="w-full h-[46px] px-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-primary-text focus:bg-white transition-colors" placeholder="กรอกรหัสผ่านอีกครั้ง">
                </div>

                <button type="submit" class="w-full h-[50px] bg-primary-text hover:bg-gray-800 text-white text-[15px] font-bold rounded-xl shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 mt-4">
                    สมัครสมาชิก <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
                </button>
            </form>

            <div class="mt-8 text-center pt-6 border-t border-gray-100">
                <p class="text-[14px] text-muted-text">
                    มีบัญชีอยู่แล้ว? <a href="login.php" class="font-bold text-primary-text hover:underline">เข้าสู่ระบบที่นี่</a>
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