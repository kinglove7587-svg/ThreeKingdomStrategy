class PeachCard extends Card{
    constructor(suit, number){
        super("Basic", "ยา", suit, number); // เรียก constructor ของ Card
    }

    use(player, game){ // ความสามารถของการ์ดยา
        if (player.hp >= player.maxHp){
            console.log("HP เต็ม ใช้ยาไม่ได้");
            return false;
        }

        player.recoverHp(1);

        return true;
    }
    // ตรวจสอบว่าเป้าหมายคือตัวเองหรือไม่ (สำหรับ PeachCard)
    canTarget(player, target){
        // คืนค่า true เฉพาะเมื่อเป้าหมายคือคนเดียวกับผู้ใช้การ์ด
        return player === target;
    }
}