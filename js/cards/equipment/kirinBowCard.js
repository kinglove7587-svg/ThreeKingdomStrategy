class KirinBowCard extends WeaponCard{
    constructor(suit, number){
        super("กิเลนคันธนู", suit ,number, 5);

        this.addSkill(new KirinBowSkill());
    }
    //
    onEquip(player){
        //
        const skill = this.skills[0];
        //
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }

        console.log(player.name + " สวมกิเลนคันธนู");

    }
    //
    onUnequip(player){
        //
        const skill = this.skills[0];
        //
        player.removeSkill(skill);

        console.log(player.name + " ถอดกิเลนคันธนู");
    }
}