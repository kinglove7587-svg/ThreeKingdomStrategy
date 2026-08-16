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
        console.log(
            "Reaction Window เปิด:", this.context.card 
            ? this.context.card.name : "(ไม่มีการ์ด)"
        );
        console.log("ผู้ตอบครแรก:", this.currentResponder.name);
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
}