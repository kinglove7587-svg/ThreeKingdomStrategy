class BraveheartSlash extends ActiveSkill{

    constructor(){
        super("Braveheart Slash");
        // เก็บ DodgeCard ตัวจริงระหว่างรอเลือกเป้าหมาย
        this.selectedCard = null;
    }
    // ตรวจสอบว่าสามารถใช้สกิลได้หรือไม่
    canUse(player, game){
        return (
            player.canUseSlash() && 
            player.hand.cards.some(card => card instanceof DodgeCard)
        );
    }
    // ตรวจสอบว่าต้องการเลือกเป้าหมายหรือไม่
    needsTarget(player, game){
        return this.selectedCard !== null;
    }
    // ตรวจสอบว่าต้องเลือกการ์ดจากมือหรือไม่
    needsCardSelection(player, game){
        return this.selectedCard === null;
    }
    // ระบุจำนวนการ์ดที่ต้องเลือก
    cardSelectionCount(player, game){
        return 1;
    }
    // ตรวจสอบว่าเป้าหมายถูกต้องหรือไม่
    canTarget(player, target){
        return SlashCard.prototype.canTarget.call(
            new SlashCard("♠️", 1), 
            player, 
            target
        );
    }
    // อนุญาตให้เลือกเฉพาะการ์ดหลบ
    canSelectSkillCard(player, card, game){
        return card instanceof DodgeCard;
    }
    // รอการยืนยันการเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // รอการยืนยันการเลือกเป้าหมาย
    waitForTargetConfirmation(player, game){
        return true;
    }
    // ใช้สกิล Braveheart Slash
    use(player, game){

        const controller = player.controller;
        // รอบแรก: หลังยืนยันการเลือก Dodge
        if(this.selectedCard === null){

            const selectedIndex = controller.selectedSkillCardIndices[0];
            const selectedCard = player.hand.cards[selectedIndex];
            if(!(selectedCard instanceof DodgeCard)){
                return false;
            }
            this.selectedCard = selectedCard;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return true;
        }
        // รอบสอง: หลังยืนยัน Target
        const target = controller.getSelectedTarget();
        if(!target){
            return false;
        }
        // ตรวจสอบว่า DodgeCard ตัวเดิมยังอยู่ในมือจริง
        const selectedIndex = player.hand.cards.indexOf(this.selectedCard);
        if(selectedIndex === -1){
            this.selectedCard = null;
            return false;
        }
        // ตรวจสอบ Slash อีกครั้งก่อนนำการ์ดออกจากมือ
        if(!player.canUseSlash()){
            this.selectedCard = null;
            return false;
        }
        // ตรวจสอบ Target อีกครั้ง
        if(!this.canTarget(player, target)){
            return false;
        }
        game.log(player.name + " ใช้ Braveheart Slash");
        // นำ DodgeCard ตัวจริงออกจากมือ
        const usedCard = player.hand.removeCard(selectedIndex);
        if(!usedCard){
            this.selectedCard = null;
            return false;
        }
        // ทิ้ง DodgeCard ตัวเดิมลง Discard Pile
        game.discardPile.addCard(usedCard);
        // ใช้ Slash Engine เดิมเป็นตัวประมวลผลการโจมตี
        const slashCard = new SlashCard(
            usedCard.suit, 
            usedCard.number
        );

        const success = slashCard.use(player, game);
        this.selectedCard = null;
        return success;
    }
    getDescription(){
        return "คุณสามารถใช้หรือเล่น หลบ เป็น โจมตี";
    }
}