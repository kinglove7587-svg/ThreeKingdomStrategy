class AxeOfInsanity extends TriggerSkill{

    constructor(){
        super("Axe Of Insanity");
    }
    //
    register(eventManager, player){

        const callback = (damage, resolution) => {
            if(!damage){
                return;
            }
            // ต้องเป็นความเสียหายที่เกิดจากเจ้าของ Skill
            if(damage.source !== player){
                return;
            }
            // ต้องสร้างความเสียหายให้ตัวละครอื่น
            if(damage.target === player){
                return;
            }
            // ต้องเกิดความเสียหายจริง
            if(damage.amount <= 0){
                return;
            }
            // ต้องเกิดจากการ์ด [โจมตี]
            if(!(damage.card instanceof SlashCard)){
                return;
            }
            // จำกัดการใช้ 1 ครั้งต่อ Play Phase
            if(player.axeOfInsanityUsed){
                return;
            }
            // บันทึกว่า Axe Of Insanity ถูกใช้แล้วใน Play Phase นี้
            player.axeOfInsanityUsed = true;
            // หยุด Trigger Resolution เพื่อประมวลผลผลของ Axe Of Insanity
            if(resolution){
                resolution.wait();
            }
            // อ่าน HP ของ Target หลัง Damage เพื่อเลือกผลของ Axe Of Insanity
            const targetHp = damage.target.hp;
            // อ่าน HP ปัจจุบันของพานเฟิง
            const playerHp = player.hp;
            // ตรวจสอบเงื่อนไข HP ของ Axe Of Insanity
            if(targetHp < playerHp){
                console.log(
                    "Axe Of Insanity Branch: Target HP < Pan Feng HP", targetHp, 
                    "<", playerHp
                );
            }else{
                console.log(
                    "Axe Of Insanity Branch: Target HP >= Pan Feng HP", targetHp, 
                    ">=", playerHp
                );
            }
            console.log(
                "Axe Of Insanity ตรวจ afterDamage:", 
                damage.source?.name, "→", 
                damage.target?.name, "damage =", 
                damage.amount
            );
        };

        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}