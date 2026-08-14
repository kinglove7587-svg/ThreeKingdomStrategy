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
        // Tooltip สำหรับแสดงรายละเอียดการ์ด
        this.cardTooltip = null;
        this.bindEvents();
    }
    // แสดงผลสถานะล่าสุดของเกมออกทาง Console
    render(){
        this.hideCardTooltip();
        this.controlArea.innerHTML = ""; // ล้างพื้นที่ปุ่มเดิมก่อน
        this.renderPlayers(); // วาดข้อมูลผู้เล่นและ HP ลงบน DOM
        this.renderHands(); // วาดปุ่มการ์ดในมือของผู้เล่นหลัก
        // อัปเดตการแสดงผลปุ่ม End Turn ตามประเภทของ Controller
        this.renderEndTurnButton();
        this.renderSkillButtons();
        this.renderPeachButtons();
        this.renderTriggerChoice();
        this.renderTriggerCardCancelButton();
        this.renderCardSelectionStatus();
        this.renderTargetSelectionStatus();
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
            // ตรวจ Target ที่สองของ Trigger
            if(
                controller.inputState === "waitingTriggerTarget" && 
                controller.selectedTriggerSkill
            ){
                if(!controller.selectedTriggerSkill.canTriggerTarget(
                    currentPlayer, 
                    player, 
                    this.game, 
                    controller.triggerContext
                )){
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
                "----------------" + 
                "</b><br>" + 
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
        // ตรวจสอบ SelectionZone ก่อนเสมอ
        const selectionPlayer = this.game.selectionZone.getCurrentPlayer();
        if(
            selectionPlayer && 
            selectionPlayer.controller.inputState === "waitingSelection"
        ){
            this.renderSelectionZone();
            return;
        }
        // หากอยู่ในสถานะเปิดดูไพ่บนมือเป้าหมาย ให้เรียก renderTargetHand()
        if(player.controller.inputState === "viewingHand"){
            this.renderTargetHand(player.controller.viewingHandTarget);
            return;
        }
        // หากอยู่ในสถานะรอเลือกการ์ดกลางโต๊ะ ให้แสดง UI ของ Selection Zone
        if(player.controller.inputState === "waitingSelection"){
            this.renderSelectionZone();
            return;
        }
        // หากอยู่ในสถานะรอเลือกโซนทำลาย (มือ, อาวุธ หรือ เกราะ) ให้เรียก renderBurnSource()
        if(player.controller.inputState === "waitingBurnSource"){
            this.renderBurnSource();
            return;
        }
        // หากอยู่ในสถานะรอเลือกการ์ดที่จะทิ้ง (ถอนสะพาน) ให้เรียก renderBurnCard()
        if(player.controller.inputState === "waitingBurnCard"){
            this.renderBurnCard();
            return;
        }
        // หากอยู่ในสถานะรอเลือกโซนขโมย (มือ หรือ อาวุธ) ให้เรียก renderStealSource()
        if(player.controller.inputState === "waitingStealSource"){
            this.renderStealSource();
            return;
        }
        // หากอยู่ในสถานะรอเลือกการ์ดเพื่อขโมย (Steal) ให้เปลี่ยนไปวาดการ์ดแบบคว่ำแทนแล้วจบฟังก์ชัน
        if(player.controller.inputState === "waitingStealCard"){
            this.renderStealHand();
            return;
        }
        // ระหว่างรอ Trigger Choice ไม่ต้องแสดงปุ่มการ์ดปกติ
        if(player.controller.inputState === "waitingTriggerChoice"){
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
            // แสดง Custom Tooltip เมื่อเลื่อนเมาส์ชี้ไพ่
            button.onmouseenter = (event) => {

                this.showCardTooltip(card, 
                    event.clientX, 
                    event.clientY
                );
            };
            
            button.onmousemove = (event) => {

                this.showCardTooltip(card, 
                    event.clientX, 
                    event.clientY
                );
            };

            button.onmouseleave = () => {
                this.hideCardTooltip();
            }
            // กำหนดข้อความบนปุ่มให้แสดงชื่อการ์ด (เช่น "โจมตี", "ยา", "หลบ")
            button.textContent = card.name;
            // แสดงลำดับการ์ดที่เลือก
            let selectedOrder = null;
            
            if(
                player.controller.inputState === "waitingSkillCard"
            ){
                const index = 
                    player.controller.selectedSkillCardIndices.indexOf(i);

                if(index !== -1){
                    selectedOrder = index + 1;
                }
            }

            if(
                player.controller.inputState === "waitingTriggerCard"
            ){
                const index = 
                    player.controller.selectedTriggerCardIndices.indexOf(i);

                if(index !== -1){
                    selectedOrder = index + 1;
                }
            }

            if(selectedOrder !== null){
                button.textContent = 
                    "①②③".charAt(selectedOrder - 1) + 
                    " " + card.name;
                
                button.classList.add("selected-card");
            }
            //  กำหนด Event Handler เมื่อมีการคลิกที่ปุ่มการ์ดบนหน้า HTML
            button.onclick = () => {
                this.hideCardTooltip();
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
        // สร้างปุ่ม ย้อนกลับ
        const backButton = document.createElement("button");
        backButton.textContent = "↩️ ย้อนกลับ";
        backButton.onclick = () => {
            controller.startStealSourceSelection();
        };
        this.controlArea.appendChild(backButton);
    }
    // แสดงปุ่มเลือกแหล่งที่จะขโมยการ์ด
    renderStealSource(){
        // ผู้เล่นปัจจุบัน และ Controller
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const target = controller.selectedStealTarget;
        // หากไม่มีเป้าหมายให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // สร้างปุ่มเลือกขโมยจาก "มือ"
        const handButton = document.createElement("button");
        handButton.textContent = "🂠 มือ";
        handButton.onclick = () => {
            controller.selectStealSource("hand");
        };
        // แสดงปุ่ม "มือ" บน Control Area
        this.controlArea.appendChild(handButton);
        // ตรวจสอบว่าเป้าหมายมีการใส่อาวุธอยู่หรือไม่ หากมีให้สร้างปุ่มขโมย "อาวุธ"
        if(target.weapon){
            const weaponButton = document.createElement("button");
            weaponButton.textContent = "⚔️ " + target.weapon.name;
            weaponButton.onclick = () => {
                controller.selectStealSource("weapon");
                controller.confirmStealSelection();
            };
            // แสดงปุ่ม "อาวุธ" บน Control Area
            this.controlArea.appendChild(weaponButton);
        }
        // ตรวจสอบว่าเป้าหมายมีการใส่เกราะอยู่หรือไม่ หากมีให้สร้างปุ่มขโมย "เกราะ"
        if(target.armor){
            const armorButton = document.createElement("button");
            armorButton.textContent = "🛡️ " + target.armor.name;
            armorButton.onclick = () => {
                controller.selectStealSource("armor");
                controller.confirmStealSelection();
            };
            this.controlArea.appendChild(armorButton);
        }
    }
    // แสดงปุ่มเลือกโซนที่จะทำลายการ์ด (มือ, อาวุธ หรือ เกราะ)
    renderBurnSource(){
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const target = controller.selectedBurnTarget;
        //
        if(!target){
            return;
        }
        // ปุ่มเลือกทำลายจากมือ
        if(target.hand.cards.length > 0){
            const handButton = document.createElement("button");
            handButton.textContent = "🂠 มือ";
            handButton.onclick = () => {
                controller.selectBurnSource("hand");
            };
            this.controlArea.appendChild(handButton);
        }
        // ปุ่มเลือกทำลายอาวุธ
        if(target.weapon){
            const weaponButton = document.createElement("button");
            weaponButton.textContent = "⚔️ " + target.weapon.name;
            weaponButton.onclick = () => {
                controller.selectBurnSource("weapon");
            };
            this.controlArea.appendChild(weaponButton);
        }
        // ปุ่มเลือกทำลายเกราะ
        if(target.armor){
            const armorButton = document.createElement("button");
            armorButton.textContent = "🛡️ " + target.armor.name;
            armorButton.onclick = () => {
                controller.selectBurnSource("armor");
            };
            this.controlArea.appendChild(armorButton);
        }
    }
    // แสดงปุ่มการ์ดของเป้าหมายตาม Source ที่เลือก เพื่อเตรียมทำลายการ์ด
    renderBurnCard(){
        // รับผู้เล่นปัจจุบัน และ Controller
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const target = controller.selectedBurnTarget;
        // หากไม่มีเป้าหมายให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // กรณีเลือกทำลายจาก "มือ" (แก้ไขเป็น selectedBurnSource)
        if(controller.selectedBurnSource === "hand"){
            for(let i = 0; i< target.hand.cards.length; i++){
                const button = document.createElement("button");
                
                button.textContent = "🂠 " + (i + 1);
                button.onclick = () => {
                    controller.selectBurnCard(i);
                    controller.confirmBurnSelection();
                };
                this.handArea.appendChild(button);
            }
        }
        // กรณีเลือกทำลาย "อาวุธ"
        if(controller.selectedBurnSource === "weapon"){
            const button = document.createElement("button");
            button.textContent = "⚔️ " + 
                target.weapon.name + " " + 
                target.weapon.suit + " " + 
                target.weapon.number;
            button.onclick = () => {
                controller.selectBurnCard(0);
                controller.confirmBurnSelection();
            };
            this.controlArea.appendChild(button);
        }
        // กรณีเลือกทำลาย "เกราะ"
        if(controller.selectedBurnSource === "armor"){
            const button = document.createElement("button");
            button.textContent = "🛡️ " + 
                target.armor.name + " " + 
                target.armor.suit + " " + 
                target.armor.number;
            button.onclick = () => {
                controller.selectBurnCard(0);
                controller.confirmBurnSelection();
            };
            this.controlArea.appendChild(button);
        }
        // ปุ่ม ↩️ ย้อนกลับ
        const backButton = document.createElement("button");
        backButton.textContent = "↩️ ย้อนกลับ";
        backButton.onclick = () => {
            controller.startBurnSourceSelection();
        };
        this.controlArea.appendChild(backButton);
    }
    // แสดงปุ่มการ์ดกลางโต๊ะ (SelectionZone) ให้ผู้เล่นที่มีสิทธิ์เลือกในขณะนั้น
    renderSelectionZone(){
        // ดึงผู้เล่นที่มีสิทธิ์เลือกการ์ดคนปัจจุบันจาก SelectionZone
        const player = this.game.selectionZone.getCurrentPlayer();
        //
        if(!player){
            return;
        }
        
        const controller = player.controller;
        const zone = this.game.selectionZone;
        // หากไม่มีการ์ดใน Zone ให้ยกเลิกการทำงาน
        if(zone.cards.length === 0){
            return;
        }
        // วนลูปสร้างปุ่มการ์ดแต่ละใบใน SelectionZone
        for(let i = 0; i < zone.cards.length; i++){
            const card = zone.cards[i];
            
            const button = document.createElement("button");
            button.textContent = 
                card.name + " " + 
                card.suit + " " + 
                card.number;
            button.onclick = () => {
                // เลือกการ์ดเข้ามือผู้เล่นปัจจุบัน
                this.game.selectSelectionCard(i);
                // ตรวจสอบว่าเลือกการ์ดจนจบหรือยัง
                if(!this.game.selectionZone.isFinish()){
                    // ดึงผู้เล่นคนถัดไปที่มีสิทธิ์เลือกเพื่อสั่งเริ่ม Selection
                    const nextPlayer = this.game.selectionZone.getCurrentPlayer();
                    nextPlayer.controller.startSelection();
                }
            };
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
        //
        if(player.mount){
            text += "<br>🐎 : " + 
            player.mount.name + " " + 
            player.mount.suit + " " + 
            player.mount.number;
        }else{
            text += "<br>🐎 : ไม่มี";
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
        // ระหว่างรอ Trigger Choice ห้ามเริ่ม Active Skill ใหม่
        if(player.controller.inputState === "waitingTriggerChoice"){
            return;
        }
        // ระหว่างเลือก Card/Target ของ Trigger ห้ามเริ่ม Skill อื่น
        if(
            player.controller.inputState === "waitingTriggerCard" || 
            player.controller.inputState === "waitingTriggerTarget"
        ){
            return;
        }
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
    // แสดงปุ่ม "ใช้ [ชื่อสกิล]" และ "ไม่ใช้" เมื่อเข้าสู่สถานะ waitingTriggerChoice
    renderTriggerChoice(){
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        // ตรวจสอบว่าอยู่ในสถานะรอตัดสินใจ Trigger Choice หรือไม่
        if(
            controller.inputState !== "waitingTriggerChoice" || 
            !controller.selectedTriggerSkill
        ){
            return;
        }
        
        const skill = controller.selectedTriggerSkill;
        // สร้างปุ่มกด "ใช้สกิล"
        const yesButton = document.createElement("button");
        yesButton.textContent = "ใช้ " + skill.name;
        yesButton.onclick = () => {
            controller.resolveTriggerChoice(true);
        };
        this.controlArea.appendChild(yesButton);
        // สร้างปุ่มกด "ไม่ใช้สกิล"
        const noButton = document.createElement("button");
        noButton.textContent = "ไม่ใช้";
        noButton.onclick = () => {
            controller.resolveTriggerChoice(false);
        };
        this.controlArea.appendChild(noButton);
    }
    // แสดงปุ่ม "ไม่ใช้" บน UI ขณะผู้เล่นอยู่ในขั้นตอนเลือกการ์ด Trigger
    renderTriggerCardCancelButton(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;

        if(
            controller.inputState !== "waitingTriggerCard" || 
            !controller.selectedTriggerSkill
        ){
            return;
        }

        const button = document.createElement("button");
        button.textContent = "ไม่ใช้";
        button.onclick = () => {
            controller.cancelTriggerCardSelection();
        };
        this.controlArea.appendChild(button);
    }
    // แสดงสถานะจำนวนการ์ดที่เลือกและจำนวนที่ต้องเลือกกลางบน UI
    renderCardSelectionStatus(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;

        let selectedIndices = null;
        let requiredCount = 0;
        let title = "";
        // Active Skill เช่น ง้าวอสรพิษ
        if(controller.inputState === "waitingSkillCard"){
            selectedIndices = controller.selectedSkillCardIndices;
            const skill = controller.selectedSkill;

            if(!skill){
                return;
            }

            requiredCount = skill.cardSelectionCount(player, this.game);

            title = skill.name;
        }
        // Trigger Skill เช่น ขวานผ่าศิลา
        if(controller.inputState === "waitingTriggerCard"){
            selectedIndices = controller.selectedTriggerCardIndices;
            const skill = controller.selectedTriggerSkill;

            if(!skill){
                return;
            }
            // รองรับ Trigger ที่เลือกการ์ด 1 ใบแบบเดิม
            requiredCount = 
                typeof skill.triggerCardSelectionCount === "function" 
                    ? skill.triggerCardSelectionCount(player, this.game) : 1;

            title = skill.name;
        }

        if(!selectedIndices){
            return;
        }

        const status = document.createElement("div");
        status.textContent = 
            title + 
            " | เลือกการ์ด " + 
            requiredCount + 
            " ใบ | เลือกแล้ว " + 
            selectedIndices.length + 
            " / " + 
            requiredCount;
        this.controlArea.appendChild(status);
    }
    // แสดงข้อความแนะนำเมื่อกำลังรอเลือกเป้าหมาย (Target)
    renderTargetSelectionStatus(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;

        let message = null;
        // การ์ดปกติ เช่น โจมตี / ดวล / การ์ดที่ต้องเลือกเป้าหมาย
        if(controller.inputState === "waitingTarget"){
            const card = controller.getSelectedCard();

            if(card){
                if(card.name === "โจมตี"){
                    message = "เลือกเป้าหมายที่จะโจมตี";
                }else{
                    message = "เลือกเป้าหมายสำหรับ " + card.name;
                }
            }
        }
        // Active Skill เช่น ง้าวอสรพิษ
        if(
            controller.inputState === "waitingSkillTarget" && 
            controller.selectedSkill
        ){
            const skill = controller.selectedSkill;

            if(skill.name === "ง้าวอสรพิษ"){
                message = "เลือกเป้าหมายที่จะโจมตี";
            }else{
                message = "เลือกเป้าหมายสำหรับสกิล " + skill.name;
            }
        }
        // Trigger Target เช่น ง้าวสามคม
        if(
            controller.inputState === "waitingTriggerTarget" && 
            controller.selectedTriggerSkill
        ){
            const skill = controller.selectedTriggerSkill;

            if(skill.name === "ง้าวสามคม"){
                message = "เลือกเป้าหมายที่จะโจมตี";
            }else{
                message = "เลือกเป้าหมายสำหรับ " + skill.name;
            }
        }

        if(!message){
            return;
        }

        const status = document.createElement("div");
        status.textContent = message;
        this.controlArea.appendChild(status);
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
        // หากอยู่ในสถานะรอเลือกการ์ดสำหรับ Trigger Skill
        if(controller.inputState === "waitingTriggerCard"){
            controller.selectTriggerCard(index);
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
        // เลือกเป้าหมายที่สองสำหรับ Trigger
        if(controller.inputState === "waitingTriggerTarget"){
            controller.selectTriggerTarget(player);
            return;
        }
        // กรณี Controller กำลังรอเลือกเป้าหมายให้กับ การ์ดปกติ (Card)
        if(controller.inputState === "waitingTarget"){
            controller.selectTarget(player);
            return;
        }
    }
    // สร้างข้อความรายละเอียดการ์ดสำหรับแสดงผลบน Tooltip
    getCardTooltip(card){

        let text = 
            card.name + "\n" + "ประเภท: " + 
            card.type + "\n" + 
            card.suit + " " + 
            card.number;
        // แสดง Range สำหรับการ์ดที่มีค่า range
        if(card.range !== undefined){
            text += "\nระยะ: " + card.range;
        }
        // แสดง Skill ที่ผูกอยู่กับการ์ด
        if(card.skills && card.skills.length > 0){
            text += "\n\nสกิล:";

            for(const skill of card.skills){
                text += "\n• " + skill.name;
            }
        }
        // เพิ่มคำอธิบายจาก Card
        if(typeof card.getDescription === "function"){
            text += "\n\n" + card.getDescription();
        }
        // แสดงว่า Recast ได้หรือไม่
        if(
            typeof card.canRecast === "function" && 
            card.canRecast()
        ){
            text += "\n\n🔄 Recast ได้";
        }
        return text;
    }
    // สร้าง Element สำหรับแสดง Tooltip รายละเอียดการ์ดบนหน้าจอ
    createCardTooltip(){

        if(this.cardTooltip){
        return this.cardTooltip;
        }

        const tooltip = document.createElement("div");

        tooltip.className = "card-tooltip";

        document.body.appendChild(tooltip);

        this.cardTooltip = tooltip;

        return tooltip;
    }
    // แสดง Tooltip ของการ์ด ณ ตำแหน่งพิกัดเมาส์ (x, y)
    showCardTooltip(card, x, y){

        const tooltip = this.createCardTooltip();

        tooltip.textContent = this.getCardTooltip(card);

        tooltip.style.display = "block";

        const offset = 15;

        let left = x + offset;
        let top = y + offset;

        // ต้องอ่านขนาดหลังจากแสดง Tooltip แล้ว
        const rect = tooltip.getBoundingClientRect();

        // ชนขอบขวา → ย้ายไปด้านซ้ายของเมาส์
        if(left + rect.width > window.innerWidth){
            left = x - rect.width - offset;
        }

        // ชนขอบล่าง → ย้ายขึ้นด้านบนของเมาส์
        if(top + rect.height > window.innerHeight){
            top = y - rect.height - offset;
        }

        // กันกรณี Tooltip เลยขอบซ้าย
        if(left < 0){
            left = 5;
        }

        // กันกรณี Tooltip เลยขอบบน
        if(top < 0){
            top = 5;
        }

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
    }
    // ซ่อน Tooltip เมื่อเลื่อนเมาส์ออกจากพื้นที่การ์ด
    hideCardTooltip(){

        if(!this.cardTooltip){
            return;
        }
        this.cardTooltip.style.display = "none";
    }
    
}
