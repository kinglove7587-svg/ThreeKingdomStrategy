class DuelCard extends TrickCard{
    // ตัวสร้างออบเจกต์การ์ดดวลเดี่ยว (กำหนดประเภท, สัญลักษณ์ดอก, และแต้มการ์ด)
    constructor(suit, number){
        super("ดวลเดี่ยว", suit, number);
    }
    // ประมวลผลเมื่อผู้เล่นสั่งใช้การ์ดดวลเดี่ยว
    use(player, game){
        // ดึงตัวละครเป้าหมายที่จะถูกดวลจากการเลือกผ่าน Controller
        const target = player.controller.getTarget(this);
        // หากผู้เล่นไม่ได้เลือกเป้าหมาย (ยกเลิก) ให้ยกเลิกการใช้การ์ด
        if(!target){
            return false;
        }
        game.log("→ เป้าหมาย : " + target.name);
        // เรียกใช้ระบบการดวล (Duel Engine) ใน Game
        game.duel(player, target);
        return true;
    }
    // ตรวจสอบเงื่อนไขเป้าหมายของการ์ด (เลือกใครก็ได้ที่ไม่ใช่ตัวเอง)
    canTarget(player, target){
        return player !== target;
    }
    // ระบุว่าการ์ดใบนี้จำเป็นต้องเลือกเป้าหมายในการใช้งาน
    needTarget(){
        return true;
    }
}