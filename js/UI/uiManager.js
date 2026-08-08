class UIManager{
    // กำหนด constructor รับ instance ของเกมเข้ามาเก็บไว้
    constructor(game){
        // กำหนด game ไว้ใช้งานในการดึงข้อมูลผู้เล่นและสถานะต่างๆ
        this.game = game;
        // ดึงตัวอ้างอิง DOM Elements จากหน้า HTML มาเก็บไว้ใช้งาน
        this.enemyArea = document.getElementById("enemy-area");
        this.playerArea = document.getElementById("player-area");
        this.handArea = document.getElementById("hand-area");
        this.logArea = document.getElementById("log-area");
        this.endTurnButton = document.getElementById("end-turn");
        this.bindEvents();
    }
    // แสดงผลสถานะล่าสุดของเกมออกทาง Console
    render(){
        // วาดข้อมูลผู้เล่นและ HP ลงบน DOM
        this.renderPlayers();
        // วาดปุ่มการ์ดในมือของผู้เล่นหลัก
        this.renderHands();
        // อัปเดตการแสดงผลปุ่ม End Turn ตามประเภทของ Controller
        this.renderEndTurnButton();
    }
    // วาดการ์ดแสดงตัวละครฝั่งเราและฝั่งศัตรู
    renderPlayers(){
        // ล้างข้อมูล HTML เก่าในโซนศัตรูออกก่อน เพื่อเตรียมวาดข้อมูลเฟรมใหม่
        this.enemyArea.innerHTML = "";
        // ล้างข้อมูล HTML เก่าในโซนผู้เล่นหลักออกก่อน
        this.playerArea.innerHTML = "";
        // วนลูปอ่านข้อมูลผู้เล่นทุกคนจากอาร์เรย์ this.game.players
        for (let i = 0; i < this.game.players.length; i++){
            // ดึงออบเจกต์ผู้เล่นในลำดับ index ปัจจุบันออกมา
            const player = this.game.players[i];
            // สร้าง Element <div> ใหม่ขึ้นมาในหน่วยความจำ
            const div = document.createElement("div");
            // เพิ่ม class พื้นฐานสำหรับการแต่งสไตล์การ์ดผู้เล่น
            div.classList.add("player-card");
            // ดึงผู้เล่นปัจจุบัน Controller และตำแหน่งการ์ดที่เลือกอยู่จาก Controller
            const currentPlayer = this.game.getCurrentPlayer();
            const controller = currentPlayer.controller;
            // ประกาศตัวแปรรองรับวัตถุการ์ดเริ่มต้นเป็น null
            let card = null;
            // ตรวจสอบว่า Controller มีเมธอด getSelectedCard หรือไม่ (เช่น HumanController)
            if (typeof controller.getSelectedCard === "function"){
                // ดึงการ์ดที่กำลังเลือกอยู่มาใช้งาน
                card = controller.getSelectedCard();
            }
            // ตรวจสอบว่ามีการเลือกการ์ดอยู่ และการ์ดใบนั้นต้องระบุเป้าหมายหรือไม่
            if (card && card.needTarget()){
                // ถ้าผู้เล่นคนนี้ไม่สามารถเลือกเป็นเป้าหมายได้ (เช่น เลือกตัวเองไม่ได้)
                if (!card.canTarget(currentPlayer, player)){
                    // เพิ่ม class เพื่อแสดงผลว่ากดเลือกไม่ได้ (เช่น ปรับ opacity จางลง)
                    div.classList.add("disabled-target");
                }
            }
            // ประกาศตัวแปรรองรับวัตถุเป้าหมายเริ่มต้นเป็น null
            let target = null;
            // ตรวจสอบว่า Controller มีเมธอด getSelectedTarget หรือไม่
            if (typeof controller.getSelectedTarget === "function"){
                // ดึงเป้าหมายที่เลือกไว้จาก Controller
                target = controller.getSelectedTarget();
            }
            // ตรวจสอบว่าผู้เล่นในรอบลูปนี้ตรงกับเป้าหมายที่เลือกไว้หรือไม่
            if (player === target){
                // เพิ่ม class "selected-target" เพื่อปรับแต่งรูปแบบ CSS (เช่น ใส่กรอบสีแดง)
                div.classList.add("selected-target");
            }
            // กำหนด Event เมื่อผู้เล่นคลิกที่กรอบของตัวละคร เพื่อส่งข้อมูลผู้เล่นใบนั้นไปประมวลผล
            div.onclick = () => {
                this.onPlayerClick(player);
            };
            // กำหนดสถานะโซ่ตรวน
            let status = "";
            if(player.isChained()){
                status += "<br>⛓";
            }
            // กำหนดข้อความ HTML ภายใน div ให้แสดงชื่อ (ตัวหนา) และ พลังชีวิต HP
            div.innerHTML = 
                "<b>" + 
                player.name + 
                "</b><br>" + 
                "HP : " +
                player.hp + 
                "/" + 
                player.maxHp + status;
            // เช็กว่าถ้าเป็นผู้เล่นคนแรก (index 0) ให้ถือว่าเป็นฝั่งเรา
            /*if (i === 0){
                // นำ element ไปแสดงในโซน playerArea
                this.playerArea.appendChild(div);
            }else{
                // หากเป็นผู้เล่นคนอื่นๆ (index > 0) ให้ถือว่าเป็นฝั่งศัตรู นำไปแสดงในโซน enemyArea
                this.enemyArea.appendChild(div);
            }*/
            this.playerArea.appendChild(div);
        }
    }
    // วาดปุ่มการ์ดบนมือของผู้เล่นที่ถึงตาเล่นในปัจจุบัน
    renderHands(){
        // ล้าง Element ปุ่มการ์ดเก่าทั้งหมดใน handArea ออกก่อน เพื่อเตรียมสร้างใหม่ในเฟรมนี้
        this.handArea.innerHTML = "";
        // ดึงตัวละครผู้เล่นที่กำลังถึงตาเล่นในปัจจุบันจาก Game Engine
        const player = this.game.getCurrentPlayer();
        // ถ้าไม่ใช่ผู้เล่นมนุษย์ ไม่ต้องแสดงการ์ดในมือ
        if (!(player.controller instanceof HumanController)){
            return;
        }
        // วนลูปแบบเก็บ index (i) เพื่อระบุตำแหน่งของการ์ดแต่ละใบบนมือ
        for (let i = 0; i < player.hand.cards.length; i++){
            // ดึงข้อมูลการ์ดในลำดับ index ที่ i
            const card = player.hand.cards[i];
            // สร้าง Element ปุ่ม <button> ขึ้นมาใหม่ในหน่วยความจำ
            const button = document.createElement("button");
            // กำหนดข้อความบนปุ่มให้แสดงชื่อการ์ด (เช่น "ฆ่า", "ยา", "หลบ")
            button.textContent = card.name;
            //  กำหนด Event Handler เมื่อมีการคลิกที่ปุ่มการ์ดบนหน้า HTML
            button.onclick = () => {
                // เรียกใช้อีเวนต์คลิกการ์ด โดยส่ง index ของการ์ดใบที่ถูกเลือกไปประมวลผล
                this.onCardClick(i);
            };
            // นำปุ่มการ์ดที่สร้างเสร็จแล้วไปแสดงในโซน handArea บนหน้าเว็บ
            this.handArea.appendChild(button);
        }
    }
    // ผูก Event ของปุ่มกดควบคุมหลัก
    bindEvents(){ 
        // กำหนด Event Handler เมื่อผู้เล่นกดปุ่ม End Turn
        this.endTurnButton.onclick = () => {
            // ดึงผู้เล่นที่กำลังเล่นอยู่ในปัจจุบัน
            const player = this.game.getCurrentPlayer();
            // เรียกใช้อีเวนต์คลิกการ์ด โดยส่ง index เป็น -1 เพื่อแจ้งจบเทิร์น
            this.onCardClick(-1);
        };
    }
    // บันทึกเหตุการณ์ลงในกล่อง Log บนหน้าเว็บ
    addLog(text){ 
        // สร้าง Element <div> ใหม่ขึ้นมาเพื่อใช้เก็บบรรทัดข้อความ
        const line = document.createElement("div");
        // กำหนดเนื้อหาข้อความภายใน div ให้เท่ากับข้อความที่ส่งเข้ามา
        line.textContent = text;
        // นำบรรทัดข้อความใหม่ที่สร้างเสร็จแล้ว ไปต่อเพิ่มในโซน logArea บนหน้าเว็บ
        this.logArea.appendChild(line);
        // ปรับตำแหน่ง Scroll ของกล่อง Log ให้เลื่อนลงไปล่างสุดเสมอ เพื่อให้เห็นข้อความล่าสุดทันที
        this.logArea.scrollTop = this.logArea.scrollHeight;
    }
    // ควบคุมการแสดงผลปุ่ม End Turn บนหน้าเว็บ
    renderEndTurnButton(){
        // ดึงผู้เล่นปัจจุบันที่กำลังถึงตาเล่น
        const player = this.game.getCurrentPlayer();
        // ตรวจสอบว่าผู้เล่นปัจจุบันเป็นมนุษย์ (HumanController) หรือไม่
        if (player.controller instanceof HumanController){
            // แสดงปุ่ม End Turn บนหน้าเว็บ
            this.endTurnButton.style.display = "inline-block";
        }else{
            // ซ่อนปุ่ม End Turn ไม่ให้กดได้ระหว่างที่ AI เล่น
            this.endTurnButton.style.display = "none";
        }
    }
    // เมธอดสำหรับจัดการ Event เมื่อมีการคลิกการ์ด (หรือกดปุ่ม End Turn ซึ่งส่ง index เป็น -1)
    onCardClick(index){
        // ดึงข้อมูลผู้เล่นปัจจุบันที่กำลังเล่นอยู่ในเทิร์นนี้
        const player = this.game.getCurrentPlayer();
        // ส่งตำแหน่ง index ของการ์ดที่ถูกคลิก ไปให้ Controller ของผู้เล่นประมวลผลต่อ
        player.controller.selectCard(index);
    }
    // เมธอดจัดการ Event เมื่อผู้เล่นคลิกที่ตัวละคร
    onPlayerClick(player){
        console.log("คลิก", player.name); // Debug
        // ดึงข้อมูลผู้เล่นปัจจุบันที่กำลังถึงตาเล่น
        const currentPlayer = this.game.getCurrentPlayer();
        // ดึง Controller ของผู้เล่นปัจจุบัน
        const controller = currentPlayer.controller;
        console.log("inputState =", controller.inputState); // Debug
        // ถ้าไม่ใช่ผู้เล่นมนุษย์ ไม่ต้องรับการคลิก
        if (!(controller instanceof HumanController)){
            return;
        }
        // ถ้า Controller ไม่ได้อยู่ในสถานะรอเลือกเป้าหมาย ให้ยกเลิกการคลิก
        if (controller.inputState !== "waitingTarget"){
            return;
        }
        // ส่งเป้าหมายให้ Controller จัดการ
        controller.selectTarget(player);
    }
}
