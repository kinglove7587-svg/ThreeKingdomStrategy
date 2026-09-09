class Heroic extends TriggerSkill{

    constructor(){
        super("Heroic");
    }
    // ทำงานใน Draw Phase ของเจ้าของ Skill
    onDrawPhase(player, game){
        // ต้องเป็นเจ้าของ Skill เท่านั้น
        if(player !== this.owner){
            return;
        }
        // หยุด Default Draw 2 ใบ
        game.pauseDrawPhase(player);
        game.log(player.name + "  ใช้ Heroic จั่วการ์ด 3 ใบ");
        return game.resumeDrawPhase(3);
    }
    
}