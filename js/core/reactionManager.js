class ReactionManager{
    // จัดการระบบ Reaction กลางของเกม โดยถามเฉพาะ Target ที่ได้รับผลจาก Effect
    constructor(game){
        this.game = game;
        //
        this.context = null;
        this.currentResponder = null;
        // DELETE: this.responders = [];
        // DELETE: this.responderIndex = -1;
        this.active = false;
    }
    // เปิด Reaction Window โดยถามเฉพาะผู้เล่นที่เป็น Target ของ Effect
    openReactionWindow(context){
        // ป้องกันการเปิด Window ซ้ำถ้ากำลังทำงานอยู่
        if(this.active){
            return false;
        }

        if(!context){
            return false;
        }

        // NEW: Reaction ใหม่ใช้ Target เพียงคนเดียว
        const target = context.target;

        if(!target){
            // NEW: Effect ที่ไม่มี Target ไม่ต้องเปิด Reaction
            return false;
        }

        // เก็บ Effect ที่กำลังรอ Reaction
        this.context = context;
        this.currentResponder = target;
        this.active = true;

        // NEW: ตรวจเฉพาะ Target ว่ามี Reaction Card ที่ใช้ได้หรือไม่
        if(this.getAvailableReactionCards().length === 0){
            this.closeReactionWindow();
            return false;
        }

        console.log(
            "Reaction Window เปิด:", this.context.card
            ? this.context.card.name : "(ไม่มีการ์ด)"
        );
        console.log("ผู้ตอบ:", this.currentResponder.name);

        this.currentResponder.controller.startReaction(this.context);

        return true;
    }
    // รับผู้เล่น Target ที่กำลังตอบ Reaction อยู่
    getCurrentResponder(){
        if(!this.active){
            return null;
        }

        return this.currentResponder;
    }
    // ค้นหาและดึงรายการการ์ดบนมือของ Target ที่สามารถใช้ตอบโต้ Context นี้ได้
    getAvailableReactionCards(){

        const responder = this.getCurrentResponder();

        if(!responder){
            return [];
        }

        if(!responder.hand || !responder.hand.cards){
            return [];
        }

        return responder.hand.cards.filter(card => {
            return(
                typeof card.canReact === "function" &&
                card.canReact(this.context)
            );
        });
    }
    // DELETE: findNextAvailableResponder() ไม่จำเป็น เพราะ Reaction ถามเฉพาะ Target
    // DELETE: moveToNextResponder() ไม่จำเป็น เพราะไม่มีการวนถามผู้เล่นคนอื่น

    // ดำเนินการใช้การ์ดตอบโต้ของ Target ปัจจุบัน
    useReactionCard(){

        const reactionCards = this.getAvailableReactionCards();

        if(reactionCards.length === 0){
            return false;
        }

        const card = reactionCards[0];
        const responder = this.getCurrentResponder();

        if(!responder){
            return false;
        }

        const cardIndex = responder.hand.cards.indexOf(card);

        if(cardIndex === -1){
            return false;
        }

        // นำการ์ดออกจากมือของ Target
        responder.hand.cards.splice(cardIndex, 1);
        this.game.discardPile.addCard(card);
        this.context.canceled = true;
        console.log(responder.name + " ใช้ " + card.name);
        return card;
    }
    // ล้างข้อมูลและปิด Reaction Window
    closeReactionWindow(){
        console.log("Reaction Window ปิด");
        // รีเซ็ตสถานะทั้งหมด
        this.active = false;
        this.context = null;
        this.currentResponder = null;
        return true;
    }
    // ประมวลผลคำตอบ Reaction จาก Target
    resolveReaction(useReaction){

        if(!this.active){
            return false;
        }

        // ตรวจสอบว่ามี Target ที่กำลังตอบอยู่หรือไม่
        const responder = this.getCurrentResponder();

        if(!responder){
            return false;
        }

        console.log("Reaction:", responder.name, useReaction ? "ใช้" : "ไม่ใช้");

        // NEW: Target ไม่ใช้ Reaction ให้ Effect ทำงานต่อทันที
        if(!useReaction){
            return this.resumeEffect();
        }

        // กรณี Target เลือกใช้ Reaction
        const card = this.useReactionCard();

        if(!card){
            return false;
        }

        // ปิด Reaction Window และ Render หน้าจอใหม่
        this.closeReactionWindow();
        this.game.ui.render();

        return true;
    }
    // ปิด Reaction Window และสั่งรัน Effect
    resumeEffect(){

        if(!this.context){
            return false;
        }

        // เก็บ Context ก่อนล้าง Reaction State
        const context = this.context;

        // สั่งปิด Reaction Window เพื่อรีเซ็ตสถานะ
        this.closeReactionWindow();

        // ตรวจสอบว่ามีฟังก์ชัน resume ให้รันต่อหรือไม่
        if(typeof context.resume !== "function"){
            return false;
        }

        // ดำเนินการรัน Effect ต่อ
        const result = context.resume();
        this.game.ui.render();
        return result;
    }
}