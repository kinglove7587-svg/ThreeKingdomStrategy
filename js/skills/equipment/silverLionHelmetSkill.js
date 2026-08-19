class SilverLionHelmetSkill extends ArmorSkill{

    constructor(){
        super("หมวกสิงโตเงิน");

        this.player = null;
    }
    // ฟังก์ชันสำหรับลงทะเบียน Event Listener ของหมวกสิงโตเงิน
    register(eventManager, player){
        
        this.player = player;
        const callback = (damage) => {
            // ตรวจสอบว่าเป้าหมายคือเจ้าของเกราะหรือไม่
            if(damage.target !== player){
                return;
            }
            // ทอนความเสียหายลงเหลือ 1 เฉพาะเมื่อความเสียหายมากกว่า 1
            if(damage.amount > 1){
                damage.amount = 1;
                player.game.log(player.name + " ได้รับผลของหมวกสิงโตเงิน ความเสียหายเหลือ 1");
            }
        };
        this.registerListener(eventManager, "beforeDamage", callback);
    }
    // ฟังก์ชันสำหรับยกเลิกการลงทะเบียน Event Listener ของหมวกสิงโตเงิน
    unregister(){
        // เรียกใช้ฟังก์ชัน unregister ของคลาสแม่
        super.unregister();
        // คืนค่า HP +1 เมื่อเกราะถูกถอด
        if(this.player){
            this.player.recoverHp(1);
            this.player = null;
        }
    }

}