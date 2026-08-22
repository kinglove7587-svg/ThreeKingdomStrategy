class Equilibrium extends ActiveSkill{

    constructor(){
        super("Equilibrium");

        this.equilibriumUsed = false;
    }
    // รีเซ็ตสถานะการใช้สกิลเมื่อเริ่มเทิร์น
    onTurnStart(player, game){
        this.equilibriumUsed = false;
    }
    // ตรวจสอบว่าสามารถใช้สกิลในเทิร์นนี้ได้หรือไม่
    canUse(player, game){
        return !this.equilibriumUsed && 
            player.hand.cards.length > 0;
    }
    // สกิลนี้ไม่ต้องเลือกเป้าหมายผู้เล่น
    needsTarget(player, game){
        return false;
    }
    // สกิลนี้ต้องมีการเลือกการ์ดบนมือ
    needsCardSelection(player, game){
        return true;
    }
    // รอผู้เล่นกรดปุ่มยืนยันหลังจากเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // จำนวนการ์ดสูงสุดที่เลือกได้ตามจำนวนไพ่บนมือ
    cardSelectionCount(player, game){
        return player.hand.cards.length;
    }
    // ประมวลผลการทิ้งการ์ดและจั่วการ์ดใหม่
    use(player, game){
        //
    }
}