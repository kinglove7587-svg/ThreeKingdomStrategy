class YinYangSwordsSkill extends TriggerSkill{

    constructor(){
        super("กระบี่คู่หยินหยาง");
    }
    // ลงทะเบียน Event Listener เมื่อตัวละครติดตั้งอาวุธ
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeDamage", 
            this.onBeforeDamage.bind(this, player)
        );
    }
    // ดักจับ Event ก่อนเกิด Damage
    onBeforeDamage(player, damage){
        // ตรวจสอบว่าผู้สร้างความเสียหายคือผู้สวมใส่อาวุธหรือไม่
        if(damage.source !== player){
            return;
        }

        const target = damage.target;
        if(!target){
            return;
        }
        // ตรวจสอบข้อมูลเพศของทั้งสองฝั่ง
        if(!player.gender || !target.gender){
            return;
        }
        // หากเพศเดียวกัน สกิลจะไม่ทำงาน
        if(player.gender === target.gender){
            return;
        }
        console.log(player.name + " ใช้กระบี่คู่หยินหยางกับ " + target.name);
        
    }
}