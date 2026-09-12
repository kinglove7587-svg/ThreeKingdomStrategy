class Captivating extends ActiveSkill{

    constructor(){
        super("Captivating");
    }
    // ใช้สกิลได้เมื่อมีการ์ด ♦️ อย่างน้อย 1 ใบในมือ
    canUse(player, game){
        return player.hand.cards.some(
            card => card.suit === "♦️"
        );
    }
    // ห้ามเลือกตัวเองเป็น Target
    canTarget(player, target){
        return player !== target;
    }
    // ต้องเลือก Target ก่อน
    needsTarget(player, game){
        return true;
    }
    // หลังเลือก Target ต้องเข้าสู่ขั้นเลือกการ์ด
    needsCardSelection(player, game){
        return true;
    }
    // เลือกการ์ดเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // ต้องกดยืนยันหลังเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // อนุญาตเฉพาะการ์ด ♦️
    canSelectSkillCard(player, card, game){
        if(!card){
            return false;
        }
        return card.suit === "♦️";
    }
    // ประมวลผล Captivating หลังเลือก Target และการ์ดแล้ว
    use(player, game){

        const controller = player.controller;
        const target = controller.getSelectedTarget();
        // ดึง Index ของการ์ดที่เลือก
        const selectedIndex = controller.selectedSkillCardIndices[0];
        if(!target || selectedIndex === undefined){
            return false;
        }
        // ดึงการ์ดจริงจากมือ
        const selectedCard = player.hand.cards[selectedIndex];
        if(!selectedCard){
            return false;
        }
        // ตรวจซ้ำว่าเป็น ♦️ จริง
        if(selectedCard.suit !== "♦️"){
            return false;
        }
        // นำการ์ด ♦️ ออกจากมือ
        const delayedCard = player.hand.removeCard(selectedIndex);
        if(!delayedCard){
            return false;
        }
        // เก็บ onJudge เดิมของการ์ดไว้
        const originalOnJudge = delayedCard.onJudge;
        // ทำให้การ์ด ♦️ ใบนี้ทำงานเหมือน LeBuSiShu
        delayedCard.onJudge = function(judgePlayer){

            const delayedCardInstance = this;
            game.log(
                judgePlayer.name + " เริ่ม Judge สุราลืมกลับจาก Captivating"
            );
            game.judge(
                judgePlayer, 
                (result) => {
                    // ถ้าไม่ใช่ ♥️ เป้าหมายข้าม Play Phase
                    if(!result.isHeart()){
                        game.log(
                            judgePlayer.name + " ถูกสุราลืมกลับจาก Captivating"
                        );
                        judgePlayer.skipPlay();
                    }
                    // นำการ์ด ♦️ ใบเดิมออกจาก Delayed Trick
                    judgePlayer.removeDelayedTrick(
                        delayedCardInstance
                    );
                    // คืน onJudge เดิมของการ์ด
                    if(originalOnJudge){
                        delayedCardInstance.onJudge = originalOnJudge;
                    }else{
                        delete delayedCardInstance.onJudge;
                    }
                    // การ์ด ♦️ ใบเดิมลงกองทิ้ง
                    game.discardPile.addCard(delayedCardInstance);
                    judgePlayer.showDelayedTrick();
                }
            );
        };
        // นำการ์ด ♦️ ใบเดิมไปติดที่ Target
        target.addDelayedTrick(delayedCard);
        target.showDelayedTrick();
        game.log(
            player.name + " ใช้ " + 
            delayedCard.name + " แทน สุราลืมกลับ ใส่ " + 
            target.name
        );
        return true;
    }
    getDescription(){
        return (
            "Captivating (อาคมลุ่มหลง)\n" +
            "คุณสามารถใช้การ์ด ♦️ 1 ใบเป็น [สุราลืมกลับ]"
        );
    }
}