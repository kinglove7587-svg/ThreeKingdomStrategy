class FirstAid extends ActiveSkill{

    constructor(){
        super("First Aid");
    }
    // First Aid ใช้กฎ Target เดียวกับ [ยา]
    canTarget(player, target){
        return (target && target.isAlive() && target.hp < target.maxHp);
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
    // ประมวลผลการใช้ First Aid
    use(player, game){
        // ดึง Target ที่เลือกไว้
        const target = player.controller.getSelectedTarget();
        // ดึง Index ของการ์ดที่เลือก
        const selectedIndex = player.controller.selectedSkillCardIndices[0];
        // ตรวจว่ามี Target และ Index การ์ดครบ
        if(!target || selectedIndex === undefined){
            return false;
        }
        // ดึงการ์ดจากมือ
        const card = player.hand.cards[selectedIndex];
        // ตรวจการ์ดซ้ำว่าเป็นสีแดงจริง
        if(!card){
            return false;
        }

        const judgeResult = new JudgeResult(card);
        if(!judgeResult.isRed()){
            return false;
        }
        // ตรวจ Target ซ้ำอีกครั้ง
        if(!this.canTarget(player, target)){
            return false;
        }
        // เอาการ์ดออกจากมือ
        const removeCard = player.hand.removeCard(selectedIndex);
        if(!removeCard){
            return false;
        }
        // ฟื้น HP 1
        target.recoverHp(1);
        // นำการ์ดลงกองทิ้ง
        game.discardPile.addCard(removeCard);
        game.log(player.name + " ใช้ First Aid กับ " + target.name);
        return true;
    }
    // First Aid ใช้ได้เมื่อมีการ์ดสีแดงในมืออย่างน้อย 1 ใบ
    canUse(player, game){
        return player.hand.cards.some(
            card => new JudgeResult(card).isRed()
        );
    }
}