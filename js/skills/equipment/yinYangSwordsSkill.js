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
        // ใช้ระบบ Judge กลาง เพื่อให้ Necromancy สามารถแทรกได้
        const judgeResult = game.judge(
            target, 
            (result) => {
                // ตรวจผล Judge หลัง Trigger ทั้งหมดทำงานเสร็จ
                if(!result){
                    damage.waitingTrigger = false;
                    damage.resume();
                    return;
                }
                if(result.isBlack()){
                    game.log("ผลตัดสิน = สีดำ");
                    // เก็บ Context สำหรับการเลือกการ์ดของเป้าหมาย
                    const context = {
                        damage: damage, 
                        attacker: player, 
                        target: target, 
                        judgeCard: result.card
                    };
                    // เริ่มขั้นตอนให้เป้าหมายเลือกการ์ดทิ้ง
                    player.controller.startYinyangDiscardSelection(context);
                    return;
                }
                if(result.isRed()){
                    game.log("ผลตัดสิน = สีแดง");
                    // ผู้โจมตีจั่วการ์ด 1 ใบ
                    const drawCard = game.drawCardFromDeck();
                    if(drawCard){
                        player.hand.addCard(drawCard);
                        game.log(player.name + " จั่วการ์ด 1 ใบด้วยกระบี่คู่หยินหยาง");
                    }
                    // Judge จบแล้ว ให้ Damage เดินต่อ
                    damage.waitingTrigger = false;
                    damage.resume();
                }
            }
        );
        // ถ้า Judge ไม่สามารถเริ่มได้ และไม่มี Judge Trigger กำลังรอ
        if(judgeResult === null && !game.pendingJudge){
            damage.waitingTrigger = false;
            damage.resume();
        }        
    }
}