class GreenDragonBladeCard extends WeaponCard{
    // GreenDragonBladeCard (การ์ดง้าวมังกรเขียว)
    constructor(suit, number){
        super("ง้าวมังกรเขียว", suit, number, 3);

        this.addSkill(new GreenDragonBladeSkill());
    }
    // เพิ่ม Skill ตอนสวมใส่
    onEquip(player){

        const skill = this.skills[0];
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมง้าวมังกรเขียว");
    }
    // ลบ Skill ตอนถอด
    onUnequip(player){

        const skill = this.skills[0];
        player.removeSkill(skill);
        console.log(player.name + " ถอดง้าวมังกรเขียว");
        
    }
    // คำอธิบายการ์ด
    getDescription(){
        return "เมื่อ โจมตี ของคุณถูกหลบ คุณสามารถใช้ โจมตี ต่อใส่เป้าหมายเดิม"
    }
}