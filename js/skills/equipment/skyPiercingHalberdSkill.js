class SkyPiercingHalberdSkill extends TriggerSkill{
    constructor(){
        super("ง้าวฟ้าทะลวง");
    }
    // ลงทะเบียน Event Listener สำหรับตรวจจับการใช้การ์ดโจมตี
    register(eventManager, player){
        
        const callback = (context) => {
            // ต้องเป็นผู้เล่นเจ้าของสกิล
            if(context.player !== player){
                return;
            }
            // ต้องเป็นการ์ดโจมตี (SlashCard)
            if(!(context.card instanceof SlashCard)){
                return;
            }
            // ต้องมีอาวุธสวมใส่อยู่
            if(!player.weapon){
                return;
            }
            // อาวุธที่สวมใส่อยู่ต้องมีสกิลนี้
            if(!player.weapon.skills.includes(this)){
                return;
            }
            // การ์ดโจมตีต้องเป็นการ์ดใบสุดท้ายในมือ
            if(player.hand.cards.length !== 0){
                return;
            }
            // เปิดการทำงานของง้าวฟ้าทะลวง
            context.skyPiercingHalberdActive = true;
            player.game.log(player.name + " ง้าวฟ้าทะลวงทำงาน");
        };
        this.registerListener(eventManager, "beforeUseSlash", callback);
    }
}