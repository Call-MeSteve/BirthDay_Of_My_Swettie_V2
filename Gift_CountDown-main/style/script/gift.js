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
const openedGifts   = new Set();             // Must contain 0, 1, 2 to trigger final letter

function updateGiftReminder() {
    const hint = document.getElementById('giftReminderHint');
    if (!hint) return;

    if (gameCompleted.every(Boolean)) {
        if (openedGifts.size < 3) {
            hint.textContent = `✨ Pé đã hoàn thành thử thách! Đã mở ${openedGifts.size}/3 hộp quà. Hãy mở nốt để xem bức thư bí mật nhé! 🎁`;
            hint.classList.add('visible');
            hint.classList.add('pulse');
        } else {
            hint.textContent = `🎉 Pé đã mở hết quà rồi! Mời em đón đọc bức thư tình yêu nhé! 💕`;
            hint.classList.add('visible');
            hint.classList.remove('pulse');
        }
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
        box.querySelector('.box-icon').textContent = '🎁';
        box.title = 'Bấm để mở quà!';
        box.addEventListener('click', () => openGiftModal(index));
    }

    updateGiftReminder();

    // If all games completed AND all 3 already opened
    if (gameCompleted.every(Boolean) && openedGifts.size === 3) {
        setTimeout(showFinalCelebration, 800);
    }
}

// ===================================================
// GAME B — QUIZ
// ===================================================
const QUIZ_QUESTIONS = [
    {
        type:     "text",
        question: "Em sinh ngày tháng năm nào? 🎂",
        hint:     "Gợi ý: ngày / tháng / năm",
        answers:  ["07/10/2004","7/10/2004","07/10","7/10","07102004","7102004"]
    },
    {
        type:     "text",
        question: "Anh thường hay gọi em là gì? 💕",
        hint:     "Gợi ý: cái tên yêu thương nhất...",
        answers:  ["pé thúi","pe thui","linh thúi","linh thui","pé","pe"]
    },
    {
        type:     "text",
        question: "Năm nay em bước sang tuổi mấy? 🎈",
        hint:     "Gợi ý: 2026 - 2004 = ?",
        answers:  ["22","hai mươi hai","twenty two","tuổi 22"]
    },
    {
        type:     "choice",
        question: "Ngày đầu tiên 2 đứa mình gặp nhau là ở đâu? ✈️",
        hint:     "Gợi ý: Chọn một đáp án đúng nhất nhé! 😉",
        options:  [
            { key: "A", text: "Ở trường" },
            { key: "B", text: "Sân Bay" },
            { key: "C", text: "Ở trong lớp" }
        ],
        correctKey: "B"
    }
];

let currentQuestion = 0;

function initQuiz() {
    showQuestion(0);

    const btn = document.getElementById('quizBtn');
    const input = document.getElementById('quizInput');
    if (btn) btn.addEventListener('click', checkQuiz);
    if (input) input.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkQuiz();
    });
}

function showQuestion(idx) {
    const q = QUIZ_QUESTIONS[idx];
    document.getElementById('questionNum').textContent  = `Câu ${idx + 1} / ${QUIZ_QUESTIONS.length}`;
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('questionHint').textContent = q.hint;
    document.getElementById('quizError').textContent   = '';
    document.getElementById('quizProgress').style.width = `${(idx / QUIZ_QUESTIONS.length) * 100}%`;

    const inputGroup = document.getElementById('quizInputGroup');
    const optionsContainer = document.getElementById('quizOptions');

    if (q.type === 'choice') {
        if (inputGroup) inputGroup.classList.add('hidden');
        if (optionsContainer) {
            optionsContainer.classList.remove('hidden');
            optionsContainer.innerHTML = '';
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.innerHTML = `<span class="opt-key">${opt.key}</span> <span>${opt.text}</span>`;
                btn.onclick = () => handleChoiceSelect(opt.key, btn, q);
                optionsContainer.appendChild(btn);
            });
        }
    } else {
        if (optionsContainer) optionsContainer.classList.add('hidden');
        if (inputGroup) inputGroup.classList.remove('hidden');
        const input = document.getElementById('quizInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function handleChoiceSelect(selectedKey, btnEl, q) {
    const errorEl = document.getElementById('quizError');
    if (selectedKey === q.correctKey) {
        btnEl.classList.add('correct');
        errorEl.textContent = '✅ Chính xác rồi! Sân Bay là nơi định mệnh đưa ta gặp nhau! 💕✈️';
        errorEl.style.color = '#4ade80';
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
                markGameComplete(0);
            }
        }, 900);
    } else {
        btnEl.classList.remove('shake');
        void btnEl.offsetWidth;
        btnEl.classList.add('shake', 'wrong');
        errorEl.textContent = '💔 Chưa chính xác rồi pé ơi... Thử lại đáp án khác nhé!';
        errorEl.style.color = '#ff6b6b';
        setTimeout(() => {
            btnEl.classList.remove('shake', 'wrong');
        }, 600);
    }
}

function checkQuiz() {
    const val = document.getElementById('quizInput').value.trim().toLowerCase();
    const q   = QUIZ_QUESTIONS[currentQuestion];

    if (!val) return;

    const correct = q.answers.map(a => a.toLowerCase()).includes(val);

    if (correct) {
        document.getElementById('quizError').textContent = '✅ Chính xác! Tuyệt vời!';
        document.getElementById('quizError').style.color = '#4ade80';
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
        }, 900);
    } else {
        const input = document.getElementById('quizInput');
        input.classList.remove('shake');
        void input.offsetWidth;
        input.classList.add('shake');
        document.getElementById('quizError').textContent = '💔 Sai rồi... thử lại nhé em!';
        setTimeout(() => input.classList.remove('shake'), 500);
    }
}

// ===================================================
// GAME C — HEART JIGSAW PUZZLE (Thử thách xếp hình trái tim)
// ===================================================
const JIGSAW_PIECES = [
    { id: 0, title: "Mảnh 1", label: "Thùy Trái", icon: "🌸", color: "linear-gradient(135deg, #ff758f, #ff4d6d)" },
    { id: 1, title: "Mảnh 2", label: "Thùy Phải", icon: "✨", color: "linear-gradient(135deg, #ffd166, #ff758f)" },
    { id: 2, title: "Mảnh 3", label: "Cánh Trái", icon: "💖", color: "linear-gradient(135deg, #c9184a, #ff4d6d)" },
    { id: 3, title: "Mảnh 4", label: "Đáy Tim",   icon: "💝", color: "linear-gradient(135deg, #ff4d6d, #ffd60a)" }
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
            <div class="piece-visual" style="background: ${item.color};">
                <span class="piece-icon">${item.icon}</span>
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
                showJigsawHint("👆 Hãy chọn một mảnh ghép ở khay bên dưới trước nhé!");
            }
        });

        // Drag & Drop handlers
        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!placedPieces[slotId]) slotEl.classList.add('drag-hover');
        });

        slotEl.addEventListener('dragleave', () => {
            slotEl.classList.remove('drag-hover');
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            slotEl.classList.remove('drag-hover');
            if (placedPieces[slotId]) return;
            const droppedPieceId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(droppedPieceId)) {
                tryPlacePiece(droppedPieceId, slotId);
            }
        });
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

    showJigsawHint(`Đang chọn "${JIGSAW_PIECES[id].label}" 👉 Hãy chạm vào ô số ${id + 1} trên trái tim!`);
}

function tryPlacePiece(pieceId, slotId) {
    const slotEl = document.getElementById(`slot-${slotId}`);
    const pieceEl = document.getElementById(`piece-btn-${pieceId}`);

    if (pieceId === slotId) {
        // Correct piece! Snap into slot
        placedPieces[slotId] = true;
        slotEl.classList.add('placed');
        slotEl.style.background = JIGSAW_PIECES[pieceId].color;
        slotEl.innerHTML = `
            <span class="placed-icon">${JIGSAW_PIECES[pieceId].icon}</span>
            <span class="placed-label">${JIGSAW_PIECES[pieceId].label}</span>
        `;

        if (pieceEl) {
            pieceEl.classList.remove('selected');
            pieceEl.classList.add('used');
        }

        selectedPieceId = null;
        showJigsawHint(`✅ Ghép đúng mảnh ${slotId + 1} rồi! Giỏi quá pé ơi! 💖`);
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
        showJigsawHint(`💔 Ô số ${slotId + 1} không hợp với mảnh này... Thử ô số ${pieceId + 1} xem nhé!`);
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

    showJigsawHint("💖 Tuyệt vời! Trái tim đã được ghép nối hoàn chỉnh!");

    setTimeout(() => {
        const area = document.getElementById('puzzleArea');
        const success = document.getElementById('puzzleSuccess');
        if (area) area.classList.add('hidden');
        if (success) success.classList.remove('hidden');
        markGameComplete(1);
    }, 1200);
}

// ===================================================
// GAME D — SECRET CODE
// ===================================================
const CIPHER_ANSWERS = ['love', 'LOVE', 'Love'];

function initCode() {
    const btn = document.getElementById('codeBtn');
    const input = document.getElementById('codeInput');
    if (btn) btn.addEventListener('click', checkCode);
    if (input) input.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkCode();
    });
}

function toggleCipherHint() {
    const table = document.getElementById('cipherTable');
    if (table) table.classList.toggle('visible');
}

function checkCode() {
    const val = document.getElementById('codeInput').value.trim();
    if (!val) return;

    const correct = CIPHER_ANSWERS.map(a => a.toLowerCase()).includes(val.toLowerCase());

    if (correct) {
        document.getElementById('codeError').textContent = '✅ Đúng rồi! "LOVE" — Anh yêu em! 💕';
        document.getElementById('codeError').style.color = '#4ade80';
        setTimeout(() => {
            document.getElementById('codeArea').classList.add('hidden');
            document.getElementById('codeSuccess').classList.remove('hidden');
            markGameComplete(2);
        }, 1000);
    } else {
        const input = document.getElementById('codeInput');
        input.classList.remove('shake');
        void input.offsetWidth;
        input.classList.add('shake');
        document.getElementById('codeError').textContent = '🔒 Chưa đúng... em xem lại bảng giải mã nhé!';
        document.getElementById('codeError').style.color = '#ff6b6b';
        setTimeout(() => input.classList.remove('shake'), 500);
    }
}

// ===================================================
// GIFT DATA & MODAL (Configured per user specifications)
// ===================================================
const GIFT_DATA = [
    {
        badge:   "🎁 PHẦN QUÀ 1",
        title:   "Sẽ Giúp cứu cánh pé Thúi vào những lúc cạn pin nè 😉",
        imgSrc:  "./images/gift01.png",
        message: "Sẽ Giúp cứu cánh pé Thúi vào những lúc cạn pin nè 😉"
    },
    {
        badge:   "🎁 PHẦN QUÀ 2",
        title:   "Tặng pé Thúi chiếc Túi đi chơi nè 💕",
        imgSrc:  "./images/gift02.png",
        message: "Tặng pé Thúi chiếc Túi đi chơi nè 💕"
    },
    {
        badge:   "🎁 PHẦN QUÀ 3",
        title:   "Điều gì tốt hơn 1 cái túi 🤔 Đó là 2 cái túi nè 😘",
        imgSrc:  "./images/gift03.png",
        message: "Điều gì tốt hơn 1 cái túi 🤔 Đó là 2 cái túi nè 😘"
    }
];

function openGiftModal(index) {
    const data = GIFT_DATA[index];
    const modal = document.getElementById('giftModal');

    // Track that user opened this gift!
    openedGifts.add(index);
    const box = document.getElementById(`giftBox${index}`);
    if (box) box.classList.add('viewed');

    const badgeEl = document.getElementById('modalBadge');
    if (badgeEl) badgeEl.textContent = data.badge;

    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalMsg').textContent   = data.message;

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
}

function closeModal() {
    document.getElementById('giftModal').classList.add('hidden');
    updateGiftReminder();

    // RULE: If all 3 games are completed AND player has opened all 3 gifts -> Show Final Celebration Letter!
    if (gameCompleted.every(Boolean) && openedGifts.size === 3) {
        setTimeout(showFinalCelebration, 600);
    }
}

// ===================================================
// FINAL CELEBRATION (Bức Thư Tình Sinh Nhật)
// ===================================================
function showFinalCelebration() {
    const overlay = document.getElementById('finalOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const canvas = document.getElementById('finalCanvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#ff6b9d','#ffd60a','#ff4d6d','#ffffff','#c9184a','#ffef80','#ff9de2'];
    const EMOJIS = ['❤️','🎂','⭐','🎉','🌸','💕','🎈','💝','💌'];
    let parts = [];

    class FinalParticle {
        constructor(edge) {
            if (edge === 0) { this.x = Math.random() * canvas.width; this.y = -10; }
            else            { this.x = Math.random() * canvas.width; this.y = canvas.height + 10; }
            const angle  = edge === 0
                ? (Math.random() * Math.PI * 0.5 + Math.PI * 0.25)
                : -(Math.random() * Math.PI * 0.5 + Math.PI * 0.25);
            const speed  = Math.random() * 5 + 2;
            this.vx   = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
            this.vy   = Math.sin(angle) * speed;
            this.maxLife = 160 + Math.random() * 100;
            this.life    = this.maxLife;
            this.size    = Math.random() * 6 + 3;
            this.isEmoji = Math.random() < 0.28;
            this.emoji   = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.rot     = Math.random() * Math.PI * 2;
            this.rotS    = (Math.random() - 0.5) * 0.08;
            this.gravity = 0.08;
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
            if (this.isEmoji) {
                ctx.font = `${this.size * 2.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size * 1.5, this.size, this.size * 3);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    let spawnTimer = 0;
    function spawnWave() {
        for (let i = 0; i < 12; i++) {
            parts.push(new FinalParticle(Math.random() < 0.5 ? 0 : 1));
        }
    }

    function animateFinal() {
        if (overlay.classList.contains('hidden')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spawnTimer++;
        if (spawnTimer % 12 === 0) spawnWave();
        parts = parts.filter(p => p.life > 0);
        parts.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateFinal);
    }

    spawnWave();
    animateFinal();
}

function closeLetter() {
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
});
