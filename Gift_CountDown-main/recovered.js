      /* OLD GROWING TREE COMMENTED OUT
      class GrowingTree {
    constructor() {
        // =================================================
        // CẤU HÌNH CÂY HOA TRÁI TIM
        // =================================================

        // Vị trí trung tâm
        this.x = flowerCanvas.width / 2;

        // Cây thấp hơn phiên bản cũ để không che phần tiêu đề
        this.targetH = flowerCanvas.height * 0.40;

        // Chiều cao hiện tại
        this.h = 0;

        // Tốc độ mọc
        this.speed = 1.4;

        // Trạng thái nở
        this.bloomed = false;
        this.bloomScale = 0;

        // =================================================
        // HIỆU ỨNG GIÓ
        // =================================================

        this.swayOffset = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.0012;
        this.maxSway = 7;

        this.currentSway = 0;
        // =================================================
        // NHÁNH CÂY
        // =================================================

        this.branches = [];

        /*
         * Tạo các nhánh theo bố cục cân đối
         * thay vì random hoàn toàn như phiên bản cũ.
         *
         * Mỗi nhánh sẽ có:
         * - vị trí trên thân
         * - hướng trái/phải
         * - chiều dài
         * - độ cong
         * - vị trí hoa
         */

        const branchData = [
            // Nhánh trái dưới
            {
                side: -1,
                hOffset: 0.25,
                length: 65,
                curve: -18,
                flowerCount: 1
            },

            // Nhánh phải dưới
            {
                side: 1,
                hOffset: 0.30,
                length: 70,
                curve: 18,
                flowerCount: 1
            },

            // Nhánh trái giữa
            {
                side: -1,
                hOffset: 0.42,
                length: 90,
                curve: -25,
                flowerCount: 2
            },

            // Nhánh phải giữa
            {
                side: 1,
                hOffset: 0.47,
                length: 95,
                curve: 25,
                flowerCount: 2
            },

            // Nhánh trái trên
            {
                side: -1,
                hOffset: 0.62,
                length: 85,
                curve: -20,
                flowerCount: 2
            },

            // Nhánh phải trên
            {
                side: 1,
                hOffset: 0.67,
                length: 90,
                curve: 20,
                flowerCount: 2
            },

            // Nhánh trái gần đỉnh
            {
                side: -1,
                hOffset: 0.78,
                length: 60,
                curve: -12,
                flowerCount: 1
            },

            // Nhánh phải gần đỉnh
            {
                side: 1,
                hOffset: 0.82,
                length: 65,
                curve: 12,
                flowerCount: 1
            }
        ];

        branchData.forEach((data, index) => {
            this.branches.push({
                ...data,

                // Tiến trình mọc của từng nhánh
                grown: 0,

                // Delay nhẹ giữa các nhánh
                delay: index * 0.08,

                // Mỗi nhánh có tốc độ khác nhau một chút
                growSpeed: 0.012 + Math.random() * 0.008,

                // Hoa trên nhánh
                flowers: []
            });
        });

        // =================================================
        // TẠO HOA CHO TÁN CÂY
        // =================================================

        this.canopyFlowers = [];

        /*
         * Tạo bố cục hoa hình trái tim.
         *
         * Công thức:
         * x = 16 sin³(t)
         * y = 13cos(t) - 5cos(2t)
         *      - 2cos(3t) - cos(4t)
         */

        const heartPoints = [
            // Trái tim phía trên
            { x: -0.95, y: -0.55, size: 0.75 },
            { x: -0.65, y: -0.82, size: 0.85 },
            { x: -0.30, y: -0.95, size: 0.90 },
            { x: 0.00,  y: -1.02, size: 1.00 },
            { x: 0.30,  y: -0.95, size: 0.90 },
            { x: 0.65,  y: -0.82, size: 0.85 },
            { x: 0.95,  y: -0.55, size: 0.75 },

            // Hai bên
            { x: -1.08, y: -0.25, size: 0.70 },
            { x: 1.08,  y: -0.25, size: 0.70 },

            { x: -1.15, y: 0.05, size: 0.65 },
            { x: 1.15,  y: 0.05, size: 0.65 },

            // Phần giữa
            { x: -0.90, y: 0.30, size: 0.72 },
            { x: -0.55, y: 0.40, size: 0.75 },
            { x: 0.00,  y: 0.48, size: 1.00 },
            { x: 0.55,  y: 0.40, size: 0.75 },
            { x: 0.90,  y: 0.30, size: 0.72 },

            // Đáy trái tim
            { x: -0.55, y: 0.68, size: 0.65 },
            { x: -0.25, y: 0.82, size: 0.70 },
            { x: 0.00,  y: 0.98, size: 0.90 },
            { x: 0.25,  y: 0.82, size: 0.70 },
            { x: 0.55,  y: 0.68, size: 0.65 }
        ];

        heartPoints.forEach((point, index) => {
            this.canopyFlowers.push({
                x: point.x,
                y: point.y,

                size: point.size,

                // Hoa xuất hiện lần lượt
                delay: index * 0.035,

                scale: 0,

                // Tốc độ nở
                bloomSpeed: 0.025 + Math.random() * 0.015,

                // Loại hoa:
                // 0 = hoa hồng
                // 1 = hoa tulip
                // 2 = hoa nhỏ
                type: index % 3
            });
        });

        // =================================================
        // HOA TRUNG TÂM
        // =================================================

        this.centerBloom = {
            scale: 0,
            bloomSpeed: 0.018
        };
    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(time) {

        // -------------------------------------------------
        // 1. CÂY MỌC TỪ DƯỚI LÊN
        // -------------------------------------------------

        if (this.h < this.targetH) {

            this.h += this.speed;

            if (this.h > this.targetH) {
                this.h = this.targetH;
            }

        } else {

            // -------------------------------------------------
            // 2. CÂY ĐÃ MỌC XONG
            // -------------------------------------------------

            this.bloomed = true;

            // Nở dần toàn bộ tán hoa
            if (this.bloomScale < 1) {

                this.bloomScale += 0.012;

                if (this.bloomScale > 1) {
                    this.bloomScale = 1;
                }
            }
        }


        // -------------------------------------------------
        // 3. HIỆU ỨNG CÂY ĐUNG ĐƯA
        // -------------------------------------------------

        this.currentSway =
            Math.sin(
                time * this.swaySpeed +
                this.swayOffset
            ) * this.maxSway;


        // -------------------------------------------------
        // 4. NHÁNH CÂY MỌC DẦN
        // -------------------------------------------------

        this.branches.forEach((branch, index) => {

            // Vị trí cần đạt tới của nhánh
            const growthPoint =
                this.targetH * branch.hOffset;

            // Khi thân cây đã mọc tới vị trí nhánh
            if (this.h >= growthPoint) {

                if (branch.grown < 1) {

                    branch.grown += branch.growSpeed;

                    if (branch.grown > 1) {
                        branch.grown = 1;
                    }
                }
            }
        });


        // -------------------------------------------------
        // 5. HOA TRÊN TÁN NỞ DẦN
        // -------------------------------------------------

        if (this.bloomed) {

            this.canopyFlowers.forEach(flower => {

                if (this.bloomScale > flower.delay) {

                    if (flower.scale < 1) {

                        flower.scale += flower.bloomSpeed;

                        if (flower.scale > 1) {
                            flower.scale = 1;
                        }
                    }
                }
            });


            // -------------------------------------------------
            // 6. HOA TRUNG TÂM NỞ SAU CÙNG
            // -------------------------------------------------

            if (this.bloomScale > 0.65) {

                if (this.centerBloom.scale < 1) {

                    this.centerBloom.scale +=
                        this.centerBloom.bloomSpeed;

                    if (this.centerBloom.scale > 1) {
                        this.centerBloom.scale = 1;
                    }
                }
            }
        }
    }


    // =====================================================
    // DRAW
    // =====================================================

    draw() {

        flowerCtx.save();

        // -------------------------------------------------
        // TỌA ĐỘ GỐC
        // -------------------------------------------------

        const baseX = this.x;
        const baseY = flowerCanvas.height;


        // -------------------------------------------------
        // 1. VẼ THÂN CÂY
        // -------------------------------------------------

        const headX =
            baseX + this.currentSway;

        const headY =
            baseY - this.h;

        const controlX =
            baseX +
            this.currentSway * 0.35;

        const controlY =
            baseY -
            this.h * 0.5;


        // Thân cây mảnh hơn
        flowerCtx.strokeStyle =
            'rgba(74, 70, 60, 0.65)';

        flowerCtx.lineWidth = 9;

        flowerCtx.lineCap = 'round';

        flowerCtx.lineJoin = 'round';


        flowerCtx.beginPath();

        flowerCtx.moveTo(
            baseX,
            baseY + 20
        );

        flowerCtx.quadraticCurveTo(
            controlX,
            controlY,
            headX,
            headY
        );

        flowerCtx.stroke();


        // -------------------------------------------------
        // 2. VẼ RỄ NHẸ Ở GỐC
        // -------------------------------------------------

        flowerCtx.strokeStyle =
            'rgba(74, 70, 60, 0.35)';

        flowerCtx.lineWidth = 3;

        for (let i = 0; i < 4; i++) {

            const direction =
                i % 2 === 0 ? -1 : 1;

            flowerCtx.beginPath();

            flowerCtx.moveTo(
                baseX,
                baseY
            );

            flowerCtx.quadraticCurveTo(
                baseX + direction * 12,
                baseY - 2,
                baseX + direction * (25 + i * 5),
                baseY + 4
            );

            flowerCtx.stroke();
        }


        // -------------------------------------------------
        // 3. VẼ CÁC NHÁNH
        // -------------------------------------------------

        this.branches.forEach(branch => {

            const branchStartY =
                baseY -
                this.targetH *
                branch.hOffset;

            // Chỉ vẽ khi thân cây đã mọc đến vị trí này
            if (this.h <
                this.targetH *
                branch.hOffset) {
                return;
            }


            // Tọa độ bắt đầu nhánh
            const startX =
                baseX +
                this.currentSway *
                branch.hOffset;


            // Chiều dài hiện tại
            const currentLength =
                branch.length *
                branch.grown;


            // Điểm cuối
            const endX =
                startX +
                branch.side *
                currentLength;


            const endY =
                branchStartY -
                currentLength *
                0.35;


            // -------------------------------------------------
            // VẼ NHÁNH CONG
            // -------------------------------------------------

            flowerCtx.strokeStyle =
                'rgba(74, 70, 60, 0.55)';

            flowerCtx.lineWidth =
                4.5;

            flowerCtx.lineCap =
                'round';


            flowerCtx.beginPath();

            flowerCtx.moveTo(
                startX,
                branchStartY
            );


            const curveX =
                startX +
                branch.side *
                branch.curve;


            const curveY =
                branchStartY -
                currentLength *
                0.25;


            flowerCtx.quadraticCurveTo(
                curveX,
                curveY,
                endX,
                endY
            );

            flowerCtx.stroke();


            // -------------------------------------------------
            // VẼ HOA CUỐI NHÁNH
            // -------------------------------------------------

            if (branch.grown > 0.85) {

                const flowerScale =
                    (branch.grown - 0.85) /
                    0.15;

                flowerCtx.save();

                flowerCtx.translate(
                    endX,
                    endY
                );

                flowerCtx.scale(
                    flowerScale,
                    flowerScale
                );

                this.drawSmallFlower(
                    branch.side > 0
                        ? '#ff8fab'
                        : '#ff6b9d',
                    0.7
                );

                flowerCtx.restore();
            }
        });


        // -------------------------------------------------
        // 4. VẼ TÁN HOA HÌNH TRÁI TIM
        // -------------------------------------------------

        if (this.bloomed) {

            const canopyWidth =
                Math.min(
                    flowerCanvas.width * 0.42,
                    330
                );

            const canopyHeight =
                Math.min(
                    flowerCanvas.height * 0.30,
                    250
                );


            /*
             * Tán hoa nằm phía trên cây.
             */

            const canopyCenterX =
                headX;

            const canopyCenterY =
                headY -
                canopyHeight * 0.35;


            this.canopyFlowers.forEach(flower => {

                if (flower.scale <= 0) {
                    return;
                }


                const fx =
                    canopyCenterX +
                    flower.x *
                    canopyWidth *
                    0.5;


                const fy =
                    canopyCenterY +
                    flower.y *
                    canopyHeight *
                    0.5;


                flowerCtx.save();

                flowerCtx.translate(
                    fx,
                    fy
                );


                flowerCtx.scale(
                    flower.scale *
                    this.bloomScale,

                    flower.scale *
                    this.bloomScale
                );


                // Hoa trung tâm
                if (
                    Math.abs(flower.x) < 0.1 &&
                    flower.y > 0.3 &&
                    flower.y < 0.6
                ) {

                    this.drawSmallFlower(
                        '#ff4d6d',
                        1.2
                    );

                } else {

                    // Hoa xen kẽ màu
                    const colors = [
                        '#ff6b9d',
                        '#ff8fab',
                        '#ffb3c6',
                        '#ffc8dd'
                    ];

                    const color =
                        colors[
                            Math.floor(
                                Math.random() *
                                colors.length
                            )
                        ];

                    this.drawSmallFlower(
                        color,
                        0.75
                    );
                }

                flowerCtx.restore();
            });


            // -------------------------------------------------
            // 5. HOA TRUNG TÂM LỚN
            // -------------------------------------------------

            if (
                this.centerBloom.scale > 0
            ) {

                flowerCtx.save();

                flowerCtx.translate(
                    canopyCenterX,
                    canopyCenterY
                );

                flowerCtx.scale(
                    this.centerBloom.scale,
                    this.centerBloom.scale
                );

                this.drawCenterFlower();

                flowerCtx.restore();
            }
        }


        flowerCtx.restore();
    }


    // =====================================================
    // HOA NHỎ
    // =====================================================

    drawSmallFlower(
        color = '#ff8fab',
        scale = 1
    ) {

        flowerCtx.save();

        flowerCtx.scale(
            scale,
            scale
        );


        // Glow
        flowerCtx.shadowColor =
            color;

        flowerCtx.shadowBlur =
            10;


        // 5 cánh hoa
        for (
            let i = 0;
            i < 5;
            i++
        ) {

            flowerCtx.save();

            flowerCtx.rotate(
                (Math.PI * 2 / 5) *
                i
            );


            flowerCtx.fillStyle =
                color;


            flowerCtx.beginPath();

            flowerCtx.ellipse(
                0,
                -10,
                6,
                10,
                0,
                0,
                Math.PI * 2
            );

            flowerCtx.fill();

            flowerCtx.restore();
        }


        // Nhụy vàng
        flowerCtx.shadowBlur = 0;

        flowerCtx.fillStyle =
            '#ffd166';


        flowerCtx.beginPath();

        flowerCtx.arc(
            0,
            0,
            4,
            0,
            Math.PI * 2
        );

        flowerCtx.fill();


        flowerCtx.restore();
    }


    // =====================================================
    // HOA TRUNG TÂM - HOA TRÁI TIM
    // =====================================================

    drawCenterFlower() {

        const scale = 1;


        flowerCtx.save();

        flowerCtx.scale(
            scale,
            scale
        );


        // =================================================
        // GLOW NGOÀI
        // =================================================

        flowerCtx.shadowColor =
            '#ff6b9d';

        flowerCtx.shadowBlur =
            30;


        // =================================================
        // 8 CÁNH HOA
        // =================================================

        const petalCount = 8;


        for (
            let i = 0;
            i < petalCount;
            i++
        ) {

            const angle =
                (Math.PI * 2 /
                petalCount) *
                i;


            flowerCtx.save();

            flowerCtx.rotate(
                angle
            );


            // Màu cánh hoa
            flowerCtx.fillStyle =
                i % 2 === 0
                    ? '#ff6b9d'
                    : '#ff8fab';


            flowerCtx.beginPath();

            flowerCtx.ellipse(
                0,
                -27,
                14,
                24,
                0,
                0,
                Math.PI * 2
            );

            flowerCtx.fill();


            flowerCtx.restore();
        }


        // =================================================
        // LỚP CÁNH HOA TRONG
        // =================================================

        flowerCtx.shadowBlur =
            10;


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const angle =
                (Math.PI * 2 /
                6) *
                i;


            flowerCtx.save();

            flowerCtx.rotate(
                angle
            );


            flowerCtx.fillStyle =
                '#ffc8dd';


            flowerCtx.beginPath();

            flowerCtx.ellipse(
                0,
                -13,
                9,
                15,
                0,
                0,
                Math.PI * 2
            );

            flowerCtx.fill();


            flowerCtx.restore();
        }


        // =================================================
        // NHỤY HOA
        // =================================================

        flowerCtx.shadowBlur =
            0;


        flowerCtx.fillStyle =
            '#ffd166';


        flowerCtx.beginPath();

        flowerCtx.arc(
            0,
            0,
            10,
            0,
            Math.PI * 2
        );

        flowerCtx.fill();


        // =================================================
        // TRÁI TIM NHỎ Ở GIỮA
        // =================================================

        flowerCtx.fillStyle =
            '#ff4d6d';


        flowerCtx.font =
            'bold 13px Arial';


        flowerCtx.textAlign =
            'center';

        flowerCtx.textBaseline =
            'middle';


        flowerCtx.fillText(
            '♥',
            0,
            1
        );


        flowerCtx.restore();
    }
}

        let centerFlower = null;
        let cubeRevealed = false;

        function initCenterFlower() {
            centerFlower = new GrowingTree();
        }

        function checkCenterFlowerStatus() {
            if (centerFlower && centerFlower.bloomed && centerFlower.bloomScale >= 0.95 && !cubeRevealed) {
                cubeRevealed = true;
                document.querySelector('.cube-container').classList.add('visible');
                document.querySelector('.click-hint').classList.add('visible');
            }
        }

        function initFlowerField() {
            for (let i = 0; i < 20; i++) {
                petals.push(new Petal(true));
            }
            // Populate rich flowers across the screen, optimized count
            for (let i = 0; i < 15; i++) {
                flowers.push(new GrowingFlower());
            }
        }
