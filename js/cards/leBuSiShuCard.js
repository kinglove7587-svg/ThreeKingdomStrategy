class LeBuSiShuCard extends Card{
    // กำหนด constructor รับค่าดอก (suit) และตัวเลข (number) ของไพ่
    constructor(suit, number){
        // เรียก constructor ของคลาสแม่ (Card) โดยระบุประเภทเป็น "DelayedTrick" และชื่อการ์ดเป็น "สุราลืมกลับ"
        super("DelayedTrick", "สุราลืมกลับ", suit, number);
    }
    // ตรวจสอบว่าสามารถเลือกผู้เล่นเป้าหมายได้หรือไม่ (ใช้ใส่ตัวเองไม่ได้)
    canTarget(player, target){
        // หากผู้เล่นผู้ใช้การ์ดและเป้าหมายเป็นคนเดียวกัน ให้ คืนค่า false (ห้ามเลือกตัวเอง)
        if (player === target){
            return false;
        }
        // คืนค่า true เมื่อเป้าหมายเป็นผู้เล่นคนอื่น
        return true;
    }
    // ประมวลผลเมื่อมีการลงการ์ดสุราลืมกลับ
    use(player, game){
        // ให้ controller ของผู้เล่นเลือกเป้าหมายที่จะถูกรบกวนด้วยการ์ดใบนี้
        const target = player.controller.getTarget(this);
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้คืนค่า false เพื่อยกเลิกการใช้การ์ด
        if (target === null){
            return false;
        }
        // นำการ์ดสุราลืมกลับไปแปะไว้ในโซน delayedTricks หน้าตัวละครของเป้าหมาย
        target.addDelayedTrick(this);
        //
        target.showDelayedTricks();
        // แสดงข้อความในระบบ Log ของเกมว่าใครใช้สุราลืมกลับใส่ใคร
        game.log(player.name + " ใช้ สุราลืมกลับ ใส่ " + target.name);
        // คืนค่า true เพื่อยืนยันว่าใช้การ์ดสำเร็จ
        return true;
    }
}