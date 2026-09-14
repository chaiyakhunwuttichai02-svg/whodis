<?php
// แก้ไขให้ใช้ Connection Pooler (รองรับ IPv4 บนเครื่อง localhost)
$host     = 'aws-0-ap-southeast-1.pooler.supabase.com'; // Host ของ Pooler (สิงคโปร์)
$port     = '6543';                                    // Port สำหรับ Pooler
$dbname   = 'postgres';
$user     = 'postgres.nghsiqbguufglyvwpfsp';           // User (มี ID โปรเจกต์ของคุณแล้ว)
$password = 'FdidVx41DVQfPQpO';                // ใส่ Password ที่ตั้งไว้ตอนสร้างโปรเจกต์

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    die('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ' . $e->getMessage());
}
?>