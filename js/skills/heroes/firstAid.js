class FirstAid extends ActiveSkill{

    constructor(){
        super("First Aid");
    }
    // First Aid เลือกได้เฉพาะการ์ดสีแดง
    canSelectSkillCard(player, card, game){

        if(!card){
            return false;
        }
        // ใช้ JudgeResult ที่มีอยู่แล้วตรวจสีของการ์ด
        const judgeResult = new JudgeResult(card);
        return judgeResult.isRed();
    }
}