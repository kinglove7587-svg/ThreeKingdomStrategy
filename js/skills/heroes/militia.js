class Militia extends PassiveSkill{

    constructor(){
        super("Militia");
    }
    // ตรวจสอบและปรับ Effective Distance ตาม HP ของกองซุนจ้าน
    getEffectDistanceModifier(player, fromPlayer, toPlayer, game){
        // HP มากกว่า 2 และกองซุนจ้านเป็นฝ่ายกระทำ
        if(
            player.hp > 2 && 
            player === fromPlayer
        ){
            return -1;
        }
        // HP น้อยกว่าหรือเท่ากับ 2 และกองซุนจ้านเป็นเป้าหมาย
        if(
            player.hp <= 2 && 
            player === toPlayer
        ){
            return 1;
        }
        return 0;
    }
}