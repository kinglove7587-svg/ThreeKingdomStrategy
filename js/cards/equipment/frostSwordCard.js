class FrostSwordCard extends WeaponCard{

    constructor(suit, number){
        super("กระบี่น้ำแข็ง",suit, number, 2);

        this.addSkill(new FrostSwordSkill());
    }
}