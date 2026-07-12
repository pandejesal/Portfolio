document.addEventListener("DOMContentLoaded", () => {
    
    /* -------------------------------------------------------------
       1. CUSTOM SMOOTH LERPING CURSOR
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
        
        // Immediate tracking for tiny inner dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp mathematical translation loop for smooth elastic motion lag
    function animateCursor() {
        const lerpFactor = 0.15; // Elasticity speed setting
        cursorX += (mouseX - cursorX) * lerpFactor;
        cursorY += (mouseY - cursorY) * lerpFactor;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Trigger cursor enlargement on hover of interactive elements
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
            // Calculate cursor offset from element's geometric center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Elastic coefficient adjustment (pull ratio)
            item.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
            item.style.transition = "transform 0.08s ease";
        });

        item.addEventListener("mouseleave", () => {
            // Restore structural alignment smoothly
            item.style.transform = "translate(0px, 0px)";
            item.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
        });
    });


    /* -------------------------------------------------------------
       3. PHYSICALLY DETAILED 3D CARD TILT
       ------------------------------------------------------------- */
    const cards = document.querySelectorAll(".tilt-card");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotX = -(y / (rect.height / 2)) * 8; 
            const rotY = (x / (rect.width / 2)) * 8; 
            
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
            card.style.borderColor = "var(--accent)";
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

    // Robotic Joint & Segment Math Model (2-Link Robot Joint Arm)
    const arm = {
        baseX: width * 0.8, // Arm base mount coordinate (right of viewport)
        baseY: height * 0.75,
        link1: 220, // Length of segment 1 (Shoulder to Elbow)
        link2: 180, // Length of segment 2 (Elbow to Wrist/Target)
        elbowX: 0,
        elbowY: 0,
        wristX: 0,
        wristY: 0,
        targetX: 0,
        targetY: 0
    };

    // Smooth robotic tracking coordinates
    let targetXFiltered = width / 2;
    let targetYFiltered = height / 2;

    function solveIK(targetX, targetY) {
        // Move arm base on screen resize dynamically
        arm.baseX = width * 0.75;
        arm.baseY = height * 0.65;

        // Vector calculations from Base to Target coordinates
        const dx = targetX - arm.baseX;
        const dy = targetY - arm.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp target trajectory to maximum physical reach limits
        let tx = targetX;
        let ty = targetY;
        const maxReach = (arm.link1 + arm.link2) * 0.99;
        if (dist > maxReach) {
            tx = arm.baseX + (dx / dist) * maxReach;
            ty = arm.baseY + (dy / dist) * maxReach;
        }

        const dCurrent = Math.sqrt((tx - arm.baseX) ** 2 + (ty - arm.baseY) ** 2);

        // Inverse Kinematic equations (Cosine rules)
        // Cosine of interior angle opposite link2
        let cosElbow = (dCurrent ** 2 - arm.link1 ** 2 - arm.link2 ** 2) / (2 * arm.link1 * arm.link2);
        cosElbow = Math.max(-1, Math.min(1, cosElbow)); // Clamp to valid cosine bounds
        const angleElbow = Math.acos(cosElbow);

        // Angle between Base-Target line and Link1
        const alpha = Math.atan2(ty - arm.baseY, tx - arm.baseX);
        const beta = Math.atan2(arm.link2 * Math.sin(angleElbow), arm.link1 + arm.link2 * Math.cos(angleElbow));
        const angleShoulder = alpha - beta;

        // Calculate joint spatial endpoints
        arm.elbowX = arm.baseX + arm.link1 * Math.cos(angleShoulder);
        arm.elbowY = arm.baseY + arm.link1 * Math.sin(angleShoulder);
        arm.wristX = arm.elbowX + arm.link2 * Math.cos(angleShoulder + angleElbow);
        arm.wristY = arm.elbowY + arm.link2 * Math.sin(angleShoulder + angleElbow);
    }

    // Animation Loop
    function animateRobotics() {
        ctx.clearRect(0, 0, width, height);

        // Lerp targeting inputs to simulate pneumatic/hydraulic motor delays
        targetXFiltered += (mouseX - targetXFiltered) * 0.04;
        targetYFiltered += (mouseY - targetYFiltered) * 0.04;

        // Compute IK model state
        solveIK(targetXFiltered, targetYFiltered);

        // Draw joint coordinate grid lines (Robotics design blueprint theme)
        ctx.strokeStyle = "rgba(0, 242, 254, 0.015)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Draw Arm Base Mount Baseplate
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw Arm Segment Link 1 (Shoulder to Elbow)
        ctx.strokeStyle = "rgba(130, 134, 143, 0.12)";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(arm.baseX, arm.baseY);
        ctx.lineTo(arm.elbowX, arm.elbowY);
        ctx.stroke();

        // Overlay high-tech inner core lines
        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Arm Segment Link 2 (Elbow to Wrist)
        ctx.strokeStyle = "rgba(130, 134, 143, 0.12)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(arm.elbowX, arm.elbowY);
        ctx.lineTo(arm.wristX, arm.wristY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Mechanical Rotational Hinges
        ctx.fillStyle = "var(--bg)";
        ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
        ctx.lineWidth = 3;

        // Base Joint
        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Elbow Joint
        ctx.beginPath();
        ctx.arc(arm.elbowX, arm.elbowY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // End Effector Grip point (Target tracker)
        ctx.fillStyle = "rgba(0, 242, 254, 0.7)";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Interactive Target crosshair ring
        ctx.strokeStyle = "rgba(0, 242, 254, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 18, 0, Math.PI * 2);
        ctx.stroke();

        requestAnimationFrame(animateRobotics);
    }
    animateRobotics();
});