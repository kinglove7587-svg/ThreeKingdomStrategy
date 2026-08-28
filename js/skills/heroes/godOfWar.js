class GodOfWar extends ActiveSkill{

    constructor(){
        super("God Of War");
        // เก็บการ์ดสีแดงต้นฉบับระหว่างรอเลือกเป้าหมาย
        this.selectedCard = null;
    }
    // ตรวจสอบว่าสามารถใช้สกิลได้หรือไม่
    canUse(player, game){
        return player.hand.cards.some(
            card => card.suit === "♥️" || card.suit === "♦️"
        );
    }
    // ไม่ต้องเลือกเป้าหมายก่อนเลือกการ์ด
    needsTarget(player, game){
        return this.selectedCard !== null;
    }
    // ต้องเลือกการ์ดจากมือ
    needsCardSelection(player, game){
        return this.selectedCard === null;
    }
    // เลือกการ์ดเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    canTarget(player, target){
        return player !== target;
    }
    // ยืนยัน และ ยกเลิก การ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // ระบุว่า God Of War ต้องรอยืนยันเป้าหมาย
    waitForTargetConfirmation(player, game){
        return true;
    }
    // อนุญาตให้เลือกเฉพาะการ์ดสีแดง
    canSelectSkillCard(player, card, game){
        return (card.suit === "♥️" || card.suit === "♦️");
    }
    // ประมวลผล God Of War
    use(player, game){
        
        const controller = player.controller;
        // รอบแรกหลังเลือกการ์ด ให้เก็บการ์ดต้นฉบับไว้
        if(this.selectedCard === null){
            // ดึง Index ของการ์ดที่เลือกจาก Active Skill
            const selectedIndex = controller.selectedSkillCardIndices[0];
            // ดึงการ์ดจริงจากมือ
            const selectedCard = player.hand.cards[selectedIndex];
            if(!selectedCard){
                return false;
            }
            this.selectedCard = selectedCard;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return true;
        }
        // รอบที่สองหลังเลือก Target ให้ส่งการ์ดเข้า Slash Flow
        const target = controller.getSelectedTarget();
        if(!target){
            return false;
        }
        // สร้าง SlashCard ชั่วคราวจาก Suit และ Number ของการ์ดต้นฉบับ
        const slashCard = new SlashCard(
            this.selectedCard.suit,
            this.selectedCard.number
        );
        // เรียก Slash Flow เดิม โดยใช้ Target ที่เลือกไว้
        const success = slashCard.use(player, game);
        // เมื่อ Slash สำเร็จ ให้นำการ์ดสีแดงต้นฉบับออกจากมือและทิ้งลงกองทิ้ง
        if(success){
            const selectedIndex = player.hand.cards.indexOf(this.selectedCard);
            if(selectedIndex !== -1){
                const discardCard = player.hand.removeCard(selectedIndex);
                if(discardCard){
                    game.discardPile.addCard(discardCard);
                }
            }
        }
        this.selectedCard = null;
        // ล้าง Active Skill Selection หลังใช้งาน
        controller.selectedSkill = null;
        controller.selectedSkillCardIndex = -1;
        controller.selectedSkillCardIndices = [];
        return success;
    }
    getDescription(){
        return "God Of War (เทพสงคราม)\n" +
            "คุณสามารถใช้หรือเล่นการ์ดสีแดง ♥️ ♦️ แทน โจมตี ได้";
    }
}