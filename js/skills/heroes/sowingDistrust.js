class SowingDistrust extends ActiveSkill{

    constructor(){
        super("Sowing Distrust");

        this.usedThisPlayPhase = false;
    }
    // รีเซ็ตสถานะการใช้สกิลเมื่อเริ่มเทิร์น
    onTurnStart(player, game){
        this.usedThisPlayPhase = false;
    }
    // ตรวจสอบว่าสามารถใช้สกิลได้หรือไม่
    canUse(player, game){
        return (
            !this.usedThisPlayPhase && 
            player.hand.cards.length > 0
        );
    }
    // สกิลนี้ต้องเลือกเป้าหมาย
    needsTarget(player, game){
        return true;
    }
    needsCardSelection(player, game){
        return true;
    }
    // ตรวจสอบว่า Target สามารถถูกเลือกได้หรือไม่
    canTarget(player, target){
        return (
            target && 
            target.isAlive() && 
            target !== player
        );
    }
    // ประมวลผลการใช้สกิล
    use(player, game){

        const target = player.controller.getTarget(this);
        if(!target){
            return false;
        }

        const selectedCardIndex = player.controller.selectedSkillCardIndex;
        const selectedCard = player.hand.cards[selectedCardIndex];
        if(!selectedCard){
            return false;
        }

        this.usedThisPlayPhase = true;
        game.log(
            player.name + "  ใช้ Sowing Distrust กับ " + target.name
        );

        const resolveSuit = (chosenSuit) => {
            game.log(target.name + " เลือกดอก " + chosenSuit);

            const cardIndex = player.hand.cards.indexOf(selectedCard);
            if(cardIndex === -1){
                game.hideModal();
                game.afterHumanAction(false);
                return;
            }

            const transferredCard = player.hand.removeCard(cardIndex);
            target.hand.addCard(transferredCard);
            game.log(
                player.name + " ส่ง " + transferredCard.name + " ให้ " + target.name
            );
            game.log(
                target.name + " เปิดเผย " + 
                transferredCard.name + " " + 
                transferredCard.suit
            );
            if(transferredCard.suit === chosenSuit){
                game.log("ดอกตรงกัน → ไม่ได้รับความเสียหาย");
            }else{
                game.log("ดอกไม่ตรงกัน → เป้าหมายต้องได้รับความเสียหาย 1");

                const damage = new Damage(
                    player, 
                    target, 
                    1, 
                    DamageType.NORMAL
                );
                game.hideModal();
                // หยุด Action หลักไว้ก่อน เพื่อรอ Damage และ Trigger ทั้งหมด
                game.pauseAction(() => true);
                game.damage(damage);
                // ถ้ามี Trigger รอ Modal ให้ Trigger เป็นผู้ Resume Action ต่อ (แก้ไขชื่อคุณลักษณะเป็น Queue)
                if(game.triggerResolutionQueue.isWaiting()){
                    return true;
                }
                return game.resumeAction();
            }
            game.hideModal();
            game.afterHumanAction(true);
        };

        game.showModal({
            owner: target, 
            title: "Sowing Distrust", 
            message: target.name + "  กรุณาเลือก 1 ดอก", 
            buttons: [
                {
                    text: "♠️", 
                    onClick: () => {
                        resolveSuit("♠️")
                    }
                }, 
                {
                    text: "♥️", 
                    onClick: () => {
                        resolveSuit("♥️")
                    }
                }, 
                {
                    text: "♣️", 
                    onClick: () => {
                        resolveSuit("♣️")
                    }
                }, 
                {
                    text: "♦️", 
                    onClick: () => {
                        resolveSuit("♦️")
                    }
                }
            ]
        });
        return true;
    }
    getDescription(){
        return (
            "Sowing Distrust (แผนป้อนไส้ศึก)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถเลือกตัวละคร 1 คน " +
            "จากนั้นเลือกการ์ด 1 ใบจากมือของคุณและให้เป้าหมายเลือก 1 ดอก " +
            "หากดอกของการ์ดที่เปิดเผยแตกต่างจากดอกที่เป้าหมายเลือก " +
            "เป้าหมายได้รับความเสียหาย 1 หน่วย " +
            "(ไม่ว่าผลจะเป็นอย่างไร เป้าหมายจะเก็บการ์ดใบนั้นไว้ในมือ)"
        );
    }
}