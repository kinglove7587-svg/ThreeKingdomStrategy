class FrostSwordCard extends WeaponCard{

    constructor(suit, number){
        super("กระบี่น้ำแข็ง",suit, number, 2);

        this.addSkill(new FrostSwordSkill());
    }
    // ทำงานเมื่อผู้เล่นสวมใส่อาวุธกระบี่น้ำแข็ง
    onEquip(player){

        const skill = this.skills[0];
        // ตรวจสอบว่ามีสกิลนี้อยู่แล้วหรือยัง เพื่อป้องกันการเพิ่มสกิลซ้ำ
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมกระบี่น้ำแข็ง");
        
    }
}