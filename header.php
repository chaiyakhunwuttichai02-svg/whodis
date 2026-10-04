<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Whodis - Check Before You Pay</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { 
            darkMode: 'class',
            theme: { 
                extend: { 
                    colors: { 
                        "base-bg": "#f8fafc",
                        "card-bg": "#ffffff",
                        "primary-text": "#0f172a",
                        "muted-text": "#64748b",
                        "danger": "#ef4444",
                        "success": "#10b981",
                        "warning": "#facc15",
                        "dark-badge": "#1e293b"
                    },
                    fontFamily: { "sans": ["Inter", "Noto Sans Thai", "sans-serif"] }
                } 
            } 
        };
    </script>
    <script>
        (function() {
            try {
                const t = localStorage.getItem('whodis_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        })();
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
    <style>
        .nav-link {
            padding: 0.5rem 1rem;
            font-size: 14px;
            font-weight: 500;
            border-radius: 9999px;
            transition: all 0.2s ease;
        }
        .nav-link:hover {
            background-color: #f1f5f9;
            color: #0f172a;
        }
        .nav-link.active {
            background-color: #1e293b;
            color: #ffffff;
        }
        /* ปุ่มเข้าสู่ระบบ: สีเขียวทึบตลอดเวลา และเข้มขึ้นเมื่อเอาเมาส์ไปชี้ */
        .btn-green-solid {
            background-color: #10b981;
            color: #ffffff;
            padding: 0.5rem 1.4rem;
            font-size: 14px;
            font-weight: 600;
            border-radius: 9999px;
            transition: all 0.2s ease;
            display: inline-block;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .btn-green-solid:hover {
            background-color: #059669; /* สีเขียวเข้มขึ้นเมื่อชี้ */
        }
    </style>
</head>
<body class="font-sans text-primary-text bg-base-bg antialiased">
    <header class="w-full bg-card-bg border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <a href="index.php" class="flex items-center gap-2.5 group">
                <img src="assets/logo.png" alt="Whodis" class="w-8 h-8 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform">
                <span class="text-[18px] font-bold text-[#012b65] dark:text-blue-400 tracking-tight">Whodis</span>
            </a>
            
            <nav class="hidden lg:flex items-center gap-1">
                <a href="index.php" class="nav-link <?= ($current_page == 'index.php' || $current_page == '') ? 'active' : 'text-muted-text' ?>">เช็กก่อนโอน</a>
                <a href="checker.php" class="nav-link <?= ($current_page == 'checker.php') ? 'active' : 'text-muted-text' ?>">Scam Checker</a>
                <a href="report.php" class="nav-link <?= ($current_page == 'report.php') ? 'active' : 'text-muted-text' ?>">แจ้งเบาะแส</a>
                <a href="stats.php" class="nav-link <?= ($current_page == 'stats.php') ? 'active' : 'text-muted-text' ?>">สถิติ Scam</a>
                <a href="knowledge.php" class="nav-link <?= ($current_page == 'knowledge.php') ? 'active' : 'text-muted-text' ?>">รู้จักการโกง</a>
                <a href="emergency.php" class="nav-link <?= ($current_page == 'emergency.php') ? 'active' : 'text-muted-text' ?>">แนวทางเมื่อถูกฉ้อโกง</a>
                <?php if (isset($_SESSION['role']) && strtolower($_SESSION['role']) === 'admin'): ?>
                    <a href="admin_reports.php" class="nav-link <?= ($current_page == 'admin_reports.php') ? 'active' : 'text-muted-text' ?>">⚙️ หลังบ้าน</a>
                <?php endif; ?>
            </nav>

            <div class="flex items-center gap-2 sm:gap-3">
                <button type="button" onclick="toggleTheme()" class="theme-toggle-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer shadow-2xs group border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="สลับโหมดมืด / สว่าง (Dark / Light Mode)" aria-label="Toggle Dark Mode">
                    <span class="theme-icon-moon material-symbols-outlined text-[20px] sm:text-[22px] hidden">dark_mode</span>
                    <span class="theme-icon-sun material-symbols-outlined text-[20px] sm:text-[22px] text-amber-500">light_mode</span>
                </button>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <span class="text-[13px] font-medium hidden md:inline">สวัสดี, <?= htmlspecialchars($_SESSION['username'], ENT_QUOTES, 'UTF-8') ?></span>
                    <a href="logout.php" class="text-muted-text hover:text-danger flex items-center" title="ออกจากระบบ"><span class="material-symbols-outlined text-[20px]">logout</span></a>
                <?php elseif ($current_page !== 'login.php'): ?>
                    <!-- ปุ่มเข้าสู่ระบบ: สีเขียวทึบตลอดเวลา และเข้มขึ้นเมื่อชี้ -->
                    <a href="login.php" class="btn-green-solid">
                        เข้าสู่ระบบ
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </header>
    <script>
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem('whodis_theme', isDark ? 'dark' : 'light'); } catch(e){}
        updateThemeIcons(isDark);
    }
    function updateThemeIcons(isDark) {
        const moon = document.querySelector('.theme-icon-moon');
        const sun = document.querySelector('.theme-icon-sun');
        if (moon && sun) {
            if (isDark) { moon.classList.remove('hidden'); sun.classList.add('hidden'); }
            else { moon.classList.add('hidden'); sun.classList.remove('hidden'); }
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        updateThemeIcons(document.documentElement.classList.contains('dark'));
    });
    </script>