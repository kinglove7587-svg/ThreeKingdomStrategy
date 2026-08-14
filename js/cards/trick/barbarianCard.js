class BarbarianCard extends TrickCard{
    constructor(suit, number){
        super("กองทัพต่างแดน", suit, number);
    }
    // ประมวลผลการ์ดกองทัพต่างแดน (Barbarian Invasion)
    use(player, game){
        // วนลูปผู้เล่นทุกคนในเกม
        for(const target of game.players){
            // ข้ามผู้เล่นที่เป็นคนใช้การ์ดใบนี้
            if(target === player){
                continue;
            }
            // บังคับให้เป้าหมายส่งการ์ด Slash/Attack
            const success = game.askSlash(target);
            // หากเป้าหมายไม่มีการ์ด Slash/Attack ตอบรับ ให้ทำ Damage 1 หน่วย
            if(!success){
                const damage = new Damage(player, target, 1);
                damage.card = this;
                game.damage(damage);
            }
        }
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ผู้เล่นทุกคนยกเว้นผู้ใช้ต้องใช้ โจมตี ตอบ หากไม่สามารถใช้ โจมตี ได้ จะได้รับความเสียหาย 1";
    }
}