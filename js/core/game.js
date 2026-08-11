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
        this.selectedTarget = null; // กำหนดค่าเริ่มต้นของผู้เล่นเป้าหมาย ให้เป็น null
        this.dyingPlayer = null; // เก็บผู้เล่นที่กำลังอยู่ในสถานะใกล้ตาย
        this.peachHelperIndex = 0; // ก็บตำแหน่งผู้เล่นที่กำลังถูกถามว่าจะใช้ยาช่วยไหม
        this.peachHelper = null; // เก็บผู้เล่นที่กำลังถูกถามว่าจะใช้ยาช่วยหรือไม่
        this.chainDamageListener = new ChainDamageListener(); // สร้าง Listener สำหรับความเสียหายโซ่ตรวน
        this.chainDamageListener.register(this.eventManager); // ผูก chainDamageListener เข้ากับ EventManager
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
    playCardFromCurrentPlayer(cardIndex = 0){ 
        const player = this.getCurrentPlayer(); // ดึงผู้เล่นที่ถึงตาเล่นตอนนี้ออกมา
        const card = player.hand.removeCard(cardIndex); // ดึงการ์ดออกจากมือผู้เล่นตามตำแหน่ง cardIndex
        // ตรวจสอบว่าผู้เล่นไม่มีการ์ดใบที่เลือก (หาการ์ดไม่พบ)
        if (card === null){
            // ส่งข้อความแจ้งเตือนไป แสดงบน UI ของเกม
            this.log(
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
        // ตรวจสอบว่า Deck ยังมี Card ให้จั่วหรือไม่
        if(this.deck.cards.length === 0){
            this.log("ไพ่ในกองหมด ไม่สามารถ Recast ได้");
            return false;
        }
        // นำ Card ที่ต้องการ Recast ออกจากมือผู้เล่น
        const cardToRecast = player.hand.removeCard(cardIndex);
        this.discardPile.addCard(cardToRecast);
        // จั่ว Card ใบใหม่จากกองจั่ว (Deck)
        const newCard = this.deck.draw();
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
        const zhangFei = this.players.find(p => p.name === "เตียวหุย");
        if (zhangFei) {
            zhangFei.showHand();
        }
        this.log("=============");
        this.log(player.name + " Turn ");
        this.log("=============");
        this.startPhase(player); // เริ่ม phase ต่างๆ
    }
    // ประมวลผลช่วงเริ่มเทิร์น (Start Phase)
    startPhase(player){ 
        // รีเซ็ตสถานะการใช้การ์ด "ฆ่า/ฟัน" (Slash) ให้ผู้เล่นกลับมาใช้ได้ใหม่ในเทิร์นนี้
        player.slashUsed = false;  
        // ส่งข้อความ "Start Phase" ไปบันทึกและแสดงในกล่อง Log บนหน้าเว็บ
        this.log("Start Phase");
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
        this.log("Judge Phase");
        // ประมวลผลการ์ดหน่วงเวลา (Delayed Trick) ทั้งหมดของผู้เล่น
        player.startJudgePhase();
        // ส่ง Event "onJudgePhase" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย player เพื่อเรียกใช้สกิลช่วง Judge Phase
        this.eventManager.emitToPlayer("onJudgePhase", player);
        // 
        this.drawPhase(player); // ส่งต่อเฟส
        player.showHand();
    }

    drawPhase(player){ // เฟสจั่วไพ่
        this.log("Draw Phase");
        this.eventManager.emitToPlayer("onDrawPhase", player);
        player.drawCard(this.deck); // แสดงสถานะ
        this.log(player.name + " จั่วการ์ด 1 ใบ");
        this.ui.render();
        this.playPhase(player); // ส่งต่เฟส
    }
    // เฟส Action ( Play Phase )
    playPhase(player){ 
        // เช็กสถานะข้าม Play Phase (เช่น ผลจากการ์ดสุราลืมกลับ)
        if (player.skipPlayPhase){
            this.log(player.name + " ถูกสุราลืมกลับ ข้าม Play Phase");
            // รีเซ็ต Flag ให้มีผลแค่เทิร์นนี้
            player.resetPhaseFlag();
            // ข้ามไป Discard Phase ทันที
            this.discardPhase(player);
            return;
        }
        this.log("Play Phase");
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
            this.log("ลงการ์ดไม่สำเร็จ");
        }
        // เมื่อใช้การ์ดเสร็จแล้ว (1 ใบ) ส่งต่อผู้เล่นไปยัง Discard Phase
        this.discardPhase(player);
    }

    discardPhase(player){ // เฟส ทิ้งไพ่
        this.log("Discard Phase");
        // ส่ง Event "onDiscardPhase" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วงทิ้งไพ่
        this.eventManager.emitToPlayer("onDiscardPhase", player);
        this.endPhase(player);
    }

    endPhase(player){ // เฟส จบ เทิร์น
        this.log("End Phase");
        // ส่ง Event "onTurnEnd" ผ่าน eventManager ไปยังผู้เล่นเป้าหมาย เพื่อเปิดใช้งานสกิลช่วงสิ้นสุดเทิร์น
        this.eventManager.emitToPlayer("onTurnEnd", player);
        this.nextTurn(); 
    }

    nextTurn(){ // เปลี่ยน ตา
        if(this.deck.cards.length === 0){
            this.log("ไพ่หมด");
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
        this.log(message);
    }
    // ตรวจสอบว่ามีผู้เล่นเสียชีวิตเพื่อจบเกมหรือไม่
    checkGameOver(){ 
        for (const player of this.players){ // วนดูผู้เล่นทุกคน
            // ถ้ามีผู้เล่นที่ไม่อยู่ในสถานะมีชีวิต ให้สั่งจบเกม
            if (!player.isAlive()){ 
                this.gameOver();
                return true;
            }
        }
        // ถ้ายังไม่มีใครตาย เกมดำเนินต่อ
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
        this.log("Game Over");
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
        // ตรวจสอบสถานะใกล้ตายของผู้เล่นเป้าหมาย
        if(damage.target.isDying()){
            // เข้าสู่กระบวนการสถานะใกล้ตาย
            this.enterDying(damage.target);
        }
        // ส่ง Event แจ้งเตือนหลังเกิดความเสียหาย เพื่อเปิดโอกาสให้สกิลที่ทำงานหลังโดนดาเมจ (เช่น สกิลดูดเลือด/โต้กลับ) ทำงาน
        this.eventManager.emit("afterDamage", damage);
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
            this.log("เลือกการ์ดต่อ หรือกด End Turn");
        }else{
            this.log("ลงการ์ดไม่สำเร็จ");
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
        // กำหนดให้ฝ่ายป้องกัน (Defender) ต้องเป็นฝ่ายทิ้งการ์ด "ฆ่า" ก่อน
        let current = defender;
        let opponent = attacker;
        // วนลูปสลับกันทิ้งการ์ด "ฆ่า" ไปเรื่อยๆ จนกว่าจะมีฝ่ายใดฝ่ายหนึ่งไม่มีการ์ด
        while(true){
            this.log(current.name + " ต้องใช้ ฆ่า");
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
    // สอบถามการใช้การ์ดยาเพื่อช่วยชีวิตผู้เล่นใกล้ตาย (ถามทุกคนบนโต๊ะ)
    askPeach(player){
        // วนลูปถามทีละคนโดยใช้ peachHelperIndex
        while(this.peachHelperIndex < this.players.length){
            const helper = this.players[this.peachHelperIndex];
            // เพิ่ม index ทันที เพื่อให้การ Resume ครั้งถัดไปชี้ไปที่ผู้เล่นคนถัดไป
            this.peachHelperIndex++;
            // ป้องกันไม่ให้ส่งคำถามหาคนใกล้ตายซ้ำโดยไม่จำเป็น
            if(helper === player){
                continue;
            }
            // ข้ามผู้เล่นที่เสียชีวิตไปแล้ว
            if(!helper.isAlive()){
                continue;
            }
            // เรียกผ่าน Controller ของผู้เล่นแต่ละคนเพื่อหาดัชนีการ์ดยา
            const index = helper.controller.askPeach(helper);
            // ตรวจสอบว่าผู้เล่นมนุษย์กำลังอยู่ในสถานะรอตัดสินใจกดใช้ยาหรือไม่
            if(helper.controller.isWaitingPeach()){
                // บันทึกผู้เล่น Human ที่กำลังถูกถาม
                this.peachHelper = helper;
                // คืนค่า "waiting" เพื่อหยุด Game Flow ชั่วคราว รอ Input จาก UI
                return "waiting";
            }
            // ถ้าไม่มีการ์ดยาในมือ ให้ข้ามไปถามคนถัดไป
            if(index === -1){
                continue;
            }
            // ถ้ารบกวนพบการ์ดยา ให้ดึงออกจากมือ แล้วนำลงกองทิ้ง
            const peach = helper.hand.removeCard(index);
            this.discardPile.addCard(peach);
            this.log(helper.name + " ใช้ ยา ช่วย " + player.name);
            // ฟื้นฟู HP ให้คนที่ใกล้ตาย 1 หน่วย
            player.recoverHp(1);
            this.ui.render();
            // ส่งกลับ true เพื่อระบุว่ารอดชีวิต
            return true;
        }
        // ถ้าวนถามจนครบทุกคนแล้วไม่มีใครมี/ใช้การ์ดยา
        return false;
    }
    // จัดการเข้าสู่สถานะใกล้ตายของผู้เล่น (HP <= 0)
    enterDying(player){
        // ตรวจสอบว่าผู้เล่นอยู่ในสถานะใกล้ตายจริงหรือไม่ ถ้าไม่ใช่ให้ยกเลิก
        if(!player.isDying()){
            return;
        }
        // บันทึกผู้เล่นที่กำลังใกล้ตาย และรีเซ็ตดัชนีผู้ช่วยเป็น 0
        this.dyingPlayer = player;
        this.peachHelperIndex = 0;
        this.log(player.name + " เข้าสู่สถานะใกล้ตาย");
        this.log(player.name + " ต้องการ ยา");
        // ถ้าตัวละครที่กำลังใกล้ตายเป็น Human ให้ตรวจสอบว่ามียาในมือหรือไม่
        const index = player.hand.findCardIndexByName("ยา");
        // ถ้ามียา ให้ตั้งตัวเองเป็น peachHelper แล้วหยุดรอการตัดสินใจกดปุ่มจาก Human ก่อน
        if(index !== -1){
            // ถ้าเป็น Human → รอผู้เล่นกดใช้ยา
            if(player.controller.isHuman()){
                this.peachHelper = player;
                player.controller.askPeach(player);
                return;
            }
            // ถ้าเป็น AI → ใช้ยาทันที
            const peach = player.hand.removeCard(index);
            this.discardPile.addCard(peach);
            this.log(player.name + " ใช้ ยา ช่วยตัวเอง");
            player.recoverHp(1);
            this.ui.render();
            return;
        }
        // ถ้าไม่ใช่ Human หรือ Human ตัวเองไม่มีการ์ดยา ให้เข้าสููลูปถามผู้เล่นคนอื่นตามลำดับ
        const saved = this.askPeach(player);
        // ถ้ารอดชีวิตจากการช่วยเหลือของผู้เล่นคนอื่น ให้จบกระบวนการ
        if(saved){
            return;
        }
        // ถ้าไม่มีใครช่วย/ถามจนครบแล้ว ให้ปรับสถานะเป็นเสียชีวิต
        player.dead();
        this.log(player.name + " แพ้แล้ว");
        // ตรวจสอบเงื่อนไขจบเกม
        this.checkGameOver();
    }
    // ตัดสินใจว่าจะใช้การ์ดยาหรือไม่ ในสถานะใกล้ตาย
    resumeDying(usePeach){
        // ดึงออบเจกต์ผู้เล่นที่กำลังอยู่ในสถานะใกล้ตาย
        const player = this.dyingPlayer;
        // ตรวจสอบว่ามีผู้เล่นใกล้ตายอยู่จริงหรือไม่ ถ้าไม่มีให้ยกเลิกการทำงาน
        if(!player){
            return;
        }
        // กรณีผู้เล่นตกลงใช้การ์ดยาช่วยชีวิต
        if(usePeach){
            // ดึงออบเจกต์ผู้เล่นที่กำลังตัดสินใจใช้ยา (ที่บันทึกไว้ใน peachHelper)
            const helper = this.peachHelper;
            // ถ้าไม่มีข้อมูลผู้เล่นที่ช่วย ให้ยกเลิกการทำงาน
            if(!helper){
                return;
            }
            // ค้นหาตำแหน่งดัชนี (index) ของการ์ด "ยา" ในมือของผู้เล่น
            const index = helper.hand.findCardIndexByName("ยา");
            // ถ้าไม่พบการ์ดยาในมือ ให้ยกเลิกการทำงาน
            if(index === -1){
                return;
            }
            // ดึงการ์ดยาออกจากมือของผู้เล่นตามตำแหน่งดัชนีที่หาได้
            const peach = helper.hand.removeCard(index);
            // นำการ์ดยาที่ถูกใช้ลงกองทิ้งการ์ด
            this.discardPile.addCard(peach);
            this.log(helper.name + " ใช้ ยา ช่วย " + player.name);
            // ฟื้นฟู HP ให้กับผู้เล่นที่กำลังใกล้ตายเพิ่มขึ้น 1 หน่วย
            player.recoverHp(1);
            this.ui.render();
            // ล้างค่า State ต่างๆ เกี่ยวกับการใกล้ตายกลับเป็นค่าเริ่มต้น
            this.dyingPlayer = null;
            this.peachHelper = null;
            this.peachHelperIndex = 0;
            // จบกระบวนการช่วยเหลือ
            return;
        }
        // กรณีผู้เล่นกดไม่ใช้ยา ให้เรียก askPeach เพื่อวนถามผู้เล่นคนถัดไปตามลำดับ
        const result = this.askPeach(player);
        // ถ้าผู้เล่นคนถัดไปใช้ยาช่วยสำเร็จ ให้จบการทำงาน
        if(result === true){
            return;
        }
        // ถ้าผู้เล่นคนถัดไปเป็น Human และกำลังรอการกดตัดสินใจ ให้หยุดรอ Input
        if(result === "waiting"){
            return;
        }
        // ถ้าวนถามผู้เล่นทุกคนแล้วไม่มีใครใช้ยาช่วย ให้เปลี่ยนสถานะเป็นเสียชีวิต
        player.dead();
        this.log(player.name + " แพ้แล้ว");
        // ล้าง State Dying
        this.dyingPlayer = null;
        this.peachHelper = null;
        this.peachHelperIndex = 0;

        this.checkGameOver();
    }
}
