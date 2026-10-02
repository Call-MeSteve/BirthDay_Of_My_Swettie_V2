// ===================================================
// gift.js — Part 4: Mini-Games Logic (Upgraded for Task 3)
// ===================================================

// ===== BACKGROUND STAR CANVAS =====
const giftMusic = document.getElementById('giftMusic');
function initGiftMusic() {
    if (window.parent && window.parent !== window && window.parent.isMasterAudioPlaying) {
        return;
    }
    if (giftMusic && giftMusic.paused) {
        const savedTime = parseFloat(sessionStorage.getItem('bgMusicTime') || '0');
        if (savedTime > 0) giftMusic.currentTime = savedTime;
        giftMusic.volume = 0.8;
        giftMusic.play().catch(() => {});
        setInterval(() => {
            if (!giftMusic.paused) {
                sessionStorage.setItem('bgMusicTime', giftMusic.currentTime);
            }
        }, 300);
    }
}
window.addEventListener('load', initGiftMusic);
document.addEventListener('click', initGiftMusic, { once: true });

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx    = bgCanvas.getContext('2d');

function resizeBg() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

const stars = Array.from({ length: 50 }, () => ({
    x:  Math.random() * window.innerWidth,
    y:  Math.random() * window.innerHeight,
    r:  Math.random() * 1.5 + 0.3,
    a:  Math.random(),
    da: (Math.random() - 0.5) * 0.006
}));

function drawBg() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    stars.forEach(s => {
        s.a += s.da;
        if (s.a > 0.85 || s.a < 0.05) s.da *= -1;
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255,255,255,${s.a})`;
        bgCtx.fill();
    });
    requestAnimationFrame(drawBg);
}
drawBg();

// ===================================================
// STATE & TRACKING (Require all 3 gifts to be opened)
// ===================================================
const gameCompleted = [false, false, false]; // 0=Quiz, 1=Heart Jigsaw, 2=Code
const openedGifts   = new Set();             // Must contain 0, 1, 2, 3 to trigger final letter

// ===== PASTEL / ROSE-GOLD CELEBRATION CONFETTI =====
function triggerPastelConfetti(opts = {}) {
    if (typeof confetti !== 'function') return;
    confetti({
        particleCount: opts.particleCount || 45,
        spread: opts.spread || 65,
        origin: opts.origin || { y: 0.65 },
        colors: ['#D4AF37', '#FFB6C1', '#FFFFFF', '#E0BFB8', '#F6D5D5', '#FAD02C'],
        ticks: 200,
        gravity: 0.8,
        scalar: 0.95,
        disableForReducedMotion: true
    });
}

function updateGiftReminder() {
    const hint = document.getElementById('giftReminderHint');
    if (!hint) return;

    if (gameCompleted.every(Boolean)) {
        if (openedGifts.size < 4) {
            hint.innerHTML = `<i data-lucide="sparkles" class="hint-icon"></i> <span>Pé đã vượt qua cả 3 vòng (Đã mở ${openedGifts.size}/4 quà). Hãy mở nốt phần quà đặc biệt để xem thư bí mật nhé!</span>`;
            hint.classList.add('visible');
            hint.classList.add('pulse');
        } else {
            hint.innerHTML = `<i data-lucide="mail-heart" class="hint-icon"></i> <span>Pé đã mở hết tất cả quà rồi! Mời em đón đọc bức thư tình yêu nhé!</span>`;
            hint.classList.add('visible');
            hint.classList.remove('pulse');
        }
        if (window.lucide) lucide.createIcons();
    }
}

function unlockSpecialGift() {
    const specialBox = document.getElementById('giftBoxSpecial');
    if (specialBox && specialBox.classList.contains('locked')) {
        specialBox.classList.remove('locked');
        specialBox.classList.add('unlocked');
        const iconWrap = specialBox.querySelector('.box-icon');
        if (iconWrap) iconWrap.innerHTML = '<i data-lucide="gift" class="lucide-icon"></i>';
        specialBox.title = 'Bấm để mở PHẦN QUÀ ĐẶC BIỆT!';
        specialBox.onclick = () => openGiftModal(3);

        const hint = document.getElementById('giftReminderHint');
        if (hint) {
            hint.innerHTML = `<i data-lucide="crown" class="hint-icon"></i> <span>Pé Thúi đã xuất sắc hoàn thành cả 3 thử thách! PHẦN QUÀ ĐẶC BIỆT ĐÃ MỞ KHÓA!</span>`;
            hint.classList.add('visible', 'pulse');
        }
        if (window.lucide) lucide.createIcons();
        triggerPastelConfetti({ particleCount: 65, spread: 85 });
    }
}

function markGameComplete(index) {
    if (gameCompleted[index]) return;
    gameCompleted[index] = true;

    // Mark card as completed
    const cards = document.querySelectorAll('.game-card');
    if (cards[index]) cards[index].classList.add('completed');

    // Unlock corresponding gift box
    const box = document.getElementById(`giftBox${index}`);
    if (box) {
        box.classList.remove('locked');
        box.classList.add('unlocked');
        const iconWrap = box.querySelector('.box-icon');
        if (iconWrap) iconWrap.innerHTML = '<i data-lucide="gift" class="lucide-icon"></i>';
        box.title = 'Bấm để mở quà!';
        box.addEventListener('click', () => openGiftModal(index));
        if (window.lucide) lucide.createIcons();
    }

    // When all 3 games are completed -> Unlock Special Gift (gift02)
    if (gameCompleted.every(Boolean)) {
        unlockSpecialGift();
    }

    updateGiftReminder();

    // If all games completed AND all 4 gifts already opened
    if (gameCompleted.every(Boolean) && openedGifts.size === 4) {
        setTimeout(showFinalCelebration, 800);
    }
}

// ===================================================
// GAME B — QUIZ
// ===================================================
const QUIZ_QUESTIONS = [
    {
        type:     "text",
        question: "Em sinh ngày tháng năm nào?",
        hint:     "Gợi ý: ngày / tháng / năm",
        answers:  ["07/10/2004","7/10/2004","07/10","7/10","07102004","7102004"]
    },
    {
        type:     "text",
        question: "Anh thường hay gọi em là gì?",
        hint:     "Gợi ý: cái tên yêu thương nhất...",
        answers:  ["pé thúi","pe thui","linh thúi","linh thui","pé","pe"]
    },
    {
        type:     "text",
        question: "Năm nay em bước sang tuổi mấy?",
        hint:     "Gợi ý: 2026 - 2004 = ?",
        answers:  ["22","hai mươi hai","twenty two","tuổi 22"]
    },
    {
        type:     "choice",
        question: "Ngày đầu tiên 2 đứa mình gặp nhau là ở đâu?",
        hint:     "Gợi ý: Chọn một đáp án đúng nhất nhé.",
        options:  [
            { key: "A", text: "Ở trường" },
            { key: "B", text: "Sân Bay" },
            { key: "C", text: "Ở trong lớp" }
        ],
        correctKey: "B"
    }
];

let currentQuestion = 0;
let isQuizTransitioning = false;

function initQuiz() {
    showQuestion(0);

    const btn = document.getElementById('quizBtn');
    const input = document.getElementById('quizInput');
    if (btn) btn.addEventListener('click', checkQuiz);
    if (input) input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isQuizTransitioning) checkQuiz();
        }
    });
}

function showQuestion(idx) {
    isQuizTransitioning = false; // Mở khóa sẵn sàng cho câu hỏi mới

    const q = QUIZ_QUESTIONS[idx];
    document.getElementById('questionNum').textContent  = `Câu ${idx + 1} / ${QUIZ_QUESTIONS.length}`;
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('questionHint').textContent = q.hint;
    document.getElementById('quizError').textContent   = '';
    document.getElementById('quizProgress').style.width = `${(idx / QUIZ_QUESTIONS.length) * 100}%`;

    const feedbackEl = document.getElementById('quizFeedbackSticker');
    if (feedbackEl) feedbackEl.classList.add('hidden');

    const inputGroup = document.getElementById('quizInputGroup');
    const optionsContainer = document.getElementById('quizOptions');
    const input = document.getElementById('quizInput');
    const btn = document.getElementById('quizBtn');

    if (q.type === 'choice') {
        if (inputGroup) inputGroup.classList.add('hidden');
        if (optionsContainer) {
            optionsContainer.classList.remove('hidden');
            optionsContainer.innerHTML = '';
            q.options.forEach(opt => {
                const optBtn = document.createElement('button');
                optBtn.className = 'quiz-option-btn';
                optBtn.innerHTML = `<span class="opt-key">${opt.key}</span> <span>${opt.text}</span>`;
                optBtn.onclick = () => handleChoiceSelect(opt.key, optBtn, q);
                optionsContainer.appendChild(optBtn);
            });
        }
    } else {
        if (optionsContainer) optionsContainer.classList.add('hidden');
        if (inputGroup) inputGroup.classList.remove('hidden');
        if (input) {
            input.disabled = false;
            input.value = '';
            input.focus();
        }
        if (btn) {
            btn.disabled = false;
        }
    }
}

function handleChoiceSelect(selectedKey, btnEl, q) {
    if (isQuizTransitioning) return; // Chặn nhấp đúp khi đang chuyển câu

    const errorEl = document.getElementById('quizError');
    const feedbackEl = document.getElementById('quizFeedbackSticker');

    if (selectedKey === q.correctKey) {
        isQuizTransitioning = true; // Khóa ngay lập tức
        document.querySelectorAll('.quiz-option-btn').forEach(b => b.disabled = true);

        btnEl.classList.add('correct');
        errorEl.textContent = 'Chính xác! Sân Bay là nơi định mệnh đưa ta gặp nhau.';
        errorEl.style.color = '#4ade80';

        if (feedbackEl) {
            feedbackEl.innerHTML = `<img src="./images/exactly.jpg" alt="Shin Like" /><span class="feedback-text">Chuẩn luôn pé iu! 👍✨</span>`;
            feedbackEl.classList.remove('hidden');
        }

        triggerPastelConfetti({ particleCount: 30, spread: 50 });
        document.getElementById('quizProgress').style.width =
            `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%`;

        setTimeout(() => {
            currentQuestion++;
            errorEl.style.color = '#ff6b6b';
            if (currentQuestion < QUIZ_QUESTIONS.length) {
                showQuestion(currentQuestion);
            } else {
                // All 4 questions done!
                document.getElementById('quizProgress').style.width = '100%';
                document.getElementById('quizArea').classList.add('hidden');
                document.getElementById('quizSuccess').classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
                triggerPastelConfetti({ particleCount: 55, spread: 70 });
                markGameComplete(0);
            }
        }, 1100);
    } else {
        btnEl.classList.remove('shake');
        void btnEl.offsetWidth;
        btnEl.classList.add('shake', 'wrong');
        errorEl.textContent = 'Chưa chính xác rồi pé ơi... Thử lại đáp án khác nhé!';
        errorEl.style.color = '#ff6b6b';

        if (feedbackEl) {
            feedbackEl.innerHTML = `<img src="./images/sock.png" alt="Shin Shock" /><span class="feedback-text">Ái chà... chưa đúng rồi pé ơi! 😅</span>`;
            feedbackEl.classList.remove('hidden');
        }

        setTimeout(() => {
            btnEl.classList.remove('shake', 'wrong');
        }, 600);
    }
}

function checkQuiz() {
    if (isQuizTransitioning) return; // Chặn spam Enter hoặc bấm liên tục khi đang chuyển câu

    const input = document.getElementById('quizInput');
    const btn = document.getElementById('quizBtn');
    const val = input ? input.value.trim().toLowerCase() : '';
    const q   = QUIZ_QUESTIONS[currentQuestion];
    const feedbackEl = document.getElementById('quizFeedbackSticker');

    if (!val) return;

    const correct = q.answers.map(a => a.toLowerCase()).includes(val);

    if (correct) {
        // KHÓA NGAY LẬP TỨC: Disable input và button để chặn triệt để Enter/Click tiếp theo
        isQuizTransitioning = true;
        if (input) input.disabled = true;
        if (btn) btn.disabled = true;

        document.getElementById('quizError').textContent = '✅ Chính xác! Tuyệt vời!';
        document.getElementById('quizError').style.color = '#4ade80';

        if (feedbackEl) {
            feedbackEl.innerHTML = `<img src="./images/exactly.jpg" alt="Shin Like" /><span class="feedback-text">Chuẩn luôn pé iu! 👍✨</span>`;
            feedbackEl.classList.remove('hidden');
        }

        document.getElementById('quizProgress').style.width =
            `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%`;

        setTimeout(() => {
            currentQuestion++;
            document.getElementById('quizError').style.color = '#ff6b6b';
            if (currentQuestion < QUIZ_QUESTIONS.length) {
                showQuestion(currentQuestion);
            } else {
                // All questions done!
                document.getElementById('quizProgress').style.width = '100%';
                document.getElementById('quizArea').classList.add('hidden');
                document.getElementById('quizSuccess').classList.remove('hidden');
                markGameComplete(0);
            }
        }, 1100);
    } else {
        if (input) {
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }
        document.getElementById('quizError').textContent = 'Chưa chính xác... Em thử lại nhé!';

        if (feedbackEl) {
            feedbackEl.innerHTML = `<img src="./images/sock.png" alt="Shin Shock" /><span class="feedback-text">Ái chà... thử lại nghen pé! 😅</span>`;
            feedbackEl.classList.remove('hidden');
        }

        setTimeout(() => {
            if (input) input.classList.remove('shake');
        }, 500);
    }
}

// ===================================================
// GAME C — HEART JIGSAW PUZZLE (Thử thách xếp hình trái tim)
// ===================================================
const JIGSAW_PIECES = [
    { id: 0, title: "Mảnh 1", label: "Thùy Trái", iconName: "heart-pulse", color: "linear-gradient(135deg, #ff5e7e, #c2185b)" },
    { id: 1, title: "Mảnh 2", label: "Thùy Phải", iconName: "git-branch",  color: "linear-gradient(135deg, #ff758c, #d81b60)" },
    { id: 2, title: "Mảnh 3", label: "Cánh Trái", iconName: "feather",     color: "linear-gradient(135deg, #ec407a, #9c154a)" },
    { id: 3, title: "Mảnh 4", label: "Cánh Phải", iconName: "navigation",  color: "linear-gradient(135deg, #f59e0b, #c2185b)" }
];

const placedPieces = [false, false, false, false];
let selectedPieceId = null;

function initPuzzle() {
    const tray = document.getElementById('jigsawTray');
    if (!tray) return;
    tray.innerHTML = '';

    // Shuffle pieces in the tray
    const shuffled = [...JIGSAW_PIECES].sort(() => Math.random() - 0.5);

    shuffled.forEach(item => {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'jigsaw-piece';
        pieceEl.id = `piece-btn-${item.id}`;
        pieceEl.draggable = true;
        pieceEl.dataset.pieceId = item.id;
        pieceEl.innerHTML = `
            <div class="piece-visual shape-${item.id}" style="background: ${item.color};">
                <span class="piece-icon"><i data-lucide="${item.iconName}"></i></span>
                <span class="piece-num">${item.id + 1}</span>
            </div>
            <span class="piece-text">${item.label}</span>
        `;

        // Click / Tap to select
        pieceEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (placedPieces[item.id]) return;
            selectJigsawPiece(item.id);
        });

        // Drag events
        pieceEl.addEventListener('dragstart', (e) => {
            if (placedPieces[item.id]) {
                e.preventDefault();
                return;
            }
            selectJigsawPiece(item.id);
            e.dataTransfer.setData('text/plain', item.id.toString());
        });

        tray.appendChild(pieceEl);
    });

    // Setup the 4 slots on the board
    for (let slotId = 0; slotId < 4; slotId++) {
        const slotEl = document.getElementById(`slot-${slotId}`);
        if (!slotEl) continue;

        // Click on slot to place currently selected piece
        slotEl.addEventListener('click', () => {
            if (placedPieces[slotId]) return;
            if (selectedPieceId !== null) {
                tryPlacePiece(selectedPieceId, slotId);
            } else {
                showJigsawHint("Hãy chọn một mảnh ghép ở khay bên dưới trước nhé.");
            }
        });

        // Hover effects on SVG part
        slotEl.addEventListener('mouseenter', () => {
            if (!placedPieces[slotId]) {
                const svgPart = document.getElementById(`heartPart${slotId}`);
                if (svgPart) svgPart.classList.add('hovered');
            }
        });

        slotEl.addEventListener('mouseleave', () => {
            const svgPart = document.getElementById(`heartPart${slotId}`);
            if (svgPart) svgPart.classList.remove('hovered');
        });

        // Drag & Drop handlers
        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!placedPieces[slotId]) {
                slotEl.classList.add('drag-hover');
                const svgPart = document.getElementById(`heartPart${slotId}`);
                if (svgPart) svgPart.classList.add('hovered');
            }
        });

        slotEl.addEventListener('dragleave', () => {
            slotEl.classList.remove('drag-hover');
            const svgPart = document.getElementById(`heartPart${slotId}`);
            if (svgPart) svgPart.classList.remove('hovered');
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            slotEl.classList.remove('drag-hover');
            const svgPart = document.getElementById(`heartPart${slotId}`);
            if (svgPart) svgPart.classList.remove('hovered');
            if (placedPieces[slotId]) return;
            const droppedPieceId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(droppedPieceId)) {
                tryPlacePiece(droppedPieceId, slotId);
            }
        });
    }

    if (window.lucide) {
        lucide.createIcons();
    }

    updateJigsawProgress();
}

function selectJigsawPiece(id) {
    if (placedPieces[id]) return;
    selectedPieceId = id;

    // Highlight selected piece
    document.querySelectorAll('.jigsaw-piece').forEach(p => {
        p.classList.remove('selected');
    });
    const selectedEl = document.getElementById(`piece-btn-${id}`);
    if (selectedEl) selectedEl.classList.add('selected');

    showJigsawHint(`Đang chọn "${JIGSAW_PIECES[id].label}" — Hãy chạm vào vị trí khớp trên trái tim.`);
}

function tryPlacePiece(pieceId, slotId) {
    const slotEl = document.getElementById(`slot-${slotId}`);
    const pieceEl = document.getElementById(`piece-btn-${pieceId}`);

    if (pieceId === slotId) {
        // Correct piece! Snap into slot
        placedPieces[slotId] = true;
        slotEl.classList.add('placed');
        slotEl.style.background = 'transparent';
        const svgPart = document.getElementById(`heartPart${slotId}`);
        if (svgPart) {
            svgPart.classList.remove('hovered');
            svgPart.classList.add('placed');
        }
        slotEl.innerHTML = `
            <span class="placed-icon"><i data-lucide="${JIGSAW_PIECES[pieceId].iconName}"></i></span>
        `;
        if (window.lucide) lucide.createIcons();

        if (pieceEl) {
            pieceEl.classList.remove('selected');
            pieceEl.classList.add('used');
        }

        selectedPieceId = null;
        showJigsawHint(`Đã ghép hoàn hảo mảnh "${JIGSAW_PIECES[slotId].label}".`);
        updateJigsawProgress();

        // Check if all 4 pieces placed
        if (placedPieces.every(Boolean)) {
            finishHeartPuzzle();
        }
    } else {
        // Wrong piece position
        if (slotEl) {
            slotEl.classList.remove('shake');
            void slotEl.offsetWidth;
            slotEl.classList.add('shake');
            setTimeout(() => slotEl.classList.remove('shake'), 500);
        }
        showJigsawHint(`Mảnh này chưa khớp với ${JIGSAW_PIECES[slotId].label}. Em thử lại nhé.`);
    }
}

function showJigsawHint(msg) {
    const guide = document.getElementById('jigsawGuide');
    if (guide) guide.textContent = msg;
}

function updateJigsawProgress() {
    const count = placedPieces.filter(Boolean).length;
    const countEl = document.getElementById('heartCount');
    const barEl = document.getElementById('pieceProgress');

    if (countEl) countEl.textContent = `Đã ghép: ${count}/4 mảnh`;
    if (barEl) barEl.style.width = `${(count / 4) * 100}%`;
}

function finishHeartPuzzle() {
    const board = document.getElementById('heartJigsawBoard');
    const glow  = document.getElementById('heartCompletedGlow');
    if (board) board.classList.add('completed');
    if (glow)  glow.classList.add('active');

    showJigsawHint("Tuyệt vời! Trái tim đã được ghép nối hoàn chỉnh!");
    triggerPastelConfetti({ particleCount: 50, spread: 70 });

    setTimeout(() => {
        const area = document.getElementById('puzzleArea');
        const success = document.getElementById('puzzleSuccess');
        if (area) area.classList.add('hidden');
        if (success) success.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
        markGameComplete(1);
    }, 1600);
}

// ===================================================
// GAME D — SECRET CODE
// ===================================================
const CIPHER_ANSWERS = ['love', 'LOVE', 'Love'];

let isCodeSubmitting = false;

function initCode() {
    const btn = document.getElementById('codeBtn');
    const input = document.getElementById('codeInput');
    if (btn) btn.addEventListener('click', checkCode);
    if (input) input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isCodeSubmitting) checkCode();
        }
    });
}

function toggleCipherHint() {
    const table = document.getElementById('cipherTable');
    if (table) table.classList.toggle('visible');
}

function checkCode() {
    if (isCodeSubmitting) return;

    const input = document.getElementById('codeInput');
    const btn = document.getElementById('codeBtn');
    const val = input ? input.value.trim() : '';
    if (!val) return;

    const correct = CIPHER_ANSWERS.map(a => a.toLowerCase()).includes(val.toLowerCase());

    if (correct) {
        isCodeSubmitting = true;
        if (input) input.disabled = true;
        if (btn) btn.disabled = true;

        document.getElementById('codeError').textContent = 'Chính xác! "LOVE" — Bí mật ngọt ngào dành cho em!';
        document.getElementById('codeError').style.color = '#4ade80';
        triggerPastelConfetti({ particleCount: 55, spread: 75 });
        setTimeout(() => {
            document.getElementById('codeArea').classList.add('hidden');
            document.getElementById('codeSuccess').classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
            markGameComplete(2);
        }, 1000);
    } else {
        if (input) {
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }
        document.getElementById('codeError').textContent = 'Chưa đúng... em xem lại bảng giải mã nhé!';
        document.getElementById('codeError').style.color = '#ff6b6b';
        setTimeout(() => {
            if (input) input.classList.remove('shake');
        }, 500);
    }
}

// ===================================================
// GIFT DATA & MODAL (Configured per user specifications)
// ===================================================
const GIFT_DATA = [
    {
        badge:   "Phần Quà 1",
        title:   "Sẽ giúp cứu cánh pé Thúi vào những lúc cạn pin nè",
        imgSrc:  "./images/gift01.png",
        message: "Sẽ giúp cứu cánh pé Thúi vào những lúc cạn pin nè"
    },
    {
        badge:   "Phần Quà 2",
        title:   "Nhớ đừng làm mất nữa nghen",
        imgSrc:  "./images/gift04.png",
        message: "Nhớ đừng làm mất nữa nghen"
    },
    {
        badge:   "Phần Quà 3",
        title:   "Tặng pé Thúi chiếc túi đi chơi nè",
        imgSrc:  "./images/gift03.png",
        message: "Tặng pé Thúi chiếc túi đi chơi nè"
    },
    {
        badge:   "Phần Quà Đặc Biệt",
        title:   "Điều gì tốt hơn một chiếc túi? Đó là hai chiếc túi nè",
        imgSrc:  "./images/gift02.png",
        message: "Điều gì tốt hơn một chiếc túi? Đó là hai chiếc túi nè"
    }
];

let autoLetterTimer = null;

function openGiftModal(index) {
    const data = GIFT_DATA[index];
    const modal = document.getElementById('giftModal');

    // Track that user opened this gift!
    openedGifts.add(index);
    const box = index === 3 ? document.getElementById('giftBoxSpecial') : document.getElementById(`giftBox${index}`);
    if (box) {
        box.classList.remove('unlocked');
        box.classList.add('opened');

        // HIỂN THỊ ẢNH PHẦN QUÀ TRỰC TIẾP TRÊN Ô HỘP QUÀ
        const iconWrap = box.querySelector('.box-icon');
        if (iconWrap && data.imgSrc) {
            iconWrap.innerHTML = `
                <div class="box-gift-thumb">
                    <img src="${data.imgSrc}" alt="${data.title}" />
                    <span class="thumb-check"><i data-lucide="check"></i></span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }

    const badgeEl = document.getElementById('modalBadge');
    if (badgeEl) badgeEl.textContent = data.badge;

    document.getElementById('modalTitle').textContent = data.title;
    
    const msgEl = document.getElementById('modalMsg');
    const imgWrap  = document.getElementById('modalImgWrap');
    const placeholder = document.getElementById('giftPlaceholder');

    if (data.imgSrc) {
        placeholder.classList.add('hidden');
        let img = imgWrap.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            imgWrap.insertBefore(img, placeholder);
        }
        img.src = data.imgSrc;
        img.alt = data.title;
        img.classList.remove('hidden');
    } else {
        placeholder.classList.remove('hidden');
        const existingImg = imgWrap.querySelector('img');
        if (existingImg) existingImg.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    updateGiftReminder();

    // CHỈ GIỮ LẠI 1 DÒNG DUY NHẤT Ở TRÊN (modalTitle), KHÔNG LẶP LẠI DÒNG DƯỚI (modalMsg)
    // KIỂM TRA ĐIỀU KIỆN: ĐÃ MỞ TẤT CẢ 4 PHẦN QUÀ -> HIỆN BANNER VÀ TỰ ĐỘNG XUẤT HIỆN BỨC THƯ TÌNH YÊU
    if (openedGifts.size === 4) {
        msgEl.innerHTML = `
            <div class="all-gifts-unlocked-banner">
                <i data-lucide="sparkles"></i>
                <span>Em đã mở đủ cả 4 phần quà rồi! Bức thư tình yêu sẽ tự động xuất hiện ngay sau đây...</span>
            </div>
        `;
        msgEl.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();

        triggerPastelConfetti({ particleCount: 70, spread: 80 });

        if (autoLetterTimer) clearTimeout(autoLetterTimer);
        autoLetterTimer = setTimeout(() => {
            closeModal();
            showFinalCelebration();
        }, 2800);
    } else {
        msgEl.innerHTML = '';
        msgEl.classList.add('hidden');
    }
}

function closeModal() {
    if (autoLetterTimer) {
        clearTimeout(autoLetterTimer);
        autoLetterTimer = null;
    }
    document.getElementById('giftModal').classList.add('hidden');
    updateGiftReminder();

    // Nếu đã mở đủ 4/4 quà -> Bức thư tình yêu tự động xuất hiện ngay
    if (openedGifts.size === 4) {
        setTimeout(showFinalCelebration, 400);
    }
}

// ===================================================
// FINAL CELEBRATION (Bức Thư Tình Sinh Nhật)
// ===================================================
function showFinalCelebration() {
    const overlay = document.getElementById('finalOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();

    // Trigger multi-stage luxury pastel confetti
    if (typeof confetti === 'function') {
        const colors = ['#D4AF37', '#FFB6C1', '#FFFFFF', '#E0BFB8', '#F6D5D5', '#FAD02C'];
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.7 },
            colors: colors
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.7 },
            colors: colors
        });
        setTimeout(() => {
            confetti({
                particleCount: 70,
                spread: 100,
                origin: { y: 0.6 },
                colors: colors
            });
        }, 400);
    }

    const canvas = document.getElementById('finalCanvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#D4AF37', '#FFB6C1', '#FFFFFF', '#E0BFB8', '#ffd60a'];
    let parts = [];

    class FinalParticle {
        constructor(edge) {
            if (edge === 0) { this.x = Math.random() * canvas.width; this.y = -10; }
            else            { this.x = Math.random() * canvas.width; this.y = canvas.height + 10; }
            const angle  = edge === 0
                ? (Math.random() * Math.PI * 0.5 + Math.PI * 0.25)
                : -(Math.random() * Math.PI * 0.5 + Math.PI * 0.25);
            const speed  = Math.random() * 4 + 2;
            this.vx   = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
            this.vy   = Math.sin(angle) * speed;
            this.maxLife = 180 + Math.random() * 80;
            this.life    = this.maxLife;
            this.size    = Math.random() * 5 + 2.5;
            this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.rot     = Math.random() * Math.PI * 2;
            this.rotS    = (Math.random() - 0.5) * 0.05;
            this.gravity = 0.05;
        }
        update() {
            this.vx *= 0.99;
            this.vy += this.gravity;
            this.x  += this.vx;
            this.y  += this.vy;
            this.rot += this.rotS;
            this.life--;
        }
        draw() {
            if (this.life <= 0) return;
            const alpha = Math.min(1, this.life / this.maxLife * 1.5);
            ctx.globalAlpha = alpha;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            // Draw minimalist elegant 4-point star sparkle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const s = this.size;
            ctx.moveTo(0, -s * 2);
            ctx.quadraticCurveTo(0, 0, s * 2, 0);
            ctx.quadraticCurveTo(0, 0, 0, s * 2);
            ctx.quadraticCurveTo(0, 0, -s * 2, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s * 2);
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    let spawnTimer = 0;
    function spawnWave() {
        for (let i = 0; i < 8; i++) {
            parts.push(new FinalParticle(Math.random() < 0.5 ? 0 : 1));
        }
    }

    function animateFinal() {
        if (overlay.classList.contains('hidden')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spawnTimer++;
        if (spawnTimer % 16 === 0) spawnWave();
        parts = parts.filter(p => p.life > 0);
        parts.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateFinal);
    }

    spawnWave();
    animateFinal();

    // BẮT ĐẦU HIỆU ỨNG CHẠY CHỮ LÃNG MẠN
    startLetterTypewriter();
}

// ===================================================
// ROMANTIC TYPEWRITER EFFECT CHO BỨC THƯ TÌNH
// ===================================================
const LETTER_PARAGRAPHS = [
    {
        id: 'letterSalutation',
        fullText: 'Pé Thúi yêu thương nhất của anh,',
        speed: 35,
        pauseAfter: 350
    },
    {
        id: 'letterP1',
        fullText: 'Chúc mừng sinh nhật pé iu tròn 22 tuổi! Chúc em tuổi mới luôn tràn ngập nụ cười hạnh phúc, mãi xinh đẹp rạng ngời, mau ăn chóng lớn và gặt hái thật nhiều thành công nha! 🎂🌸',
        speed: 26,
        pauseAfter: 450
    },
    {
        id: 'letterP2',
        fullText: 'Cảm ơn em đã luôn ở bên, mang lại cho anh những ngày tháng ngọt ngào và ấm áp nhất. Anh mong rằng chúng mình sẽ cùng nhau đón thật nhiều sinh nhật nữa nhé! 💕✨',
        speed: 26,
        pauseAfter: 500
    },
    {
        id: 'closingPhrase',
        fullText: 'Yêu em nhiều lắm,',
        speed: 40,
        pauseAfter: 350
    },
    {
        id: 'signatureName',
        fullText: 'Anh yêu của em! ❤️',
        speed: 45,
        pauseAfter: 600
    }
];

let letterTypewriterActive = false;
let letterTypewriterTimeouts = [];

function clearLetterTypewriter() {
    letterTypewriterTimeouts.forEach(t => clearTimeout(t));
    letterTypewriterTimeouts = [];
    letterTypewriterActive = false;
    document.querySelectorAll('.letter-cursor').forEach(c => c.remove());
}

function startLetterTypewriter() {
    clearLetterTypewriter();
    letterTypewriterActive = true;

    const skipBtn = document.getElementById('letterSkipBtn');
    if (skipBtn) skipBtn.style.display = 'inline-flex';

    // Xóa rỗng các dòng để bắt đầu viết từng con chữ
    LETTER_PARAGRAPHS.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.innerHTML = '';
    });

    const deliveryBox = document.getElementById('deliveryNoticeBox');
    if (deliveryBox) {
        deliveryBox.classList.remove('visible');
    }

    let cursor = document.createElement('span');
    cursor.className = 'letter-cursor';

    function typeSegment(segmentIndex) {
        if (!letterTypewriterActive) return;

        if (segmentIndex >= LETTER_PARAGRAPHS.length) {
            letterTypewriterActive = false;
            if (cursor && cursor.parentNode) cursor.remove();
            if (skipBtn) skipBtn.style.display = 'none';
            triggerPastelConfetti({ particleCount: 65, spread: 85 });
            return;
        }

        const seg = LETTER_PARAGRAPHS[segmentIndex];
        const el = document.getElementById(seg.id);
        if (!el) {
            typeSegment(segmentIndex + 1);
            return;
        }

        el.appendChild(cursor);

        let charIndex = 0;
        const text = seg.fullText;

        function typeNextChar() {
            if (!letterTypewriterActive) return;

            if (charIndex < text.length) {
                const char = text.charAt(charIndex);
                el.insertBefore(document.createTextNode(char), cursor);
                charIndex++;

                // Nhịp thở tự nhiên: ngắt nghỉ khi gặp dấu câu
                let delay = seg.speed;
                if (char === '.' || char === '!' || char === '?') {
                    delay += 250;
                } else if (char === ',' || char === '—') {
                    delay += 140;
                }

                const timer = setTimeout(typeNextChar, delay);
                letterTypewriterTimeouts.push(timer);
            } else {
                // Sau khi viết xong đoạn 2 -> hiện khung thông báo quà đặc biệt
                if (seg.id === 'letterP2' && deliveryBox) {
                    deliveryBox.classList.add('visible');
                }

                const timer = setTimeout(() => {
                    typeSegment(segmentIndex + 1);
                }, seg.pauseAfter);
                letterTypewriterTimeouts.push(timer);
            }
        }

        typeNextChar();
    }

    // Bắt đầu viết sau 400ms kể từ khi phong thư mở ra
    const initTimer = setTimeout(() => {
        typeSegment(0);
    }, 400);
    letterTypewriterTimeouts.push(initTimer);
}

function skipLetterTypewriter() {
    clearLetterTypewriter();

    // Điền toàn bộ nội dung bức thư ngay lập tức
    LETTER_PARAGRAPHS.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.innerHTML = item.fullText;
    });

    const deliveryBox = document.getElementById('deliveryNoticeBox');
    if (deliveryBox) {
        deliveryBox.classList.add('visible');
    }

    const skipBtn = document.getElementById('letterSkipBtn');
    if (skipBtn) skipBtn.style.display = 'none';

    triggerPastelConfetti({ particleCount: 50, spread: 70 });
}

function closeLetter() {
    clearLetterTypewriter();
    const overlay = document.getElementById('finalOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// ===================================================
// INIT ALL GAMES
// ===================================================
window.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    initPuzzle();
    initCode();

    if (window.lucide) {
        lucide.createIcons();
    }

    // Friendly click feedback when clicking locked boxes
    document.querySelectorAll('.gift-box').forEach(box => {
        box.addEventListener('click', () => {
            if (box.classList.contains('locked')) {
                box.classList.remove('shake');
                void box.offsetWidth;
                box.classList.add('shake');
                setTimeout(() => box.classList.remove('shake'), 500);
                const hint = document.getElementById('giftReminderHint');
                if (hint) {
                    if (box.id === 'giftBoxSpecial') {
                        hint.innerHTML = '<i data-lucide="crown" class="hint-icon"></i> <span>Pé hãy vượt qua cả 3 thử thách bên dưới để mở khóa phần quà đặc biệt này nhé!</span>';
                    } else {
                        const gameNum = parseInt(box.dataset.game) + 1;
                        hint.innerHTML = `<i data-lucide="lock" class="hint-icon"></i> <span>Pé hãy vượt qua Thử thách ${gameNum} bên dưới để mở hộp quà này nhé!</span>`;
                    }
                    hint.classList.add('visible', 'pulse');
                    if (window.lucide) lucide.createIcons();
                }
            }
        });
    });
});

// ===================================================
// FLOATING INTERACTIVE MASCOT (MÈO MEME / SHIN CUTE)
// ===================================================
const MASCOT_QUOTES = [
    "Chúc Pé Thúi sinh nhật 22 tuổi luôn xinh đẹp, hạnh phúc nha! 🎂🌸",
    "Em là cô gái đáng yêu và ngọt ngào nhất vũ trụ này! ✨💖",
    "Cố lên pé iu, mở hết 4 phần quà để xem bức thư bí mật nhé! 🎁",
    "Anh yêu Pé Thúi nhiều hơn cả những vì sao trên trời! 🌟💕",
    "Hôm nay công chúa là nhất, muốn gì anh cũng chiều! 👑🥰",
    "Mèo con chúc chị Linh mau ăn chóng lớn, luôn cười tươi nha! 🎈",
    "Moah moah! Chúc mừng sinh nhật pé iu của anh! 💋❤️"
];
let currentMascotQuoteIdx = 0;

function triggerMascotSpeech() {
    const bubble = document.getElementById('mascotBubble');
    const avatar = document.querySelector('.mascot-avatar-btn');
    if (!bubble) return;

    currentMascotQuoteIdx = (currentMascotQuoteIdx + 1) % MASCOT_QUOTES.length;
    bubble.innerHTML = `<span>${MASCOT_QUOTES[currentMascotQuoteIdx]}</span>`;

    // Hiệu ứng nảy avatar
    if (avatar) {
        avatar.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => {
            avatar.style.transform = '';
        }, 300);
    }

    triggerPastelConfetti({ particleCount: 25, spread: 45, origin: { x: 0.9, y: 0.85 } });
}
