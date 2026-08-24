class Necromancy extends TriggerSkill{

    constructor(){
        super("Necromancy");
    }
    // ลงทะเบียนที่จะทำงานเมื่อไพ่ถูกเปิดเผย
    register(eventManager, player){

        const callback = (context) => {
            if(!context){
                return;
            }
            console.log("Necromancy Judge Event =", context);
            console.log("Necromancy Owner =", player.name);
            console.log("Judge Player =", context.player?.name);
            console.log("Judge Card =", context.card);
        };
        this.registerListener(
            eventManager, 
            "judgeCardRevealed", 
            callback
        );
    }
}