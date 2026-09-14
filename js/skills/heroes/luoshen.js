class Luoshen extends ActiveSkill{

    constructor(){
        super("Luoshen");

        this.usedThisPlayPhase = false;
        this.receivedCards = [];
    }
    // รีเซ็ตสถานะเมื่อเริ่ม Turn ใหม่
    onTurnStart(player, game){
        this.usedThisPlayPhase = false;
        this.receivedCards = [];
    }
    // ตรวจสอบว่า Luoshen สามารถใช้งานได้หรือไม่
    canUse(player, game){
        return (
            !this.usedThisPlayPhase && 
            player.hand.cards.length < 6
        );
    }
    // Luoshen ไม่ต้องเลือก Target
    needsTarget(player, game){
        return false;
    }
    // Luoshen ไม่ต้องเลือก Card จากมือ
    needsCardSelection(player, game){
        return false;
    }
    // เริ่มต้นการใช้งาน Luoshen
    use(player, game){
        // ตรวจ State อีกครั้งก่อนเริ่ม Judge จริง
        if(this.usedThisPlayPhase){
            return false;
        }
        // ถ้ามือครบ 6 ใบ ไม่ต้องเริ่ม Judge
        if(player.hand.cards.length >= 6){
            return false;
        }
        this.usedThisPlayPhase = true;
        this.receivedCards = [];
        game.log(player.name + " ใช้ Luoshen");
        // เริ่ม Judge Loop ใบแรก
        this.resolveJudge(player, game);
        return true;
    }
    // ประมวลผล Judge ของ Luoshen ครั้งละ 1 ใบ
    resolveJudge(player, game){
        // ป้องกันไม่ให้เริ่ม Judge ใหม่เมื่อมือครบ 6 ใบ
        if(player.hand.cards.length >= 6){
            this.finishLuoshen(player, game);
            return;
        }
        // ใช้ระบบ Judge กลางของ Game
        game.judge(player, (judgeResult) => {
            // ป้องกันกรณี Judge ไม่มีผลลัพธ์
            if(!judgeResult || !judgeResult.card){
                this.finishLuoshen(player, game);
                return;
            }
            // ตรวจว่า Judge เป็นสีดำหรือไม่
            if(!judgeResult.isBlack()){
                this.finishLuoshen(player, game);
                return;
            }
            // ดึง Card จริงจาก JudgeResult
            const judgeCard = judgeResult.card;
            // ค้นหา Card จริงใน Discard Pile
            const discardIndex = game.discardPile.cards.indexOf(judgeCard);
            if(discardIndex === -1){
                game.log(
                    player.name + " ไม่สามารถรับ " + 
                    judgeCard.name + " ได้ เนื่องจากการ์ดถูกนำออกจากกองทิ้งแล้ว"
                );
                this.finishLuoshen(player, game);
                return;
            }
            // นำ Card จริงออกจาก Discard Pile
            const receivedCard = game.discardPile.cards.splice(
                discardIndex, 
                1
            )[0];
            if(!receivedCard){
                this.finishLuoshen(player, game);
                return;
            }
            // นำ Judge Card เข้า Hand
            player.hand.addCard(receivedCard);
            game.ui.render();
            // เก็บ Card ที่ได้รับไว้สำหรับ Final Summary Log
            this.receivedCards.push(receivedCard);
            game.log(
                player.name + " ได้รับ " + 
                receivedCard.name + " " + 
                receivedCard.suit + " " + 
                receivedCard.number + " จาก Luoshen"
            );
            // ตรวจ Hand Limit หลังรับ Card
            if(player.hand.cards.length >= 6){
                this.finishLuoshen(player, game);
                return;
            }
            // ถ้ายังมี Hand ต่ำกว่า 6 ให้ Judge ใบถัดไป
            this.resolveJudge(player, game);
        });
    }
    // จบกระบวนการ Luoshen และสรุปผลการได้รับ Card
    finishLuoshen(player, game){
        // สร้างข้อความพื้นฐานสำหรับ Summary Log
        let message = 
            player.name + " Luoshen จบ → ได้รับการ์ดทั้งหมด " + 
            this.receivedCards.length + " ใบ";
        // ถ้ามีการ์ดที่ได้รับ ให้แสดงชื่อทั้งหมด
        if(this.receivedCards.length > 0){
            const cardName = this.receivedCards 
                .map(card => card.name) 
                .join(", ");
            message += " : " + cardName;
        }
        game.log(message);
        // Finalize Human Action หลัง Luoshen จบจริง
        if(
            player.controller.isHuman() && 
            !game.pendingJudge && 
            game.actionLocked
        ){
            game.afterHumanAction(true);
        }
    }
    getDescription(){
        return (
            "Luoshen (เทพธิดาแห่งแม่น้ำหลัว)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase " +
            "คุณสามารถทำการ Judge 1 ใบ " +
            "หากการ์ด Judge เป็นสีดำ คุณจะได้รับการ์ดใบนั้น " +
            "และสามารถทำขั้นตอนนี้ซ้ำได้ตราบใดที่การ์ด Judge ของคุณเป็นสีดำ " +
            "และการ์ดในมือของคุณต้องไม่เกิน 6 ใบ"
        );
    }
}