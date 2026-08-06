class DodgeCard extends BasicCard{
    // การ์ดหลบ (ประเภท Basic)
    constructor(suit, number){
        super("Basic", "หลบ", suit, number);
    }
    // ใช้ได้ผ่านระบบ Response (askDodge) เท่านั้น
    use(player, game){
        return false;
    }
}