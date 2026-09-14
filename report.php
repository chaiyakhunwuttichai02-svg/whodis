<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... โค้ดเดิมของคุณ ...
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// บังคับล็อกอิน: ถ้ายังไม่เข้าสู่ระบบ ให้เด้งไปหน้า login.php
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php';

$successMessage = '';
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_SESSION['user_id']; 
    $scamType = trim($_POST['scam_type'] ?? '');
    $scammerName = trim($_POST['scammer_name'] ?? '');
    $bankAccount = trim($_POST['bank_account'] ?? '');
    $bankName = trim($_POST['bank_name'] ?? '');
    $contactChannel = trim($_POST['contact_channel'] ?? '');
    $incidentDate = trim($_POST['incident_date'] ?? '');
    $claimAmount = trim($_POST['claim_amount'] ?? 0);
    $incidentDetails = trim($_POST['incident_details'] ?? '');
    
    $evidenceFile = null;

    if (isset($_FILES['evidence_file']) && $_FILES['evidence_file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['evidence_file']['tmp_name'];
        $fileName = $_FILES['evidence_file']['name'];
        $fileSize = $_FILES['evidence_file']['size'];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $fileTmpPath);
        finfo_close($finfo);

        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (in_array($mimeType, $allowedMimeTypes) && $fileSize <= 5242880) {
            $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
            $newFileName = 'slip_' . uniqid() . '.' . $fileExtension;
            $uploadFileDir = 'uploads/';
            if (!is_dir($uploadFileDir)) { mkdir($uploadFileDir, 0777, true); }
            $destFilePath = $uploadFileDir . $newFileName;

            if (move_uploaded_file($fileTmpPath, $destFilePath)) {
                $evidenceFile = $newFileName;
            } else {
                $errorMessage = 'เกิดข้อผิดพลาดในการบันทึกไฟล์หลักฐาน';
            }
        } else {
            $errorMessage = 'อนุญาตเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) ไม่เกิน 5MB';
        }
    }

    if ($errorMessage === '') {
        try {
            $stmt = $pdo->prepare('INSERT INTO reports (user_id, scammer_name, bank_account, bank_name, incident_date, claim_amount, incident_details, evidence_file, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$userId, $scammerName, $bankAccount, $bankName, $incidentDate, $claimAmount, "[$scamType] $incidentDetails", $evidenceFile, 'UNDER INVESTIGATION']);
            $successMessage = 'บันทึกรายงานเบาะแสของคุณเรียบร้อยแล้ว ข้อมูลจะถูกนำไปตรวจสอบต่อไป';
        } catch (PDOException $e) {
            $errorMessage = 'เกิดข้อผิดพลาดในระบบฐานข้อมูล: ' . $e->getMessage();
        }
    }
}

function e(string $value): string { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); }

include 'header.php'; 
?>

<main class="w-full pt-10 pb-20">
    <div class="max-w-[800px] mx-auto px-4">
        
        <div class="text-center mb-8">
            <h1 class="text-[32px] md:text-[36px] font-bold text-primary-text mb-2">แจ้งมิจฉาชีพ</h1>
            <p class="text-muted-text text-[15px]">รายงานเพื่อเตือนคนอื่น ทุกรายงานผ่านการกลั่นกรองก่อนเผยแพร่</p>
        </div>

        <?php if ($successMessage !== ''): ?>
            <div class="mb-6 p-5 bg-[#ecfdf5] border border-[#10b981] text-[#059669] rounded-2xl flex items-start gap-3 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">check_circle</span>
                <div class="text-[15px] font-medium leading-relaxed pt-0.5"><?= e($successMessage) ?></div>
            </div>
        <?php endif; ?>

        <?php if ($errorMessage !== ''): ?>
            <div class="mb-6 p-5 bg-[#fef2f2] border border-[#ef4444] text-[#dc2626] rounded-2xl flex items-start gap-3 shadow-sm">
                <span class="material-symbols-outlined text-[24px]">error</span>
                <div class="text-[15px] font-medium leading-relaxed pt-0.5"><?= e($errorMessage) ?></div>
            </div>
        <?php endif; ?>

        <!-- Progress Bar -->
        <div class="flex items-center justify-between mb-8 relative">
            <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            <div id="progress-line" class="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-text transition-all duration-300 -z-10" style="width: 0%;"></div>
            
            <div class="step-indicator flex flex-col items-center gap-2" data-step="1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-primary-text text-white border-[3px] border-white transition-colors duration-300">1</div>
                <span class="text-[12px] font-medium text-primary-text">ประเภทการโกง</span>
            </div>
            <div class="step-indicator flex flex-col items-center gap-2 opacity-50" data-step="2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-gray-200 text-gray-500 border-[3px] border-white transition-colors duration-300">2</div>
                <span class="text-[12px] font-medium text-gray-500">ข้อมูลผู้ติดต่อ</span>
            </div>
            <div class="step-indicator flex flex-col items-center gap-2 opacity-50" data-step="3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-gray-200 text-gray-500 border-[3px] border-white transition-colors duration-300">3</div>
                <span class="text-[12px] font-medium text-gray-500">รายละเอียด</span>
            </div>
            <div class="step-indicator flex flex-col items-center gap-2 opacity-50" data-step="4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-gray-200 text-gray-500 border-[3px] border-white transition-colors duration-300">4</div>
                <span class="text-[12px] font-medium text-gray-500">ยืนยัน</span>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
            <form id="reportForm" action="report.php" method="POST" enctype="multipart/form-data">
                
                <!-- Step 1: ประเภทการโกง พร้อมอิโมจิ -->
                <div id="step-1" class="form-step block">
                    <h2 class="text-[18px] font-bold text-primary-text mb-4">เลือกประเภทการโกง</h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <?php 
                        $scamTypes = [
                            'Investment Scam' => '📈', 
                            'Online Shopping Scam' => '🛍️', 
                            'Loan Scam' => '💸', 
                            'Romance Scam' => '💔', 
                            'Job Scam' => '💼', 
                            'Phishing' => '🎣', 
                            'Fake Bank/Website' => '🏦', 
                            'Crypto Scam' => '💰', 
                            'Call Center Scam' => '📞'
                        ];
                        
                        $i = 0;
                        foreach($scamTypes as $type => $emoji): 
                            $checked = ($i === 0) ? 'checked' : '';
                        ?>
                        <label class="cursor-pointer h-full">
                            <input type="radio" name="scam_type" value="<?= $type ?>" class="peer hidden" <?= $checked ?>>
                            <div class="h-full px-2 py-5 rounded-2xl border border-gray-200 transition-all peer-checked:bg-primary-text peer-checked:border-primary-text hover:bg-gray-50 flex flex-col items-center justify-center gap-2">
                                <span class="text-[28px] md:text-[32px] leading-none mb-1"><?= $emoji ?></span>
                                <span class="text-[13px] font-semibold text-muted-text peer-checked:text-white text-center leading-tight"><?= $type ?></span>
                            </div>
                        </label>
                        <?php 
                        $i++;
                        endforeach; 
                        ?>
                    </div>
                </div>

                <!-- Step 2: ข้อมูลผู้ติดต่อ -->
                <div id="step-2" class="form-step hidden space-y-5">
                    <h2 class="text-[18px] font-bold text-primary-text mb-4">ข้อมูลผู้ติดต่อ / ผู้รับเงิน</h2>
                    <div>
                        <label class="block text-[13px] font-semibold text-primary-text mb-1.5">ช่องทางที่ติดต่อ</label>
                        <input type="text" name="contact_channel" class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="LINE, Facebook, SMS, โทรศัพท์...">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">เบอร์โทร</label>
                            <input type="text" name="scammer_phone" class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="08x-xxx-xxxx">
                        </div>
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">เลขบัญชี/พร้อมเพย์ <span class="text-danger">*</span></label>
                            <input type="text" name="bank_account" required class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="XXX-X-XXXXX-X">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">ชื่อผู้รับเงิน <span class="text-danger">*</span></label>
                            <input type="text" name="scammer_name" required class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="นาย XXXXX">
                        </div>
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">ธนาคาร <span class="text-danger">*</span></label>
                            <select name="bank_name" required class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text bg-white">
                                <option value="">เลือกธนาคาร...</option>
                                <option value="กสิกรไทย">กสิกรไทย</option>
                                <option value="ไทยพาณิชย์">ไทยพาณิชย์</option>
                                <option value="กรุงไทย">กรุงไทย</option>
                                <option value="กรุงเทพ">กรุงเทพ</option>
                                <option value="พร้อมเพย์">พร้อมเพย์</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Step 3: รายละเอียดเหตุการณ์ -->
                <div id="step-3" class="form-step hidden space-y-5">
                    <h2 class="text-[18px] font-bold text-primary-text mb-4">รายละเอียดเหตุการณ์</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">จำนวนเงินที่เสียหาย (บาท) <span class="text-danger">*</span></label>
                            <input type="number" name="claim_amount" required min="1" class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="0">
                        </div>
                        <div>
                            <label class="block text-[13px] font-semibold text-primary-text mb-1.5">วันที่เกิดเหตุ <span class="text-danger">*</span></label>
                            <input type="date" name="incident_date" required class="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[13px] font-semibold text-primary-text mb-1.5">รายละเอียดเหตุการณ์ <span class="text-danger">*</span></label>
                        <textarea name="incident_details" required rows="4" minlength="10" class="w-full p-4 border border-gray-200 rounded-xl text-[14px] focus:border-primary-text focus:ring-1 focus:ring-primary-text" placeholder="เล่าเหตุการณ์ที่เกิดขึ้น เช่น ถูกชวนลงทุน, ถูกขอโอนเงิน... (อย่างน้อย 10 ตัวอักษร)"></textarea>
                    </div>
                    <div>
                        <label class="block text-[13px] font-semibold text-primary-text mb-1.5">แนบหลักฐาน (Screenshot/สลิป)</label>
                        <div class="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center hover:border-primary-text transition-colors">
                            <input type="file" name="evidence_file" accept="image/jpeg, image/png, image/webp" class="mx-auto block text-[13px] text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-gray-200 file:text-primary-text hover:file:bg-gray-300 cursor-pointer">
                        </div>
                        <p class="text-[12px] text-success mt-2 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">info</span> มีหลักฐานแนบ (รายงานที่มีหลักฐานจะมีน้ำหนักมากกว่า)</p>
                    </div>
                </div>

                <!-- Step 4: ยืนยัน -->
                <div id="step-4" class="form-step hidden space-y-5 text-center">
                    <span class="material-symbols-outlined text-[64px] text-primary-text mb-2">policy</span>
                    <h2 class="text-[20px] font-bold text-primary-text">ยืนยันการส่งข้อมูล</h2>
                    <p class="text-[14px] text-muted-text max-w-md mx-auto">ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดเป็นความจริง การจงใจให้ข้อมูลเท็จเพื่อใส่ร้ายผู้อื่นอาจมีความผิดตามกฎหมาย และยินยอมให้ระบบนำข้อมูลไปประมวลผลเพื่อเตือนภัยสาธารณะ</p>
                    
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6 text-left max-w-md mx-auto text-[13px] text-muted-text space-y-2">
                        <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-success">lock</span> ข้อมูลส่วนตัวของคุณจะถูกปกปิด</div>
                        <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-success">verified</span> ข้อมูลมิจฉาชีพจะถูกตรวจสอบโดย AI ก่อน</div>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                    <button type="button" id="prevBtn" class="hidden h-[48px] px-6 bg-gray-100 text-muted-text font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-[18px]">chevron_left</span> ย้อนกลับ
                    </button>
                    <div id="spacer" class="flex-1"></div> 
                    
                    <button type="button" id="nextBtn" class="h-[48px] px-8 bg-primary-text text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1">
                        ต่อไป <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                    
                    <button type="submit" id="submitBtn" class="hidden h-[48px] px-8 bg-danger text-white font-bold rounded-xl hover:bg-danger-hover transition-colors flex items-center gap-2">
                        ส่งข้อมูลรายงาน <span class="material-symbols-outlined text-[18px]">send</span>
                    </button>
                </div>
            </form>
        </div>

    </div>
</main>

<script>
    let currentStep = 1;
    const totalSteps = 4;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const spacer = document.getElementById('spacer');
    const progressLine = document.getElementById('progress-line');

    function updateUI() {
        for(let i=1; i<=totalSteps; i++) {
            document.getElementById('step-'+i).classList.add('hidden');
            const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
            const circle = indicator.querySelector('div');
            const text = indicator.querySelector('span');
            
            if(i <= currentStep) {
                indicator.classList.remove('opacity-50');
                circle.classList.replace('bg-gray-200', 'bg-primary-text');
                circle.classList.replace('text-gray-500', 'text-white');
                text.classList.replace('text-gray-500', 'text-primary-text');
            } else {
                indicator.classList.add('opacity-50');
                circle.classList.replace('bg-primary-text', 'bg-gray-200');
                circle.classList.replace('text-white', 'text-gray-500');
                text.classList.replace('text-primary-text', 'text-gray-500');
            }
        }
        document.getElementById('step-'+currentStep).classList.remove('hidden');
        
        progressLine.style.width = ((currentStep - 1) / (totalSteps - 1)) * 100 + '%';

        if(currentStep === 1) {
            prevBtn.classList.add('hidden');
            spacer.classList.remove('hidden');
        } else {
            prevBtn.classList.remove('hidden');
            spacer.classList.add('hidden');
        }

        if(currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    nextBtn.addEventListener('click', () => {
        if(currentStep < totalSteps) {
            currentStep++;
            updateUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        if(currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    updateUI();
</script>

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