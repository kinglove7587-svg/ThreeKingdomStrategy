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
        // Index ของการ์ดที่กำลังเปิดเมนู "เล่น / Recast"
        this.cardActionIndex = -1;
        // Tooltip สำหรับแสดงรายละเอียดการ์ด
        this.cardTooltip = null;
        this.tooltipHoverSkill = null;
        this.characterTooltip = null;
        this.tooltipShiftDown = false;
        this.tooltipHoverCard = null;
        this.tooltipHoverSkill = null;
        this.tooltipMouseX = 0;
        this.tooltipMouseY = 0;
        
        this.bindEvents();
        // Event เมื่อกดปุ่ม Shift ค้างไว้เพื่อเปิด Tooltip ทันที
        document.addEventListener("keydown", (event) => {

            if(event.key !== "Shift"){
                return;
            }

            if(this.tooltipShiftDown){
                return;
            }
            this.tooltipShiftDown = true;
            //
            if(this.tooltipHoverCard){

                this.showCardTooltip(
                    this.tooltipHoverCard, 
                    this.tooltipMouseX, 
                    this.tooltipMouseY
                );
            }
            if(this.tooltipHoverSkill){

                this.showSkillTooltip(
                    this.tooltipHoverSkill,
                    this.tooltipMouseX,
                    this.tooltipMouseY
                );
            }
        });
        // Event เมื่อปล่อยปุ่ม Shift ให้ซ่อน Tooltip ทันที
        document.addEventListener("keyup", (event) => {

            if(event.key !== "Shift"){
                return;
            }
            this.tooltipShiftDown = false;
            this.hideCardTooltip();
        });
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
        this.renderTriggerChoice();
        this.renderReactionChoice();
        this.renderTriggerCardCancelButton();
        this.renderCardSelectionStatus();
        this.renderTargetSelectionStatus();
        this.renderAdditionalTargetSelection();
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
            div.dataset.playerIndex = i;
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
            if (card && card.needTarget() && controller.inputState !== "waitingBorrowedSwordTarget"){
                // ถ้าผู้เล่นคนนี้ไม่สามารถเลือกเป็นเป้าหมายได้ (เช่น เลือกตัวเองไม่ได้)
                if (!card.canTarget(currentPlayer, player)){
                    // เพิ่ม class เพื่อแสดงผลว่ากดเลือกไม่ได้ (เช่น ปรับ opacity จางลง)
                    div.classList.add("disabled-target");
                }
            }
            // Wooden Cart - ล็อกผู้เล่นหลัก
            if(
                controller.inputState === "waitingWoodenCartCard" && 
                player === currentPlayer
            ){
                div.classList.add("disabled-target");
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
            // Borrowed Sword - ล็อกเป้าหมายที่ผู้ถูกบังคับโจมตีไม่ได้
            if(controller.inputState === "waitingBorrowedSwordTarget"){
                if(!controller.canSelectBorrowedSwordTarget(player)){
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
            // Wooden Cart - ถ้าอยู่ใน state waitingWoodenCartCard
            if(
                controller.inputState === "waitingWoodenCartCard" && 
                controller.selectedWoodenCartTarget
            ){
                target = controller.selectedWoodenCartTarget;
            }
            // ตรวจสอบว่าผู้เล่นในรอบลูปนี้ตรงกับเป้าหมายที่เลือกไว้หรือไม่
            if (player === target){
                // เพิ่ม class "selected-target" เพื่อปรับแต่งรูปแบบ CSS (เช่น ใส่กรอบสีแดง)
                div.classList.add("selected-target");
            }
            // ไฮไลต์เป้าหมายเพิ่มเติม
            if(
                controller.inputState === "waitingAdditionalTargets" && 
                controller.selectedAdditionalTargets.includes(player)
            ){
                div.classList.add("selected-target");
            }
            // กำหนด Event เมื่อผู้เล่นคลิกที่กรอบของตัวละคร เพื่อส่งข้อมูลผู้เล่นใบนั้นไปประมวลผล
            div.onclick = () => {
                this.onPlayerClick(player);
            };
            // กำหนดสถานะ
            let status = "";
            if(player.isChained()){
                status += "<br>⛓";
            }
            if(player.delayedTricks.some(card => card instanceof LightningCard)){
                status += "<br>⚡";
            }
            //
            const genderIcon = this.getGenderIcon(player.gender);
            const factionIcon = this.getFactionIcon(player.faction);

            const infoButton = document.createElement("button");
            infoButton.textContent = "👤";
            infoButton.className = "character-info-button";
            infoButton.onclick = (event) => {
                event.stopPropagation();
                this.showCharacterTooltip(player);
            };
            // กำหนดข้อความ HTML ภายใน div ให้แสดงชื่อ (ตัวหนา) และ พลังชีวิต HP
            div.innerHTML = 
                "<b>" + 
                player.name + 
                " </b> " + 
                "<br>" + 
                "HP : " +
                player.hp + 
                "/" + 
                player.maxHp + 
                status + 
                this.renderEquipment(player);
                //
                const nameElement = div.querySelector("b");
                if(nameElement){
                    nameElement.appendChild(infoButton);
                }
                // ผูก Event Tooltip ให้กับเกราะที่สวมอยู่
                const armorElement = div.querySelector(".equipped-armor");
                if(armorElement && player.armor){
                    armorElement.onmouseenter = (event) => {
                        this.showCardTooltip(
                            player.armor, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    armorElement.onmousemove = (event) => {
                        this.showCardTooltip(
                            player.armor, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    armorElement.onmouseleave = () => {
                        this.hideCardTooltip();
                    };
                }
                // ผูก Event Tooltip ให้กับอาวุธที่สวมอยู่
                const weaponElement = div.querySelector(".equipped-weapon");
                if(weaponElement && player.weapon){

                    weaponElement.onmouseenter = (event) => {
                        this.showCardTooltip(
                            player.weapon, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    weaponElement.onmousemove = (event) => {
                        this.showCardTooltip(
                            player.weapon, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    weaponElement.onmouseleave = () => {
                        this.hideCardTooltip();
                    };
                }
                // ผูก Event Tooltip ให้กับม้าที่สวมอยู่
                const mountElement = div.querySelector(".equipped-mount");
                if(mountElement && player.mount){

                    mountElement.onmouseenter = (event) => {
                        this.showCardTooltip(
                            player.mount, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    mountElement.onmousemove = (event) => {
                        this.showCardTooltip(
                            player.mount, 
                            event.clientX, 
                            event.clientY
                        );
                    };

                    mountElement.onmouseleave = (event) => {
                        this.hideCardTooltip();
                    };
                }
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
        // 
        const bumperHarvestPlayer = this.game.bumperHarvestPlayer;
        if(
            bumperHarvestPlayer && 
            bumperHarvestPlayer.controller.inputState === "waitingSelection"
        ){
            this.renderSelectionZone();
            return;
        }
        // ตรวจสอบว่าผู้เล่นอยู่ในสถานะรอเลือกการ์ด Yin Yang Discard หรือไม่
        if(player.controller.inputState === "waitingYinYangDiscard"){
            this.renderYinYangDiscardHand();
            return;
        }
        // รอเลือกการ์ดทิ้งจาก พักพลจัดทัพ
        if(player.controller.inputState === "waitingRestAndReorganizationDiscard"){
            this.renderRestAndReorganizationDiscardHand();
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
        // หากอยู่ในสถานะรอเลือกการ์ด Frost Sword ให้เรียก renderFrostSwordHand()
        if(player.controller.inputState === "waitingFrostSwordCard"){
            this.renderFrostSwordHand();
            return;
        }
        // ระหว่างรอ Trigger Choice ไม่ต้องแสดงปุ่มการ์ดปกติ
        if(player.controller.inputState === "waitingTriggerChoice"){
            return;
        }
        // ระหว่างรอเลือกเป้าหมายของ Active Skill ไม่ต้องแสดงไพ่ในมือ
        if(player.controller.inputState === "waitingSkillTarget"){
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
            // ระบบ Shift + Hover Tooltip
            button.onmouseenter = (event) => {

                this.tooltipHoverCard = card;
                this.tooltipMouseX = event.clientX;
                this.tooltipMouseY = event.clientY;

                if(this.tooltipShiftDown){

                    this.showCardTooltip(card, 
                        event.clientX, 
                        event.clientY
                    );
                }
            };

            button.onmousemove = (event) => {

                this.tooltipMouseX = event.clientX;
                this.tooltipMouseY = event.clientY;

                if(this.tooltipShiftDown){

                    this.showCardTooltip(card, 
                        event.clientX, 
                        event.clientY
                    );
                }
            };

            button.onmouseleave = () => {
                this.tooltipHoverCard = null;
                this.hideCardTooltip();
            };
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
            // แสดงลำดับการ์ดที่เลือกสำหรับ พักพลจัดทัพ
            if(player.controller.inputState === "waitingRestAndReorganizationDiscard"){
                const index = 
                    player.controller.selectedRestAndReorganizationCards.indexOf(card);
                if(index !== -1){
                    selectedOrder = index + 1;
                }
            }
            // Hand Limit Discard
            if(player.controller.inputState === "waitingHandLimitDiscard"){
                const index = 
                    player.controller.selectedHandLimitDiscardCards.indexOf(card);
                if(index !== -1){
                    selectedOrder = index + 1;
                }
            }
            // ตรวจสอบว่า Skill ปัจจุบันอนุญาตให้เลือกการ์ดใบนี้หรือไม่
            let skillCardAllowed = true;
            if(
                player.controller.inputState === "waitingSkillCard" && 
                player.controller.selectedSkill && 
                typeof player.controller.selectedSkill.canSelectSkillCard === "function"
            ){
                skillCardAllowed = player.controller.selectedSkill.canSelectSkillCard(
                    player, card, this.game
                );
                // ล็อกการ์ดที่ Skill ไม่อนุญาต
                if(!skillCardAllowed){
                    button.disabled = true;
                    button.classList.add("disabled-card");
                }
            }
            // ตรวจสอบเงื่อนไขการเลือก TriggerCard (เช่น เพลิงผลาญ)
            let triggerCardAllowed = true;

            if(
                player.controller.inputState === "waitingTriggerCard" && 
                player.controller.selectedTriggerSkill && 
                typeof player.controller.selectedTriggerSkill.canSelectTriggerCard === "function"
            ){
                triggerCardAllowed = player.controller.selectedTriggerSkill.canSelectTriggerCard(
                    player, card, player.controller.triggerContext
                );
                // ปิดใช้งานปุ่มถ้าเลือกไม่ได้
                if(!triggerCardAllowed){
                    button.disabled = true;
                    button.classList.add("disabled-card");
                }
            }

            if(selectedOrder !== null){
                button.textContent = 
                    "①②③④⑤".charAt(selectedOrder - 1) + 
                    " " + card.name;
                
                button.classList.add("selected-card");
            }
            //  กำหนด Event Handler เมื่อมีการคลิกที่ปุ่มการ์ดบนหน้า HTML
            button.onclick = () => {
                // ป้องกันการกดการ์ดที่ Skill ล็อกไว้
                if(!skillCardAllowed){
                    return;
                }
                if(!triggerCardAllowed){
                    return;
                }
                this.hideCardTooltip();
                // เรียกใช้อีเวนต์คลิกการ์ด โดยส่ง index ของการ์ดใบที่ถูกเลือกไปประมวลผล
                this.onCardClick(i);
            };
            // นำปุ่มการ์ดที่สร้างเสร็จแล้วไปแสดงในโซน handArea บนหน้าเว็บ
            this.handArea.appendChild(button);
        }
        if(player.controller.inputState === "waitingHandLimitDiscard"){
            this.renderHandLimitDiscard();
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
    // แสดงรายการการ์ด/อุปกรณ์จาก Zone ที่เลือก เพื่อให้ผู้เล่นคลิกขโมย
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
        // กรณีเลือกขโมยจาก "มือ" (แสดงไพ่คว่ำที่ handArea)
        if(controller.selectedStealSource === "hand"){
        // วนลูปสร้างปุ่มไพ่คว่ำตามจำนวนการ์ดบนมือของเป้าหมาย
            for(let i = 0; i < target.hand.cards.length; i++){
                // สร้าง Element ปุ่ม <button> ขึ้นมาใหม่
                const button = document.createElement("button");
                // กำหนดข้อความบนปุ่มเป็นไอคอนไพ่คว่ำ พร้อมหมายเลข
                button.textContent = "🂠 " + (i + 1);
                // กำหนด Event เมื่อกดคลิก ให้เรียกใช้เมธอด selectStealCard
                button.onclick = () => {
                    if(!controller.selectStealCard(i)){
                        return;
                    }
                    controller.confirmStealSelection();
                };
                // นำปุ่มที่สร้างไปแสดงผลในโซน handArea บนหน้าเว็บ
                this.handArea.appendChild(button);
            }
        }
        // กรณีเลือกขโมย "อาวุธ"
        if(controller.selectedStealSource === "weapon"){

            const button = document.createElement("button");
            button.textContent = "⚔️ " + 
                target.weapon.name + " " + 
                target.weapon.suit + " " + 
                target.weapon.number;
            button.onclick = () => {
                controller.selectStealCard(0);
                controller.confirmStealSelection();
            };
            this.controlArea.appendChild(button);
        }
        // กรณีเลือกขโมย "เกราะ"
        if(controller.selectedStealSource === "armor"){

            const button = document.createElement("button");
            button.textContent = "🛡️ " + 
                target.armor.name + " " + 
                target.armor.suit + " " + 
                target.armor.number;
            button.onclick = () => {
                controller.selectStealCard(0);
                controller.confirmStealSelection();
            };
            this.controlArea.appendChild(button);
        }
        // กรณีเลือกขโมย "ม้า"
        if(controller.selectedStealSource === "mount"){

            const button = document.createElement("button");
            button.textContent = "🐎 " + 
                target.mount.name + " " + 
                target.mount.suit + " " + 
                target.mount.number;
            button.onclick = () => {
                controller.selectStealCard(0);
                controller.confirmStealSelection();
            };
            this.controlArea.appendChild(button);
        }
        // กรณีเลือกขโมยจาก "Judgement Zone"
        if(controller.selectedStealSource === "judgement"){

            for(let i = 0; i < target.delayedTricks.length; i++){

                const card = target.delayedTricks[i];
                const button = document.createElement("button");
                button.textContent = "⚡ " + 
                    card.name + " " + 
                    card.suit + " " + 
                    card.number;
                button.onclick = () => {
                    controller.selectStealCard(i);
                    controller.confirmStealSelection();
                };
                this.controlArea.appendChild(button);
            }
        }
        // สร้างปุ่ม ย้อนกลับ
        const backButton = document.createElement("button");
        backButton.textContent = "↩️ ย้อนกลับ";
        backButton.onclick = () => {
            controller.startStealSourceSelection();
        };
        this.controlArea.appendChild(backButton);
    }
    // แสดงปุ่มเลือกตำแหน่ง (Zone) ที่จะขโมยการ์ดจากเป้าหมาย
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
        if(target.hand.cards.length > 0){
            const handButton = document.createElement("button");
            handButton.textContent = "🂠 มือ";
            handButton.onclick = () => {
                controller.selectStealSource("hand");
            };
            // แสดงปุ่ม "มือ" บน Control Area
            this.controlArea.appendChild(handButton);
        }
        // ตรวจสอบว่าเป้าหมายมีการใส่อาวุธอยู่หรือไม่ หากมีให้สร้างปุ่มขโมย "อาวุธ"
        if(target.weapon){
            const weaponButton = document.createElement("button");
            weaponButton.textContent = "⚔️ " + target.weapon.name;
            weaponButton.onclick = () => {
                controller.selectStealSource("weapon");
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
            };
            this.controlArea.appendChild(armorButton);
        }
        // ปุ่มขโมย "ม้า"
        if(target.mount){

            const mountButton = document.createElement("button");
            mountButton.textContent = "🐎 " + target.mount.name;
            mountButton.onclick = () => {
                controller.selectStealSource("mount");
            };
            this.controlArea.appendChild(mountButton);
        }
        // ปุ่มขโมยจาก "Judgement Zone"
        if(target.delayedTricks.length > 0){

            const judgementButton = document.createElement("button");
            judgementButton.textContent = "⚡ Judgement (" + 
                target.delayedTricks.length + ")";
            judgementButton.onclick = () => {
                controller.selectStealSource("judgement");
            };
            this.controlArea.appendChild(judgementButton);
        }
        // ปุ่ม "ไม่ขโมย" (ยกเลิกและล้าง State)
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "ไม่ขโมย";
        cancelButton.onclick = () => {
            controller.game.finishAction();
            controller.inputState = "idle";
            controller.selectedStealTarget = null;
            controller.selectedStealSource = null;
            controller.selectedStealCard = null;
            controller.selectedStealCardIndex = -1;
            controller.selectedCardIndex = -1;
            controller.game.ui.render();
        };
        this.controlArea.appendChild(cancelButton);
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
        // ปุ่มเลือกทำลายม้า
        if(target.mount){

            const mountButton = document.createElement("button");
            mountButton.textContent = "🐎 " + target.mount.name;
            mountButton.onclick = () => {
                controller.selectBurnSource("mount");
            };
            this.controlArea.appendChild(mountButton);
        }
        // ปุ่มเลือกทำลาย Judgement Zone
        if(target.delayedTricks.length > 0){

            const judgementButton = document.createElement("button");
            judgementButton.textContent = "⚡ Judgement (" + 
                target.delayedTricks.length + ")";
            judgementButton.onclick = () => {
                controller.selectBurnSource("judgement");
            };
            this.controlArea.appendChild(judgementButton);
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
        // กรณีเลือกทำลาย "ม้า"
        if(controller.selectedBurnSource === "mount"){

            const button = document.createElement("button");
            button.textContent = "🐎 " + 
                target.mount.name + " " + 
                target.mount.suit + " " + 
                target.mount.number;
            button.onclick = () => {
                controller.selectBurnCard(0);
                controller.confirmBurnSelection();
            };
            this.controlArea.appendChild(button);
        }
        // กรณีเลือกทำลาย "Judgement Zone"
        if(controller.selectedBurnSource === "judgement"){

            for(let i = 0; i < target.delayedTricks.length; i++){

                const card = target.delayedTricks[i];
                const button = document.createElement("button");
                button.textContent = "⚡ " + 
                    card.name + " " + 
                    card.suit + " " + 
                    card.number;
                button.onclick = () => {
                    controller.selectBurnCard(i);
                    controller.confirmBurnSelection();
                };
                this.controlArea.appendChild(button);
            }
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
        const player = this.game.bumperHarvestPlayer;
        //
        if(!player){
            return;
        }
        
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
        const controller = player.controller;
        // ระหว่าง Reaction ห้ามกด End Turn (ซ่อนปุ่มทันที)
        if(this.game.reactionManager && this.game.reactionManager.active){
            this.endTurnButton.style.display = "none";
            this.endTurnButton.disabled = true;
            return;
        }
        // ระหว่างเลือกเป้าหมายเพิ่ม ห้ามแสดง End Turn
        if(
            controller.inputState === "waitingAdditionalTargets"
        ){
            this.endTurnButton.style.display = "none";
            this.endTurnButton.disabled = true;
            return;
        }
        // ระหว่างเลือกเป้าหมายสกิล หรือ เลือกการ์ดสกิล ห้ามแสดง End Turn
        if(
            controller.inputState === "waitingSkillTarget" || 
            controller.inputState === "waitingSkillCard"
        ){
            this.endTurnButton.disabled = true;
            return;
        }
        // ตรวจสอบว่าผู้เล่นปัจจุบันเป็นมนุษย์ (HumanController) หรือไม่
        if (controller instanceof HumanController){
            // แสดงปุ่ม End Turn บนหน้าเว็บ
            this.endTurnButton.style.display = "inline-block";
            this.endTurnButton.disabled = this.game.actionLocked;
        }else{
            // ซ่อนปุ่ม End Turn ไม่ให้กดได้ระหว่างที่ AI เล่น
            this.endTurnButton.style.display = "none";
            this.endTurnButton.disabled = true;
        }
    }
    // สร้างข้อความ HTML แสดงผลอุปกรณ์ที่ผู้เล่นกำลังสวมใส่อยู่ (อาวุธ/เกราะ)
    renderEquipment(player){
        let text = "";
        // ตรวจสอบว่าผู้เล่นมีการสวมใส่อาวุธอยู่หรือไม่
        if(player.weapon){
            text += "<br>⚔️ : " + 
                "<span class=\"equipped-card equipped-weapon\">" + 
                player.weapon.name + " " +
                player.weapon.suit + " " +
                player.weapon.number + 
                "</span>";
        }else{
            text += "<br>⚔️ : ไม่มี";
        }
        // ตรวจสอบว่าผู้เล่นมีการสวมใส่เกราะอยู่หรือไม่
        if(player.armor){
            text += "<br>🛡️ : " + 
                "<span class=\"equipped-card equipped-armor\">" + 
                player.armor.name + " " + 
                player.armor.suit + " " + 
                player.armor.number + 
                "</span>";
        }else{
            text += "<br>🛡️ : ไม่มี";
        }
        //
        if(player.mount){
            text += "<br>🐎 : " + 
            "<span class=\"equipped-card equipped-mount\">" + 
            player.mount.name + " " + 
            player.mount.suit + " " + 
            player.mount.number + 
            "</span>";
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
            this.cardActionIndex = -1;
            controller.selectCard(index);
            return;
        }
        // --- กรณีการ์ด canRecast() === true ---
        this.cardActionIndex = index;
        // สร้างปุ่ม "เล่น" สำหรับการสั่งใช้การ์ดปกติ
        const playButton = document.createElement("button");
        playButton.textContent = "เล่น";
        playButton.onclick = () => {
            this.cardActionIndex = -1;
            controller.selectCard(index);
        };
        this.controlArea.appendChild(playButton);
        // สร้างปุ่ม "Recast" สำหรับการทิ้งไพ่เพื่อจั่วใบใหม่
        const recastButton = document.createElement("button");
        recastButton.textContent = "Recast";
        recastButton.onclick = () => {
            this.cardActionIndex = -1;
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
            const isCurrentSkill = 
                (
                    player.controller.inputState === "waitingSkillTarget" || 
                    player.controller.inputState === "waitingSkillCard"
                ) && 
                player.controller.selectedSkill === skill;
            button.disabled = this.game.actionLocked && !isCurrentSkill;
            button.textContent = "ใช้สกิล " + skill.name;
            // Tooltip สำหรับ Active Skill
            button.onmouseenter = (event) => {
                this.tooltipHoverSkill = skill;
                this.tooltipMouseX = event.clientX;
                this.tooltipMouseY = event.clientY;

                if(this.tooltipShiftDown){
                    this.showSkillTooltip(
                        skill,
                        event.clientX,
                        event.clientY
                    );
                }
            };

            button.onmousemove = (event) => {
                this.tooltipMouseX = event.clientX;
                this.tooltipMouseY = event.clientY;

                if(this.tooltipShiftDown){
                    this.showSkillTooltip(
                        skill,
                        event.clientX,
                        event.clientY
                    );
                }
            };

            button.onmouseleave = () => {
                this.tooltipHoverSkill = null;
                this.hideCardTooltip();
            };
            // เมื่อคลิกปุ่ม ให้สั่ง HumanController เริ่มกระบวนการเลือกเป้าหมายสกิล
            button.onclick = () => {
                // หากกำลังเลือกเป้าหมายของสกิลเดิมอยู่ แล้วกดปุ่มสกิลเดิมซ้ำ ให้ยกเลิกการเลือก (Toggle Off)
                if(
                    (
                        player.controller.inputState === "waitingSkillTarget" || 
                        player.controller.inputState === "waitingSkillCard"
                    ) && 
                    player.controller.selectedSkill === skill
                ){
                    player.controller.cancelSkillSelection();
                    return;
                }
                // หากยังไม่ได้เลือกสกิล ให้เริ่มกระบวนการเลือกเป้าหมายของสกิล
                player.controller.startSkillUse(skill);
            };
            // นำปุ่มไปใส่ไว้ในพื้นที่ควบคุม (controlArea) บน UI
            this.controlArea.appendChild(button);
        }
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
    // แสดงปุ่มตัดสินใจ Reaction สำหรับผู้เล่นที่กำลังถูกถาม
    renderReactionChoice(){

        const reactionManager = this.game.reactionManager;

        if(!reactionManager || !reactionManager.active){
            return;
        }
        // ดึงผู้เล่นที่มีสิทธิ์ตอบ Reaction ในลำดับปัจจุบัน
        const player = reactionManager.getCurrentResponder();

        if(!player){
            return;
        }

        const controller = player.controller;
        // ค้นหา Player Card ใน DOM ตาม index ของผู้เล่น
        const playerCard = document.querySelector(
            '.player-card[data-player-index="' + 
            this.game.players.indexOf(player) + '"]' 
        );

        if(!playerCard){
            return;
        }

        if(!(controller instanceof HumanController)){
            return;
        }

        if(controller.inputState !== "waitingReaction"){
            return;
        }
        // ปุ่ม "ใช้" Reaction
        const yesButton = document.createElement("button");
        yesButton.textContent = "ใช้";
        yesButton.onclick = (event) => {
            event.stopPropagation();
            controller.resolveReaction(true);
        };
        playerCard.appendChild(yesButton);
        // ปุ่ม "ไม่ใช้" Reaction
        const noButton = document.createElement("button");
        noButton.textContent = "ไม่ใช้";
        noButton.onclick = (event) => {
            event.stopPropagation();
            controller.resolveReaction(false);
        };
        playerCard.appendChild(noButton);

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
        // Skill แบบ Batch Selection
        if(
            controller.selectedSkill && 
            controller.selectedSkill.waitForCardSelectionConfirmation(player, this.game)
        ){
            // First Aid แสดงสถานะการเลือกไพ่สีแดง 1 ใบ
            if(title === "First Aid"){
                status.textContent = 
                title + 
                " | เลือกการ์ดสีแดง | เลือกแล้ว " + 
                selectedIndices.length + " / " + requiredCount;
            }else{
                status.textContent = 
                    title + 
                    " | เลือกการ์ด | เลือกแล้ว " + 
                    selectedIndices.length + " / " + requiredCount; 
            }
            this.controlArea.appendChild(status);
            
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "ยืนยัน";
            confirmButton.disabled = selectedIndices.length === 0;
            confirmButton.onclick = () => {
                controller.confirmSkillCardSelection();
            };
            this.controlArea.appendChild(confirmButton);
            return;
        }
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
        // แสดงข้อความคำแนะนำสำหรับ Wooden Cart
        if(controller.inputState === "waitingWoodenCartCard"){
            const target = controller.selectedWoodenCartTarget;
            if(target){
                message = "เลือกการ์ด 1 ใบเพื่อมอบให้ " + target.name;
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
        // Borrowed Sword - แจ้งให้ผู้เล่นเลือกเป้าหมายที่ 2
        if(controller.inputState === "waitingBorrowedSwordTarget"){
            message = "เลือกเป้าหมายที่จะโจมตี";
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
        // Yin-Yang Swords: ให้เป้าหมายเป็นผู้เลือกการ์ดเอง
        if(
            controller.inputState === "waitingYinYangDiscard" && 
            controller.yinYangContext && 
            controller.yinYangContext.target && 
            controller.yinYangContext.target.controller instanceof HumanController
        ){
            const targetController = controller.yinYangContext.target.controller;
            targetController.selectYinYangDiscard(index);
            return;
        }
        // ตรวจสอบว่าถ้าอยู่ในสถานะรอเลือกการ์ดสำหรับสกิล
        if(controller.inputState === "waitingSkillCard"){
            controller.selectSkillCard(index);
            return;
        }
        // ตรวจสอบว่าถ้าอยู่ในสถานะรอเลือกการ์ดสำหรับ Frost Sword
        if(controller.inputState === "waitingFrostSwordCard"){
            controller.selectFrostSwordCard("hand", index);
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
        // ตรวจสอบสถานะการเลือกการ์ดสำหรับ Wooden Cart
        if(controller.inputState === "waitingWoodenCartCard"){
            controller.selectWoodenCartCard(index);
            return;
        }
        // Hand Limit Discard
        if(controller.inputState === "waitingHandLimitDiscard"){
            controller.selectHandLimitDiscardCard(index);
            return;
        }
        // หากกดจบเทิร์น (index เป็น -1) ให้ส่งให้ Controller สั่งจบเทิร์น
        if(index === -1){
            controller.selectCard(index);
            return;
        }
        // ให้ Controller จัดการ Toggle ยกเลิก
        if(
            controller.inputState === "waitingTarget" && 
            controller.selectedCardIndex === index
        ){
            controller.selectCard(index);
            return;
        }
        // ถ้ากดการ์ดใบเดิมซ้ำขณะเปิดเมนูอยู่ ให้ยกเลิกและปิดเมนู
        if(this.cardActionIndex === index){
            console.log("ยกเลิกเมนูการ์ด:", 
                player.hand.cards[index] 
                ? player.hand.cards[index].name : "(ไม่พบการ์ด)"
            );

            this.cardActionIndex = -1;
            this.controlArea.innerHTML = "";
            this.game.ui.render();
            return;

        }
        // เปิดเมนู / เล่นการ์ด
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
        // เพิ่มการรับ Event เลือกเป้าหมายเพิ่มเติม
        if(controller.inputState === "waitingAdditionalTargets"){
            controller.selectAdditionalTarget(player);
            return;
        }
        // เลือกเป้าหมายที่ 2 สำหรับ Borrowed Sword
        if(controller.inputState === "waitingBorrowedSwordTarget"){
            controller.selectBorrowedSwordTarget(player);
            return;
        }
        // ตรวจสอบสถานะ waitingWoodenCartCard หากคลิกเลือกผู้เล่นอื่น ให้เปลี่ยนเป้าหมายรับการ์ดทันที
        if(controller.inputState === "waitingWoodenCartCard"){
            controller.selectWoodenCartTarget(player);
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
    // สร้าง DOM Element สำหรับ Character Tooltip
    createCharacterTooltip(){
        // ถ้าเคยสร้าง Tooltip ไว้แล้ว ให้ดึงอันเดิมมาใช้ซ้ำ (ไม่สร้าง DOM ซ้ำ)
        if(this.characterTooltip){
            return this.characterTooltip;
        }
        // สร้าง Element div ใหม่สำหรับเป็นกรอบ Tooltip ตัวละคร
        const tooltip = document.createElement("div");
        tooltip.className = "character-tooltip";
        document.body.appendChild(tooltip);
        this.characterTooltip = tooltip;
        return tooltip;
    }
    // สร้างเนื้อหาภายใน Character Tooltip สำหรับผู้เล่นที่กำหนด
    renderCharacterTooltipContent(player, tooltip){
        // ล้างข้อมูล DOM เก่าภายใน Tooltip ออกทั้งหมดก่อนเริ่มวาดใหม่
        tooltip.innerHTML = "";
        
        // Header ==================================================

        const header = document.createElement("div");
        header.className = "character-tooltip-header";
        // ชื่อตัวละคร
        const name = document.createElement("span");
        name.className = "character-tooltip-name";
        name.textContent = player.name;
        header.appendChild(name);
        // พลังชีวิตสูงสุด
        const hp = document.createElement("span");
        hp.className = "character-tooltip-hp";
        hp.textContent = "HP : " + "❤️".repeat(player.maxHp);
        header.appendChild(hp);
        tooltip.appendChild(header);

        const factionInfo = document.createElement("div");
        factionInfo.className = "character-tooltip-faction-info";

        const genderIcon = this.getGenderIcon(player.gender);
        const factionIcon = this.getFactionIcon(player.faction);

        factionInfo.innerHTML =
            "เพศ : " +
            genderIcon +
            "    " +
            "ฝ่าย : " +
            factionIcon;

        tooltip.appendChild(factionInfo);

        // Skill ======================================================

        const skillSection = document.createElement("div");
        skillSection.className = "character-tooltip-section";
        // หัวข้อเซกชัน "สกิล"
        const skillTitle = document.createElement("div");
        skillTitle.className = "character-tooltip-section-title";
        skillTitle.textContent = "สกิล";
        skillSection.appendChild(skillTitle);
        // ดึงอาร์เรย์สกิลจากเมธอด getSkills() หรืออ่านจากพร็อพเพอร์ตี้
        const skills = typeof player.getSkills === "function" 
            ? player.getSkills() 
            : (player.skills || []);
        // วนลูปสร้างรายการสกิลแต่ละรายการ
        for(const skill of skills){

            const item = document.createElement("div");
            item.className = "character-tooltip-skill";
            
            let skillType = "";
            if(skill instanceof PassiveSkill){
                skillType = " (PassiveSkill)";

            }else if(skill instanceof ActiveSkill){
                skillType = " (ActiveSkill)";

            }else if(skill instanceof TriggerSkill){
                skillType = " (TriggerSkill)";
            }
            item.textContent = "• " + skill.name + skillType;
            skillSection.appendChild(item);
        }
        // นำเซกชันสกิลไปต่อไว้ที่ Tooltip หลัก
        tooltip.appendChild(skillSection);

        // ความสามารถ ===================================================

        const abilitySection = document.createElement("div");
        abilitySection.className = "character-tooltip-ability";
        // หัวข้อเซกชัน "ความสามารถ"
        const abilityTitle = document.createElement("div");
        abilityTitle.className = "character-tooltip-section-title";
        abilityTitle.textContent = "ความสามารถ";
        abilitySection.appendChild(abilityTitle);
        // ข้อความอธิบายความสามารถตัวละคร
        const abilityText = document.createElement("div");
        abilityText.className = "character-tooltip-description";
        abilityText.textContent = player.abilityDescription || "";
        abilitySection.appendChild(abilityText);
        // นำเซกชันความสามารถไปต่อไว้ที่ Tooltip หลัก
        tooltip.appendChild(abilitySection);

        // ปุ่มปิด =========================================================

        const closeButton = document.createElement("button");
        closeButton.textContent = "ปิด";
        closeButton.className = "character-tooltip-close";
        closeButton.onclick = () => {
            this.hideCharacterTooltip();
        };
        // นำปุ่มปิดไปต่อไว้ที่ Tooltip หลัก
        tooltip.appendChild(closeButton);
    }
    // เปิดแสดงผล Character Tooltip ให้อยู่กึ่งกลางหน้าจอ
    showCharacterTooltip(player){
        // ดึงหรือสร้าง Element Tooltip ตัวละคร
        const tooltip = this.createCharacterTooltip();
        // วาดเนื้อหาข้อมูลตัวละครลงใน Tooltip
        this.renderCharacterTooltipContent(player, tooltip);
        // กำหนดสไตล์การจัดวางให้อยู่ตรงกลางหน้าจอ (Center Screen Popup)
        tooltip.style.display = "block";
        tooltip.style.position = "fixed";
        tooltip.style.left = "50%";
        tooltip.style.top = "50%";
        tooltip.style.transform = "translate(-50%, -50%)";
    }
    // ซ่อนหน้าต่าง Character Tooltip เมื่อผู้เล่นกดปุ่มปิด
    hideCharacterTooltip(){
        // ถ้ายังไม่ได้สร้างหรือไม่มี Character Tooltip ให้ข้ามการทำงาน
        if(!this.characterTooltip){
            return;
        }
        // ซ่อนหน้าต่าง Tooltip
        this.characterTooltip.style.display = "none";
    }
    // คืนค่าชื่อ Class CSS ตามประเภทของการ์ด เพื่อใช้แยกสี Tooltip
    getCardTypeClass(card){

        switch(card.type){
            case "Basic":
                return "card-type-basic";
            case "Trick":
                return "card-type-trick";
            case "DelayedTrick": 
                return "card-type-deleayed";
            case "Equipment":
                return "card-type-equipment";
            default:
                return "card-type-default";
        }
    }
    // สร้างเนื้อหาภายใน Skill Tooltip
    renderSkillTooltipContent(skill, tooltip){

        // ล้างข้อมูลเดิม
        tooltip.innerHTML = "";

        // ========================
        // ชื่อ Skill
        // ========================

        const title = document.createElement("div");

        title.className = "card-tooltip-title";
        title.textContent = skill.name;

        tooltip.appendChild(title);

        // ========================
        // ประเภท Skill
        // ========================

        const info = document.createElement("div");
        info.className = "card-tooltip-info";

        const typeLine = document.createElement("div");

        if(skill instanceof ActiveSkill){
            typeLine.textContent = "ประเภท: ActiveSkill";
        }else{
            typeLine.textContent = "ประเภท: Skill";
        }

        info.appendChild(typeLine);
        tooltip.appendChild(info);

        // ========================
        // ความสามารถ
        // ========================

        if(typeof skill.getDescription === "function"){

            const description = document.createElement("div");
            description.className = "card-tooltip-section";

            const descriptionTitle = document.createElement("div");
            descriptionTitle.className =
                "card-tooltip-section-title";

            descriptionTitle.textContent = "ความสามารถ";

            description.appendChild(descriptionTitle);

            const descriptionText = document.createElement("div");
            descriptionText.className =
                "card-tooltip-description";

            descriptionText.textContent =
                skill.getDescription();

            description.appendChild(descriptionText);

            tooltip.appendChild(description);
        }
    }
    // แยกส่วนสร้าง HTML Structure ของ Tooltip
    renderCardTooltipContent(card, tooltip){
        // ล้างข้อมูลเดิม 
        tooltip.innerHTML = "";

        // ========================
        // ชื่อการ์ด
        // ========================

        const title = document.createElement("div");

        title.className = "card-tooltip-title";
        title.textContent = card.name;

        tooltip.appendChild(title);

        // ========================
        // ข้อมูลพื้นฐาน
        // ========================

        const info = document.createElement("div");
        info.className = "card-tooltip-info";

        const typeLine = document.createElement("div");
        typeLine.className = 
            "card-tooltip-type " + this.getCardTypeClass(card);
        typeLine.textContent = "ประเภท: " + card.type;
        info.appendChild(typeLine);

        const cardNumber = document.createElement("div");
        cardNumber.textContent = card.suit + " " + card.number;
        info.appendChild(cardNumber);

        if(card.range !== undefined){
            
            const rangeLine = document.createElement("div");
            rangeLine.textContent = "ระยะ: " + card.range;
            info.appendChild(rangeLine);
        }
        tooltip.appendChild(info);

        // =========================
        // Skill
        // =========================

        if(card.skills && card.skills.length > 0){

            const skillSection = document.createElement("div");
            skillSection.className = "card-tooltip-section";

            const skillTitle = document.createElement("div");
            skillTitle.className = "card-tooltip-section-title";
            skillTitle.textContent = "สกิล";
            skillSection.appendChild(skillTitle);

            for(const skill of card.skills){
                const skillItem = document.createElement("div");
                skillItem.className = "card-tooltip-skill";
                skillItem.textContent = "• " + skill.name;
                skillSection.appendChild(skillItem);
            }
            tooltip.appendChild(skillSection);
        }

        // ===========================
        // ความสามารถ
        // ===========================

        if(typeof card.getDescription === "function"){

            const description = document.createElement("div");
            description.className = "card-tooltip-section";

            const descriptionTitle = document.createElement("div");
            descriptionTitle.className = "card-tooltip-section-title";
            descriptionTitle.textContent = "ความสามารถ";
            description.appendChild(descriptionTitle);

            const descriptionText = document.createElement("div");
            descriptionText.className = "card-tooltip-description";
            descriptionText.textContent = card.getDescription();
            description.appendChild(descriptionText);
            tooltip.appendChild(description);
        }

        // ===========================
        // Recast
        // ===========================

        if(
            typeof card.canRecast === "function" && 
            card.canRecast()
        ){
            const recast = document.createElement("div");
            recast.className = "card-tooltip-recast";
            recast.textContent = "🔄 Recast ได้";
            tooltip.appendChild(recast);
        }
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

        this.renderCardTooltipContent(card, tooltip);

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
    // แสดง Tooltip ของ Skill ณ ตำแหน่งเมาส์
    showSkillTooltip(skill, x, y){

        const tooltip = this.createCardTooltip();

        this.renderSkillTooltipContent(skill, tooltip);

        tooltip.style.display = "block";

        const offset = 15;

        let left = x + offset;
        let top = y + offset;

        const rect = tooltip.getBoundingClientRect();

        // ชนขอบขวา → ย้าย Tooltip ไปทางซ้ายของเมาส์
        if(left + rect.width > window.innerWidth){
            left = x - rect.width - offset;
        }

        // ชนขอบล่าง → ย้าย Tooltip ขึ้นด้านบนของเมาส์
        if(top + rect.height > window.innerHeight){
            top = y - rect.height - offset;
        }

        // กัน Tooltip เลยขอบซ้าย
        if(left < 0){
            left = 5;
        }

        // กัน Tooltip เลยขอบบน
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
    // แสดง UI สถานะเลือกเป้าหมายเพิ่ม
    renderAdditionalTargetSelection(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;

        if(controller.inputState !== "waitingAdditionalTargets"){
            return;
        }

        const status = document.createElement("div");
        status.textContent = 
            "ง้าวฟ้าทะลวง | เลือกเป้าหมายเพิ่ม " + 
            controller.selectedAdditionalTargets.length + " / " + 
            controller.additionalTargetLimit;
        this.controlArea.appendChild(status);
        // ปุ่มเสร็จสิ้น
        const button = document.createElement("button");
        button.textContent = "เสร็จสิ้น";
        button.onclick = () => {
            controller.finishAdditionalTargetSelection();
        };
        this.controlArea.appendChild(button);
    }
    // วาดปุ่มเลือกการ์ด/อุปกรณ์เพื่อทิ้งสำหรับสกิลกระบี่น้ำแข็ง
    renderFrostSwordHand(){
        
        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const selectedCards = controller.selectedFrostSwordCards;
        const target = controller.triggerContext.damage.target;
        const orderSymbols = ["①", "②"];

        // วาดปุ่มเลือกไพ่บนมือ (แสดงที่ handArea)
        for(let i = 0; i < target.hand.cards.length; i++){
            
            const card = target.hand.cards[i];
            const button = document.createElement("button");
            button.textContent = (i + 1) +  ". 🂠";
            
            const selectedIndex = selectedCards.findIndex(selected => 
                selected.source === "hand" && 
                selected.card === card
            );
            
            if(selectedIndex !== -1){
                button.textContent = orderSymbols[selectedIndex] + " 🂠";
                button.classList.add("selected-card");
            };
            if(selectedCards.length >= 2 && selectedIndex === -1){
                button.disabled = true;
            }
            button.onclick = () => {
                const success = controller.selectFrostSwordCard("hand", i);
                if(success){
                    this.game.ui.render();
                }
            };
            this.handArea.appendChild(button);
        }
        // รายการอุปกรณ์ (อาวุธ, เกราะ, ม้า)
        const equipment = [
            {
                source: "weapon", 
                card: target.weapon, 
                icon: "⚔️"
            },
            {
                source: "armor", 
                card: target.armor, 
                icon: "🛡️"
            },
            {
                source: "mount", 
                card: target.mount, 
                icon: "🐎"
            }
        ];
        // วาดปุ่มเลือกอุปกรณ์ (แสดงที่ controlArea)
        for(const item of equipment){

            if(!item.card){
                continue;
            }
            
            const button = document.createElement("button");
            button.textContent = item.icon + " " + item.card.name;
            
            const selectedIndex = selectedCards.findIndex(selected => 
                selected.source === item.source && 
                selected.card === item.card
            );
            
            if(selectedIndex !== -1){
                button.textContent = orderSymbols[selectedIndex] + " " + 
                    item.icon + " " + item.card.name;
                button.classList.add("selected-card");
            }
            
            if(selectedCards.length >= 2 && selectedIndex === -1){
                button.disabled = true;
            }
            button.onclick = () => {
                const success = controller.selectFrostSwordCard(item.source, -1);
                if(success){
                    this.game.ui.render();
                }
            };
            this.controlArea.appendChild(button);
        }
        // แสดงข้อความ Status ตามรูปแบบที่กำหนด
        const status = document.createElement("div");
        status.className = "status-message";
        status.textContent = "เลือกการ์ด 2 ใบ | เลือกแล้ว " + selectedCards.length + " / 2";
        this.controlArea.appendChild(status);
    }
    // icon gender
    getGenderIcon(gender){

        if(gender === "male"){
            return "♂️";
        }

        if(gender === "female"){
            return "♀️";
        }
        return "";
    }
    // icon faction
    getFactionIcon(faction){

        if(faction === "Shu"){
            return '<span class="faction-shu">[ "Shu" 蜀 ]</span>';
        }

        if(faction === "Wei"){
            return '<span class="faction-wei">[ "Wei" 魏 ]</span>';
        }

        if(faction === "Wu"){
            return '<span class="faction-wu">[ "Wu" 吴 ]</span>';
        }

        if(faction === "Qun"){
            return '<span class="faction-qun">[ "Qun" 群 ]</span>';
        }
        return "";
    }
    // วาดปุ่มไพ่คว่ำสำหรับให้เลือกทิ้งการ์ดเป้าหมาย (กระบี่คู่หยินหยาง)
    renderYinYangDiscardHand(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const context = controller.yinYangContext;
        if(!context){
            return;
        }

        const target = context.target;
        for(let i = 0; i < target.hand.cards.length; i++){

            const button = document.createElement("button");
            button.textContent = (i + 1) + ". 🂠 ";
            button.onclick = () => {
                controller.selectYinYangDiscard(i);
            };
            this.handArea.appendChild(button);
        }

        const status = document.createElement("div");
        status.textContent = target.name + " ต้องทิ้งการ์ด 1 ใบ";
        this.controlArea.appendChild(status);
    }
    // แสดงมือสำหรับเลือกทิ้งจาก พักพลจัดทัพ
    renderRestAndReorganizationDiscardHand(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;

        for(let i = 0; i < player.hand.cards.length; i++){

            const card = player.hand.cards[i];
            const button = document.createElement("button");
            const selectedIndex = controller.selectedRestAndReorganizationCards.indexOf(card);
            // แสดงลำดับการเลือกบนการ์ด
            if(selectedIndex !== -1){
                button.textContent = "①②".charAt(selectedIndex) + " " + card.name;
                button.classList.add("selected-card");

            }else{
                button.textContent = card.name;
            }
            button.onclick = () => {
                controller.selectRestAndReorganizationCard(i);
            };
            this.handArea.appendChild(button);
        }
        // แสดงสถานะการเลือก
        const status = document.createElement("div");
        status.textContent = "เลือกการ์ดที่จะทิ้ง 2 ใบ | เลือกแล้ว: " + 
            controller.selectedRestAndReorganizationCards.length + " / 2";
        this.controlArea.appendChild(status);
        // ปุ่มยืนยันการทิ้งการ์ด
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "ยืนยันการทิ้ง";
        confirmButton.disabled = controller.selectedRestAndReorganizationCards.length !== 2;
        confirmButton.onclick = () => {
            controller.confirmRestAndReorganizationDiscard();
        };
        this.controlArea.appendChild(confirmButton);
    }
    // แสดงมือสำหรับเลือกทิ้งจาก Hand Limit Discard
    renderHandLimitDiscard(){

        const player = this.game.getCurrentPlayer();
        const controller = player.controller;
        const requiredCount = player.hand.cards.length - player.hp;
        // แสดงสถานะการเลือก
        const status = document.createElement("div");
        status.textContent = 
            "ต้องทิ้ง " + requiredCount + " ใบ | เลือกแล้ว " + 
            controller.selectedHandLimitDiscardCards.length + 
            " / " + requiredCount;
        this.handArea.appendChild(status);
        // ปุ่มยืนยัน และ ยกเลิก
        const buttonArea = document.createElement("div");
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "ยืนยัน";
        // เปิดใช้งานเมื่อเลือกครบจำนวนที่ต้องทิ้ง
        confirmButton.disabled = 
            controller.selectedHandLimitDiscardCards.length !== requiredCount;
        // เมื่อกดยืนยัน ให้เรียก Controller
        confirmButton.onclick = () => {
            controller.confirmHandLimitDiscard();
        };

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "ยกเลิก";
        cancelButton.onclick = () => {
            controller.cancelHandLimitDiscard();
        };
        buttonArea.appendChild(confirmButton);
        buttonArea.appendChild(cancelButton);
        this.controlArea.appendChild(buttonArea);
    }
    // แสดง Generic Modal กลางหน้าจอ
    showModal(title, message = "", content = null, button = []){

        const overlay = document.getElementById("game-modal-overlay");
        const titleElement = document.getElementById("game-modal-title");
        const messageElement = document.getElementById("game-modal-message");
        const contentElement = document.getElementById("game-modal-content");
        const buttonsElement = document.getElementById("game-modal-buttons");

        if(
            !overlay || 
            !titleElement || 
            !messageElement || 
            !contentElement || 
            !buttonsElement
        ){
            return false;
        }

        titleElement.textContent = title;
        messageElement.textContent = message;
        contentElement.innerHTML = "";
        buttonsElement.innerHTML = "";

        if(content instanceof HTMLElement){
            contentElement.appendChild(content);
        }
        for(const buttonData of buttons){
            
            const button = document.createElement("button");
            button.textContent = buttonData.text;
            button.onclick = () => {
                if(typeof buttonData.onClick === "function"){
                    buttonData.onClick();
                }
            };
            buttonsElement.appendChild(button);
        }
        overlay.style.display = "flex";
        return true;
    }
    // ปิด Generic Modal กลางหน้าจอ
    hideModal(){

        const overlay = document.getElementById("game-modal-overlay");
        const contentElement = document.getElementById("game-modal-content");
        const buttonsElement = document.getElementById("game-modal-buttons");

        if(!overlay){
            return false;
        }
        overlay.style.display = "none";
        if(contentElement){
            contentElement.innerHTML = "";
        }
        if(buttonsElement){
            buttonsElement.innerHTML = "";
        }
        return true;
    }
    
}
