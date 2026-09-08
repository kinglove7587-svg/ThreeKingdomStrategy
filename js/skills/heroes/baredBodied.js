class BaredBodied extends TriggerSkill{

    constructor(){
        super("Bared Bodied");
        // เก็บสถานะว่า Bared Bodied ถูกเปิดใช้งานในเทิร์นปัจจุบันหรือไม่
        this.activeThisTurn = false;
    }
    // ลงทะเบียนตรวจสอบ Damage ก่อนเกิดจริง
    register(eventManager, player){
        // Callback สำหรับตรวจสอบ Damage ของ Bared Bodied
        const callback = (damage) => {
            // ถ้า Bared Bodied ไม่ได้เปิดใช้งาน ให้ข้าม
            if(!this.activeThisTurn){
                return;
            }
            // ต้องเป็น Damage ที่ Xu Zhu เป็นผู้สร้างเท่านั้น
            if(damage.source !== player){
                return;
            }
            // ต้องเป็น Damage จาก Slash เท่านั้น
            if(!(damage.card instanceof SlashCard)){
                return;
            }
            // เพิ่ม Damage อีก 1 หน่วย
            damage.amount++;
            player.game.log(
                player.name + " ได้รับผลของ Bared Bodied ความเสียหาย +1"
            );
        };
        // ลงทะเบียน Listener ดักจับ Event beforeDamage
        this.registerListener(
            eventManager, 
            "beforeDamage", 
            callback
        );
    }
    // แทรกเข้าสู่ Draw Phase เพื่อถามว่าจะใช้ Bared Bodied หรือไม่
    onDrawPhase(player, game){

        if(player !== this.owner){
            return;
        }
        if(player.skipPlayPhase){
            return;
        }
        // หยุด Draw Phase เพื่อรอการตัดสินใจ
        game.pauseDrawPhase(player);
        // ให้ผู้เล่นเลือกว่าจะใช้ Bared Bodied หรือไม่
        player.controller.startTriggerChoice(
            this, 
            {
                drawPhase: true
            }
        );
    }
    // ประมวลผลคำตอบว่าจะใช้ Bared Bodied หรือไม่
    resolveChoice(player, game, context, usedSkill){

        if(!usedSkill){
            game.log(player.name + " ไม่ใช้ Bared Bodied");
            return game.resumeDrawPhase();
        }
        game.log(player.name + " ใช้ Bared Bodied");
        // เปิดสถานะ Bared Bodied ให้มีผลตลอดเทิร์นปัจจุบัน
        this.activeThisTurn = true;
        // ใช้ Draw Phase แบบจั่วเพียง 1 ใบ
        return game.resumeDrawPhase(1);
    }
    // ล้างสถานะ Bared Bodied เมื่อจบเทิร์นของเจ้าของ
    onTurnEnd(player, game){
        // ป้องกันไม่ให้ล้างสถานะจากผู้เล่นคนอื่น
        if(player !== this.owner){
            return;
        }
        // Bared Bodied มีผลเฉพาะเทิร์นปัจจุบัน
        this.activeThisTurn = false;
    }
}