class RainingArrowsCard extends TrickCard{
    constructor(suit, number){
        super("ฝนธนู", suit, number);
    }
    // บังคับให้ผู้เล่นคนอื่นทุกคนทิ้งการ์ดหลบ (Dodge) หากไม่มีจะได้รับ Damage 1 หน่วย
    use(player, game){
        // วนลูปผู้เล่นทุกคนในเกม
        for(const target of game.players){
            // ข้ามผู้เล่นที่เป็นคนใช้การ์ดใบนี้
            if(target === player){
                continue;
            }
            // บังคับให้เป้าหมายส่งการ์ด Dodge/หลบ
            const success = game.askDodge(target);
            // หากเป้าหมายไม่มีการ์ด Dodge ตอบรับ ให้ทำ Damage 1 หน่วย
            if(!success){
                const damage = new Damage(player, target, 1);
                damage.card = this;
                game.damage(damage);
            }
        }
        return true;
    }
}