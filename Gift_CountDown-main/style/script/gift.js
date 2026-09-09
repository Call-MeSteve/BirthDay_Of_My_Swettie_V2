// ===================================================
// gift.js — Part 4: Mini-Games Logic
// ===================================================

// ===== BACKGROUND STAR CANVAS =====
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
// STATE
// ===================================================
const gameCompleted = [false, false, false]; // game 0=Quiz, 1=Heart, 2=Code

function markGameComplete(index) {
    if (gameCompleted[index]) return;
    gameCompleted[index] = true;

    // Mark card as completed
    document.querySelectorAll('.game-card')[index].classList.add('completed');

    // Unlock gift box
    const box = document.getElementById(`giftBox${index}`);
    box.classList.remove('locked');
    box.classList.add('unlocked');
    box.querySelector('.box-icon').textContent = '🎁';
    box.addEventListener('click', () => openGiftModal(index));

    // Check if all done
    if (gameCompleted.every(Boolean)) {
        setTimeout(showFinalCelebration, 800);
    }
}

// ===================================================
// GAME B — QUIZ
// ===================================================

// ===== CUSTOMIZE QUESTIONS HERE =====
const QUIZ_QUESTIONS = [
    {
        question: "Em sinh ngày tháng năm nào? 🎂",
        hint:     "Gợi ý: ngày / tháng / năm",
        answers:  ["07/10/2004","7/10/2004","07/10","7/10","07102004","7102004"]
    },
    {
        question: "Anh thường hay gọi em là gì? 💕",
        hint:     "Gợi ý: cái tên yêu thương nhất...",
        answers:  ["pé thúi","pe thui","linh thúi","linh thui","pé","pe"]
    },
    {
        question: "Năm nay em bước sang tuổi mấy? 🎈",
        hint:     "Gợi ý: 2026 - 2004 = ?",
        answers:  ["22","hai mươi hai","twenty two","tuổi 22"]
    }
];

let currentQuestion = 0;

function initQuiz() {
    showQuestion(0);

    document.getElementById('quizBtn').addEventListener('click', checkQuiz);
    document.getElementById('quizInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') checkQuiz();
    });
}

function showQuestion(idx) {
    const q = QUIZ_QUESTIONS[idx];
    document.getElementById('questionNum').textContent  = `Câu ${idx + 1} / ${QUIZ_QUESTIONS.length}`;
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('questionHint').textContent = q.hint;
    document.getElementById('quizInput').value = '';
    document.getElementById('quizError').textContent   = '';
    document.getElementById('quizProgress').style.width = `${(idx / QUIZ_QUESTIONS.length) * 100}%`;
    document.getElementById('quizInput').focus();
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
// GAME C — HEART PUZZLE
// ===================================================
const PIECES = ['💝','💖','💗','💓','💞','💕','❤️','🌸'];
let collected = 0;

function initPuzzle() {
    const container = document.getElementById('piecesContainer');
    container.innerHTML = '';
    collected = 0;

    PIECES.forEach((emoji, i) => {
        const piece = document.createElement('div');
        piece.className = 'heart-piece';
        piece.textContent = emoji;
        piece.title = 'Click để thu thập!';
        piece.style.animationDelay = `${i * 0.25}s`;
        piece.addEventListener('click', () => collectPiece(piece, i));
        container.appendChild(piece);
    });

    updateHeartDisplay();
}

function collectPiece(el, idx) {
    if (el.classList.contains('collected')) return;

    el.classList.add('collected');
    collected++;
    updateHeartDisplay();

    if (collected >= PIECES.length) {
        // All pieces collected!
        setTimeout(() => {
            document.getElementById('puzzleArea').classList.add('hidden');
            document.getElementById('puzzleSuccess').classList.remove('hidden');
            markGameComplete(1);
        }, 800);
    }
}

function updateHeartDisplay() {
    const pct  = collected / PIECES.length;
    document.getElementById('heartCount').textContent = `${collected}/${PIECES.length}`;
    document.getElementById('pieceProgress').style.width = `${pct * 100}%`;

    const fill = document.getElementById('heartFill');
    if (collected > 0) {
        fill.style.opacity  = Math.min(1, pct * 1.5).toString();
        fill.style.transform = `scale(${0.2 + pct * 0.8})`;
    }
    if (collected === PIECES.length) {
        fill.classList.add('filled');
    }
}

// ===================================================
// GAME D — SECRET CODE
// ===================================================

// Cipher: 🍋=L, 🌺=O, 🎵=V, ❤️=E → "LOVE"
const CIPHER_ANSWERS = ['love', 'LOVE', 'Love'];

function initCode() {
    document.getElementById('codeBtn').addEventListener('click', checkCode);
    document.getElementById('codeInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') checkCode();
    });
}

function toggleCipherHint() {
    const table  = document.getElementById('cipherTable');
    table.classList.toggle('visible');
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
// GIFT MODAL
// ===================================================

// ===== CUSTOMIZE: Add gift image URLs and messages here =====
const GIFT_DATA = [
    {
        title:   "🎁 Quà 1 — Từ Quiz Tình Yêu",
        imgSrc:  "",   // TODO: thêm đường dẫn ảnh quà 1 vào đây, ví dụ: "./images/gift1.jpg"
        message: "Pé trả lời giỏi quá! Đây là quà xứng đáng cho em nha! 💕"
    },
    {
        title:   "🎁 Quà 2 — Từ Trái Tim Hoàn Chỉnh",
        imgSrc:  "",   // TODO: thêm đường dẫn ảnh quà 2
        message: "Trái tim của anh dành hết cho pé rồi đó! 💝"
    },
    {
        title:   "🎁 Quà 3 — Từ Mật Thư Bí Ẩn",
        imgSrc:  "",   // TODO: thêm đường dẫn ảnh quà 3
        message: "Em đã giải mã được bí mật lớn nhất của anh — đó chính là TÌNH YÊU! ❤️"
    }
];

function openGiftModal(index) {
    const data = GIFT_DATA[index];
    const modal = document.getElementById('giftModal');

    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalMsg').textContent   = data.message;

    const imgWrap  = document.getElementById('modalImgWrap');
    const placeholder = document.getElementById('giftPlaceholder');

    if (data.imgSrc) {
        // Show actual gift image
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
        // Show placeholder
        placeholder.classList.remove('hidden');
        const existingImg = imgWrap.querySelector('img');
        if (existingImg) existingImg.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('giftModal').classList.add('hidden');
}

// ===================================================
// FINAL CELEBRATION
// ===================================================
function showFinalCelebration() {
    const overlay = document.getElementById('finalOverlay');
    overlay.classList.remove('hidden');

    const canvas = document.getElementById('finalCanvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#ff6b9d','#ffd60a','#ff4d6d','#fff','#c9184a','#ffef80','#ff9de2'];
    const EMOJIS = ['❤️','🎂','⭐','🎉','🌸','💕','🎈','💝'];
    let parts = [];

    class FinalParticle {
        constructor(edge) {
            // Spawn from random edges
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
            this.isEmoji = Math.random() < 0.3;
            this.emoji   = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.rot     = Math.random() * Math.PI * 2;
            this.rotS    = (Math.random() - 0.5) * 0.1;
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

    // Spawn particles continuously
    let spawnTimer = 0;
    function spawnWave() {
        for (let i = 0; i < 15; i++) {
            parts.push(new FinalParticle(Math.random() < 0.5 ? 0 : 1));
        }
    }

    function animateFinal() {
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

// ===================================================
// INIT ALL GAMES
// ===================================================
window.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    initPuzzle();
    initCode();

    // Play background music on interaction
    const playMusic = () => {
        const music = document.getElementById('giftMusic');
        if (music && music.paused) {
            music.volume = 0.5;
            music.play().catch(e => console.log('Music autoplay blocked:', e));
        }
    };
    document.addEventListener('click', playMusic, { once: true });
    document.addEventListener('touchstart', playMusic, { once: true });
});
