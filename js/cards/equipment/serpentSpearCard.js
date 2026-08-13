class SerpentSpearCard extends WeaponCard{
    constructor(suit, number){
        super("ง้าวอสรพิษ", suit, number, 3);
        // Active Skill
        this.addSkill(new SerpentSpearSkill());
    }
    // เมื่อสวมใส่อาวุธ ให้มอบ Active Skill ของอาวุธนี้ให้ผู้เล่นใช้งาน
    onEquip(player){
        const skill = this.skills[0];
        
        if(!player.skills.includes(skill)){
            
            player.addSkill(skill);
        }

        console.log(player.name + " สวมง้าวอสรพิษ");
    }
    // เมื่อถอดอาวุธ ให้นำ Active Skill ของอาวุธออกจากผู้เล่น
    onUnequip(player){
        const skill = this.skills[0];
        
        player.removeSkill(skill);

        console.log(player.name + " ถอดง้าวอสรพิษ");
    }
}