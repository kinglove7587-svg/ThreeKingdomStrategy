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
        // สร้าง Context สำหรับให้เป้าหมายมีโอกาสใช้ Negation ก่อนเริ่ม Duel
        const context = {
            card: this, 
            source: player, 
            target: target, 
            canceled: false,

            resume: () => {
                // ถ้าถูก Negation ยกเลิก ไม่ต้องเริ่ม Duel
                if(context.canceled){
                    console.log("Duel ถูกหักล้าง");
                    return true;
                }
                // เริ่ม Duel หลัง Reaction จบ
                game.duel(player, target);
                return true;
            }
        };
        // เปิด Reaction Window ก่อนเริ่ม Effect
        const opened = game.reactionManager.openReactionWindow(context);
        // ถ้าเปิด Reaction Window สำเร็จ ให้รอการตอบโต้ก่อน
        if(opened){
            return true;
        }
        // กรณีเปิด Reaction ไม่สำเร็จ ให้ทำ Effect ต่อทันที
        return context.resume();
    }
    // ตรวจสอบเงื่อนไขเป้าหมายของการ์ด (เลือกใครก็ได้ที่ไม่ใช่ตัวเอง)
    canTarget(player, target){
        return player !== target;
    }
    // ระบุว่าการ์ดใบนี้จำเป็นต้องเลือกเป้าหมายในการใช้งาน
    needTarget(){
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เลือกผู้เล่นอื่นเพื่อเริ่มการดวล โดยการใช้การ์ดโจมตีในการดวล";
    }
}