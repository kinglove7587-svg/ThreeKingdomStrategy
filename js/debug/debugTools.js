class DebugTools {

    constructor(game){
        this.game = game;
        this.pauseSlashTestSkills = [];
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
}

window.DebugTools = DebugTools;
