class SixSwordsOfWuSkill extends PassiveSkill{

    constructor(){
        super("กระบี่หกเล่มแห่งง่อก๊ก");
    }
    // เพิ่มระยะโจมตีให้กับผู้เล่นฝ่ายเดียวกันที่ถืออาวุธนี้
    getAttackDistanceModifier(player, attacker, target, game){
        // ผู้ถืออาวุธไม่รับโบนัสจากอาวุธของตัวเอง
        if(player === attacker){
            return 0;
        }
        // ต้องเป็นผู้เล่นฝ่ายเดียวกับเจ้าของอาวุธ
        if(player.faction !== attacker.faction){
            return 0;
        }
        return 1;
    }
}