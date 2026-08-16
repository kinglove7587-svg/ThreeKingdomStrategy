class BlueSteelSwordCard extends WeaponCard{
    // การ์ดอุปกรณ์ประเภทอาวุธ "กระบี่เหล็กกล้า" (ระยะ 2)
    constructor(suit, number){
        super("กระบี่เหล็กกล้า", suit, number, 2);
        // addSkill
        this.addSkill(new BlueSteelSwordSkill());
    }
    // ทำงานเมื่อผู้เล่นทำการสวมใส่อาวุธชิ้นนี้
    onEquip(player){
        
        const skill = this.skills[0];
        // หากผู้เล่นยังไม่มี สกิลกระบี่เหล็กกล้า ให้ทำการเพิ่มสกิลเข้าตัวผู้เล่น
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมกระบี่เหล็กกล้า");
    }
    // ทำงานเมื่อถอดอาวุธชิ้นนี้ออก
    onUnequip(player){
        
        const skill = this.skills[0];
        // ถอดสกิลกระบี่เหล็กกล้า ออกจากตัวผู้เล่น
        player.removeSkill(skill);
        console.log(player.name + " ถอดกระบี่เหล็กกล้า");
        
    }
    // ส่งคืนคำอธิบายความสามารถของการ์ดเพื่อแสดงใน UI / Tooltip
    getDescription(){
        return "เมื่อใช้ โจมตี การโจมตีนั้นไม่สนผลของเกราะเป้าหมาย";
    }
}