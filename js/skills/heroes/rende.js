class Rende extends ActiveSkill{ 
    // กำหนด constructor สืบทอดจาก ActiveSkill และระบุชื่อสกิล "Rende" (จิตเมตตา)
    constructor(){
        super("Rende"); // จิตเมตตา
        this.rendeCardCount = 0; // เปลี่ยนมาใช้นับจำนวนการ์ดที่มอบในเทิร์นนี้แทน
    }
    // เริ่มเทิร์นใหม่ รีเซ็ตจำนวนการ์ดที่มอบให้กลับเป็น 0
    onTurnStart(player, game){
        this.rendeCardCount = 0;
    }
    // เช็กเงื่อนไขการใช้งาน: ใช้งานได้เรื่อยๆ ตราบใดที่ยังมีการ์ดในมือ
    canUse(player, game){
        return player.hand.cards.length > 0;
    }
    // ตรวจสอบว่าสามารถเลือกผู้เล่นคนนี้เป็นเป้าหมายของ Rende ได้หรือไม่
    canTarget(player, target){
        // Rende ต้องมอบการ์ดให้ตัวละครอื่น ห้ามเลือกตัวเอง
        return player !== target;
    }
    // ประมวลผลการใช้สกิล Rende 
    use(player, game){
        // เช็กก่อนว่าผ่านเงื่อนไขการใช้งานหรือไม่ หากไม่มีไพ่ในมือให้ยกเลิกการทำงาน
        if (!this.canUse(player, game)){
            return false;
        }
        let target;
        // ถ้าผู้ใช้เป็น Human ให้ดึงเป้าหมายจากการเลือก
        if(player.controller.isHuman()){
            target = player.controller.getSelectedTarget();
            // ถ้ายังไม่ได้เลือกเป้าหมาย ให้เปลี่ยนสถานะ HumanController เข้าสู่การรอเลือก Target
            if(!target){
                player.controller.startSkillTargetSelection(this);
                return false;
            }
        }else{
            // ถ้าเป็น AI ให้เลือกเป้าหมายเป็นผู้เล่นถัดไป
            target = game.getNextPlayer();
        }
        let cardIndex;
        // ตรวจสอบและเลือกเป้าหมาย (Target)
        if(player.controller.isHuman()){
            cardIndex = player.controller.selectedSkillCardIndex;
            // ถ้ายังไม่ได้เลือกเป้าหมาย ให้สั่งเข้าสู่สถานะรอเลือกเป้าหมายก่อน
            if(cardIndex === -1){
                player.controller.selectedSkill = this;
                player.controller.inputState = "waitingSkillCard";
                player.controller.game.ui.render();
                return false;
            }
        }else{
            // AI ยังเลือกใบแรก
            cardIndex = 0;
        }
        //
        const card = player.hand.removeCard(cardIndex);
        // เช็กความปลอดภัย หากดึงไพ่ไม่ได้ (ได้ค่า null) ให้ยกเลิกการทำงาน
        if (card === null){
            return false;
        }
        // นำการ์ดใบนั้นย้ายเข้าไปใส่ไว้ในมือของผู้เล่นเป้าหมาย
        target.hand.addCard(card);
        // เพิ่มจำนวนการ์ด Rende ที่มอบไปแล้วในเทิร์นนี้
        this.rendeCardCount++;
        // แสดง Log การใช้สกิล รายชื่อการ์ดที่มอบ และผู้รับ
        game.log(
            player.name + 
            " ใช้สกิล Rende (จิตเมตตา) มอบ " + 
            card.name + 
            " ให้ " +
            target.name
        );
        // มอบการ์ดใบที่ 2 ในเทิร์นนี้ จะฟื้น HP 1
        if(this.rendeCardCount === 2 && player.hp < player.maxHp){
            player.heal(1);
        }
        // แสดงรายการไพ่ในมือล่าสุดของผู้ใช้สกิลและผู้รับ
        player.showHand();
        target.showHand();
        // ส่งค่า true กลับไปเมื่อส่งมอบไพ่สำเร็จ
        return true;
        
    }
}