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
        // ทำการเปิดการ์ดเช็กดวงจากระบบ Game Engine
        const result = player.game.judge(player);
        // หากไม่มีผลลัพธ์การเช็กดวง ให้ยกเลิกกระบวนการ
        if(!result){
            return;
        }
        // หากไพ่เช็กดวง "ไม่ใช่ดอกดอกจิก (♣)" ให้สั่งข้าม Draw Phase
        if(!result.isClub()){
            player.skipDraw();
        }
        // นำการ์ดเสบียงหมด! ออกจากโซน Delayed Trick ของผู้เล่น
        player.removeDelayedTrick(this);
        // นำการ์ดเสบียงหมด! ลงกองทิ้ง (Discard Pile)
        player.game.discardPile.addCard(this);
    }
}