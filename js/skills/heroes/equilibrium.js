class Equilibrium extends ActiveSkill{

    constructor(){
        super("Equilibrium");

        this.equilibriumUsed = false;
    }
    // รีเซ็ตสถานะการใช้สกิลเมื่อเริ่มเทิร์น
    onTurnStart(player, game){
        this.equilibriumUsed = false;
    }
    // ตรวจสอบว่าสามารถใช้สกิลในเทิร์นนี้ได้หรือไม่
    canUse(player, game){
        return !this.equilibriumUsed && 
            player.hand.cards.length > 0;
    }
    // สกิลนี้ไม่ต้องเลือกเป้าหมายผู้เล่น
    needsTarget(player, game){
        return false;
    }
    // สกิลนี้ต้องมีการเลือกการ์ดบนมือ
    needsCardSelection(player, game){
        return true;
    }
    // รอผู้เล่นกรดปุ่มยืนยันหลังจากเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // จำนวนการ์ดสูงสุดที่เลือกได้ตามจำนวนไพ่บนมือ
    cardSelectionCount(player, game){
        return player.hand.cards.length;
    }
    // ประมวลผลการทิ้งการ์ดและจั่วการ์ดใหม่
    use(player, game){
        
        let selectedCards = [];
        if(player.controller.isHuman()){
            selectedCards = 
                player.controller.selectedSkillCardIndices
                    .map(index => player.hand.cards[index])
                    .filter(card => card);

        }else{
            if(player.hand.cards.length > 0){
                selectedCards = [player.hand.cards[0]];
            }
        }
        if(selectedCards.length === 0){
            return false;
        }

        const selectedCardsCount = selectedCards.length;
        const selectedIndexes = selectedCards
            .map(card => player.hand.cards.indexOf(card))
            .sort((a, b) => b - a);
        
        for(const index of selectedIndexes){
            const card = player.hand.removeCard(index);
            if(!card){
                return false;
            }
            game.discardPile.addCard(card);
        }

        for(let i = 0; i < selectedCardsCount; i++){
            const newCard = game.drawCardFromDeck();
            if(!newCard){
                return false;
            }
            player.hand.addCard(newCard);
        }
        this.equilibriumUsed = true;
        game.log(
            player.name + " ใช้สกิล Equilibrium ทิ้งการ์ด " + 
            selectedCardsCount + " ใบ และจั่ว " + 
            selectedCardsCount + " ใบ"
        );
        return true;
    }
    getDescription(){
        return "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถทิ้งการ์ดจำนวนเท่าใดก็ได้ แล้วจั่วการ์ดจำนวนเท่ากัน";
    }
}