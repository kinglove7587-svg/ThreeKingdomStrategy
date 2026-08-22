class PassiveSkill extends Skill{
    //
    constructor(name){
        super(name);
    }
    // 
    getAttackDistanceModifier(player, attacker, target, game){
        return 0;
    }
}