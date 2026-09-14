class Wizardry extends PassiveSkill{

    constructor(){
        super("Wizardry");
    }
    // ตรวจสอบว่า Card ใบนี้ได้รับสิทธิ์ไม่จำกัดระยะจาก Wizardry หรือไม่
    canIgnoreEffectDistance(player, card, game){

        if(player !== this.owner){
            return false;
        }
        if(
            !(card instanceof TrickCard) && 
            !(card instanceof DelayedTrickCard)
        ){
            return false;
        }
        return true;
    }
}