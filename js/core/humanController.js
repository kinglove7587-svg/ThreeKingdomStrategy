class HumanController{
    // ควบคุมการกระทำของผู้เล่นมนุษย์
    constructor(player, game){
        this.player = player;
        this.game = game;
        // เก็บ index ของการ์ดที่ผู้เล่นเลือก
        this.selectedCardIndex = -1;
        // เก็บเป้าหมายที่ผู้เล่นเลือก
        this.selectedTarget = null;
        // สถานะการรับ Input ปัจจุบัน
        this.inputState = "idle";
        // NEW: Context ของ Action ที่กำลังรอ Reaction
        this.reactionContext = null;
    }
    // เมธอดสำหรับเริ่มเทิร์นของผู้เล่นมนุษย์
    startTurn(){
        console.log("Human Turn");
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        this.game.ui.render();
    }
    // เมธอดตรวจสอบว่าการ์ดที่เลือกสามารถเล่นได้หรือไม่
    canPlayCard(card){
        if(!card || typeof card.canUse !== "function"){
            return false;
        }
        return card.canUse(this.player);
    }
    // เมธอดสั่งเล่นการ์ดที่เลือก
    playCard(cardIndex){
        const card = this.player.hand.cards[cardIndex];
        if(!card){
            return false;
        }
        // ตรวจสอบว่าการ์ดสามารถใช้ได้หรือไม่
        if(!this.canPlayCard(card)){
            return false;
        }
        // ถ้าการ์ดต้องเลือก Target ให้รอการเลือก Target ก่อน
        if(typeof card.needTarget === "function" && card.needTarget()){
            this.selectedCardIndex = cardIndex;
            this.inputState = "waitingTarget";
            this.game.ui.render();
            return false;
        }
        // ใช้การ์ดทันทีถ้าไม่ต้องเลือก Target
        const result = card.use(this.player);
        if(result && typeof result.then === "function"){
            result.then(success => {
                this.game.afterHumanAction(success);
            });
            return true;
        }
        return result;
    }
    // เมธอดสำหรับจบ Action ของผู้เล่นมนุษย์
    finishAction(success){
        // แจ้ง Game Engine ว่าผู้เล่นมนุษย์ทำ Action สำเร็จแล้ว
        this.game.afterHumanAction(true);
        return true;
    }
    // เมธอดประมวลผลจบเทิร์นของผู้เล่นมนุษย์
    finishTurn(){
        // ดึง index ของการ์ดที่เลือกไว้
        const cardIndex = this.selectedCardIndex;
        // ถ้ากดจบเทิร์น (-1) ให้ส่งเรื่องไปที่ Game Engine เพื่อเข้าสู่ขั้นตอนจบเทิร์น
        if (cardIndex === -1){
            // สั่งให้เกมประมวลผลจบเทิร์น
            this.game.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดโดยเรียกใช้ getSelectedCard()
        const card = this.getSelectedCard();
        // ดัก Error: ถ้าไม่พบวัตถุการ์ด (เช่น ไม่ได้เลือกการ์ด) ให้หยุดทำงานทันที
        if (!card){
            return;
        }
        // แจ้ง Game ให้บันทึก Log
        this.game.log("เลือกการ์ดลำดับ : " + cardIndex);
        // ล้าง Reaction Context เก่าก่อนเริ่ม Action ใหม่
        this.reactionContext = null;
        // สั่ง Controller เล่นการ์ดใบที่เลือก และรับผลลัพธ์ (true/false)
        const success = this.playCard(cardIndex);
        // ล้างค่าเป้าหมายที่เลือกไว้ เพื่อป้องกันไม่ให้ข้อมูลเป้าหมายเดิมค้างอยู่ในเทิร์นถัดไป
        this.selectedTarget = null;
        // รอ Trigger ที่ต่อจากการ์ดให้จบก่อน
        if(
            this.inputState === "waitingTriggerChoice" || 
            this.inputState === "waitingTriggerCard" || 
            this.inputState === "waitingTriggerTarget" || 
            this.inputState === "waitingAdditionalTargets"
        ){
            return;
        }
        // การ์ดจบการทำงานสมบูรณ์แล้ว
        this.selectedCardIndex = -1;
        // NEW: ถ้า Action นี้กำลังรอ Reaction ให้ ReactionManager จัดการจบ Action
        if(this.reactionContext){
            return;
        }
        // ส่งผลลัพธ์ให้ Game จัดการอัปเดตสถานะและหน้าจอถัดไป
        this.game.afterHumanAction(success);
    }
    // เมธอด API ที่เปิดไว้ให้ส่วน UI (เช่น HTML/DOM Event) เรียกใช้งานเพื่ออัปเดตการ์ดที่เลือก
    selectCard(index){
        // หากกำลังรอเลือกเป้าหมายอยู่ แล้วผู้เล่นกดเลือกการ์ดใบเดิมซ้ำ -> ให้ยกเลิกการเลือกการ์ด
        if(
            this.inputState === "waitingTarget" && 
            this.selectedCardIndex === index
        ){
            
            const card = this.getSelectedCard();
            console.log("ยกเลิกการเลือกการ์ด", card ? card.name : "(ไม่พบการ์ด)");

            this.selectedCardIndex = -1;
            this.selectedTarget = null;
            this.inputState = "idle";
            this.game.ui.render();
            return;
            
        }
        // บันทึก index การ์ดที่เลือกลงใน Controller
        this.selectedCardIndex = index;
        // ถ้าผู้เล่นกดจบเทิร์น (index เป็น -1) ให้สั่งจบเทิร์นทันที
        if (index === -1){
            this.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดที่เลือก
        const card = this.getSelectedCard();
        // ถ้าไม่พบการ์ด ให้รีเซ็ตและหยุด
        if (!card){
            this.selectedCardIndex = -1;
            return;
        }
        // ตรวจสอบว่าการ์ดสามารถใช้ได้หรือไม่
        if(!this.canPlayCard(card)){
            console.log("ไม่สามารถใช้การ์ดนี้ได้");
            this.selectedCardIndex = -1;
            this.game.ui.render();
            return;
        }
        // ถ้าการ์ดต้องเลือก Target
        if(typeof card.needTarget === "function" && card.needTarget()){
            this.inputState = "waitingTarget";
            this.game.ui.render();
            return;
        }
        // ถ้าไม่ต้องเลือก Target ให้เล่นทันที
        this.finishTurn();
    }
    // เมธอด API สำหรับเลือกเป้าหมาย
    selectTarget(target){
        console.log("selectTarget ถูกเรียก", target ? target.name : "(ไม่มี)");
        if(!target){
            return;
        }
        // ต้องอยู่ในสถานะรอเลือกเป้าหมาย
        if(this.inputState !== "waitingTarget"){
            return;
        }
        this.selectedTarget = target;
        this.inputState = "idle";
        const card = this.getSelectedCard();
        if(!card){
            this.selectedTarget = null;
            return;
        }
        // ถ้าการ์ดมีเมธอด setTarget ให้ส่ง Target เข้าไป
        if(typeof card.setTarget === "function"){
            card.setTarget(target);
        }
        // เล่นการ์ดที่เลือกไว้
        this.finishTurn();
    }
    // เมธอดช่วยดึงการ์ดที่เลือก
    getSelectedCard(){
        if(this.selectedCardIndex < 0 || this.selectedCardIndex >= this.player.hand.cards.length){
            return null;
        }
        return this.player.hand.cards[this.selectedCardIndex];
    }
    // เมธอดเริ่ม Reaction ของ Human
    startReaction(context){
        this.inputState = "waitingReaction";
        this.game.ui.render();
    }
}