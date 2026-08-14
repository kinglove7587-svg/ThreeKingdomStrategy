class RockCleavingAxeCard extends WeaponCard{
    constructor(suit, number){
        super("ขวานผ่าศิลา", suit, number, 3);
        this.addSkill(new RockCleavingAxeSkill());
    }

    onEquip(player){
        const skill = this.skills[0];

        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }

        console.log(player.name + " สวมขวานผ่าศิลา");
    }

    onUnequip(player){
        const skill = this.skills[0];

        player.removeSkill(skill);

        console.log(player.name + " ถอดขวานผ่าศิลา");
    }
}
