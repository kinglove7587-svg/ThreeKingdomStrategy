class HumanController extends Controller{
    // ตัวสร้างวัตถุ กำหนดสถานะ Input เริ่มต้นเป็น idle, ล้างค่า index การ์ด (-1) และเป้าหมายที่เลือก (null)
    constructor(game){
        super(game);
        this.inputState = "idle"; // สถานะการรับ Input ปัจจุบัน
        this.selectedCardIndex = -1; // ดรรชนี (Index) ของการ์ดที่เลือกอยู่บนมือ
        this.selectedTarget = null; // ผู้เล่นเป้าหมายที่เลือก
        this.viewingHandTarget = null; // เก็บออบเจกต์เป้าหมายที่กำลังถูกเปิดดูการ์ดในมือ
        this.selectedSkill = null; // บันทึกออบเจกต์ Skill ที่ผู้เล่นเลือกใช้งาน
        this.selectedSkillCardIndex = -1; // บันทึกตำแหน่ง Index ของการ์ดที่ผู้เล่นเลือกเพื่อมอบผ่านสกิล
        this.selectedSkillCardIndices = [];
        //Steal (ฉกฉวย) State
        this.selectedStealTarget = null;
        this.selectedStealCard = null; 
        this.selectedStealSource = null; 
        this.selectedStealCardIndex = -1;
        // BurnBridge State
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
        this.selectedBurnCard = null;
        this.selectedBurnCardIndex = -1;
        // เก็บ Trigger Skill ที่กำลังรอการตัดสินใจ
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        // Sky Piercing Halberd State
        this.selectedAdditionalTargets = [];
        this.additionalTargetLimit = 0;
        this.additionalTargetContext = null;
        // State สำหรับประมวลผล Slash แบบหลายเป้าหมายทีละลำดับ
        this.pendingSlashContext = null;
        this.pendingSlashTargets = [];
        this.pendingSlashTargetIndex = 0;
        this.pendingSlashTriggerAfterDamage = false;
        // State สำหรับเก็บ Context ของ Reaction
        this.reactionContext = null;
    }
    // จัดการเทิร์นของผู้เล่นมนุษย์
    playTurn(){ 
        console.log("Human Turn");
        // สั่งให้ UIManager อัปเดตหน้าจอ UI ใหม่ เพื่อรอรับการตอบสนอง (กดการ์ด/กดปุ่ม) จากผู้เล่นมนุษย์
        this.game.ui.render();
        // ยังไม่รู้ผล เพราะกำลังรอผู้เล่นกด
        return null;
    }
    // เรียกใช้การ Recast จาก Game Engine พร้อมล้างค่า State
    recastCard(index){
        // สั่งให้ Game ดำเนินการ Recast การ์ดตาม index ที่เลือก
        const success = this.game.recastCard(index);
        // หาก Recast ไม่สำเร็จ ให้ยกเลิกการทำงาน
        if(!success){
            return false;
        }
        // ล้างค่าตัวแประบุการ์ดและเป้าหมายที่เคยเลือกไว้
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        // คืนค่าสถานะการรับ Input กลับเป็นปกติ (idle)
        this.inputState = "idle";
        // แจ้ง Game Engine ว่าผู้เล่นมนุษย์ทำ Action สำเร็จแล้ว
        this.game.afterHumanAction(true);
        return true;
    }
    // เมธอดประมวลผลจบเทิร์นของผู้เล่นมนุษย์
    finishTurn(){
        // ดึง index ของการ์ดที่เลือกไว้
        const cardIndex = this.selectedCardIndex;
        // ถ้ากดจบเทิร์น (-1) ให้ส่งเรื่องไปที่ Game Engine เพื่อเข้าสู่ขั้นตอนจบเทิร์น
        if (cardIndex === -1){
            // สั่งให้เกมประมวลผลจบเทิร์น
            this.game.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดโดยเรียกใช้ getSelectedCard()
        const card = this.getSelectedCard();
        // ดัก Error: ถ้าไม่พบวัตถุการ์ด (เช่น ไม่ได้เลือกการ์ด) ให้หยุดทำงานทันที
        if (!card){
            return;
        }
        // แจ้ง Game ให้บันทึก Log
        this.game.log("เลือกการ์ดลำดับ : " + cardIndex);
        // จำไว้ว่า Action นี้เปิด Reaction หรือไม่ ก่อนที่ Reaction จะทำงาน
        const reactionWasOpened = !!(
            this.game.reactionManager && 
            this.game.reactionManager.active
        );
        // ล้าง Reaction Context เก่าก่อนเริ่ม Action ใหม่
        this.reactionContext = null;
        // สั่ง Controller เล่นการ์ดใบที่เลือก และรับผลลัพธ์ (true/false)
        const success = this.playCard(cardIndex);
        // ล้างค่าเป้าหมายที่เลือกไว้ เพื่อป้องกันไม่ให้ข้อมูลเป้าหมายเดิมค้างอยู่ในเทิร์นถัดไป
        this.selectedTarget = null;
        // รอ Trigger ที่ต่อจากการ์ดให้จบก่อน
        if(
            this.inputState === "waitingTriggerChoice" || 
            this.inputState === "waitingTriggerCard" || 
            this.inputState === "waitingTriggerTarget" || 
            this.inputState === "waitingAdditionalTargets"
        ){
            return;
        }
        // การ์กจบการทำงานสมบูรณ์แล้ว
        this.selectedCardIndex = -1;
        // ReactionManager จะเป็นคนเรียก afterHumanAction()
        if(this.reactionContext){
            return;
        }
        // ส่งผลลัพธ์ให้ Game จัดการอัปเดตสถานะและหน้าจอถัดไป
        this.game.afterHumanAction(success);
    }
    // เมธอด API ที่เปิดไว้ให้ส่วน UI (เช่น HTML/DOM Event) เรียกใช้งานเพื่ออัปเดตการ์ดที่เลือก
    selectCard(index){
        // หากกำลังรอเลือกเป้าหมายอยู่ แล้วผู้เล่นกดเลือกการ์ดใบเดิมซ้ำ -> ให้ยกเลิกการเลือกการ์ด
        if(
            this.inputState === "waitingTarget" && 
            this.selectedCardIndex === index
        ){
            
            const card = this.getSelectedCard();
            console.log("ยกเลิกการเลือกการ์ด", card ? card.name : "(ไม่พบการ์ด)");

            this.selectedCardIndex = -1;
            this.selectedTarget = null;
            this.inputState = "idle";
            this.game.ui.render();
            return;
            
        }
        // บันทึก index การ์ดที่เลือกลงใน Controller
        this.selectedCardIndex = index;
        // ถ้าผู้เล่นกดจบเทิร์น (index เป็น -1) ให้สั่งจบเทิร์นทันที
        if (index === -1){
            this.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดที่เลือก
        const card = this.getSelectedCard();
        // ถ้าไม่พบการ์ด ให้รีเซ็ตและหยุด
        if (!card){
            this.selectedCardIndex = -1;
            return;
        }
        // ตรวจสอบว่าเป็นการ์ดที่สามารถเล่นได้หรือไม่
        if(!card.canUse(this.player)){
            console.log("ไม่สามารถใช้การ์ดนี้ได้");
            this.selectedCardIndex = -1;
            this.game.ui.render();
            return;
        }
        // ถ้าการ์ดต้องเลือก Target
        if(typeof card.needTarget === "function" && card.needTarget()){
            this.inputState = "waitingTarget";
            this.game.ui.render();
            return;
        }
        // ถ้าไม่ต้องเลือก Target ให้เล่นทันที
        this.finishTurn();
    }
    // คืนวัตถุการ์ดที่ผู้เล่นกำลังเลือกอยู่ในปัจจุบัน
    getSelectedCard(){
        // ใช้ผู้เล่นที่ Controller ควบคุมอยู่โดยตรง (this.player) แทนการเรียกผ่าน game
        return this.player.hand.cards[this.selectedCardIndex];
    }
    // บันทึกวัตถุผู้เล่นเป้าหมายลงใน Controller
    setSelectedTarget(player){
        // กำหนดค่าผู้เล่นเป้าหมายให้กับตัวแปร selectedTarget
        this.selectedTarget = player;
    }
    // คืนวัตถุผู้เล่นเป้าหมายที่เลือกไว้ปัจจุบัน
    getSelectedTarget(){
        // คืนค่าออบเจกต์ผู้เล่นเป้าหมาย
        return this.selectedTarget;
    }
    // เริ่มต้นสถานะการเปิดดูการ์ดบนมือของผู้เล่นเป้าหมาย
    startViewingHand(target){
        this.viewingHandTarget = target;
        this.inputState = "viewingHand";
        this.game.ui.render();
    }
    // สิ้นสุดสถานะการเปิดดูการ์ดบนมือของผู้เล่นเป้าหมาย
    finishViewingHand(){
        this.viewingHandTarget = null;
        this.inputState = "idle";
        this.game.ui.render();
    }
    // คืนค่าผู้เล่นเป้าหมายที่ผู้เล่นมนุษย์เลือกไว้บน UI
    getTarget(card){
        return this.getSelectedTarget();
    }
    // รีเซ็ตค่าการขโมยเดิม และเปลี่ยนสถานะเป็น "waitingStealCard"
    startStealSelection(){
        this.selectedStealCard = null;
        this.selectedStealSource = null;
        this.selectedStealCardIndex = -1;
        this.inputState = "waitingStealCard";
        this.game.ui.render();
    }
    startStealSourceSelection(){
        this.inputState = "waitingStealSource";
        this.game.ui.render();
    }
    startBurnSourceSelection(){
        this.inputState = "waitingBurnSource";
        this.game.ui.render();
    }
    startBurnCardSelection(){
        this.inputState = "waitingBurnCard";
        this.game.ui.render();
    }
    startSelection(){
        this.inputState = "waitingSelection";
        this.game.ui.render();
    }
    finishSelection(){
        this.inputState = "idle";
        this.game.ui.render();
    }
    selectStealCard(index){
        const target = this.selectedStealTarget;
        if(!target){ return; }
        if(index < 0 || index >= target.hand.cards.length){ return; }
        this.selectedStealSource = "hand";
        this.selectedStealCard = target.hand.cards[index];
        this.selectedStealCardIndex = index;
    }
    selectStealSource(source){
        const target = this.selectedStealTarget;
        if(!target){ return false; }
        if(source === "hand"){
            this.selectedStealSource = "hand";
            this.startStealSelection();
            return true;
        }
        if(source === "weapon"){
            if(!target.weapon){ return false; }
            this.selectedStealSource = "weapon";
            this.selectedStealCard = target.weapon;
            this.selectedStealCardIndex = -1;
            return true;
        }
        if(source === "armor"){
            if(!target.armor){ return false; }
            this.selectedStealSource = "armor";
            this.selectedStealCard = target.armor;
            this.selectedStealCardIndex = -1;
            return true;
        }
        return false;
    }
    selectBurnSource(source){
        const target = this.selectedBurnTarget;
        if(!target){ return false; }
        if(source === "hand"){
            if(target.hand.cards.length === 0){ return false; }
            this.selectedBurnSource = "hand";
            this.startBurnCardSelection();
            return true;
        }
        if(source === "weapon"){
            if(!target.weapon){ return false; }
            this.selectedBurnSource = "weapon";
            this.startBurnCardSelection();
            return true;
        }
        if(source === "armor"){
            if(!target.armor){ return false; }
            this.selectedBurnSource = "armor";
            this.startBurnCardSelection();
            return true;
        }
        return false;
    }
    selectBurnCard(index){
        const target = this.selectedBurnTarget;
        if(!target){ return false; }
        if(this.selectedBurnSource === "hand"){
            if(index < 0 || index >= target.hand.cards.length){ return false; }
            this.selectedBurnCard = target.hand.cards[index];
            this.selectedBurnCardIndex = index;
            return true;
        }
        if(this.selectedBurnSource === "weapon"){
            if(!target.weapon){ return false; }
            this.selectedBurnCard = target.weapon;
            this.selectedBurnCardIndex = -1;
            return true;
        }
        if(this.selectedBurnSource === "armor"){
            if(!target.armor){ return false; }
            this.selectedBurnCard = target.armor;
            this.selectedBurnCardIndex = -1;
            return true;
        }
        return false;
    }
    stealSelectedCard(){
        const target = this.selectedStealTarget;
        if(!target || this.selectedStealSource !== "hand"){ return false; }
        const index = this.selectedStealCardIndex;
        if(index < 0 || index >= target.hand.cards.length){ return false; }
        const card = target.hand.removeCard(index);
        if(!card){ return false; }
        this.player.hand.addCard(card);
        return true;
    }
    stealSelectedEquipment(){
        const target = this.selectedStealTarget;
        if(!target){ return false; }
        if(this.selectedStealSource === "weapon"){
            if(!target.weapon){ return false; }
            const weapon = target.weapon;
            target.unequipWeapon();
            this.player.equipWeapon(weapon);
            return true;
        }
        if(this.selectedStealSource === "armor"){
            if(!target.armor){ return false; }
            const armor = target.armor;
            target.unequipArmor();
            this.player.equipArmor(armor);
            return true;
        }
        return false;
    }
    confirmStealSelection(){
        let success = false;
        if(this.selectedStealSource === "hand"){ success = this.stealSelectedCard(); }
        if(this.selectedStealSource === "weapon"){ success = this.stealSelectedEquipment(); }
        if(this.selectedStealSource === "armor"){ success = this.stealSelectedEquipment(); }
        if(!success){ return false; }
        this.inputState = "idle";
        this.selectedStealTarget = null;
        this.selectedStealCard = null;
        this.selectedStealSource = null;
        this.selectedStealCardIndex = -1;
        this.game.ui.render();
        return true;
    }
    confirmBurnSelection(){
        const success = this.discardSelectedBurnCard();
        if(!success){ return false; }
        this.inputState = "idle";
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
        this.selectedBurnCard = null;
        this.selectedBurnCardIndex = -1;
        this.game.ui.render();
        return true;
    }
    isWaitingInput(){
        return true;
    }
    selectTarget(player){
        console.log("selectTarget ถูกเรียก", player.name); // Debug
        const card = this.getSelectedCard();
        if(!card){ return; }
        if(!card.canTarget(this.player, player)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        this.setSelectedTarget(player);
        this.inputState = "idle";
        this.finishTurn();
    }
    askSlash(player, game){
        const slashCards = player.hand.findSlashCards();
        if(slashCards.length === 0){ return -1; }
        return slashCards[0].index;
    }
    isHuman(){
        return true;
    }
    askDodge(player){
        return player.hand.findCardIndexByName("หลบ");
    }
    askPeach(player){
        const index = player.hand.findCardIndexByName("ยา");
        if(index === -1){ return -1; }
        this.inputState = "waitingPeach";
        return index;
    }
    confirmPeach(){
        this.inputState = "idle";
        this.game.resumeDying(true);
    }
    declinePeach(){
        this.inputState = "idle";
        this.game.resumeDying(false);
    }
    isWaitingPeach(){
        return this.inputState === "waitingPeach";
    }
    startSkillTargetSelection(skill){
        this.selectedSkill = skill;
        this.selectedTarget = null;
        this.inputState = "waitingSkillTarget";
        this.game.ui.render();
    }
    startSkillUse(skill){
        this.selectedSkill = skill;
        this.selectedTarget = null;
        this.selectedSkillCardIndex = -1;
        this.selectedSkillCardIndices = [];
        if(skill.needsTarget(this.player, this.game)){
            this.inputState = "waitingSkillTarget";
            this.game.ui.render();
            return;
        }
        if(skill.needsCardSelection(this.player, this.game)){
            this.inputState = "waitingSkillCard";
            this.game.ui.render();
            return;
        }
        const success = skill.use(this.player, this.game);
        this.game.afterHumanAction(success);
    }
    selectSkillTarget(player){
        console.log("selectSkillTarget ถูกเรียก", player.name);
        if(this.inputState !== "waitingSkillTarget"){ return; }
        const skill = this.selectedSkill;
        if(!skill){ return; }
        if(!skill.canTarget(this.player, player)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        this.setSelectedTarget(player);
        if(skill.needsCardSelection(this.player, this.game)){
            this.selectedSkillCardIndices = [];
            this.inputState = "waitingSkillCard";
            this.game.ui.render();
            return;
        }
        this.inputState = "idle";
        const success = skill.use(this.player, this.game);
        this.game.afterHumanAction(success);
    }
    selectSkillCard(index){
        console.log("selectSkillCard ถูกเรียก", index);
        if(this.inputState !== "waitingSkillCard"){ return; }
        const skill = this.selectedSkill;
        if(!skill){ return; }
        const card = this.player.hand.cards[index];
        if(!card){ return; }
        if(this.selectedSkillCardIndices.includes(index)){ return; }
        this.selectedSkillCardIndices.push(index);
        this.selectedSkillCardIndex = index;
        console.log("Skill Card Selection =", this.selectedSkillCardIndices);
        const requiredCount = skill.cardSelectionCount(this.player, this.game);
        if(this.selectedSkillCardIndices.length < requiredCount){
            this.game.ui.render();
            return;
        }
        const success = skill.use(this.player, this.game);
        this.selectedSkill = null;
        this.selectedSkillCardIndex = -1;
        this.selectedSkillCardIndices = [];
        this.inputState = "idle";
        if(success){ this.selectedTarget = null; }
        this.game.afterHumanAction(success);
    }
    discardSelectedBurnCard(){
        const target = this.selectedBurnTarget;
        if(!target){ return false; }
        if(this.selectedBurnSource === "hand"){
            const index = this.selectedBurnCardIndex;
            if(index < 0 || index >= target.hand.cards.length){ return false; }
            const card = target.hand.removeCard(index);
            if(!card){ return false; }
            this.game.discardPile.addCard(card);
            return true;
        }
        if(this.selectedBurnSource === "weapon"){
            if(!target.weapon){ return false; }
            const weapon = target.unequipWeapon();
            if(!weapon){ return false; }
            this.game.discardPile.addCard(weapon);
            return true;
        }
        if(this.selectedBurnSource === "armor"){
            if(!target.armor){ return false; }
            const armor = target.unequipArmor();
            if(!armor){ return false; }
            this.game.discardPile.addCard(armor);
            return true;
        }
        return false;
    }
    startTriggerChoice(skill, context){
        this.selectedTriggerSkill = skill;
        this.triggerContext = context;
        this.inputState = "waitingTriggerChoice";
        this.game.ui.render();
    }
    startReaction(context){
        this.reactionContext = context;
        this.inputState = "waitingReaction";
        this.game.ui.render();
    }
    resolveReaction(useReaction){
        if(this.inputState !== "waitingReaction"){ return false; }
        const context = this.reactionContext;
        if(!context){ return false; }
        console.log(this.player.name, useReaction ? "ใช้ Reaction" : "ไม่ใช้ Reaction");
        this.reactionContext = null;
        this.inputState = "idle";
        return this.game.reactionManager.resolveReaction(useReaction);
    }
    resolveTriggerChoice(useSkill){
        if(this.inputState !== "waitingTriggerChoice"){ return; }
        const skill = this.selectedTriggerSkill;
        const context = this.triggerContext;
        if(!skill){ return; }
        const success = skill.resolveChoice(this.player, this.game, context, useSkill);
        if(
            this.inputState === "waitingTriggerCard" ||
            this.inputState === "waitingTriggerTarget"
        ){
            this.game.ui.render();
            return success;
        }
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        if(this.pendingSlashTriggerAfterDamage){
            return this.resumePendingSlashAfterTrigger();
        }
        this.game.afterHumanAction(success);
        return success;
    }
    startTriggerCardSelection(skill, context){
        this.selectedTriggerSkill = skill;
        this.triggerContext = context;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        this.inputState = "waitingTriggerCard";
        this.game.ui.render();
    }
    cancelTriggerCardSelection(){
        if(this.inputState !== "waitingTriggerCard"){ return; }
        const skill = this.selectedTriggerSkill;
        const context = this.triggerContext;
        if(!skill || !context){ return; }
        const success = skill.cancelTriggerCardSelection(this.player, this.game, context);
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        this.inputState = "idle";
        this.game.afterHumanAction(success);
        return success;
    }
    selectTriggerCard(index){
        if(this.inputState !== "waitingTriggerCard"){ return; }
        const skill = this.selectedTriggerSkill;
        if(!skill){ return; }
        const card = this.player.hand.cards[index];
        if(!card){ return; }
        if(typeof skill.canSelectTriggerCard === "function" && !skill.canSelectTriggerCard(this.player, card, this.triggerContext)){
            return;
        }
        if(this.selectedTriggerCardIndices.includes(index)){ return; }
        this.selectedTriggerCardIndices.push(index);
        this.selectedTriggerCardIndex = index;
        console.log("Trigger Card Selection =", this.selectedTriggerCardIndices);
        const requiredCount = typeof skill.triggerCardSelectionCount === "function" ? skill.triggerCardSelectionCount(this.player, this.game) : 1;
        if(this.selectedTriggerCardIndices.length < requiredCount){
            this.game.ui.render();
            return;
        }
        const cards = this.selectedTriggerCardIndices.map(selectedIndex => this.player.hand.cards[selectedIndex]);
        this.triggerContext.cards = cards;
        this.triggerContext.card = cards[0];
        if(typeof skill.resolveTriggerCards === "function"){
            const success = skill.resolveTriggerCards(this.player, this.game, this.triggerContext);
            this.selectedTriggerSkill = null;
            this.triggerContext = null;
            this.selectedTriggerCardIndex = -1;
            this.selectedTriggerCardIndices = [];
            this.inputState = "idle";
            this.selectedCardIndex = -1;
            this.selectedTarget = null;
            this.game.afterHumanAction(success);
            return success;
        }
        this.inputState = "waitingTriggerTarget";
        this.game.ui.render();
    }
    selectTriggerTarget(player){
        if(this.inputState !== "waitingTriggerTarget"){ return; }
        const skill = this.selectedTriggerSkill;
        if(!skill){ return; }
        if(!skill.canTriggerTarget(this.player, player, this.game, this.triggerContext)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        this.triggerContext.secondaryTarget = player;
        const success = skill.resolveTriggerTarget(this.player, this.game, this.triggerContext);
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.inputState = "idle";
        this.game.afterHumanAction(success);
        return success;
    }
    selectAdditionalTarget(player){
        if(this.inputState !== "waitingAdditionalTargets"){ return; }
        if(player === this.player){ return; }
        if(this.additionalTargetContext && player === this.additionalTargetContext.primaryTarget){ return; }
        const selectedIndex = this.selectedAdditionalTargets.indexOf(player);
        if(selectedIndex !== -1){
            this.selectedAdditionalTargets.splice(selectedIndex, 1);
            console.log("ยกเลิกเป้าหมายเพิ่มเติม:", player.name);
            this.game.ui.render();
            return;
        }
        if(this.selectedAdditionalTargets.length >= this.additionalTargetLimit){ return; }
        this.selectedAdditionalTargets.push(player);
        this.game.ui.render();
    }
    finishAdditionalTargetSelection(){
        if(this.inputState !== "waitingAdditionalTargets"){ return; }
        const context = this.additionalTargetContext;
        if(!context){ return; }
        const targets = [context.primaryTarget, ...this.selectedAdditionalTargets];
        context.targets = targets;
        this.pendingSlashContext = context;
        console.log("ง้าวฟ้าทะลวง เลือกเป้าหมายแล้ว:", targets.map(target => target.name));
        this.inputState = "idle";
        this.additionalTargetContext = null;
        this.additionalTargetLimit = 0;
        this.selectedAdditionalTargets = [];
        const success = this.startPendingSlashResolution();
        if(!success){
            this.game.ui.render();
            return;
        }
        this.game.ui.render();
    }
    preparePendingSlashTargets(context){
        if(!context || !Array.isArray(context.targets)){ return false; }
        this.pendingSlashContext = context;
        this.pendingSlashTargets = [...context.targets];
        this.pendingSlashTargetIndex = 0;
        console.log("เตรียมเป้าหมาย Slash:", this.pendingSlashTargets.map(target => target.name));
        return true;
    }
    startPendingSlashResolution(){
        if(!this.pendingSlashContext){
            console.log("ไม่พบ Pending Slash Context");
            return false;
        }
        const success = this.preparePendingSlashTargets(this.pendingSlashContext);
        if(!success){ return false; }
        return this.resolvePendingSlashTargets();
    }
    getPendingSlashTarget(){
        if(this.pendingSlashTargetIndex < 0 || this.pendingSlashTargetIndex >= this.pendingSlashTargets.length){ return null; }
        return this.pendingSlashTargets[this.pendingSlashTargetIndex];
    }
    advancePendingSlashTarget(){
        this.pendingSlashTargetIndex++;
        return this.getPendingSlashTarget();
    }
    isPendingSlashComplete(){
        return this.pendingSlashTargetIndex >= this.pendingSlashTargets.length;
    }
    resolvePendingSlashTarget(){
        const target = this.getPendingSlashTarget();
        if(!target){ return false; }
        const context = this.pendingSlashContext;
        if(!context){ return false; }
        const card = context.card;
        if(!card){ return false; }
        console.log("กำลังประมวลผล Pending Slash", target.name);
        const success = card.resolveSlashTarget(this.player, target, this.game);
        if(success){
            if(this.inputState === "waitingTriggerChoice" || this.inputState === "waitingTriggerCard" || this.inputState === "waitingTriggerTarget"){
                console.log("Pending Slash หยุดรอ Trigger", target.name);
                return true;
            }
            console.log("ประมวลผล Pending Slash สำเร็จ:", target.name);
            this.advancePendingSlashTarget();
        }
        return success;
    }
    resolvePendingSlashTargets(){
        if(!this.pendingSlashContext){ return false; }
        while(!this.isPendingSlashComplete()){
            const success = this.resolvePendingSlashTarget();
            if(!success){ return false; }
            if(this.inputState === "waitingTriggerChoice" || this.inputState === "waitingTriggerCard" || this.inputState === "waitingTriggerTarget"){
                console.log("Pending Slash หยุดรอ Trigger ที่ Target Index", this.pendingSlashTargetIndex);
                return true;
            }
        }
        console.log("Pending Slash ประมวลผลครบทุกเป้าหมาย");
        return this.finishPendingSlashResolution();
    }
    resumePendingSlashAfterTrigger(){
        if(!this.pendingSlashContext){ return false; }
        if(!this.pendingSlashTriggerAfterDamage){ return false; }
        this.pendingSlashTriggerAfterDamage = false;
        this.advancePendingSlashTarget();
        if(this.isPendingSlashComplete()){
            return this.finishPendingSlashResolution();
        }
        return this.resolvePendingSlashTargets();
    }
    finishPendingSlashResolution(){
        if(!this.isPendingSlashComplete()){ return false; }
        console.log("จบ Pending Slash ของง้าวฟ้าทะลวง");
        this.pendingSlashContext = null;
        this.pendingSlashTargets = [];
        this.pendingSlashTargetIndex = 0;
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        this.game.afterHumanAction(true);
        return true;
    }
}