class Rende extends ActiveSkill{ 
    // กำหนด constructor สืบทอดจาก ActiveSkill และระบุชื่อสกิล "Rende" (จิตเมตตา)
    constructor(){
        super("Rende"); // จิตเมตตา
        this.rendeCardCount = 0; // เปลี่ยนมาใช้นับจำนวนการ์ดที่มอบในเทิร์นนี้แทน
        // ป้องกันการฟื้น HP จาก Rende มากกว่า 1 ครั้งต่อเทิร์น
        this.rendeHpRecovered = false;
    }
    // เริ่มเทิร์นใหม่ รีเซ็ตจำนวนการ์ดที่มอบให้กลับเป็น 0
    onTurnStart(player, game){
        this.rendeCardCount = 0;
        this.rendeHpRecovered = false;
    }
    // เช็กเงื่อนไขการใช้งาน: ใช้งานได้เรื่อยๆ ตราบใดที่ยังมีการ์ดในมือ
    canUse(player, game){
        return player.hand.cards.length > 0;
    }
    // ระบุว่าสกิลนี้ต้องเลือกเป้าหมาย
    needsTarget(player, game){
        return true;
    }
    // ระบุว่าสกิลนี้ต้องเลือกการ์ดในมือ
    needsCardSelection(player, game){
        return true;
    }
    // ตรวจสอบว่าสามารถเลือกผู้เล่นคนนี้เป็นเป้าหมายของ Rende ได้หรือไม่
    canTarget(player, target){
        // Rende ต้องมอบการ์ดให้ตัวละครอื่น ห้ามเลือกตัวเอง
        return player !== target;
    }
    // ประมวลผลการใช้สกิล Rende 
    use(player, game){
        // เช็กก่อนว่าผ่านเงื่อนไขการใช้งานหรือไม่
        if(!this.canUse(player, game)){
            return false;
        }

        let target;
        let selectedCards = [];
        // Human
        if(player.controller.isHuman()){
            // ดึงเป้าหมายที่เลือกไว้
            target = player.controller.getSelectedTarget();
            if(!target){
                return false;
            }
            // ดึงการ์ดที่เลือกทั้งหมดจาก Array
            selectedCards = 
                player.controller.selectedSkillCardIndices
                    .map(index => player.hand.cards[index])
                    .filter(card => card);

        }else{
            // AI ยังคงใช้ Logic เดิม
            target = game.getNextPlayer();
            if(player.hand.cards.length > 0){
                selectedCards = [player.hand.cards[0]];
            }
        }
        // ต้องมีการ์ดอย่างน้อย 1 ใบ
        if(selectedCards.length === 0){
            return false;
        }
        // ป้องกัน Rende เลือกเกิน 5 ใบ
        if(selectedCards.length > 5){
            return false;
        }
        // ส่งการ์ดทั้งหมดให้ Target
        for(const card of selectedCards){

            const index = player.hand.cards.indexOf(card);
            if(index === -1){
                return false;
            }

            const removeCard = player.hand.removeCard(index);
            if(!removeCard){
                return false;
            }
            target.hand.addCard(removeCard);
        }
        // เพิ่มจำนวนการ์ด Rende ที่มอบสำเร็จจริงในเทิร์นนี้
        this.rendeCardCount += selectedCards.length;
        game.log(
            player.name + 
            " ใช้สกิล Rende (จิตเมตตา) มอบการ์ด " + 
            selectedCards.length + 
            " ใบให้ " + target.name
        );
        // ครบ 2 ใบในเทิร์นนี้ → ฟื้น HP ได้สูงสุด 1 ครั้ง
        if(
            this.rendeCardCount >= 2 && 
            !this.rendeHpRecovered && 
            player.hp < player.maxHp
        ){
            player.recoverHp(1);
            this.rendeHpRecovered = true;
        }
        // แสดงมือปัจจุบัน
        player.showHand();
        target.showHand();
        return true;
    }
    // Rende ต้องรอการยืนยันหลังเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // Rende เลือกการ์ดได้สูงสุดตามจำนวนการ์ดในมือ
    cardSelectionCount(player, game){
        return player.hand.cards.length;
    }
    getDescription(){
        return "Rende (จิตเมตตา)\n" +
            "ช่วง Play Phase สามารถมอบการ์ดจากมือให้ตัวละครอื่นได้จำนวนเท่าใดก็ได้\n" +
            "และเมื่อมอบการ์ดตั้งแต่ 2 ใบขึ้นไป จะฟื้น HP 1\n\n";
    }
}