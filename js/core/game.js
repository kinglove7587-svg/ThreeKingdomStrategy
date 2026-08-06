class Game {
    constructor(playerNames){
        this.deck = new Deck(); // สร้าง deck ใหม่
        this.deck.shuffle(); // สั่งสับไพ่
        this.discardPile = new DiscardPile(); // สร้างกองทิ้งไพ่ไว้เก็บการ์ดที่ถูกใช้งานแล้ว
        this.eventManager = new EventManager(); // สร้าง EventManager เข้าไปเก็บไว้ เพื่อใช้เป็นศูนย์กลางส่ง Event ในเกม
        // สร้าง Listener สำหรับ Debug ดักจับ Event ความเสียหาย
        const debugListener = new DebugDamageListener();
        // ผูก Event "beforeDamage" และ "afterDamage" เข้ากับ EventManager ของเกม
        debugListener.register(this.eventManager);
        // สร้าง Instance ของ UIManager และส่งออบเจกต์ Game (this) เข้าไป เพื่อใช้เป็นตัวจัดการระบบแสดงผล (UI Engine) หลักของเกม
        this.ui = new UIManager(this); 
        this.players = []; // สร้าง array ไว้เก็บชื่อ ผู้เล่น
        // วนลูปอ่านข้อมูลผู้เล่นทีละคนจากอาร์เรย์ playerNames (ซึ่งเก็บเป็น Object { name, controller })
        for (const data of playerNames){
            // สร้าง Instance จากคลาสฮีโร่เฉพาะของแต่ละตัวละคร แล้วเพิ่มลงในอาร์เรย์ผู้เล่น
            this.players.push(
                new data.hero(
                    data.name,
                    this,
                    data.controller
                )
            );
        }
        // กำหนดคนเริ่มเล่นเป็นคนแรก (Index 0)
        this.currentPlayerIndex = 0; 
        // กำหนดค่าเริ่มต้นของตำแหน่งการ์ดที่ถูกเลือก ให้เป็น -1 (ยังไม่ได้เลือกการ์ดใดๆ)
        this.selectedCardIndex = -1;
        // กำหนดค่าเริ่มต้นของผู้เล่นเป้าหมาย ให้เป็น null (ยังไม่ได้เลือกเป้าหมาย)
        this.selectedTarget = null;
        this.chainDamageListener = new ChainDamageListener(); // สร้าง Listener สำหรับความเสียหายโซ่ตรวน
        this.chainDamageListener.register(this.eventManager); // ผูก chainDamageListener เข้ากับ EventManager
    }

    dealInitialCards(cardCount = 2){ // แจกไพ่ให้ผู้เล่น
        for (let i = 0; i < cardCount; i++){ // วนทำซ้ำตามจำนวนใบ
            for (const player of this.players){ // สั่งผู้เล่นในแต่ละรอบ
                player.drawCard(this.deck); // จั่วไพ่จากกองคนละ 1 ใบ
            }
        }
    }

    showAllHands(){ // แสดงไพ่ในมือ ผู้เล่น ทุกคน
        for (const player of this.players){ // วนลูป เอา ผู้เล่น ออกมาทีละคน
            player.showStatus(); // แสดง HP ก่อน
            player.showHand(); // แสดงไพ่ในมือผู้เล่น
        }
    }

    showDeck(){ // แสดงไพ่เหลือในกอง
        console.log("ไพ่ในกองที่เหลือ");
        console.table(this.deck.cards);
    }

    showDiscardPile(){ // แสดงรายการการ์ดทั้งหมดที่อยู่ในกองทิ้ง
        console.log("ไพ่ในกองทิ้ง");
        console.table(this.discardPile.cards); // พิมพ์ตารางไพ่ในกองทิ้งออกมาดู
    }
    // ให้ผู้เล่นปัจจุบันเล่น/ทิ้งการ์ดตามตำแหน่ง ลำดับ ที่เลือก
    playCardFromCurrentPlayer(cardIndex = 0){ 
        const player = this.getCurrentPlayer(); // ดึงผู้เล่นที่ถึงตาเล่นตอนนี้ออกมา
        const card = player.hand.removeCard(cardIndex); // ดึงการ์ดออกจากมือผู้เล่นตามตำแหน่ง cardIndex
        // ตรวจสอบว่าผู้เล่นไม่มีการ์ดใบที่เลือก (หาการ์ดไม่พบ)
        if (card === null){
            // ส่งข้อความแจ้งเตือนไป แสดงบน UI ของเกม
            this.ui.addLog(
                player.name + " ไม่มีการ์ดใบนี้"
            );
            return false;
        }
        //
        this.log(player.name + " ใช้ " + card.name);

        const success = card.use(player, this); // ใช้การ์ดว่าสำเร็จหรือไม่
        //
        if (!success){
            player.hand.addCard(card); // คืนการ์ดกลับเข้ามือ
            return false;
        }
        // เช็กว่าการ์ดใบนี้ควรถูกส่งลงกองทิ้งหรือไม่ (เช่น การ์ดทั่วไปส่งลงกองทิ้ง แต่การ์ดอุปกรณ์จะสวมใส่ไว้)
        if (card.shouldDiscard()){
            // นำการ์ดที่ใช้เสร็จแล้วไปใส่ในกองทิ้งไพ่ (discardPile)
            this.discardPile.addCard(card);
        }

        this.ui.render(); // แสดงสถานะเกม

        return true;
    }
    
    playCurrentPlayerTurn(cardIndex = 0){ // เล่น 1 เทิร์นแบบย่อ
        this.playCardFromCurrentPlayer(cardIndex); // ใช้ไพ่ที่เลือก
        this.discardPhase(
            this.getCurrentPlayer()
        );
    }

    getCurrentPlayer(){ // คืนผู้เล่นที่กำลังถึงตาอยู่ตอนนี้
        return this.players[this.currentPlayerIndex];
    }

    getNextPlayer(){ // คืนผู้เล่นคนถัดไป
        let index = this.currentPlayerIndex + 1; // คนถัดไป

        if (index >= this.players.length){ // ถ้าเกินคนสุดท้าย
            index = 0; // กลับมาคนแรก
        }

        return this.players[index]; // ส่งผู้เล่นในลำดับกลับ
    }
    // คืนผู้เล่นคนถัดไปโดยอ้างอิงจากผู้เล่นที่ส่งเข้ามา (player)
    getNextPlayerOf(player){
        // หาตำแหน่ง Index ของผู้เล่นในอาร์เรย์ this.players
        const index = this.players.indexOf(player);
        // ถ้าหาไม่เจอ ให้ส่งค่า null
        if (index === -1){
            return null;
        }
        // คำนวณ Index คนถัดไป (ใช้วนรอบกลับไป 0 เมื่อถึงคนสุดท้าย)
        const nextIndex = (index + 1) % this.players.length;
        // ส่งผู้เล่นคนถัดไปกลับออกไป
        return this.players[nextIndex];
    }
    // คืนค่าระยะห่างระหว่างผู้เล่น 2 คน บนโต๊ะแบบวงกลม
    getDistance(fromPlayer, toPlayer){
        // หาตำแหน่งของผู้เล่นต้นทางในอาร์เรย์ผู้เล่น
        const fromIndex = this.players.indexOf(fromPlayer);
        // หาตำแหน่งของผู้เล่นปลายทางในอาร์เรย์ผู้เล่น
        const toIndex = this.players.indexOf(toPlayer);
        // พิมพ์ตรวจสอบตำแหน่ง (Index) ของผู้เล่นทั้งสองฝั่งออกทาง Console
        console.log(fromPlayer.name, "=>", fromIndex, "|", toPlayer.name, "=>", toIndex);
        // ดึงจำนวนผู้เล่นทั้งหมดบนโต๊ะ
        const playerCount = this.players.length;
        // คำนวณระยะห่างตามทิศทางวนตามเข็มนาฬิกา
        const clockwise = Math.abs(fromIndex - toIndex);
        // คำนวณระยะห่างตามทิศทางวนทวนเข็มนาฬิกา
        const counterClockwise = playerCount - clockwise;
        // เลือกระยะห่างที่สั้นที่สุดระหว่างวนตามเข็มกับวนทวนเข็ม
        const distance = Math.min(clockwise, counterClockwise);
        // แสดงผลลัพธ์ระยะห่างที่คำนวณได้ออกทาง Console เพื่อตรวจสอบ
        console.log("Distance =", distance);
        // คืนค่าระยะห่างสั้นที่สุดกลับไปใช้งาน
        return distance;
    }

    startTurn(){ // เริ่ม ตา
        const player = this.getCurrentPlayer();
        this.ui.addLog("=============");
        this.ui.addLog(player.name + " Turn ");
        this.ui.addLog("=============");
        this.startPhase(player); // เริ่ม phase ต่างๆ
    }

    startPhase(player){ // เริ่มต้นเฟส
        // รีเซ็ตสถานะการใช้การ์ด "ฆ่า/ฟัน" (Slash) ให้ผู้เล่นกลับมาใช้ได้ใหม่ในเทิร์นนี้
        player.slashUsed = false;  
        // ส่งข้อความ "Start Phase" ไปบันทึกและแสดงในกล่อง Log บนหน้าเว็บ
        this.ui.addLog("Start Phase");
        // ส่ง Event "onTurnStart" เจาะจงไปยังผู้เล่นเป้าหมาย เพื่อกระตุ้นสกิลที่ทำงานช่วงเริ่มเทิร์น
        this.eventManager.emitToPlayer("onTurnStart", player);
        // ส่งต่อการทำงานไปยังช่วงเช็กดวง/คำนวณผล (Judge Phase) เป็นลำดับถัดไป
        this.judgePhase(player); // ส่งต่อเฟส
    }
    // ช่วงเสี่ยงทาย (Judge Phase) ของผู้เล่น
    judgePhase(player){ 
        this.ui.addLog("Judge Phase");
        // ประมวลผลการ์ดหน่วงเวลา (Delayed Trick) ทั้งหมดของผู้เล่น
        player.startJudgePhase();
        // ส่ง Event "onJudgePhase" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย player เพื่อเรียกใช้สกิลช่วง Judge Phase
        this.eventManager.emitToPlayer("onJudgePhase", player);
        // 
        this.drawPhase(player); // ส่งต่อเฟส
    }

    drawPhase(player){ // เฟสจั่วไพ่
        this.ui.addLog("Draw Phase");
        this.eventManager.emitToPlayer("onDrawPhase", player);
        player.drawCard(this.deck); // แสดงสถานะ
        this.ui.addLog(player.name + " จั่วการ์ด 1 ใบ");
        this.ui.render();
        this.playPhase(player); // ส่งต่เฟส
    }
    // เฟส Action ( Play Phase )
    playPhase(player){ 
        // เช็กสถานะข้าม Play Phase (เช่น ผลจากการ์ดสุราลืมกลับ)
        if (player.skipPlayPhase){
            this.ui.addLog(player.name + " ถูกสุราลืมกลับ ข้าม Play Phase");
            // รีเซ็ต Flag ให้มีผลแค่เทิร์นนี้
            player.resetPhaseFlag();
            // ข้ามไป Discard Phase ทันที
            this.discardPhase(player);
            return;
        }
        this.ui.addLog("Play Phase");
        // ส่ง Event "onPlayPhase" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วง Play Phase
        this.eventManager.emitToPlayer("onPlayPhase", player);
        // ใช้ Active Skill
        // กำหนดตัวแปร flag ไว้เช็กว่าในรอบลูปนั้นๆ มีการใช้สกิลเกิดขึ้นหรือไม่ (เริ่มต้นให้เป็น true เพื่อเข้าลูป)
        let usedSkill = true;
        // วนลูปทำงานตราบใดที่ยังมีการใช้สกิลสำเร็จอยู่ในรอบก่อนหน้า
        while (usedSkill) {
            // รีเซ็ตค่าเป็น false ในทุกๆ รอบลูปเริ่มต้น หากไม่มีสกิลไหนถูกใช้ในรอบนี้ ลูปจะจบลงทันที
            usedSkill = false;
            // วนลูปตรวจสอบเฉพาะ Active Skill ของผู้เล่น เช่น สกิล Rende ของเล่าปี่
            for (const skill of player.getActiveSkills()){
                // ถ้าสกิลนี้ไม่ผ่านเงื่อนไขการใช้งาน canUse เป็น false ให้ข้ามไปเช็กสกิลถัดไป
                if (!skill.canUse(player, this)){
                    continue;
                }
                // สั่งใช้งานสกิล และหากใช้งานสำเร็จ use คืนค่า true
                if (skill.use(player, this)){
                    usedSkill = true;
                    break;
                }
            }
        }
        // เช็กว่าผู้เล่นไม่มีการ์ดในมือเลยหรือไม่
        if (player.hand.cards.length === 0){
            this.discardPhase(player); // ถ้าไม่มีการ์ด ให้ข้ามไป Discard Phase ทันที
            return;
        }
        // สั่งให้ Controller เล่นเทิร์น และเก็บผลลัพธ์ความสำเร็จ (true/false)
        const success = player.controller.playTurn();
        // ตรวจสอบว่า Controller กำลังรอการตอบสนอง จากผู้เล่นอยู่หรือไม่ ถ้าใช่ให้หยุดรอ
        if (player.controller.isWaitingInput()){
            return;
        }
        // ถ้า game over ให้หยุด
        if (this.checkGameOver()){
            return;
        }
        // ถ้าเกมยังไม่จบ แต่ลงการ์ดไม่สำเร็จ
        if (!success){
            this.ui.addLog("ลงการ์ดไม่สำเร็จ");
        }
        // เมื่อใช้การ์ดเสร็จแล้ว (1 ใบ) ส่งต่อผู้เล่นไปยัง Discard Phase
        this.discardPhase(player);
    }

    discardPhase(player){ // เฟส ทิ้งไพ่
        this.ui.addLog("Discard Phase");
        // ส่ง Event "onDiscardPhase" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วงทิ้งไพ่
        this.eventManager.emitToPlayer("onDiscardPhase", player);
        this.endPhase(player);
    }

    endPhase(player){ // เฟส จบ เทิร์น
        this.ui.addLog("End Phase");
        // ส่ง Event "onTurnEnd" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วงสิ้นสุดเทิร์น
        this.eventManager.emitToPlayer("onTurnEnd", player);
        this.nextTurn(); 
    }

    nextTurn(){ // เปลี่ยน ตา
        if(this.deck.cards.length === 0){
            this.ui.addLog("ไพ่หมด");
            return;
        }

        this.currentPlayerIndex++; // ถ้าถึงคนสุดท้ายแล้ว ให้เวียนกลับไปหาผู้เล่นคนแรก

        if (this.currentPlayerIndex >= this.players.length){
            this.currentPlayerIndex = 0;
        }
        this.startTurn();
    }

    start(){ // เริ่มเกม
        this.dealInitialCards(); // แจกไพ่
        this.ui.render(); // แสดงไพ่ในมือ
        this.startTurn(); // เริ่ม ตา แรก
    }

    showGameState(){ // แสดงสถานะเกมทั้งหมด
        this.showDiscardPile(); // แสดงกองทิ้ง
        this.ui.render(); // แสดงกองจั่ว
    }
    // ประกาศเมธอด log() เพื่อให้ส่วนอื่นส่งข้อความมาเพิ่มลงใน Log บน UI ได้ง่ายขึ้น
    log(message){
        console.log(message);
        this.ui.addLog(message);
    }
    checkGameOver(){ // เช็กเกม over
        for (const player of this.players){ // วนดูผู้เล่นทุกคน
            // ถ้าใคร hp เหลือ 0 แสดง Game Over
            if (player.hp <= 0){ 
                this.ui.addLog(player.name + " แพ้แล้ว");
                this.ui.addLog("Game Over");
                return true;
            }
        }
        // ถ้ายังไม่มีใครตาย เกมดำเนินต่อ
        return false;
    }
    // ประมวลผลความเสียหายพร้อมส่งแจ้งเตือน Event ก่อนและหลังเกิดความเสียหาย
    damage(damage){
        // ส่ง Event แจ้งเตือนก่อนเกิดความเสียหาย เพื่อเปิดโอกาสให้เกราะหรือสกิลเข้ามาแก้ไขค่า Damage หรือยกเลิกได้
        this.eventManager.emit("beforeDamage", damage);
        // หากความเสียหายถูกยกเลิก ให้ลง Log และจบการทำงานทันที
        if (damage.canceled){
            this.log("ความเสียหายถูกยกเลิก");
            return;
        }
        // ตรวจสอบ source หากไม่มีผู้สร้างความเสียหาย (เช่น สายฟ้า) ให้ใช้ชื่อ "สายฟ้า" แทน เพื่อป้องกัน Error
        const sourceName = damage.source ? damage.source.name : "สายฟ้า";
        // กำหนดชื่อประเภทความเสียหายภาษาไทย
        let damageName = "";
        // แปลงประเภท Damage เป็นข้อความ
        switch(damage.type){
            case DamageType.FIRE: damageName = "ไฟ";
            break;
            case DamageType.THUNDER: damageName = "สายฟ้า";
            break;
            default: damageName = "ปกติ";
        }
        // แสดง Log ผลความเสียหาย
        this.log(sourceName + " ทำความเสียหาย " + damageName + " " +
            damage.amount +  " ให้ " + damage.target.name
        );
        // เช็กว่ามีความเสียหายที่เกิดจากการ์ดหรือไม่ ถ้ามีให้แสดงชื่อการ์ดที่เป็นต้นเหตุ
        if (damage.card){
            console.log("Damage Card :", damage.card.name);
        }
        // ลด HP ของเป้าหมายตามจำนวนความเสียหายที่กำหนดในออบเจกต์ Damage
        damage.target.loseHp(damage.amount);
        // ส่ง Event แจ้งเตือนหลังเกิดความเสียหาย เพื่อเปิดโอกาสให้สกิลที่ทำงานหลังโดนดาเมจ (เช่น สกิลดูดเลือด/โต้กลับ) ทำงาน
        this.eventManager.emit("afterDamage", damage);
    }
    // ระบบกลางสำหรับการเสี่ยงทาย (Judge Phase)
    judge(player){
        // จั่วการ์ดใบบนสุดจากกองเพื่อใช้เสี่ยงทาย
        const judgeCard = this.deck.draw();
        // ถ้ากองไพ่หมด ให้คืนค่า false
        if (!judgeCard){
            return false;
        }
        this.log("Judge : " + judgeCard.suit + " " + judgeCard.number);
        // ส่งการ์ดเสี่ยงทายลงกองทิ้ง
        this.discardPile.addCard(judgeCard);
        // แสดงรายการไพ่ในกองทิ้ง
        this.showDiscardPile();
        // คืนค่าออบเจกต์ JudgeResult เพื่อนำไปเช็กผลลัพธ์ต่อ
        return new JudgeResult(judgeCard);
    }
    // เมธอดสำหรับจบเทิร์น และส่งต่อผู้เล่นปัจจุบันเข้าสู่เฟสทิ้งการ์ด
    finishTurn(){
        // ดึงผู้เล่นปัจจุบันที่กำลังเล่นเทิร์นอยู่ออกมา
        const player = this.getCurrentPlayer();
        // ส่งผู้เล่นเข้าสู่เฟสทิ้งการ์ด (Discard Phase)
        this.discardPhase(player);
    }
    // จัดการผลลัพธ์หลังผู้เล่นมนุษย์ทำ Action (ลงการ์ด)
    afterHumanAction(success){
        // ถ้าเกมจบแล้ว ให้หยุดการทำงานทันที
        if (this.checkGameOver()){
            return;
        }
        // ตรวจสอบว่าเล่นการ์ดสำเร็จหรือไม่ เพื่อแสดงข้อความแจ้งเตือนที่ถูกต้องบน Log
        if (success){
            this.ui.addLog("เลือกการ์ดต่อ หรือกด End Turn");
        }else{
            this.ui.addLog("ลงการ์ดไม่สำเร็จ");
        }
        // ล้างข้อมูลการเลือกหลังประมวลผลเสร็จ
        this.clearSelectedCard();
        this.clearSelectedTarget();
        // อัปเดตหน้าจอ
        this.ui.render();
    }
    // ล้างค่าตำแหน่งการ์ดที่เลือก ให้กลับเป็นค่าเริ่มต้น (-1)
    clearSelectedCard(){
        this.selectedCardIndex = -1;
    }
    // บันทึกตัวละครผู้เล่นเป้าหมายที่ถูกเลือกเก็บไว้ใน Game State
    selectTarget(player){
        this.selectedTarget = player;
    }
    // ล้างค่าผู้เล่นเป้าหมายที่เลือก ให้กลับเป็นค่าเริ่มต้น (null)
    clearSelectedTarget(){
        this.selectedTarget = null;
    }
    // ดึงข้อมูลผู้เล่นเป้าหมายที่ถูกเลือกอยู่ในปัจจุบัน
    getSelectedTarget(){
        return this.selectedTarget;
    }
    // ประมวลผลการ Recast (หลอมไพ่ใหม่): ทิ้งการ์ดลงกองทิ้ง แล้วให้ผู้เล่นจั่วไพ่ใหม่ 1 ใบ
    recast(player, card){
        this.log(player.name + " Recast " + card.name + "  แล้วจั่ว 1 ใบ");
        // นำการ์ดส่งลงกองทิ้ง (discardPile)
        this.discardPile.addCard(card);
        // ให้ผู้เล่นจั่วการ์ดใหม่ขึ้นมือ 1 ใบ
        player.drawCard(this.deck);
    }
    // ประมวลผลเริ่มต้นการดวลเดี่ยว (Duel Engine)
    duel(attacker, defender){
        this.log(attacker.name + " เริ่ม Duel กับ " + defender.name);
        // กำหนดให้ฝ่ายป้องกัน (Defender) ต้องเป็นฝ่ายทิ้งการ์ด "ฆ่า" ก่อน
        let current = defender;
        let opponent = attacker;
        // วนลูปสลับกันทิ้งการ์ด "ฆ่า" ไปเรื่อยๆ จนกว่าจะมีฝ่ายใดฝ่ายหนึ่งไม่มีการ์ด
        while(true){
            // ถามหาและบังคับใช้การ์ด "ฆ่า" จากฝ่าย current
            const success = this.askSlash(current);
            // หากฝ่าย current ไม่มีการ์ด "ฆ่า" ให้รับความเสียหายและจบการดวลทันที
            if(!success){
                // สร้างความเสียหาย 1 หน่วย โดยมี opponent เป็นผู้สร้างความเสียหายให้ current
                const damage = new Damage(opponent, current, 1);
                // ประมวลผลสร้างความเสียหายใส่ระบบ
                this.damage(damage);
                break;
            }
            // สลับบทบาทผู้เล่นสำหรับรอบถัดไป
            const temp = current;
            current = opponent;
            opponent= temp;
        }
    }
    // ตรวจสอบและบังคับใช้การ์ด "ฆ่า" ในมือของผู้เล่น
    askSlash(player){
        // ส่งคำร้องขอเลือกการ์ด "ฆ่า" ไปยัง Controller ของผู้เล่น
        const index = player.controller.askSlash(player, this);
        // หากผู้เล่นไม่มีการ์ด "ฆ่า" บนมือ
        if(index === -1){
            this.log(player.name + " ไม่มี ฆ่า");
            return false;
        }
        // ดึงการ์ด "ฆ่า" ออกจากมือตามตำแหน่งที่พบ
        const slash = player.hand.removeCard(index);
        // นำการ์ด "ฆ่า" ลงกองทิ้ง (Discard Pile) พร้อมบันทึก Log
        this.discardPile.addCard(slash);
        this.log(player.name + " ใช้ฆ่า");
        // อัปเดตหน้าจอ UI ใหม่ทันทีหลังการ์ดถูกทิ้ง
        this.ui.render();
        return true;
    }
}
