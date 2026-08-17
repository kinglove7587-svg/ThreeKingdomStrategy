class BorrowedSwordCard extends TrickCard{
    // ตัวสร้างการ์ด Borrowed Sword
    constructor(suit, number){
        super("ยืมดาบสังหาร", suit, number);
    }
    // การ์ดใบนี้ต้องเลือก Target
    needTarget(){
        return true;
    }
    // Target ต้องมีอาวุธ และห้ามเลือกตัวเอง
    canTarget(player, target){

        if(player === target){
            return false;
        }

        if(!target.weapon){
            return false;
        }
        return true;
    }
    //  ตรวจสอบ Target และขโมยอาวุธเมื่อไม่มีการ์ดโจมตี
    use(player, game){

        const target = player.controller.getSelectedTarget();
        if(!target){
            return false;
        }
        game.log("→ เป้าหมาย : " + target.name);
        // ตรวจสอบว่า Target มีการ์ดโจมตีหรือไม่
        const slashCards = target.hand.findSlashCards();
        // กรณี Target มีการ์ดโจมตี ให้ผู้ใช้เลือกเป้าหมายที่ 2 ที่จะให้ Target โจมตีใส่
        if(slashCards.length > 0){
            player.controller.startBorrowedSwordTargetSelection({
                attacker: target, 
                slashCard: slashCards[0]
            });
            return true;
        }
        // กรณี Target ไม่มีโจมตี ให้ขโมยอาวุธเข้ามือผู้ใช้ทันที
        const weapon = target.unequipWeapon();
        if(!weapon){
            return false;
        }
        player.hand.addCard(weapon);
        game.log(player.name + " ขโมย " + weapon.name + " จาก " + target.name);
        return true;
    }
    // คำอธิบายการ์ด
    getDescription(){
        return "เลือกผู้เล่นอื่นที่มีอาวุธ หากเป้าหมายมี โจมตี ให้บังคับใช้ โจมตี และผู้ใช้เป็นผู้เลือกเป้าหมายของการโจมตี ตามระยะของผู้ใช้อาวุธ มิฉะนั้นขโมยอาวุธ"
    }
}