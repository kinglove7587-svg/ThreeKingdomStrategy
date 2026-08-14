class DebugTools {

    constructor(game){
        this.game = game;
        this.pauseSlashTestSkills = [];
        this.triggerCardPatchInstalled = false;
    }

    installPauseSlashTest(player = this.game.players[0]){

        class TestCancelSlashSkill extends TriggerSkill {
            constructor(){
                super("ทดสอบ Cancel Slash");
            }

            register(eventManager, player){
                this.registerListener(
                    eventManager,
                    "beforeSlashHit",
                    this.onBeforeSlashHit.bind(this, player)
                );
            }

            onBeforeSlashHit(player, context){
                context.canceled = true;
                this.game.log("TestCancel: ยกเลิกการโจมตี");
            }
        }

        class TestPauseSlashSkill extends TriggerSkill {
            constructor(){
                super("ทดสอบ Pause Slash");
            }

            register(eventManager, player){
                this.registerListener(
                    eventManager,
                    "beforeSlashHit",
                    this.onBeforeSlashHit.bind(this, player)
                );
            }

            onBeforeSlashHit(player, context){

                if(!context.canceled){
                    return;
                }

                if(player.controller instanceof HumanController){
                    context.waitingTrigger = true;

                    player.controller.startTriggerChoice(
                        this,
                        {
                            slashContext: context
                        }
                    );
                }
            }

            resolveChoice(player, game, context, useSkill){

                const slashContext = context.slashContext;

                if(useSkill){
                    slashContext.canceled = false;
                }

                slashContext.waitingTrigger = false;

                return slashContext.resume();
            }
        }

        const testCancel = new TestCancelSlashSkill();
        const testPause = new TestPauseSlashSkill();

        player.addSkill(testCancel);
        player.addSkill(testPause);
        player.slashUsed = false;

        this.pauseSlashTestSkills.push({
            player,
            testCancel,
            testPause
        });

        console.log("ติดตั้ง Pause Slash Test แล้ว");
        return {testCancel, testPause};
    }

    removePauseSlashTest(player = this.game.players[0]){

        const tests = this.pauseSlashTestSkills.filter(
            test => test.player === player
        );

        for(const test of tests){
            test.testCancel.unregister();
            test.testPause.unregister();

            player.skills = player.skills.filter(
                skill =>
                    skill !== test.testCancel &&
                    skill !== test.testPause
            );

            player.slashUsed = false;
        }

        this.pauseSlashTestSkills = this.pauseSlashTestSkills.filter(
            test => test.player !== player
        );

        console.log("ถอด Pause Slash Test แล้ว");
    }

    resetSlash(player = this.game.players[0]){
        player.slashUsed = false;
        console.log("รีเซ็ต Slash แล้ว");
    }

    installTriggerMultiCardSupport(){

        if(this.triggerCardPatchInstalled){
            console.log("Trigger Multi Card Support ติดตั้งอยู่แล้ว");
            return;
        }

        const originalStartTriggerCardSelection =
            HumanController.prototype.startTriggerCardSelection;

        const originalSelectTriggerCard =
            HumanController.prototype.selectTriggerCard;

        HumanController.prototype.startTriggerCardSelection = function(skill, context){
            this.selectedTriggerCardIndices = [];
            this.selectedTriggerCardIndex = -1;
            originalStartTriggerCardSelection.call(this, skill, context);
            this.selectedTriggerCardIndices = [];
        };

        HumanController.prototype.selectTriggerCard = function(index){

            if(this.inputState !== "waitingTriggerCard"){
                return;
            }

            const skill = this.selectedTriggerSkill;

            if(!skill){
                return;
            }

            const card = this.player.hand.cards[index];

            if(!card){
                return;
            }

            if(this.selectedTriggerCardIndices.includes(index)){
                return;
            }

            const requiredCount =
                typeof skill.triggerCardSelectionCount === "function"
                    ? skill.triggerCardSelectionCount(
                        this.player,
                        this.game
                    )
                    : 1;

            this.selectedTriggerCardIndices.push(index);
            this.selectedTriggerCardIndex = index;

            console.log(
                "Trigger Card Selection =",
                this.selectedTriggerCardIndices
            );

            if(this.selectedTriggerCardIndices.length < requiredCount){
                this.game.ui.render();
                return;
            }

            const cards = this.selectedTriggerCardIndices.map(
                selectedIndex => this.player.hand.cards[selectedIndex]
            );

            this.triggerContext.cards = cards;
            this.triggerContext.card = cards[0];

            if(typeof skill.resolveTriggerCards === "function"){

                const success = skill.resolveTriggerCards(
                    this.player,
                    this.game,
                    this.triggerContext
                );

                this.selectedTriggerSkill = null;
                this.triggerContext = null;
                this.selectedTriggerCardIndex = -1;
                this.selectedTriggerCardIndices = [];
                this.inputState = "idle";

                this.game.afterHumanAction(success);
                return success;
            }

            this.inputState = "waitingTriggerTarget";
            this.game.ui.render();
        };

        this._triggerCardOriginals = {
            startTriggerCardSelection: originalStartTriggerCardSelection,
            selectTriggerCard: originalSelectTriggerCard
        };

        this.triggerCardPatchInstalled = true;

        console.log("ติดตั้ง Trigger Multi Card Support แล้ว");
    }

    removeTriggerMultiCardSupport(){

        if(!this.triggerCardPatchInstalled){
            return;
        }

        HumanController.prototype.startTriggerCardSelection =
            this._triggerCardOriginals.startTriggerCardSelection;

        HumanController.prototype.selectTriggerCard =
            this._triggerCardOriginals.selectTriggerCard;

        this._triggerCardOriginals = null;
        this.triggerCardPatchInstalled = false;

        console.log("ถอด Trigger Multi Card Support แล้ว");
    }
}

window.DebugTools = DebugTools;
