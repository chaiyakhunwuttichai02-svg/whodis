<?php
session_start();
require_once 'db_connect.php';

$error_message = '';

// หากมีการกดปุ่ม POST ให้เคลียร์ Session เก่าทิ้งก่อนล็อกอินใหม่
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($email) && !empty($password)) {
        try {
            // ค้นหาอีเมลโดยปรับเป็นตัวเล็กทั้งหมดเพื่อความแม่นยำ
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
           
            if ($user && (password_verify($password, $user['password']) || $password === $user['password'])) {
                
                // ตัดช่องว่างและแปลงยศเป็นตัวเล็กทั้งหมด
                $user_role = strtolower(trim($user['role'] ?? 'user'));

                // บันทึกข้อมูลลง Session
                $_SESSION['user_id']  = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role']     = $user_role;

                // Redirect ตามสิทธิ์
                if ($user_role === 'admin') {
                    header("Location: admin_reports.php");
                } else {
                    header("Location: index.php");
                }
                exit;

            } else {
                $error_message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง!';
            }
        } catch (PDOException $e) {
            $error_message = 'เกิดข้อผิดพลาด: ' . $e->getMessage();
        }
    } else {
        $error_message = 'กรุณากรอกข้อมูลให้ครบถ้วน!';
    }
} 
// ถ้าไม่ได้กดส่งฟอร์ม แล้วมี Session ล็อกอินค้างคาวอยู่แล้ว ให้เด้งตามสิทธิ์
else if (isset($_SESSION['user_id'])) {
    $current_role = strtolower(trim($_SESSION['role'] ?? 'user'));
    if ($current_role === 'admin') {
        header("Location: admin_reports.php");
    } else {
        header("Location: index.php");
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบ - whodis</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light d-flex align-items-center vh-100">

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-4">
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-body p-4">
                    <h3 class="text-center fw-bold text-primary mb-1">whodis</h3>
                    <p class="text-center text-muted small mb-4">เข้าสู่ระบบเพื่อใช้งาน</p>

                    <?php if (!empty($error_message)): ?>
                        <div class="alert alert-danger py-2 small" role="alert">
                            <?= htmlspecialchars($error_message) ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="login.php">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">อีเมล</label>
                            <input type="email" name="email" class="form-control" placeholder="name@example.com" required>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label small fw-bold">รหัสผ่าน</label>
                            <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">เข้าสู่ระบบ</button>
                    </form>

                    <hr class="my-4">
                    <p class="text-center small mb-0">ยังไม่มีบัญชี? <a href="register.php">สมัครสมาชิก</a></p>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>