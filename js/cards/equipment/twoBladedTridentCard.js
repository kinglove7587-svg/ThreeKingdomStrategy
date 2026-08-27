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
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เมื่อ Slash ของคุณสร้างความเสียหายสำเร็จ สามารถทิ้งการ์ด 1 ใบ เพื่อโจมตีผู้เล่นคนอื่นที่อยู่ห่างจากเป้าหมายเดิมไม่เกิน 1 ด้วยความเสียหาย 1 และ PassiveSkill ตัวละครที่โดนโจมตี ไม่สามารถใช้ได้"
    }
}