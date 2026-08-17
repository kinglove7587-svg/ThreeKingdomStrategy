class HumanController extends Controller{
    constructor(game){
        super(game);
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        this.viewingHandTarget = null;
        this.selectedSkill = null;
        this.selectedSkillCardIndex = -1;
        this.selectedSkillCardIndices = [];
        this.selectedStealTarget = null;
        this.selectedStealCard = null;
        this.selectedStealSource = null;
        this.selectedStealCardIndex = -1;
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
        this.selectedBurnCard = null;
        this.selectedBurnCardIndex = -1;
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        this.selectedAdditionalTargets = [];
        this.additionalTargetLimit = 0;
        this.additionalTargetContext = null;
        this.pendingSlashContext = null;
        this.pendingSlashTargets = [];
        this.pendingSlashTargetIndex = 0;
        this.pendingSlashTriggerAfterDamage = false;
        this.reactionContext = null;
    }
    playTurn(){
        console.log("Human Turn");
        this.game.ui.render();
        return null;
    }
    recastCard(index){
        const success = this.game.recastCard(index);
        if(!success){
            return false;
        }
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        this.inputState = "idle";
        this.game.afterHumanAction(true);
        return true;
    }
    finishTurn(){
        const cardIndex = this.selectedCardIndex;
        if(cardIndex === -1){
            this.game.finishTurn();
            return;
        }
        const card = this.getSelectedCard();
        if(!card){
            return;
        }
        this.game.log("เลือกการ์ดลำดับ : " + cardIndex);
        // DELETE: const reactionWasOpened = ...
        this.reactionContext = null;
        const success = this.playCard(cardIndex);
        this.selectedTarget = null;
        if(
            this.inputState === "waitingTriggerChoice" ||
            this.inputState === "waitingTriggerCard" ||
            this.inputState === "waitingTriggerTarget" ||
            this.inputState === "waitingAdditionalTargets"
        ){
            return;
        }
        this.selectedCardIndex = -1;
        // NEW: ReactionManager จะเป็นคนเรียก afterHumanAction()
        if(this.reactionContext){
            return;
        }
        this.game.afterHumanAction(success);
    }
    selectCard(index){
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
        this.selectedCardIndex = index;
        if(index === -1){
            this.finishTurn();
            return;
        }
        const card = this.getSelectedCard();
        if(!card){
            return;
        }
        if(card.needTarget()){
            this.inputState = "waitingTarget";
            this.game.ui.render();
            return;
        }
        this.finishTurn();
    }
    getSelectedCard(){
        return this.player.hand.cards[this.selectedCardIndex];
    }
    setSelectedTarget(player){
        this.selectedTarget = player;
    }
    getSelectedTarget(){
        return this.selectedTarget;
    }
    startViewingHand(target){
        this.viewingHandTarget = target;
        this.inputState = "viewingHand";
        this.game.ui.render();
    }
    finishViewingHand(){
        this.viewingHandTarget = null;
        this.inputState = "idle";
        this.game.ui.render();
    }
    getTarget(card){
        return this.getSelectedTarget();
    }
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
        console.log("selectTarget ถูกเรียก", player.name);
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
        if(
            typeof skill.canSelectTriggerCard === "function" &&
            !skill.canSelectTriggerCard(this.player, card, this.triggerContext)
        ){
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
            if(
                this.inputState === "waitingTriggerChoice" ||
                this.inputState === "waitingTriggerCard" ||
                this.inputState === "waitingTriggerTarget"
            ){
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
            if(
                this.inputState === "waitingTriggerChoice" ||
                this.inputState === "waitingTriggerCard" ||
                this.inputState === "waitingTriggerTarget"
            ){
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