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
        this.usedThisPlayPhase = true;
        game.log(
            player.name + "  ใช้ Sowing Distrust กับ " + target.name
        );

        const resolveSuit = (chosenSuit) => {
            game.log(target.name + " เลือกดอก " + chosenSuit);

            const randomIndex = Math.floor(
                Math.random() * player.hand.cards.length
            );
            const transferredCard = player.hand.removeCard(randomIndex);
            if(!transferredCard){
                game.hideModal();
                game.afterHumanAction(false);
                return;
            }
            target.hand.addCard(transferredCard);
            game.log(
                player.name + " ส่ง " + transferredCard.name + " ให้ " + target.name
            );
            game.log(
                target.name + " เปิดเผย " + transferredCard.name + " " + transferredCard.suit
            );
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
            "ให้เลือก 1 ดอก จากนั้นตัวละครเป้าหมายจั่วการ์ด 1 ใบจากมือของคุณและเปิดเผยการ์ดใบนั้น " +
            "หากดอกของการ์ดที่เปิดเผยแตกต่างจากดอกการ์ดที่เลือก " +
            "ตัวละครเป้าหมายได้รับความเสียหาย 1 หน่วย " +
            "(ไม่ว่าผลจะเป็นอย่างไร ตัวละครเป้าหมายจะเก็บการ์ดใบนั้นไว้ในมือ)"
        );
    }
}