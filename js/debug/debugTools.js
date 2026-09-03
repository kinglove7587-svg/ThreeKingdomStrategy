class DebugTools {

    constructor(game){
        this.game = game;
        this.pauseSlashTestSkills = [];
        this.triggerCardPatchInstalled = false;
        this.createCharacterDebugPanel();
    }
    // สร้าง Debug Panel สำหรับเปลี่ยนตัวละครทั้ง 5 คน
    createCharacterDebugPanel(){

        const panel = document.createElement("div");
        panel.id = "debug-character-panel";

        const title = document.createElement("div");
        title.textContent = "DEBUG CHARACTER";
        panel.appendChild(title);
        // รายชื่อตัวละครที่สามารถเลือกผ่าน Debug
        const heros = [
            { hero: LiuBei, name: "เล่าปี่" },
            { hero: ZhangFei, name: "เตียวหุย" },
            { hero: CaoCao, name: "โจโฉ" },
            { hero: SunQuan, name: "ซุนกวน" },
            { hero: HuaTuo, name: "ฮัวโต๋" },
            { hero: SimaYi, name: "สุมาอี้" },
            { hero: GanNing, name: "กำเหลง" },
            { hero: LuBu, name: "ลิโป้" },
            { hero: XiahouDun, name: "แฮหัวตุ้น" },
            { hero: GuanYu, name: "กวนอู" },
            { hero: LuMeng, name: "ลิบอง" }

        ];
        // สร้าง Select ให้ Player ทั้ง 5 คน
        for(let i = 0; i < this.game.players.length; i++){

            const player = this.game.players[i];
            const row = document.createElement("div");
            const label = document.createElement("span");
            label.textContent = "P" + (i + 1) + " ";
            
            const select = document.createElement("select");
            for(const data of heros){
                const option = document.createElement("option");
                option.value = data.hero.name;
                option.textContent = data.name;

                if(player.constructor === data.hero){
                    option.selected = true;
                }

                select.appendChild(option);
            }

            select.onchange = () => {
                const selectedHero = heros.find(
                    data => data.hero.name === select.value
                );
                if(!selectedHero){
                    return;
                }
                this.changeCharacter(i, selectedHero.hero);
            };

            row.appendChild(label);
            row.appendChild(select);

            panel.appendChild(row);
        }

        document.body.appendChild(panel);
        this.characterDebugPanel = panel;
        // ซ่อน Panel ตอนเริ่มต้น
        panel.style.bottom = "50px";
        // สร้างปุ่มเปิด/ปิด Debug Character
        const toggleButton = document.createElement("button");
        toggleButton.id = "debug-character-toggle";
        toggleButton.textContent = "🛠 DEBUG";
        // เริ่มต้นเปิด Panel
        panel.style.display = "none";
        toggleButton.onclick = () => {
            this.toggleCharacterDebugPanel();
        };
        document.body.appendChild(toggleButton);
        this.characterDebugToggleButton = toggleButton;
    }
    // เปิด/ปิด Debug Character Panel
    toggleCharacterDebugPanel(){

        if(!this.characterDebugPanel){
            return;
        }
        if(this.characterDebugPanel.style.display === "none"){
            this.characterDebugPanel.style.display = "block";
        }else{
            this.characterDebugPanel.style.display = "none";
        }
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
    // เปลี่ยนตัวละครของ Player ผ่าน Debug
    changeCharacter(playerIndex, HeroClass){

        if(!Number.isInteger(playerIndex)){
            console.error("playerIndex ต้องเป็นจำนวนเต็ม");
            return false;
        }

        const player = this.game.players[playerIndex];

        if(!player){
            console.error("ไม่พบ Player index =", playerIndex);
            return false;
        }

        if(typeof HeroClass !== "function"){
            console.error("HeroClass ไม่ถูกต้อง");
            return false;
        }
        // สร้าง Hero ชั่วคราวเพื่อดึงข้อมูลและ Skill ของตัวละครใหม่
        const newHero = new HeroClass(
            this.game, 
            player.controller.constructor
        );
        // ถอน Skill เดิมออกจาก EventManager
        for(const skill of [...player.skills]){
            player.removeSkill(skill);
        }
        // ถอน Skill ของ Hero ชั่วคราวออกก่อน
        for(const skill of [...newHero.skills]){
            skill.unregister();
        }
        // โอนข้อมูลของ Hero ใหม่มาให้ Player เดิม
        player.name = newHero.name;
        player.maxHp = newHero.maxHp;
        player.hp = newHero.hp;
        player.faction = newHero.faction;
        player.gender = newHero.gender;
        player.abilityDescription = newHero.abilityDescription;
        // เปลี่ยน Prototype ให้ Player เดิมเป็น Hero ใหม่
        Object.setPrototypeOf(
            player, 
            HeroClass.prototype
        );
        // โอน Skill ของ Hero ใหม่มาให้ Player เดิม
        player.skills = [];
        for(const skill of newHero.skills){
            skill.owner = player;
            player.skills.push(skill);
            skill.register(
                this.game.eventManager, 
                player
            );
        }
        this.game.ui.render();
        console.log(
            "Debug เปลี่ยน Player", playerIndex, "เป็น", player.name
        );
        return true;
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
