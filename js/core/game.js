class Game {
    constructor(playerNames){
        this.deck = new Deck(); // สร้าง deck ใหม่
        this.deck.shuffle(); // สั่งสับไพ่
        this.discardPile = new DiscardPile(); // สร้างกองทิ้งไพ่ไว้เก็บการ์ดที่ถูกใช้งานแล้ว
        this.selectionZone = new SelectionZone(); // ระบบโซนกลางสำหรับจัดการการเลือกการ์ดร่วมกันหลายคน
        this.eventManager = new EventManager(this); // สร้าง EventManager เข้าไปเก็บไว้ เพื่อใช้เป็นศูนย์กลางส่ง Event ในเกม
        this.reactionManager = new ReactionManager(this);
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
        this.bumperHarvestPlayer = null;
        this.selectedTarget = null; // กำหนดค่าเริ่มต้นของผู้เล่นเป้าหมาย ให้เป็น null
        this.chainDamageListener = new ChainDamageListener(); // สร้าง Listener สำหรับความเสียหายโซ่ตรวน
        this.chainDamageListener.register(this.eventManager); // ผูก chainDamageListener เข้ากับ EventManager
        // ใช้ตรวจว่า Action ปัจจุบันยังดำเนินอยู่หรือไม่
        this.actionLocked = false;
        this.isGameOver = false;
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
    playCardFromCurrentPlayer(cardIndex = 0, target = null){ 
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

        const success = card.use(player, this, target); // ใช้การ์ดว่าสำเร็จหรือไม่
        //
        if (!success){
            player.hand.addCard(card); // คืนการ์ดกลับเข้ามือ
            return false;
        }
        // 
        if(card.shouldDiscard() && !card.treacheryClaimed){
            this.discardPile.addCard(card);
        }

        this.ui.render(); // แสดงสถานะเกม

        return true;
    }
    // ตรวจสอบความถูกต้องของการ์ดที่เลือกก่อนเข้าสู่กระบวนการ Recast
    recastCard(cardIndex = 0){
        // ดึงออบเจกต์ผู้เล่นที่กำลังถึงตาเล่นในปัจจุบัน
        const player = this.getCurrentPlayer();
        // ดึงข้อมูลการ์ดจากมือผู้เล่นตามตำแหน่ง cardIndex
        const card = player.hand.cards[cardIndex];
        // ตรวจสอบว่ามี Card ในตำแหน่งที่เลือกหรือไม่
        if(!card){
            this.log(player.name + " ไม่มีการ์ดใบนี้");
            return false;
        }
        // ตรวจสอบว่า Card ใบนี้สามารถ Recast ได้หรือไม่
        if(!card.canRecast()){
            this.log(card.name + " ไม่สามารถ Recast ได้");
            return false;
        }
        // จั่วการ์ดใหม่ก่อนนำการ์ดเดิมลงกองทิ้ง
        const newCard = this.drawCardFromDeck();
        if(newCard === null){
            this.log("ไพ่หมดทั้งกองจั่วและกองทิ้ง ไม่สามารถ Recast ได้");
            return false;
        }
        // นำ Card ที่ต้องการ Recast ออกจากมือผู้เล่น
        const cardToRecast = player.hand.removeCard(cardIndex);
        if(!cardToRecast){
            player.hand.addCard(newCard);
            return false;
        }
        // นำการ์ดเดิมลงกองทิ้ง
        this.discardPile.addCard(cardToRecast);
        // นำ Card ใบใหม่ใส่เพิ่มเข้ามือผู้เล่น
        player.hand.addCard(newCard);
        this.ui.render();
        this.log(player.name + " Recast " + cardToRecast.name + " ได้ " + newCard.name);
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
    // คืนค่าระยะห่างระหว่างผู้เล่น 2 คน บนโต๊ะแบบวงกลม โดยคำนวณรวมกับค่าปรับระยะของ Mount (ม้า)
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
        // ระยะห่างพื้นฐานบนโต๊ะ (เลือกเส้นทางที่สั้นที่สุด)
        const distance = Math.min(clockwise, counterClockwise);

        console.log("Base Distance =", distance);

        return distance;
    }

    startTurn(){ // เริ่ม ตา
        // ถ้าเกมจบแล้ว ห้ามเริ่มเทิร์น
        if(this.isGameOver){
            return;
        }
        const player = this.getCurrentPlayer();
        
        this.ui.addLog("=============");
        this.ui.addLog(player.name + " Turn ");
        this.ui.addLog("=============");
        this.startPhase(player); // เริ่ม phase ต่างๆ
    }
    // ประมวลผลช่วงเริ่มเทิร์น (Start Phase)
    startPhase(player){ 
        // รีเซ็ตสถานะการใช้การ์ด "โจมตี/ฟัน" (Slash) ให้ผู้เล่นกลับมาใช้ได้ใหม่ในเทิร์นนี้
        player.slashUsed = false;
        player.woodenCartUsed = false;
        // ส่งข้อความ "Start Phase" ไปบันทึกและแสดงในกล่อง Log บนหน้าเว็บ
        this.ui.addLog("Start Phase");
        // ส่ง Event "onTurnStart" เจาะจงไปยังผู้เล่นเป้าหมาย เพื่อกระตุ้นสกิลที่ทำงานช่วงเริ่มเทิร์น
        this.eventManager.emitToPlayer("onTurnStart", player);
        // เรียก lifecycle onTurnStart ของทุกสกิลที่ผู้เล่นมี
        for(const skill of player.skills){
            skill.onTurnStart(player, this);
        }
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
        player.showHand();
    }
    // เฟสจั่วไพ่ (Draw Phase)
    drawPhase(player){ 
        this.ui.addLog("Draw Phase");
        // ตรวจสอบ Flag ว่าผู้เล่นต้องข้ามเฟสจั่วการ์ดหรือไม่
        if(player.skipDrawPhase){
            this.log(player.name + " ข้าม Draw Phase");
            // รีเซ็ต Flag กลับเป็น false เพื่อให้เทิร์นถัดไปจั่วได้ตามปกติ
            player.skipDrawPhase = false;
            this.ui.render();
            // ส่งต่อไปยังเฟสเล่นการ์ด (Play Phase) ทันที
            this.playPhase(player);
            return;
        }
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
        //
        if(!player.controller.isHuman()){
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
        // Hand Limit สำหรับ AI
        if(
            !player.controller.isHuman() && 
            player.hand.cards.length > player.hp
        ){
            player.controller.discardHandLimit();
        }
        this.endPhase(player);
    }

    endPhase(player){ // เฟส จบ เทิร์น
        this.ui.addLog("End Phase");
        // ส่ง Event "onTurnEnd" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วงสิ้นสุดเทิร์น
        this.eventManager.emitToPlayer("onTurnEnd", player);
        if(player.isDying()){
            player.dead();
            this.removeDeadPlayer(player);
            if(this.checkGameOver()){
                return;
            }
        }
        this.nextTurn(); 
    }

    nextTurn(){ // เปลี่ยน ตา
        // ถ้าเกมจบแล้ว ห้ามเริ่มเทิร์นใหม่
        if(this.isGameOver){
            return;
        }
        
        if(this.players.length <= 1){
            this.checkGameOver();
            true;
        }
        this.currentPlayerIndex++;
        if(this.currentPlayerIndex >= this.players.length){
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
    // ตรวจสอบว่ามีผู้เล่นเสียชีวิตเพื่อจบเกมหรือไม่
    checkGameOver(){ 

        if(livingPlayers.length <= 1){
            this.gameOver();
            return true;
        }
        return false;
    }
    // แสดงข้อความประกาศจบเกม
    gameOver(){
        //
        if(this.isGameOver){
            return;
        }
        //
        this.isGameOver = true;
        this.ui.addLog("Game Over");
        this.ui.render();
    }
    // ประมวลผลความเสียหายพร้อมส่งแจ้งเตือน Event ก่อนและหลังเกิดความเสียหาย
    damage(damage){
        // สร้างฟังก์ชัน resume สำหรับประมวลผลความเสียหายต่อเมื่อพ้นช่วง Trigger
        damage.resume = () => {
            if(damage.canceled){
                this.log("ความเสียหายถูกยกเลิก");
                return;
            }
            // ตรวจสอบ source หากไม่มีผู้สร้างความเสียหาย
            const sourceName = damage.source ? damage.source.name : "สายฟ้า";
            // กำหนดชื่อประเภทความเสียหายภาษาไทย
            let damageName = "";
            // แปลงประเภท Damage เป็นข้อความ
            switch(damage.type){
                case DamageType.FIRE:
                    damageName = "ไฟ";
                    break;
                case DamageType.THUNDER:
                    damageName = "สายฟ้า";
                    break;
                default:
                    damageName = "ปกติ";
            }
            this.log(sourceName + " ทำความเสียหาย " + damageName + " " + 
                damage.amount + " ให้ " + damage.target.name
            );
            // เช็กว่ามีความเสียหายที่เกิดจากการ์ดหรือไม่
            if(damage.card){
                console.log("Damage Card :", damage.card.name);
                
            }
            // ลด HP ของเป้าหมายตามจำนวนความเสียหาย
            damage.target.loseHp(damage.amount);
            // ตรวจสอบสถานะใกล้ตาย
            if(damage.target.isDying()){
                this.enterDying(damage.target);
            }
            // ส่ง Event หลังเกิด Damage
            this.eventManager.emit("afterDamage", damage);
        }
        // ส่ง Event ก่อนเกิด Damage
        this.eventManager.emit("beforeDamage", damage);
        // หยุดการทำงานชั่วคราวหากมี Trigger Skill
        if(damage.waitingTrigger){
            return true;
        }
        return damage.resume();
    }
    // ระบบกลางสำหรับการเสี่ยงทาย (Judge Phase)
    judge(player){
        // จั่วการ์ดใบบนสุดจากกองเพื่อใช้เสี่ยงทาย
        const judgeCard = this.deck.draw();
        // ถ้ากองไพ่หมด ให้คืนค่า false
        if (!judgeCard){
            return null;
        }
        this.log(
            player.name + " Judge : " +
            judgeCard.name + " " +
            judgeCard.suit + " " +
            judgeCard.number
        );
        // ส่งการ์ดเสี่ยงทายลงกองทิ้ง
        this.discardPile.addCard(judgeCard);
        // แสดงรายการไพ่ในกองทิ้ง
        this.showDiscardPile();
        // คืนค่าออบเจกต์ JudgeResult เพื่อนำไปเช็กผลลัพธ์ต่อ
        return new JudgeResult(judgeCard);
    }
    // เมธอดสำหรับจบเทิร์น และส่งต่อผู้เล่นปัจจุบันเข้าสู่เฟสทิ้งการ์ด
    finishTurn(){
        // ห้ามจบเทิร์นถ้า Action ปัจจุบันยังไม่จบ
        if(this.actionLocked){
            return false;
        }
        // ดึงผู้เล่นปัจจุบันที่กำลังเล่นเทิร์นอยู่ออกมา
        const player = this.getCurrentPlayer();
        const controller = player.controller;
        // ตรวจจำนวนการ์ดในมือก่อนจบเทิร์น (Hand Limit Check)
        if(player.hand.cards.length > player.hp){
            controller.selectedHandLimitDiscardCards = [];
            controller.inputState = "waitingHandLimitDiscard";
            this.actionLocked = true;
            this.ui.render();
            return false;
        }
        // ส่งผู้เล่นเข้าสู่เฟสทิ้งการ์ด (Discard Phase)
        this.discardPhase(player);
        return true;
    }
    // จัดการผลลัพธ์หลังผู้เล่นมนุษย์ทำ Action (ลงการ์ด)
    afterHumanAction(success){
        // Action จบแล้ว ปลดล็อก End Turn
        this.finishAction();
        // ถ้าเกมจบแล้ว ให้หยุดการทำงานทันที
        if (this.checkGameOver()){
            return;
        }
        // ตรวจสอบว่าเล่นการ์ดสำเร็จหรือไม่ เพื่อแสดงข้อความแจ้งเตือนที่ถูกต้องบน Log
        if (success){
            this.ui.addLog("เลือกการ์ดต่อ หรือกด End Turn");
        }else{
            this.ui.addLog("ลงการ์ดไม่สำเร็จ");
            this.ui.addLog("เลือกการ์ดต่อ หรือกด End Turn");
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
    // เมธอด Recast การ์ด (เปลี่ยนการ์ดใบที่ไม่ใช้เป็นจั่วการ์ดใหม่ 1 ใบ)
    recast(player, card){
        // ตรวจสอบว่ามีผู้เล่นและการ์ดส่งมาจริงหรือไม่
        if(!player || !card){
            return false;
        }
        // ตรวจสอบว่าการ์ดใบนี้สามารถ Recast ได้หรือไม่
        if(!card.canRecast()){
            return false;
        }
        // หาตำแหน่ง Index ของการ์ดใบนี้ในมือผู้เล่น
        const cardIndex = player.hand.cards.indexOf(card);
        if(cardIndex === -1){
            return false;
        }
        // นำการ์ดออกจากมือ แล้วนำลงกองทิ้ง
        player.hand.removeCard(cardIndex);
        this.discardPile.addCard(card);
        // ให้ผู้เล่นจั่วการ์ดใหม่ 1 ใบ พร้อมบันทึก Log
        player.drawCard(this.deck);
        this.log(player.name + " Recast " + card.name + " แล้วจั่ว 1 ใบ");
        return true;
    }
    // ประมวลผลเริ่มต้นการดวลเดี่ยว (Duel Engine)
    duel(attacker, defender){
        this.log(attacker.name + " เริ่ม Duel กับ " + defender.name);
        // กำหนดให้ฝ่ายป้องกัน (Defender) ต้องเป็นฝ่ายทิ้งการ์ด "โจมตี" ก่อน
        let current = defender;
        let opponent = attacker;
        // วนลูปสลับกันทิ้งการ์ด "โจมตี" ไปเรื่อยๆ จนกว่าจะมีฝ่ายใดฝ่ายหนึ่งไม่มีการ์ด
        while(true){
            this.log(current.name + " ต้องใช้ โจมตี");
            // ถามหาและบังคับใช้การ์ด "โจมตี" จากฝ่าย current
            const success = this.askSlash(current);
            // หากฝ่าย current ไม่มีการ์ด "โจมตี" ให้รับความเสียหายและจบการดวลทันที
            if(!success){
                // สร้างความเสียหาย 1 หน่วย โดยมี opponent เป็นผู้สร้างความเสียหายให้ current
                const damage = new Damage(opponent, current, 1);
                // ประมวลผลสร้างความเสียหายใส่ระบบ
                this.damage(damage);
                break;
            }
            // สลับบทบาทผู้เล่นสำหรับรอบถัดไปผ่าน Helper Function
            const players = this.swapPlayers(current, opponent);
            // อัปเดตผู้เล่นปัจจุบันและฝ่ายตรงข้ามใหม่หลังสลับสิทธิ์
            current = players.current;
            opponent = players.opponent;
        }
    }
    // สลับบทบาทผู้เล่นระหว่างฝ่ายรุกและฝ่ายรับ
    swapPlayers(current, opponent){
        // คืนค่าออบเจกต์ที่สลับตำแหน่ง current และ opponent เรียบร้อยแล้ว
        return {
            current: opponent, 
            opponent: current
        };
    }
    // ตรวจสอบและบังคับใช้การ์ด "โจมตี" ในมือของผู้เล่น
    askSlash(player){
        // ส่งคำร้องขอเลือกการ์ด "โจมตี" ไปยัง Controller ของผู้เล่น
        const index = player.controller.askSlash(player, this);
        // หากผู้เล่นไม่มีการ์ด "โจมตี" บนมือ
        if(index === -1){
            this.log(player.name + " ไม่มี โจมตี");
            return false;
        }
        // ดึงการ์ด "โจมตี" ออกจากมือตามตำแหน่งที่พบ
        const slash = player.hand.removeCard(index);
        // นำการ์ด "โจมตี" ลงกองทิ้ง (Discard Pile) พร้อมบันทึก Log
        this.discardPile.addCard(slash);
        this.log(player.name + " ใช้โจมตี");
        // อัปเดตหน้าจอ UI ใหม่ทันทีหลังการ์ดถูกทิ้ง
        this.ui.render();
        return true;
    }
    // ตรวจสอบและบังคับใช้การ์ด "หลบ" ในมือของผู้เล่น
    askDodge(player){
        // ส่งคำร้องขอเลือกการ์ด "หลบ" ไปยัง Controller ของผู้เล่น
        const index = player.controller.askDodge(player, this);
        // หากผู้เล่นไม่มีการ์ด "หลบ" บนมือ (หรือเลือกไม่ใช้)
        if(index === -1){
            this.log(player.name + " ไม่มี หลบ");
            return false;
        }
        // ดึงการ์ด "หลบ" ออกจากมือตามตำแหน่งที่พบ
        const dodge = player.hand.removeCard(index);
        //
        this.discardPile.addCard(dodge);
        this.log(player.name + " ใช้ หลบ");
        this.ui.render();
        // คืนค่า true แสดงว่าตอบโต้ด้วยการ์ดหลบสำเร็จ
        return true;
    }
    // จัดการเข้าสู่สถานะ Dying ของผู้เล่น
    enterDying(player){
        // ถ้าไม่อยู่ใน Dying หรือ ตายจริงไปแล้ว ไม่ต้องทำอะไร
        if(!player.isDying() || !player.isAlive()){
            return;
        }
        this.log(player.name + " เข้าสู่สถานะ ใกล้ตาย");
        this.ui.render();
    }
    // เริ่มต้นระบบการ์ดส้มปอย/เก็บเกี่ยว (Bumper Harvest)
    startBumperHarvest(){

        const player = this.getCurrentPlayer();
        this.bumperHarvestPlayer = player;
        if(player && player.controller){
            player.controller.selectedCardIndex = -1;
        }
        // งรายชื่อเฉพาะผู้เล่นที่ยังมีชีวิตอยู่ (isAlive)
        const livingPlayers = this.players.filter(
            player => player.isAlive()
        );

        const initiatingPlayer = this.getCurrentPlayer();
        const startIndex = livingPlayers.indexOf(initiatingPlayer);
        if(startIndex !== -1){

            const orderedPlayers = [
                ...livingPlayers.slice(startIndex), 
                ...livingPlayers.slice(0, startIndex)
            ];
            livingPlayers.splice(
                0, livingPlayers.length, ...orderedPlayers
            );
        }
        // ล้างข้อมูลเดิมใน SelectionZone
        this.selectionZone.clear();
        
        const harvestCards = [];
        // จั่วการ์ดจากกองตามจำนวนผู้เล่นที่ยังมีชีวิต
        for(let i = 0; i < livingPlayers.length; i++){
            const card = this.deck.draw();
            // หากการ์ดหมดกองให้หยุดจั่ว
            if(!card){
                break;
            }
            
            harvestCards.push(card);
        }
        // เริ่มรอบการเลือกการ์ดใน SelectionZone
        this.selectionZone.startSelection(harvestCards, livingPlayers);
        // สั่งให้ Controller ของผู้เล่นคนแรกที่ต้องเลือก สลับ State เป็น waitingSelection
        const selectionPlayer = this.selectionZone.getCurrentPlayer();
        
        if(selectionPlayer && selectionPlayer.controller){
            selectionPlayer.controller.startSelection();
        }

        console.log("Bumper Harvest:", livingPlayers.length, "ผู้เล่น", 
            harvestCards.length, "การ์ด"
        );
        return true;
    }
    // ให้ผู้เล่นคนปัจจุบันเลือกการ์ดจาก SelectionZone เข้ามือ และเลื่อนสิทธิ์ไปยังผู้เล่นคนถัดไป
    selectSelectionCard(index){
        const zone = this.selectionZone;
        const player = zone.getCurrentPlayer();
        // หากไม่มีผู้เล่นในโซน ให้ยกเลิก
        if(!player){
            return false;
        }
        // ถอดการ์ดออกจาก SelectionZone ตาม Index ที่เลือก
        const card = zone.removeCard(index);
        // หากไม่มีการ์ดที่ Index นั้น ให้ยกเลิก
        if(!card){
            return false;
        }
        // นำการ์ดเข้ามือผู้เล่นปัจจุบัน
        player.hand.addCard(card);
        // ตรวจสอบว่าเลือกการ์ดหมดหรือยัง (isFinish)
        if(zone.isFinish()){
            this.finishSelection();
            return true;
        }
        // เลื่อนสิทธิ์การเลือกไปยังผู้เล่นคนถัดไป
        zone.advancePlayer();
        this.ui.render();
        return true;
    }
    // จบกระบวนการเลือกการ์ดกลางโต๊ะ (SelectionZone)
    finishSelection(){
        const zone = this.selectionZone;
        // ล้างข้อมูลการ์ดและผู้เล่นทั้งหมดใน SelectionZone
        zone.clear();
        // คืนสถานะ Controller ของผู้เล่นทุกคนในเกมกลับเป็น idle
        for(const player of this.players){
            if(player.controller){
                player.controller.finishSelection();
            }
        }
        this.finishAction();
        this.ui.render();

        return true;
    }
    // คำนวณระยะสำหรับ "ผู้โจมตี -> เป้าหมาย" โดยรวมค่าปรับจาก Mount ตามทิศทาง
    getAttackDistance(attacker, target){
        // ระยะพื้นฐานบนโต๊ะ
        const baseDistance = 
            this.getDistance(attacker, target);
        // Modifier ฝั่งผู้โจมตี (เช่น ม้าต้าหยวน = -1)
        const attackerModifier = 
            attacker.getMountAttackDistanceModifier();
        // Modifier ฝั่งเป้าหมาย (เช่น ม้าเงาพยับ = +1)
        const targetModifier = 
            target.getMountDefenseDistanceModifier();
        let passiveModifier = 0;
        for(const player of this.players){
            if(!player.isAlive()){
                continue;
            }
            for(const skill of player.getPassiveSkills()){
                if(typeof skill.getAttackDistanceModifier !== "function"){
                    continue;
                }
                passiveModifier += skill.getAttackDistanceModifier(player, attacker, target, this);
            }
        }
        // คำนวณระยะสำหรับการโจมตี (ขั้นต่ำไม่ต่ำกว่า 1)
        const distance = Math.max(
            1, 
            baseDistance + 
            attackerModifier + 
            targetModifier + 
            passiveModifier
        );

        console.log(
            "Attack Distance:", 
            baseDistance, "+", 
            attackerModifier, "+", 
            targetModifier, "+", 
            passiveModifier, "=", 
            distance
        );
        return distance;
    }
    // ดึงการ์ด 1 ใบจากสำรับ (Deck) หากสำรับหมด จะนำกองทิ้ง (Discard Pile) กลับมาสับใหม่เป็นสำรับ
    drawCardFromDeck(){

        if(this.deck.cards.length === 0){
            // หากกองทิ้งไม่มีการ์ดเหลืออยู่เลย ไม่สามารถจั่วได้
            if(this.discardPile.cards.length === 0){
                return null;
            }
            // นำการ์ดทั้งหมดจากกองทิ้งกลับมาใส่สำรับ ล้างกองทิ้ง แล้วทำการสับกอง
            this.deck.cards = this.discardPile.cards;
            this.discardPile.cards = [];
            this.deck.shuffle();
        }
        return this.deck.draw();
    }
    // ลบผู้เล่นที่ตายจริงออกจากเกม
    removeDeadPlayer(player){

        const index = this.players.indexOf(player);
        // ไม่พบผู้เล่น หรือถูกลบไปแล้ว
        if(index === -1){
            return;
        }
        // ลบผู้เล่นออกจาก game.players
        this.players.splice(index, 1);
        // ถ้าไม่มีผู้เล่นเหลือ
        if(this.players.length === 0){
            this.currentPlayerIndex = 0;
            return;
        }
        // ลด Index ลง 1 เพื่อให้ nextTurn() เพิ่มกลับไปหาคนถัดไป
        if(index === this.currentPlayerIndex){
            this.currentPlayerIndex--;
            if(this.currentPlayerIndex < 0){
                this.currentPlayerIndex = this.players.length - 1;
            }
            return;
        }
        // ถ้าผู้เล่นที่ถูกลบอยู่ก่อน currentPlayerIndex
        if(index < this.currentPlayerIndex){
            this.currentPlayerIndex--;
        }
        // ป้องกัน currentPlayerIndex เกินขอบเขต
        if(this.currentPlayerIndex >= this.players.length){
            this.currentPlayerIndex = 0;
        }
    }
    // เริ่ม Action ใหม่ และล็อก End Turn
    startAction(){
        this.actionLocked = true;
    }
    // จบ Action และปลดล็อก End Turn
    finishAction(){
        this.actionLocked = false;
    }
}
