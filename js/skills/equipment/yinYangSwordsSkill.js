class YinYangSwordsSkill extends TriggerSkill{

    constructor(){
        super("กระบี่คู่หยินหยาง");
    }
    // ลงทะเบียน Event Listener เมื่อตัวละครติดตั้งอาวุธ
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeDamage", 
            (damage) => {
                this.onBeforeDamage(player, player.game, damage);
            }
        );
    }
    // ดักจับ Event ก่อนเกิด Damage
    onBeforeDamage(player, game, damage){
        // ตรวจสอบว่าผู้สร้างความเสียหายคือผู้สวมใส่อาวุธหรือไม่
        if(damage.source !== player){
            return;
        }

        const target = damage.target;
        if(!target){
            return;
        }
        // ตรวจสอบข้อมูลเพศของทั้งสองฝั่ง
        if(!player.gender || !target.gender){
            return;
        }
        // หากเพศเดียวกัน สกิลจะไม่ทำงาน
        if(player.gender === target.gender){
            return;
        }
        console.log(player.name + " ใช้กระบี่คู่หยินหยางกับ " + target.name);

        const judgeCard = game.drawCardFromDeck();
        if(judgeCard === null){
            console.log("ไม่สามารถจั่วไพ่ตัดสินได้");
            return;
        }

        const judgeResult = new JudgeResult(judgeCard);
        console.log(
            target.name + " จั่วไพ่ตัดสิน : " + 
            judgeCard.name + " " +
            judgeCard.suit + " " + 
            judgeCard.number
        );

        if(judgeResult.isBlack()){
            console.log("ผลตัดสิน = สีดำ");
            // หยุด Damage ชั่วคราว
            damage.waitingTrigger = true;
            // เก็บ Context สำหรับการเลือกการ์ดของเป้าหมาย
            const context = {
                damage: damage, 
                attacker: player, 
                target: target, 
                judgeCard: judgeCard
            };
            // เริ่มเข้าสู่ขั้นตอนให้เป้าหมายทิ้งการ์ด
            player.controller.startYinYangDiscardSelection(context);
            return;
            
        }else if(judgeResult.isRed()){
            console.log("ผลตัดสิน = สีแดง");
            // ผู้โจมตีจั่วการ์ด 1 ใบ
            const drawCard = game.drawCardFromDeck();
            // ตรวจสอบว่ากองจั่วมีการ์ดให้จั่วหรือไม่
            if(drawCard){
                // เพิ่มการ์ดเข้ามือของผู้โจมตี
                player.hand.addCard(drawCard);
                game.log(player.name + " จั่วการ์ด 1 ใบด้วยกระบี่คู่หยินหยาง");
            }
            
        }
        game.discardPile.addCard(judgeCard);
        
    }
}