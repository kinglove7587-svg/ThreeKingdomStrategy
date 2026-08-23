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
    // First Aid เลือกการ์ดได้เพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // First Aid รอการยืนยัน และกดการ์ดเดิมซ้ำเพื่อยกเลิกได้
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
}