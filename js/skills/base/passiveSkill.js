class PassiveSkill extends Skill{
    //
    constructor(name){
        super(name);
    }
    // 
    getAttackDistanceModifier(player, attacker, target, game){
        return 0;
    }
    // ใช้สำหรับ PassiveSkill ที่ต้องการปรับ Hand Limit
    getHandLimitModifier(player, game){
        return 0;
    }
}