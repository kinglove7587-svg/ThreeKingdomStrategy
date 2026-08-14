class RockCleavingAxeCard extends WeaponCard{
    constructor(suit, number){
        super("ขวานผ่าศิลา", suit, number, 3);
        // ผูก Skill ของขวานเข้ากับการ์ด
        this.addSkill(new RockCleavingAxeSkill());
    }
    // เพิ่มสกิลขวานผ่าศิลาให้ตัวผู้เล่นเมื่อสวมใส่
    onEquip(player){
        const skill = this.skills[0];
        
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }

        console.log(player.name + " สวมขวานผ่าศิลา");
    }
    // ถอดสกิลขวานผ่าศิลาออกจากตัวผู้เล่นเมื่อถอดอาวุธ
    onUnequip(player){
        const skill = this.skills[0];
        
        player.removeSkill(skill);

        console.log(player.name + " ถอดขวานศิลา");
    }
}