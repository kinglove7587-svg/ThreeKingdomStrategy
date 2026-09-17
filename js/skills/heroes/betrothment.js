class Betrothment extends ActiveSkill{

    constructor(){
        super("Betrothment");

        this.usedThisPlayPhase = false;
    }
    // รีเซ็ตสิทธิ์การใช้ Skill เมื่อเริ่ม Play Phase ใหม่
    onPlayPhase(player, game){

        if(player !== this.owner){
            return;
        }
        this.usedThisPlayPhase = false;
    }
    // ตรวจสอบเงื่อนไขการใช้ Skill
    canUse(player, game){

        if(player !== this.owner){
            return false;
        }
        if(game.getCurrentPlayer() !== player){
            return false;
        }
        if(this.usedThisPlayPhase){
            return false;
        }
        // ต้องมีการ์ดในมืออย่างน้อย 2 ใบ
        if(player.hand.cards.length < 2){
            return false;
        }
        // ต้องมี Target ที่สามารถเลือกได้อย่างน้อย 1 คน
        return game.players.some(
            target => this.canTarget(player, target)
        );
    }
    // Betrothment ต้องเลือก Target ก่อน
    needsTarget(player, game){
        return true;
    }
    // ตรวจสอบ Target
    canTarget(player, target){
        return (
            target && 
            target !== player && 
            target.isAlive() && 
            target.gender === "male" && 
            target.hp < target.maxHp
        );
    }
    // ต้องเลือกการ์ดจากมือ
    needsCardSelection(player, game){
        return true;
    }
    // ต้องเลือกการ์ด 2 ใบ
    cardSelectionCount(player, game){
        return 2;
    }
    // ต้องกดยืนยันหลังเลือกการ์ดครบ 2 ใบ
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // Betrothment เลือกการ์ดได้ทุกประเภท
    canSelectSkillCard(player, card, game){
        return !!card;
    }
    // ประมวลผล Betrothment
    use(player, game){

        if(!this.canUse(player, game)){
            return false;
        }

        const controller = player.controller;
        const target = controller.getSelectedTarget();
        const selectedIndices = [
            ...controller.selectedSkillCardIndices
        ];
        // Revalidate Target
        if(!this.canTarget(player, target)){
            controller.selectedTarget = null;
            controller.selectedSkillCardIndices = [];
            controller.selectedSkillCardIndex = -1;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return false;
        }
        // Revalidate Card Selection
        if(
            selectedIndices.length !== 2 || 
            new Set(selectedIndices).size !== 2
        ){
            controller.selectedTarget = null;
            controller.selectedSkillCardIndices = [];
            controller.selectedSkillCardIndex = -1;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return false;
        }

        const selectedCards = selectedIndices.map(
            index => player.hand.cards[index]
        );
        // ตรวจว่าการ์ดที่เลือกยังอยู่ในมือจริง
        if(selectedCards.some(card => !card)){
            controller.selectedTarget = null;
            controller.selectedSkillCardIndices = [];
            controller.selectedSkillCardIndex = -1;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return false;
        }
        // Discard 2 Cards
        const discardedCards = [];
        // ลบจาก Index มากไปน้อย เพื่อป้องกัน Index เลื่อน
        const sortedIndices = [...selectedIndices]
            .sort((a, b) => b - a);
        for(const index of sortedIndices){
            const card = player.hand.removeCard(index);
            if(!card){
                return false;
            }
            game.discardPile.addCard(card);
            discardedCards.push(card);
        }
        // ใช้สิทธิ์ Betrothment
        this.usedThisPlayPhase = true;
        game.log(
            player.name + " ใช้ Betrothment กับ " + 
            target.name + " ทิ้งการ์ด " + 
            discardedCards.length + " ใบ: " + 
            discardedCards.map(card => card.name).join(", ")
        );
        // Recovery Order
        player.recoverHp(1);
        target.recoverHp(1);
        return true;
    }
    getDescription(){
        return (
            "Betrothment (สายสัมพันธ์สมรส)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase " +
            "คุณสามารถเลือกตัวละครเพศชายที่บาดเจ็บ 1 คน " +
            "จากนั้นทิ้งการ์ด 2 ใบจากมือของคุณ " +
            "เพื่อให้ทั้งคุณและตัวละครชายที่เลือกฟื้นฟู HP 1 หน่วย"
        );
    }
}