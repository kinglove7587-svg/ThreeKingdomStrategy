class RationsDepletedCard extends DelayedTrickCard{
    constructor(suit, number){
        super("เสบียงหมด!", suit, number);
    }
    // ตรวจสอบว่าเป้าหมายสามารถถูกใช้การ์ดใบนี้ใส่ได้หรือไม่
    canTarget(player, target){
        // ห้ามเลือกตัวเองเป็นเป้าหมาย
        if(player === target){
            return false;
        }
        // เป้าหมายต้องอยู่ในระยะทางกายภาพ
        return player.game.getDistance(player, target) <= 1;
    }
    // สั่งใช้การ์ดเสบียงหมด! โดยนำการ์ดไปวางในพื้นที่ Delayed Trick
    use(player, game){
        // ดึงออบเจกต์เป้าหมายที่ถูกเลือกจาก Controller
        const target = player.controller.getSelectedTarget();
        // ตรวจสอบว่ามีเป้าหมายหรือไม่
        if(!target){
            return false;
        }
        // นำการ์ดใบนี้ไปแปะไว้ที่พื้นที่ Delayed Trick ของเป้าหมาย
        target.addDelayedTrick(this);
        return true;
    }
    // ทำการเช็กดวง (Judge) เมื่อถึง Judgment Phase ของเป้าหมาย
    onJudge(player){
        // เรียก Judge และรอผลลัพธ์
        player.game.judge(
            player, 
            (result) => {
                // ตรวจผล Judge หลัง Judge ปกติหรือ Resume
                if(!result.isClub()){
                    player.skipDraw();
                }
                // นำการ์ดเสบียงหมด! ออกจากโซน Delayed Trick
                player.removeDelayedTrick(this);
                // นำการ์ดเสบียงหมด! ลงกองทิ้ง
                player.game.discardPile.addCard(this);
                // อัปเดตการแสดงผล UI Delayed Trick บนตัวละคร
                if(typeof player.showDelayedTrick === "function"){
                    player.showDelayedTrick();
                }
            }
        );
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "วางใส่ผู้เล่นอื่นที่อยู่ห่างไม่เกิน 1 เมื่อถึง Judge หากไม่ใช่ ♣️ ผู้เล่นจะข้าม Draw Phase";
    }
}