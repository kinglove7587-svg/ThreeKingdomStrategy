class HorseRiding extends PassiveSkill{

    constructor(){
        super("Horse Riding");
    }
    // ตรวจสอบและลด Effective Distance เมื่อม้าเฉียวเป็นฝ่ายกระทำ
    getEffectDistanceModifier(player, fromPlayer, toPlayer, game){

        if(player === fromPlayer){
            return -1;
        }
        return 0;
    }
}