class Dauntless extends ActiveSkill{

    constructor(){
        super("Dauntless");

        this.usedThisPlayPhase = false;
    }
    // รีเซ็ตการใช้สกิลเมื่อเริ่ม Play Phase ใหม่
    onPlayPhase(player, game){

        if(player !== this.owner){
            return;
        }
        this.usedThisPlayPhase = false;
    }
    // ใช้ได้เฉพาะเจ้าของ Skill ใน Play Phase ของตัวเอง
    canUse(player, game){
        return (
            player === this.owner && 
            game.getCurrentPlayer() === player && 
            !this.usedThisPlayPhase && 
            player.hand.cards.some(
                card => card instanceof BasicCard
            )
        );
    }
    // Dauntless ต้องเลือก Target
    needsTarget(player, game){
        return true;
    }
    // Dauntless ต้องเลือก Basic Card 1 ใบ
    needsCardSelection(player, game){
        return true;
    }
    // เลือก Basic Card ได้เท่านั้น
    canSelectSkillCard(player, card, name){
        return card instanceof BasicCard;
    }
    // เลือกเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // เลือก Basic Card แล้วไม่ต้องกดยืนยัน
    waitForCardSelectionConfirmation(player, game){
        return false;
    }
    // Target ต้องเป็นตัวละครที่ยังมีชีวิต
    canTarget(player, target){
        return (
            target && 
            target.isAlive()
        );
    }
    // ประมวลผล Dauntless หลังเลือก Target
    use(player, game){

        if(!this.canUse(player, game)){
            return false;
        }

        const controller = player.controller;
        const selectedIndex = controller.selectedSkillCardIndices[0];
        const target = controller.getSelectedTarget();
        if(selectedIndex === undefined || !target){
            return false;
        }
        if(!this.canTarget(player, target)){
            return false;
        }
        // ตรวจสอบการ์ดที่เลือกจริงอีกครั้ง
        const selectedCard = player.hand.cards[selectedIndex];
        if(!(selectedCard instanceof BasicCard)){
            return false;
        }
        // ทิ้ง Basic Card ที่ใช้เป็นค่าใช้จ่าย
        const discardedCard = player.hand.removeCard(selectedIndex);
        if(!discardedCard){
            return false;
        }
        game.discardPile.addCard(discardedCard);
        // ถือว่าใช้ Dauntless แล้วตั้งแต่จ่ายค่าใช้จ่ายสำเร็จ
        this.usedThisPlayPhase = true;
        // ตรวจ Equipment ของ Target
        const hasEquipment = !!(
            target.weapon || 
            target.armor || 
            target.mount
        );
        // ถ้าไม่มี Equipment ให้สร้าง Damage 1 ทันที
        if(!hasEquipment){
            const damage = new Damage(
                player, 
                target, 
                1
            );
            game.damage(damage);
            game.log(
                player.name + " ใช้ Dauntless และสร้างความเสียหาย 1 แก่ " + target.name
            );
            return true;
        }
        // ถ้ามี Equipment ให้หยุดรอการเลือก Equipment
        controller.inputState = "waitingDauntlessEquipment";
        controller.selectedDauntlessEquipment = null;
        game.log(
            player.name + " ใช้ Dauntless กับ " + 
            target.name + " — เลือก Equipment"
        );
        game.ui.render();
        return true;
    }
    getDescription(){
        return (
            "Dauntless (กล้าหาญ)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase ของคุณ " +
            "ทิ้งการ์ดพื้นฐาน 1 ใบ เพื่อให้ตัวละครเป้าหมาย " +
            "ทิ้งการ์ดอุปกรณ์ 1 ใบ " +
            "หากเป้าหมายไม่มีการ์ดอุปกรณ์ ให้สร้างความเสียหาย 1 หน่วยแทน"
        );
    }
}