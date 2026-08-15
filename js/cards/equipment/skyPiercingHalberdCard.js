class SkyPiercingHalberdCard extends WeaponCard{
    constructor(suit, number){
        super("ง้าวฟ้าทะลวง", suit, number, 4);
        // Skill
        this.addSkill(new SkyPiercingHalberdSkill());
    }
    // เมื่อสวมใส่อาวุธ
    onEquip(player){

        const skill = this.skills[0];

        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }

        console.log(player.name + " สวมง้าวฟ้าทะลวง");
    }
    // เมื่อถอดอาวุธ
    onUnequip(player){

        const skill = this.skills[0];
        player.removeSkill(skill);

        console.log(player.name + " ถอดง้าวฟ้าทะลวง");
    }
    // ข้อความอธิบายความสามารถการ์ด
    getDescription(){
        return "เมื่อใช้ โจมตี เป็นการ์ดใบสุดท้ายในมือ สามารถเลือกตัวละครเพิ่มได้อีก 2 คน"
    }
}