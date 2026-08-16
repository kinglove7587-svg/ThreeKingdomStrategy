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
}