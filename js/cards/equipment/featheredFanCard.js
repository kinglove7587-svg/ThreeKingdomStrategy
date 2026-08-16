class FeatheredFanCard extends WeaponCard{
    // การ์ดอุปกรณ์ประเภทอาวุธ "พัดขนนก" (ระยะโจมตี 4)
    constructor(suit, number){
        super("พัดขนนก", suit, number, 4);
        // ผูก FeatheredFanSkill เข้ากับตัวการ์ด
        this.addSkill(new FeatheredFanSkill());
    }
    // ทำงานเมื่อผู้เล่นสวมใส่อาวุธ
    onEquip(player){

        const skill = this.skills[0];
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมพัดขนนก");
        
    }
    // ทำงานเมื่อผู้เล่นถอดอาวุธออก
    onUnequip(player){

        const skill = this.skills[0];
        player.removeSkill(skill);
        console.log(player.name + " ถอดพัดขนนก");
        
    }
    // คืนค่าคำอธิบายความสามารถของการ์ด
    getDescription(){
        return "เมื่อใช้ โจมตี สามารถเปลี่ยนเป็น โจมตีไฟ";
    }
}