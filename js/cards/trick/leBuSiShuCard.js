class LeBuSiShuCard extends DelayedTrickCard{
    // กำหนด constructor รับค่าดอก (suit) และตัวเลข (number) ของไพ่
    constructor(suit, number){
        // เรียก constructor ของคลาสแม่ (Card) โดยระบุประเภทเป็น "DelayedTrick" และชื่อการ์ดเป็น "สุราลืมกลับ"
        super("สุราลืมกลับ", suit, number);
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
        console.log("เริ่มใช้ สุราลืมกลับ"); // Debug
        console.log("selectedTarget =", player.controller.getSelectedTarget()); // Debug
        // ให้ controller ของผู้เล่นเลือกเป้าหมายที่จะถูกรบกวนด้วยการ์ดใบนี้
        const target = player.controller.getTarget(this);
        console.log(target); // Debug
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้คืนค่า false เพื่อยกเลิกการใช้การ์ด
        if (target === null){
            return false;
        }
        // นำการ์ดสุราลืมกลับไปแปะไว้ในโซน delayedTricks หน้าตัวละครของเป้าหมาย
        target.addDelayedTrick(this);
        //
        target.showDelayedTrick();
        // แสดงข้อความในระบบ Log ของเกมว่าใครใช้สุราลืมกลับใส่ใคร
        game.log("→ เป้าหมาย : " + target.name);
        // คืนค่า true เพื่อยืนยันว่าใช้การ์ดสำเร็จ
        return true;
    }
    // ประมวลผลการเสี่ยงทาย (Judge) ของการ์ดสุราลืมกลับ
    onJudge(player){
        console.log(player.name + " เริ่ม Judge สุราลืมกลับ");
        
        player.game.judge(
            player, 
            (result) => {
                // ตรวจผล Judge หลัง Judge ปกติหรือ Resume
                if(!result.isHeart()){
                    console.log(player.name + " ถูกสุราลืมกลับ");
                    player.skipPlay();
                }
                // ถอดการ์ดสุราลืมกลับออกจากตัวละคร
                player.removeDelayedTrick(this);
                // ส่งการ์ดสุราลืมกลับลงกองทิ้ง
                player.game.discardPile.addCard(this);
                // แสดงรายการ Delayed Trick ที่เหลืออยู่
                player.showDelayedTrick();
            }
        );
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "วางใส่ผู้เล่นอื่น เมื่อถึง Judge หากไม่ใช่ ♥️ เป้าหมายจะข้าม Play Phase หากเป็น ♥️ จะไม่เกิดผล";
    }
}
