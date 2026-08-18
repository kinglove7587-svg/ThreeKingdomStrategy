class GreenDragonBladeSkill extends TriggerSkill{
    // GreenDragonBladeSkill (สกิลผูกง้าวมังกรเขียว)
    constructor(){
        super("ง้าวมังกรเขียว");
    }
    // ลงทะเบียนฟัง Event หลังจากการตรวจ Dodge ของการ์ด Slash
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeSlashHit", 
            this.onBeforeSlashHit.bind(this, player)
        );
    }
    // ตรวจสอบว่า Slash ของผู้สวมอาวุธนี้ถูกหลบหรือไม่
    onBeforeSlashHit(player, context){

        if(!context.canceled){
            return;
        }

        if(context.source !== player){
            return;
        }
        console.log(
            player.name + " ง้าวมังกรเขียว: Slash ถูกหลบโดย " +
            context.target.name
        );
        
    }
}