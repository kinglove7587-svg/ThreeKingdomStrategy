class BlueSteelSwordSkill extends TriggerSkill{
    // สกิลของอาวุธกระบี่เหล็กกล้า (Blue Steel Sword)
    constructor(){
        super("กระบี่เหล็กกล้า");
    }
    // ลงทะเบียน Event Listener ดักฟัง beforeSlashTarget
    register(eventManager, player){
        
        const callback = (context) => {
            // ทำงานเฉพาะตอนผู้เล่นคนนี้เป็นผู้โจมตี
            if(context.player !== player){
                return;
            }
            // ต้องเป็นการ์ดโจมตี (SlashCard) เท่านั้น
            if(!(context.card instanceof SlashCard)){
                return;
            }
            // เปิดสถานะ ทะลวงเกราะ (Ignore Armor)
            context.ignoreArmor = true;
            player.game.log(player.name + " กระบี่เหล็กกล้า ตีทะลุเกราะ");
        };
        this.registerListener(eventManager, "beforeSlashTarget", callback);
    }
}