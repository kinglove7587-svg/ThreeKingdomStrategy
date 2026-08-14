class TwoBladedTridentCard extends WeaponCard{
    constructor(suit, number){
        super("ง้าวสามคม", suit, number, 3);
        // ผูก Trigger Skill ของง้าวสามคมเข้ากับการ์ด
        this.addSkill(new TwoBladedTridentSkill());
    }
    // เพิ่มสกิลง้าวสามคมให้ตัวผู้เล่นเมื่อสวมใส่
    onEquip(player){
        const skill = this.skills[0];
        
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }

        console.log(player.name + " สวมง้าวสามคม");
    }
    // ถอดสกิลง้าวสามคมออกจากตัวผู้เล่นเมื่อถอดออก
    onUnequip(player){
        const skill = this.skills[0];
        
        player.removeSkill(skill);

        console.log(player.name + " ถอดง้าวสามคม");
    }
}