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
        game.log(player.name + " ใช้กระบี่คู่หยินหยางกับ " + target.name);

        // ล็อก Damage ไว้ระหว่างรอ Judge และ Trigger ที่อาจแทรก
        damage.waitingTrigger = true;
        // ใช้ Trigger Choice เดิมของเกม
        player.controller.startTriggerChoice(
            this, 
            {
                damage: damage
            }
        );
    }
    // เรียกใช้เมื่อผู้เล่นเลือกว่าจะใช้สกิลหรือไม่
    resolveChoice(player, game, context, usedSkill){

        if(!context || !context.damage){
            return false;
        }

        const damage = context.damage;
        const target = damage.target;
        // ไม่ใช้กระบี่คู่หยินหยาง
        if(!usedSkill){
            game.log(player.name + " ไม่ใช้กระบี่คู่หยินหยาง");
            damage.waitingTrigger = false;
            return damage.resume();
        }
        // ใช้ Judge กลางของเกม
        return game.judge(
            target, 
            (judgeResult) => {
                // ป้องกันกรณี Judge ไม่มีผลลัพธ์
                if(!judgeResult){
                    damage.waitingTrigger = false;
                    return damage.resume();
                }
                if(judgeResult.isBlack()){
                    game.log("ผลตัดสิน = สีดำ");
                    // เก็บ Context สำหรับการเลือกการ์ดทิ้ง
                    const yinYangContext = {
                        damage: damage, 
                        attacker: player, 
                        target: target, 
                        judgeCard: judgeResult.card
                    };
                    // เริ่ม Flow เลือกการ์ดทิ้ง
                    player.controller.startYinYangDiscardSelection(yinYangContext);
                    return true;
                }
                if(judgeResult.isRed()){
                    game.log("ผลตัดสิน = สีแดง");
                    const drawCard = game.drawCardFromDeck();
                    if(drawCard){
                        player.hand.addCard(drawCard);
                        game.log(player.name + " จั่วการ์ด 1 ใบด้วยกระบี่คู่หยินหยาง");
                    }
                    // Judge จบแล้ว ให้ Damage เดินต่อ
                    damage.waitingTrigger = false;
                    return damage.resume();
                }
                return true;
            }
        );
    }
}