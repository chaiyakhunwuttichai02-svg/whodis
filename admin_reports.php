<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'db_connect.php';

// ตรวจสอบสิทธิ์ Admin
if (!isset($_SESSION['user_id']) || strtolower(trim($_SESSION['role'] ?? '')) !== 'admin') {
    header('Location: login.php');
    exit();
}

// ==========================================
// ดึงข้อมูลแอดมินจากฐานข้อมูลจริง เพื่อมาแสดงผลมุมขวาบน
// ==========================================
$admin_name = 'Admin';
$admin_email = 'admin@whodis.com';

try {
    $stmt_admin = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt_admin->execute([$_SESSION['user_id']]);
    $admin_data = $stmt_admin->fetch(PDO::FETCH_ASSOC);
    
    if ($admin_data) {
        $admin_name = $admin_data['username'] ?? $admin_data['name'] ?? $admin_data['firstname'] ?? 'Admin';
        $admin_email = $admin_data['email'] ?? 'No Email Provided';
    }
} catch (PDOException $e) {
    // สำรองข้อมูลจาก Session กรณี Database Error
    $admin_name = $_SESSION['username'] ?? $_SESSION['name'] ?? $_SESSION['firstname'] ?? 'Admin';
    $admin_email = $_SESSION['email'] ?? 'admin@whodis.com';
}

// รับค่า view และ filter
$current_view = $_GET['view'] ?? 'reports';
$current_filter = $_GET['filter'] ?? 'all';

// ==========================================
// 1. จัดการ Action ของหน้า Reports
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['report_id'])) {
    $report_id = $_POST['report_id'];
    $action = $_POST['action'] ?? '';

    if ($action === 'approve') {
        $stmt = $pdo->prepare("UPDATE reports SET status = 'approved' WHERE id = ?");
        $stmt->execute([$report_id]);
    } elseif ($action === 'reject') {
        $stmt = $pdo->prepare("UPDATE reports SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$report_id]);
    } elseif ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM reports WHERE id = ?");
        $stmt->execute([$report_id]);
    }
    header('Location: admin_reports.php?view=reports&filter=' . $current_filter);
    exit();
}

// ==========================================
// 2. ดึงข้อมูลสำหรับหน้าต่างๆ
// ==========================================
$error = null;

if ($current_view === 'reports') {
    // ดึงสถิติ
    try {
        $stmt_stats = $pdo->query("SELECT status FROM reports");
        $all_data = $stmt_stats->fetchAll(PDO::FETCH_ASSOC);
        $total_reports = count($all_data);
        $pending_count = 0; $approved_count = 0; $rejected_count = 0;
        foreach ($all_data as $r) {
            $s = strtolower($r['status'] ?? 'pending');
            if ($s === 'approved') $approved_count++;
            elseif ($s === 'rejected') $rejected_count++;
            else $pending_count++;
        }
    } catch (PDOException $e) { $error = "Error: " . $e->getMessage(); }

    // ดึงตาราง
    try {
        $sql = "SELECT * FROM reports ";
        if ($current_filter === 'pending') $sql .= "WHERE status = 'pending' OR status IS NULL ";
        elseif ($current_filter === 'approved') $sql .= "WHERE status = 'approved' ";
        elseif ($current_filter === 'rejected') $sql .= "WHERE status = 'rejected' ";
        $sql .= "ORDER BY created_at DESC";
        $stmt = $pdo->query($sql);
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) { $reports = []; }
} 
elseif ($current_view === 'users') {
    // ดึงข้อมูล Users
    try {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
        $users_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $users_list = [];
        $error = "ไม่พบตาราง users หรือมีข้อผิดพลาด: " . $e->getMessage();
    }
}

function e(string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Whodis</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
        .sidebar { background-color: #1f2937; }
        .sidebar-item:hover { background-color: #374151; color: white; }
        .sidebar-item.active { background-color: #3b82f6; color: white !important; }
        .toggle-checkbox:checked { right: 0; border-color: #3b82f6; }
        .toggle-checkbox:checked + .toggle-label { background-color: #3b82f6; }
    </style>
</head>
<body class="flex h-screen overflow-hidden text-gray-800">

    <!-- Sidebar ด้านซ้าย -->
    <aside class="sidebar w-64 h-full flex-shrink-0 flex flex-col text-gray-300 transition-all duration-300">
        <div class="h-16 flex items-center px-6 border-b border-gray-700">
            <span class="material-symbols-outlined text-[28px] mr-2 text-white">security</span>
            <span class="text-white font-bold text-lg tracking-wider">Whodis Admin</span>
        </div>
        
        <div class="flex-1 overflow-y-auto py-4">
            <nav class="space-y-1 px-3">
                <a href="?view=reports&filter=all" class="sidebar-item <?= ($current_view === 'reports' && $current_filter === 'all') ? 'active' : '' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg">
                    <span class="material-symbols-outlined mr-3 text-[20px]">dashboard</span>
                    Dashboard
                </a>
                <a href="?view=reports&filter=pending" class="sidebar-item <?= ($current_view === 'reports' && $current_filter === 'pending') ? 'active' : 'text-orange-400' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg mt-2">
                    <span class="material-symbols-outlined mr-3 text-[20px]">hourglass_empty</span>
                    Pending Reports
                </a>
                <a href="?view=reports&filter=approved" class="sidebar-item <?= ($current_view === 'reports' && $current_filter === 'approved') ? 'active' : 'text-emerald-400' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg mt-2">
                    <span class="material-symbols-outlined mr-3 text-[20px]">check_circle</span>
                    Approved
                </a>
                <a href="?view=reports&filter=rejected" class="sidebar-item <?= ($current_view === 'reports' && $current_filter === 'rejected') ? 'active' : 'text-red-400' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg mt-2">
                    <span class="material-symbols-outlined mr-3 text-[20px]">cancel</span>
                    Rejected
                </a>
                <hr class="border-gray-700 my-4 mx-4">
                <a href="?view=users" class="sidebar-item <?= $current_view === 'users' ? 'active' : '' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg mt-2">
                    <span class="material-symbols-outlined mr-3 text-[20px]">group</span>
                    Users
                </a>
                <a href="?view=settings" class="sidebar-item <?= $current_view === 'settings' ? 'active' : '' ?> flex items-center px-4 py-3 text-sm font-medium rounded-lg mt-2">
                    <span class="material-symbols-outlined mr-3 text-[20px]">settings</span>
                    Settings
                </a>
            </nav>
        </div>
        
        <div class="p-4 border-t border-gray-700">
            <a href="logout.php" class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition">
                <span class="material-symbols-outlined mr-2 text-[18px]">logout</span>
                Logout
            </a>
        </div>
    </aside>

    <!-- พื้นที่เนื้อหาด้านขวา -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
        
        <!-- Top Navbar -->
        <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
            <div class="text-xl font-bold text-gray-800">
                <?php
                    if ($current_view === 'users') echo 'User Management';
                    elseif ($current_view === 'settings') echo 'System Settings';
                    elseif ($current_filter === 'pending') echo 'Pending Reports';
                    elseif ($current_filter === 'approved') echo 'Approved Reports';
                    elseif ($current_filter === 'rejected') echo 'Rejected Reports';
                    else echo 'Dashboard Overview';
                ?>
            </div>
            
            <div class="flex items-center gap-4">
                <?php if ($current_view === 'reports'): ?>
                <button onclick="window.location.href='report.php'" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">add</span> Add Report
                </button>
                <?php endif; ?>
                
                <!-- โปรไฟล์แอดมิน -->
                <div class="flex items-center gap-3 border-l pl-4 border-gray-200">
                    <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <span class="material-symbols-outlined text-[22px]">person</span>
                    </div>
                    <div class="hidden md:block text-sm">
                        <div class="font-bold text-gray-700 leading-tight"><?= e($admin_name) ?></div>
                        <div class="text-xs text-gray-400"><?= e($admin_email) ?></div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content (Scrollable) -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            
            <?php if ($error): ?>
                <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
                    <?= e($error) ?>
                </div>
            <?php endif; ?>

            <?php 
            // ==========================================
            // มุมมอง: Reports (ค่าเริ่มต้น)
            // ==========================================
            if ($current_view === 'reports'): 
            ?>
                <!-- 4 กล่องสถิติ -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <a href="?view=reports&filter=pending" class="block bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-orange-400 flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <div class="text-[11px] font-bold text-gray-500 tracking-wider mb-1">PENDING REVIEW</div>
                            <div class="text-3xl font-bold text-gray-800"><?= $pending_count ?></div>
                        </div>
                        <span class="material-symbols-outlined text-orange-400 text-[32px]">hourglass_top</span>
                    </a>
                    <a href="?view=reports&filter=approved" class="block bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-emerald-500 flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <div class="text-[11px] font-bold text-gray-500 tracking-wider mb-1">APPROVED</div>
                            <div class="text-3xl font-bold text-gray-800"><?= $approved_count ?></div>
                        </div>
                        <span class="material-symbols-outlined text-emerald-500 text-[32px]">check_box</span>
                    </a>
                    <a href="?view=reports&filter=rejected" class="block bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-red-500 flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <div class="text-[11px] font-bold text-gray-500 tracking-wider mb-1">REJECTED</div>
                            <div class="text-3xl font-bold text-gray-800"><?= $rejected_count ?></div>
                        </div>
                        <span class="material-symbols-outlined text-red-500 text-[32px]">cancel_presentation</span>
                    </a>
                    <a href="?view=reports&filter=all" class="block bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-gray-800 flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <div class="text-[11px] font-bold text-gray-500 tracking-wider mb-1">TOTAL REPORTS</div>
                            <div class="text-3xl font-bold text-gray-800"><?= $total_reports ?></div>
                        </div>
                        <span class="material-symbols-outlined text-gray-800 text-[32px]">bar_chart</span>
                    </a>
                </div>

                <!-- ตารางรายงาน -->
                <div class="mb-6">
                    <div class="bg-white p-4 rounded-t-xl border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                        <div class="relative w-full sm:w-80">
                            <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
                            <input type="text" id="searchInput" placeholder="Search reports..." onkeyup="searchTable('reportsTable')" class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                        </div>
                        <select onchange="window.location.href='?view=reports&filter=' + this.value" class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer">
                            <option value="all" <?= $current_filter === 'all' ? 'selected' : '' ?>>All Status</option>
                            <option value="pending" <?= $current_filter === 'pending' ? 'selected' : '' ?>>Pending</option>
                            <option value="approved" <?= $current_filter === 'approved' ? 'selected' : '' ?>>Approved</option>
                            <option value="rejected" <?= $current_filter === 'rejected' ? 'selected' : '' ?>>Rejected</option>
                        </select>
                    </div>
                    <div class="bg-white rounded-b-xl shadow-sm overflow-x-auto">
                        <table class="w-full text-left border-collapse" id="reportsTable">
                            <thead>
                                <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 tracking-wider border-b border-gray-100">
                                    <th class="px-6 py-4">NO.</th>
                                    <th class="px-6 py-4">SCAMMER</th>
                                    <th class="px-6 py-4">SUBJECT / DETAILS</th>
                                    <th class="px-6 py-4 text-center">STATUS</th>
                                    <th class="px-6 py-4">DATE</th>
                                    <th class="px-6 py-4 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                <?php if (empty($reports)): ?>
                                    <tr><td colspan="6" class="px-6 py-12 text-center text-gray-400">ไม่มีข้อมูล</td></tr>
                                <?php else: ?>
                                    <?php $i = 1; foreach ($reports as $row): 
                                        $status = strtolower($row['status'] ?? 'pending');
                                        $img = trim($row['evidence_file'] ?? $row['image'] ?? '');
                                        $image_src = $img ? ((str_starts_with($img, 'http') || str_starts_with($img, 'uploads/')) ? $img : 'uploads/' . $img) : '';
                                    ?>
                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors search-item">
                                        <td class="px-6 py-4 text-gray-500"><?= $i++ ?></td>
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-gray-800 search-txt"><?= e($row['scammer_name'] ?? 'ไม่ระบุชื่อ') ?></div>
                                            <div class="text-[12px] text-gray-500 mt-0.5 search-txt"><?= e($row['bank_account'] ?? '-') ?></div>
                                        </td>
                                        <td class="px-6 py-4 max-w-xs truncate text-gray-600 search-txt"><?= e($row['incident_details'] ?? '-') ?></td>
                                        <td class="px-6 py-4 text-center">
                                            <?php if ($status === 'approved'): ?><span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Approved</span>
                                            <?php elseif ($status === 'rejected'): ?><span class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                            <?php else: ?><span class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500 whitespace-nowrap"><?= e(date('d M Y', strtotime($row['created_at'] ?? 'now'))) ?></td>
                                        <td class="px-6 py-4 text-center">
                                            <div class="flex items-center justify-center gap-2">
                                                <?php if($image_src): ?>
                                                    <button onclick="openImageModal('<?= e($image_src) ?>')" class="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg" title="ดูรูป"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
                                                <?php endif; ?>
                                                <form method="POST" class="inline-flex gap-1" onsubmit="return confirm('ยืนยันการทำรายการ?');">
                                                    <input type="hidden" name="report_id" value="<?= $row['id'] ?>">
                                                    <?php if($status !== 'approved'): ?><button type="submit" name="action" value="approve" class="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded-lg"><span class="material-symbols-outlined text-[18px]">check</span></button><?php endif; ?>
                                                    <?php if($status !== 'rejected'): ?><button type="submit" name="action" value="reject" class="text-orange-500 hover:bg-orange-50 p-1.5 rounded-lg"><span class="material-symbols-outlined text-[18px]">close</span></button><?php endif; ?>
                                                    <button type="submit" name="action" value="delete" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            <?php 
            // ==========================================
            // มุมมอง: Users
            // ==========================================
            elseif ($current_view === 'users'): 
            ?>
                <div class="mb-6">
                    <div class="bg-white p-4 rounded-t-xl border-b border-gray-100 flex justify-between items-center">
                        <div class="relative w-full sm:w-80">
                            <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
                            <input type="text" id="searchUser" placeholder="Search users by name or email..." onkeyup="searchTable('usersTable', 'searchUser')" class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    <div class="bg-white rounded-b-xl shadow-sm overflow-x-auto">
                        <table class="w-full text-left border-collapse" id="usersTable">
                            <thead>
                                <tr class="bg-gray-50 text-[11px] font-bold text-gray-500 tracking-wider border-b border-gray-100">
                                    <th class="px-6 py-4">ID</th>
                                    <th class="px-6 py-4">USERNAME / NAME</th>
                                    <th class="px-6 py-4">EMAIL</th>
                                    <th class="px-6 py-4 text-center">ROLE</th>
                                    <th class="px-6 py-4">JOINED DATE</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                <?php if (empty($users_list)): ?>
                                    <tr><td colspan="5" class="px-6 py-12 text-center text-gray-400">ไม่มีข้อมูลผู้ใช้งาน หรือตาราง users ยังไม่ถูกต้อง</td></tr>
                                <?php else: ?>
                                    <?php foreach ($users_list as $user): ?>
                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors search-item">
                                        <td class="px-6 py-4 font-medium text-gray-500">#<?= $user['id'] ?? '-' ?></td>
                                        <td class="px-6 py-4 font-bold text-gray-800 search-txt"><?= e($user['username'] ?? $user['name'] ?? $user['firstname'] ?? 'Unknown') ?></td>
                                        <td class="px-6 py-4 text-gray-600 search-txt"><?= e($user['email'] ?? '-') ?></td>
                                        <td class="px-6 py-4 text-center">
                                            <?php $urole = strtolower($user['role'] ?? 'user'); ?>
                                            <?php if($urole === 'admin'): ?>
                                                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Admin</span>
                                            <?php else: ?>
                                                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">User</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500"><?= e(date('d M Y', strtotime($user['created_at'] ?? 'now'))) ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            <?php 
            // ==========================================
            // มุมมอง: Settings
            // ==========================================
            elseif ($current_view === 'settings'): 
            ?>
                <div class="max-w-4xl mx-auto space-y-6">
                    <!-- General Settings -->
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div class="border-b border-gray-100 px-6 py-4">
                            <h3 class="text-lg font-bold text-gray-800">General Settings</h3>
                            <p class="text-sm text-gray-500">จัดการข้อมูลพื้นฐานของระบบเว็บไซต์</p>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Site Name (ชื่อเว็บไซต์)</label>
                                <input type="text" value="Whodis Detection System" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                <input type="email" value="support@whodis.com" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none">
                            </div>
                            <div class="flex items-center justify-between pt-2">
                                <div>
                                    <p class="text-sm font-medium text-gray-800">Maintenance Mode (ปิดปรับปรุงระบบ)</p>
                                    <p class="text-xs text-gray-500">เปิดเพื่อปิดไม่ให้ผู้ใช้งานทั่วไปเข้าถึงเว็บไซต์ชั่วคราว</p>
                                </div>
                                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle1" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"/>
                                    <label for="toggle1" class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-6 py-3 text-right">
                            <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

        </main>
    </div>

    <!-- Modal ดูรูปภาพ -->
    <div id="imageModal" class="fixed inset-0 bg-black/80 z-[100] hidden flex items-center justify-center p-4 cursor-pointer" onclick="closeImageModal()">
        <div class="relative max-w-3xl max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
            <img id="modalImage" src="" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white">
            <button onclick="closeImageModal()" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition">✕</button>
        </div>
    </div>

    <script>
        function openImageModal(src) {
            document.getElementById('modalImage').src = src;
            document.getElementById('imageModal').classList.remove('hidden');
        }
        function closeImageModal() {
            document.getElementById('imageModal').classList.add('hidden');
            document.getElementById('modalImage').src = '';
        }

        // ระบบค้นหา
        function searchTable(tableId, inputId = 'searchInput') {
            let input = document.getElementById(inputId).value.toLowerCase();
            let table = document.getElementById(tableId);
            if(!table) return;
            
            let rows = table.querySelectorAll(".search-item");
            rows.forEach(row => {
                let texts = row.querySelectorAll(".search-txt");
                let found = false;
                texts.forEach(txt => {
                    if (txt.innerText.toLowerCase().includes(input)) found = true;
                });
                row.style.display = found ? "" : "none";
            });
        }
    </script>
</body>
</html>