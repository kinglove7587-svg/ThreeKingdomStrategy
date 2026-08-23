class PeachCard extends BasicCard{
    constructor(suit, number){
        super("Basic", "ยา", suit, number); // เรียก constructor ของ Card
    }

    use(player, game, target){ // ความสามารถของการ์ดยา
        if(!target || target.hp >= target.maxHp){
            console.log("เป้าหมาย HP เต็ม ใช้ยาไม่ได้");
            return false;
        }

        target.recoverHp(1);

        return true;
    }
    // ตรวจสอบว่าเป้าหมายคือตัวเองหรือไม่ (สำหรับ PeachCard)
    canTarget(player, target){
        // คืนค่า true เฉพาะเมื่อเป้าหมายคือคนเดียวกับผู้ใช้การ์ด
        return target && target.hp < target.maxHp;
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ฟื้นฟู HP 1 ให้ตัวเอง";
    }
}