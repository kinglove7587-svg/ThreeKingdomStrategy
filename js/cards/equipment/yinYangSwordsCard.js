class YinYangSwordsCard extends WeaponCard{

    constructor(suit, number){
        super("กระบี่คู่หยินหยาง", suit, number, 2);

        this.addSkill(new YinYangSwordsSkill());
    }
    //
    onEquip(player){

        const skill = this.skills[0];
        if(!player.skills.includes(skill)){
            player.addSkill(skill);
        }
        console.log(player.name + " สวมกระบี่คู่หยินหยาง");
        
    }
    //
    onUnequip(player){

        const skill = this.skills[0];
        player.removeSkill(skill);
        console.log(player.name + " ถอดกระบี่คู่หยินหยาง");
        
    }
    getDescription(){
        return (
            "เมื่อคุณใช้ [โจมตี] กับตัวละครเพศตรงข้าม " +
            "เป้าหมายจั่วการ์ด 1 ใบเพื่อตัดสินสี " +
            "หากเป็นสีดำ เป้าหมายต้องทิ้งการ์ด 1 ใบ " +
            "หากเป็นสีแดง คุณจั่วการ์ด 1 ใบ"
        );
    }
}