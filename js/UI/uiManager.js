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
        this.controlArea = document.getElementById("control-area");
        this.bindEvents();
    }
    // แสดงผลสถานะล่าสุดของเกมออกทาง Console
    render(){
        this.controlArea.innerHTML = ""; // ล้างพื้นที่ปุ่มเดิมก่อน
        this.renderPlayers(); // วาดข้อมูลผู้เล่นและ HP ลงบน DOM
        this.renderHands(); // วาดปุ่มการ์ดในมือของผู้เล่นหลัก
        // อัปเดตการแสดงผลปุ่ม End Turn ตามประเภทของ Controller
        this.renderEndTurnButton();
        this.renderSkillButtons();
        this.renderPeachButtons();
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
            // ตรวจสอบเงื่อนไข Disabled Target สำหรับ สกิล
            if(
                controller.inputState === "waitingSkillTarget" && 
                controller.selectedSkill
            ){
                if(!controller.selectedSkill.canTarget(currentPlayer, player)){
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
                player.maxHp + 
                status + 
                this.renderEquipment(player);
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
        // หากอยู่ในสถานะเปิดดูไพ่บนมือเป้าหมาย ให้เรียก renderTargetHand()
        if(player.controller.inputState === "viewingHand"){
            this.renderTargetHand(player.controller.viewingHandTarget);
            return;
        }
        // หากอยู่ในสถานะรอเลือกการ์ดเพื่อขโมย (Steal) ให้เปลี่ยนไปวาดการ์ดแบบคว่ำแทนแล้วจบฟังก์ชัน
        if(player.controller.inputState === "waitingStealCard"){
            this.renderStealHand();
            return;
        }
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
            // กำหนดข้อความบนปุ่มให้แสดงชื่อการ์ด (เช่น "โจมตี", "ยา", "หลบ")
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
    // แสดงการ์ดบนมือทั้งหมดของผู้เล่นเป้าหมาย
    renderTargetHand(target){
        // หากไม่มีออบเจกต์เป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // วนลูปการ์ดทุกใบในมือของผู้เล่นเป้าหมาย
        for(const card of target.hand.cards){
            //สร้าง Element ปุ่ม <button> ใหม่ในหน่วยความจำ
            const button = document.createElement("button");
            // กำหนดข้อความบนปุ่มเป็น "ชื่อดอก แต้ม" (เช่น โจมตี ♠️ 7)
            button.textContent = 
            card.name + " " +
            card.suit + " " + 
            card.number;
            // ปิดการใช้งานปุ่ม (disabled) เพื่อให้เป็นเพียงการเปิดดู ห้ามคลิกเลือก
            button.disabled = true;
            // นำปุ่มการ์ดไปแสดงผลในโซน handArea บน UI
            this.handArea.appendChild(button);
        }
        // สร้างปุ่ม "กลับ" สำหรับคลิกจบการเปิดดูมือ และคืนค่า state
        const closeButton = document.createElement("button");
        closeButton.textContent = "กลับ";
        closeButton.onclick = () => {
            this.game.getCurrentPlayer().controller.finishViewingHand();
        };
        // นำปุ่ม "กลับ" ไปวางในโซน controlArea บน UI
        this.controlArea.appendChild(closeButton);
    }
    // วาดการ์ดคว่ำของเป้าหมายในโหมดขโมยการ์ด (Steal)
    renderStealHand(){
        // ดึงผู้เล่นปัจจุบันที่กำลังเล่นอยู่ในขณะนี้
        const player = this.game.getCurrentPlayer();
        // ดึง Controller ของผู้เล่น
        const controller = player.controller;
        // ดึงเป้าหมายที่จะขโมยการ์ดที่ถูกเลือกไว้
        const target = controller.selectedStealTarget;
        // ถ้าไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // วนลูปสร้างปุ่มไพ่คว่ำตามจำนวนการ์ดบนมือของเป้าหมาย
        for(let i = 0; i < target.hand.cards.length; i++){
            // สร้าง Element ปุ่ม <button> ขึ้นมาใหม่
            const button = document.createElement("button");
            // กำหนดข้อความบนปุ่มเป็นไอคอนไพ่คว่ำ พร้อมหมายเลข
            button.textContent = "🂠 " + (i + 1);
            // กำหนด Event เมื่อกดคลิก ให้เรียกใช้เมธอด selectStealCard
            button.onclick = () => {
                controller.selectStealCard(i);
                controller.confirmStealSelection();
            };
            // นำปุ่มที่สร้างไปแสดงผลในโซน handArea บนหน้าเว็บ
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
    // สร้างข้อความ HTML แสดงผลอุปกรณ์ที่ผู้เล่นกำลังสวมใส่อยู่ (อาวุธ/เกราะ)
    renderEquipment(player){
        let text = "";
        // ตรวจสอบว่าผู้เล่นมีการสวมใส่อาวุธอยู่หรือไม่
        if(player.weapon){
            text += "<br>⚔️ : " + 
                player.weapon.name + " " +
                player.weapon.suit + " " +
                player.weapon.number;
        }else{
            text += "<br>⚔️ : ไม่มี";
        }
        // ตรวจสอบว่าผู้เล่นมีการสวมใส่เกราะอยู่หรือไม่
        if(player.armor){
            text += "<br>🛡️ : " + 
                player.armor.name + " " + 
                player.armor.suit + " " + 
                player.armor.number;
        }else{
            text += "<br>🛡️ : ไม่มี";
        }
        return text;
    }
    // เมธอดสำหรับวาดปุ่มทางเลือกระหว่าง "เล่น" หรือ "Recast" สำหรับการ์ดที่รองรับ
    renderCardActionButtons(index){
        // ดึงออบเจกต์ผู้เล่นปัจจุบัน
        const player = this.game.getCurrentPlayer();
        // ดึง Controller ของผู้เล่น
        const controller = player.controller;
        // ดึงการ์ดในมือจากตำแหน่ง index ที่เลือก
        const card = player.hand.cards[index];
        // ตรวจสอบว่ามีการ์ดในตำแหน่งนี้หรือไม่
        if(!card){
            return;
        }
        //
        this.controlArea.innerHTML = "";
        // ถ้าการ์ดใบนี้ Recast ไม่ได้ ให้สั่งเลือกการ์ดเล่นแบบเดิมทันที
        if(!card.canRecast()){
            controller.selectCard(index);
            return;
        }
        // --- กรณีการ์ด canRecast() === true ---
        // สร้างปุ่ม "เล่น" สำหรับการสั่งใช้การ์ดปกติ
        const playButton = document.createElement("button");
        playButton.textContent = "เล่น";
        playButton.onclick = () => {
            controller.selectCard(index);
        };
        this.controlArea.appendChild(playButton);
        // สร้างปุ่ม "Recast" สำหรับการทิ้งไพ่เพื่อจั่วใบใหม่
        const recastButton = document.createElement("button");
        recastButton.textContent = "Recast";
        recastButton.onclick = () => {
            controller.recastCard(index);
        };
        this.controlArea.appendChild(recastButton);
    }
    // เมธอดสำหรับสร้างปุ่มกดใช้งาน Active Skill บน UI
    renderSkillButtons(){
        // ดึงข้อมูลผู้เล่นปัจจุบันที่กำลังถึงตาเล่น
        const player = this.game.getCurrentPlayer();
        // ถ้าผู้เล่นปัจจุบันไม่ใช่ Human ไม่ต้องสร้างปุ่ม สกิล
        if(!(player.controller instanceof HumanController)){
            return;
        }
        // ดึงรายการ Active Skill ทั้งหมดของผู้เล่น
        const skills = player.getActiveSkills();
        // วนลูปเช็กสกิลแต่ละใบ
        for(const skill of skills){
            // ถ้าสกิลไม่ผ่านเงื่อนไขการใช้งาน ให้ข้ามไป
            if(!skill.canUse(player, this.game)){
                continue;
            }
            // สร้างปุ่มกดสำหรับสกิล
            const button = document.createElement("button");
            button.textContent = "ใช้สกิล " + skill.name;
            // เมื่อคลิกปุ่ม ให้สั่ง HumanController เริ่มกระบวนการเลือกเป้าหมายสกิล
            button.onclick = () => {
                player.controller.startSkillTargetSelection(skill);
            };
            // นำปุ่มไปใส่ไว้ในพื้นที่ควบคุม (controlArea) บน UI
            this.controlArea.appendChild(button);
        }
    }
    // สร้างและแสดงปุ่ม "ใช้ยา"
    renderPeachButtons(){
        // ดึงผู้เล่นมนุษย์ที่กำลังถูกถามเรื่องยา
        const player = this.game.peachHelper;
        if(!player){
            return;
        }
        // ดึง Controller และตรวจสอบว่าเป็น HumanController หรือไม่
        const controller = player.controller;
        if(!(controller instanceof HumanController)){
            return;
        }
        // ไม่ต้องแสดงปุ่ม "ใช้ยา / ไม่ใช้ยา"
        if(player === this.game.dyingPlayer){
            return;
        }
        // แสดงปุ่มเฉพาะตอนที่สถานะกำลังรอการตัดสินใจใช้ยา (waitingPeach) เท่านั้น
        if(controller.inputState !== "waitingPeach"){
            return;
        }
        // สร้างปุ่ม "ใช้ยา"
        const yesButton = document.createElement("button");
        yesButton.textContent = "ใช้ยา";
        yesButton.onclick = () => {
            this.onPeachDecision(true);
        };
        // สร้างปุ่ม "ไม่ใช้ยา"
        const noButton = document.createElement("button");
        noButton.textContent = "ไม่ใช้ยา";
        noButton.onclick = () => {
            this.onPeachDecision(false);
        };
        // นำปุ่มทั้งสองไปใส่ในพื้นที่ controlArea
        this.controlArea.appendChild(yesButton);
        this.controlArea.appendChild(noButton);
    }
    // เมธอดสำหรับจัดการ Event เมื่อมีการคลิกการ์ด
    onCardClick(index){
        // ดึงข้อมูลผู้เล่นปัจจุบันที่กำลังถึงตาเล่น
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        // ตรวจสอบว่าถ้าอยู่ในสถานะรอเลือกการ์ดสำหรับสกิล
        if(controller.inputState === "waitingSkillCard"){
            controller.selectSkillCard(index);
            return;
        }
        // ตรวจสอบว่าถ้าอยู่ในสถานะรอเลือกการ์ดที่จะขโมย (Steal)
        if(controller.inputState === "waitingStealCard"){
            controller.selectStealCard(index);
            return;
        }
        //
        if(index === -1){
            controller.selectCard(index);
            return;
        }
        // 
        this.renderCardActionButtons(index);
    }
     // จัดการคำสั่งการตัดสินใจใช้/ไม่ใช้การ์ดยา จากปุ่มกดบนหน้าจอ UI
    onPeachDecision(usePeach){
        // ดึงออบเจกต์ผู้เล่นมนุษย์ (Human) ที่กำลังถูกถามว่าจะใช้ยาหรือไม่
        const player = this.game.peachHelper;
        // ถ้าไม่มีผู้เล่นที่กำลังถูกถาม ให้ยกเลิกการทำงาน
        if(!player){
            return;
        }
        // ดึง Controller ของผู้เล่นคนนั้น
        const controller = player.controller;
        // ตรวจสอบว่า Controller เป็นของ HumanController หรือไม่
        if(!(controller instanceof HumanController)){
            return;
        }
        // ตรวจสอบสถานะต้องเป็น waitingPeach เท่านั้น ถึงจะรับคำสั่งนี้ได้
        if(controller.inputState !== "waitingPeach"){
            return;
        }
        // กรณีผู้เล่นกดปุ่มใช้ยา
        if(usePeach){
            controller.confirmPeach();
        }else{
            // กรณีผู้เล่นกดปุ่มไม่ใช้ยา / ข้าม
            controller.declinePeach();
        }
        this.game.ui.render();
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
        // กรณี Controller กำลังรอเลือกเป้าหมายให้กับ สกิล (Skill)
        if(controller.inputState === "waitingSkillTarget"){
            controller.selectSkillTarget(player);
            return;
        }
        // กรณี Controller กำลังรอเลือกเป้าหมายให้กับ การ์ดปกติ (Card)
        if(controller.inputState === "waitingTarget"){
            controller.selectTarget(player);
            return;
        }
    }
}
