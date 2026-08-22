class SixSwordsOfWuCard extends WeaponCard{

    constructor(suit, number){
        super("กระบี่หกเล่มแห่งง่อก๊ก", suit, number, 2);

        this.addSkill(new SixSwordsOfWuSkill());
    }
    // ทำงานเมื่อผู้เล่นสวมใส่กระบี่หกเล่มแห่งง่อก๊ก
    onEquip(player){

        const skill = this.skills[0];
        // ตรวจสอบว่ามีสกิลนี้อยู่แล้วหรือยัง เพื่อป้องกันการเพิ่มสกิลซ้ำ
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมกระบี่หกเล่มแห่งง่อก๊ก");
        
    }
    // ทำงานเมื่อผู้เล่นถอดกระบี่หกเล่มแห่งง่อก๊ก
    onUnequip(player){

        const skill = this.skills[0];
        player.removeSkill(skill);
        console.log(player.name + " ถอดกระบี่หกเล่มแห่งง่อก๊ก");
        
    }
    getDescription(){
        return "อาวุธระยะ 2 ผู้เล่นคนอื่นฝ่ายเดียวกับคุณมีระยะโจมตีเพิ่มขึ้น 1";
    }
}