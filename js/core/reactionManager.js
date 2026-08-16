class ReactionManager{
    // จัดการระบบ Reaction กลางของเกม (รองรับ Negation, Skill ตอบโต้ และการ์ด Reactive)
    constructor(game){
        this.game = game;
        //
        this.context = null;
        this.currentResponder = null;
        this.responders = [];
        this.responderIndex = -1;
        this.active = false;
    }
    // เปิด Reaction Window สำหรับ Effect หรือการ์ดที่กำลังรอการตอบโต้/หักล้าง
    openReactionWindow(context){
        // ป้องกันการเปิด Window ซ้ำถ้ากำลังทำงานอยู่
        if(this.active){
            return false;
        }

        if(!context){
            return false;
        }
        // เก็บ Effect ที่กำลังรอ Reaction
        this.context = context;
        // เตรียมรายชื่อผู้เล่นที่จะมีสิทธิ์ตอบ Reaction
        this.responders = [];
        // เริ่มวนหาผู้เล่นถัดจากเจ้าของ Effect (source)
        const source = context.source;
        if(!source){
            return false;
        }

        let player = this.game.getNextPlayerOf(source);
        while(player && player !== source){
            
            this.responders.push(player);
            player = this.game.getNextPlayerOf(player);
        }
        // ถ้าไม่มีผู้เล่นคนอื่นให้ตอบ ให้ปิด Window
        if(this.responders.length === 0){
            this.closeReactionWindow();
            return false;
        }

        this.responderIndex = 0;
        this.currentResponder = this.responders[this.responderIndex];
        this.active = true;
        this.currentResponder.controller.startReaction(this.context);
        console.log(
            "Reaction Window เปิด:", this.context.card 
            ? this.context.card.name : "(ไม่มีการ์ด)"
        );
        console.log("ผู้ตอบคนแรก:", this.currentResponder.name);
        return true;
        
        
    }
    // รับผู้เล่นที่กำลังตอบ Reaction อยู่ในขณะนี้
    getCurrentResponder(){
        // ถ้า Reaction Window ไม่ได้เปิดอยู่ ให้คืนค่า null
        if(!this.active){
            return null;
        }
        // ถ้า index ของผู้ตอบไม่ถูกต้อง ให้คืนค่า null
        if(
            this.responderIndex < 0 || 
            this.responderIndex >= this.responders.length
        ){
            return null;
        }
        return this.responders[this.responderIndex];
    }
    // ค้นหาและดึงรายการการ์ดบนมือของผู้ตอบปัจจุบัน ที่สามารถใช้ตอบโต้ Context นี้ได้
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
    // ดำเนินการใช้การ์ดตอบโต้ของผู้เล่นปัจจุบัน (ถ้ามี)
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
        // นำการ์ดออกจากมือของผู้ตอบ
        responder.hand.cards.splice(cardIndex, 1);
        this.context.canceled = true;
        console.log(responder.name + " ใช้ " + card.name);
        return card;
    }
    // เลื่อนไปถาม Reaction ผู้เล่นคนถัดไปในลำดับ
    moveToNextResponder(){

        if(!this.active){
            return null;
        }
        
        this.responderIndex++;
        // ยังมีผู้เล่นคนถัดไปในรายการ
        if(this.responderIndex < this.responders.length){

            const nextResponder = this.responders[this.responderIndex];
            this.currentResponder = nextResponder;
            console.log("Responder → ผู้ตอบคนถัดไป:", nextResponder);
            // เรียก startReaction ของ Controller คนถัดไป
            nextResponder.controller.startReaction(this.context);
            return nextResponder;
        }
        // ไม่มีผู้เล่นเหลือแล้ว สั่งปิด Reaction Window
        return null;
    }
    // ล้างข้อมูลและปิด Reaction Window หลังจบการสอบถาม Reaction ทุกคน
    closeReactionWindow(){
        console.log("Reaction Window ปิด");
        // รีเซ็ตสถานะทั้งหมด
        this.active = false;
        this.context = null;
        this.currentResponder = null;
        this.responders = [];
        this.responderIndex = -1;
        return true;
    }
    // ประมวลผลคำตอบ Reaction จากผู้เล่นปัจจุบัน
    resolveReaction(useReaction){

        if(!this.active){
            return false;
        }
        // ตรวจสอบว่ามีผู้เล่นที่กำลังตอบอยู่หรือไม่
        const responder = this.getCurrentResponder();
        if(!responder){
            return false;
        }
        console.log("Reaction:", responder.name, useReaction ? "ใช้" : "ไม่ใช้");
        // กรณีเลือก "ไม่ใช้"
        if(!useReaction){
            
            const nextResponder = this.moveToNextResponder();
            // ยังมีผู้เล่นคนถัดไป ให้รอรับคำตอบต่อ
            if(nextResponder){
                return true;
            }
            // ไม่มีผู้เล่นเหลือแล้ว สั่งปิด Window และ Resume Effect
            return this.resumeEffect();
        }
        // กรณีเลือก "ใช้" Reaction (เตรียมไว้สำหรับ NegationCard)
        console.log("DEBUG: Reaction ใช้ แต่ยังไม่มี Effect ของ Reaction");
        
        return true;
    }
    // ปิด Reaction Window และสั่งรัน Effect
    resumeEffect(){

        if(!this.context){
            return false;
        }
        // ตรวจสอบว่ามีฟังก์ชัน resume ให้รันต่อหรือไม่
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