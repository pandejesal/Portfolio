document.addEventListener("DOMContentLoaded", () => {
    
    /* -------------------------------------------------------------
       1. CUSTOM SMOOTH LERPING CURSOR (DYNAMIC PALETTE)
       ------------------------------------------------------------- */
    const cursor = document.getElementById("custom-cursor");
    const cursorDot = document.getElementById("cursor-dot");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate inner dot tracking
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp mathematics loop for fluid outer ring movement
    function animateCursor() {
        const lerpFactor = 0.15; // Delay ratio
        cursorX += (mouseX - cursorX) * lerpFactor;
        cursorY += (mouseY - cursorY) * lerpFactor;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Attach hover transitions to interactive elements
    const interactiveElements = document.querySelectorAll("a, .skill-badge, .card");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });


    /* -------------------------------------------------------------
       2. ELASTIC MAGNETIC PHYSICS HOVER
       ------------------------------------------------------------- */
    const magneticItems = document.querySelectorAll(".magnetic");

    magneticItems.forEach(item => {
        item.addEventListener("mousemove", (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Shift elements slightly toward cursor
            item.style.transform = `translate(${x * 0.32}px, ${y * 0.32}px)`;
            item.style.transition = "transform 0.08s ease";
        });

        item.addEventListener("mouseleave", () => {
            // Elastic snap-back
            item.style.transform = "translate(0px, 0px)";
            item.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
        });
    });


    /* -------------------------------------------------------------
       3. PHYSICALLY DETAILED 3D CARD TILT (CYAN/CORAL SPLIT)
       ------------------------------------------------------------- */
    const cards = document.querySelectorAll(".tilt-card");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotX = -(y / (rect.height / 2)) * 7; 
            const rotY = (x / (rect.width / 2)) * 7; 
            
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
            // Border highlights switch to Coral on active tilt
            card.style.borderColor = "var(--accent-red)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
            card.style.borderColor = "var(--border)";
        });
    });


    /* -------------------------------------------------------------
       4. INTERACTIVE ROBOTIC ARM INVERSE KINEMATICS (IK)
       ------------------------------------------------------------- */
    const canvas = document.getElementById("robotic-canvas");
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // 2-Link Joint Model
    const arm = {
        baseX: width * 0.75, // Base offset
        baseY: height * 0.65,
        link1: 220, // Primary segment (Shoulder to Elbow)
        link2: 180, // Secondary segment (Elbow to Wrist)
        elbowX: 0,
        elbowY: 0,
        wristX: 0,
        wristY: 0
    };

    let targetXFiltered = width / 2;
    let targetYFiltered = height / 2;

    function solveIK(targetX, targetY) {
        arm.baseX = width * 0.78;
        arm.baseY = height * 0.62;

        const dx = targetX - arm.baseX;
        const dy = targetY - arm.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Limit target range to structural reach boundaries
        let tx = targetX;
        let ty = targetY;
        const maxReach = (arm.link1 + arm.link2) * 0.99;
        if (dist > maxReach) {
            tx = arm.baseX + (dx / dist) * maxReach;
            ty = arm.baseY + (dy / dist) * maxReach;
        }

        const dCurrent = Math.sqrt((tx - arm.baseX) ** 2 + (ty - arm.baseY) ** 2);

        // Trigonometric solver
        let cosElbow = (dCurrent ** 2 - arm.link1 ** 2 - arm.link2 ** 2) / (2 * arm.link1 * arm.link2);
        cosElbow = Math.max(-1, Math.min(1, cosElbow));
        const angleElbow = Math.acos(cosElbow);

        const alpha = Math.atan2(ty - arm.baseY, tx - arm.baseX);
        const beta = Math.atan2(arm.link2 * Math.sin(angleElbow), arm.link1 + arm.link2 * Math.cos(angleElbow));
        const angleShoulder = alpha - beta;

        arm.elbowX = arm.baseX + arm.link1 * Math.cos(angleShoulder);
        arm.elbowY = arm.baseY + arm.link1 * Math.sin(angleShoulder);
        arm.wristX = arm.elbowX + arm.link2 * Math.cos(angleShoulder + angleElbow);
        arm.wristY = arm.elbowY + arm.link2 * Math.sin(angleShoulder + angleElbow);
    }

    // Canvas draw cycle
    function animateRobotics() {
        ctx.clearRect(0, 0, width, height);

        // Filter mouse input to simulate structural inertia
        targetXFiltered += (mouseX - targetXFiltered) * 0.04;
        targetYFiltered += (mouseY - targetYFiltered) * 0.04;

        solveIK(targetXFiltered, targetYFiltered);

        // Background coordinate grid mapping
        ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Draw Arm Base Plate
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Draw Arm Segment Link 1 (Shoulder to Elbow — Styled as Electric Cyan)
        ctx.strokeStyle = "rgba(0, 242, 254, 0.08)";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(arm.baseX, arm.baseY);
        ctx.lineTo(arm.elbowX, arm.elbowY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 242, 254, 0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Arm Segment Link 2 (Elbow to Wrist — Styled as Coral/Light Red)
        ctx.strokeStyle = "rgba(255, 90, 95, 0.08)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(arm.elbowX, arm.elbowY);
        ctx.lineTo(arm.wristX, arm.wristY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 90, 95, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Joints
        ctx.fillStyle = "var(--bg)";
        ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
        ctx.lineWidth = 2.5;

        // Base Joint
        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Elbow Joint
        ctx.strokeStyle = "rgba(255, 90, 95, 0.5)";
        ctx.beginPath();
        ctx.arc(arm.elbowX, arm.elbowY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wrist endpoint
        ctx.fillStyle = "var(--accent-cyan)";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Outer Tracking Crosshair (Dual Color Ripple)
        ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 90, 95, 0.1)";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 22, 0, Math.PI * 2);
        ctx.stroke();

        requestAnimationFrame(animateRobotics);
    }
    animateRobotics();
});