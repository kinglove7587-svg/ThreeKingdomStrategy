class ChainDamageListener{
    // เมธอดสำหรับผูก Listener เข้ากับ EventManager ของเกม
    register(eventManager){
        //มื่อเกิด Event "afterDamage" (เกิดความเสียหายขึ้นแล้ว) ให้ส่งข้อมูล damage ไปประมวลผลต่อ
        eventManager.on("afterDamage", (damge)=>{
            this.onAfterDamage(damge);
        });
    }
    // ตรวจสอบและส่งต่อความเสียหายเมื่อเข้าเงื่อนไขโซ่ตรวน
    onAfterDamage(damage){ 
        // ถ้าไม่ใช่ความเสียหายธาตุ (ไฟ หรือ สายฟ้า) ให้ข้ามไปทันที
        if(damage.type !== DamageType.FIRE && 
            damage.type !== DamageType.THUNDER
        ){
            return;
        }
        // ถ้าความเสียหายนี้เกิดจากการส่งต่อโซ่ตรวนมาแล้ว ให้ข้ามไปทันที
        if(damage.chain){
            return;
        }
        // ถ้าเป้าหมายไม่ได้ติดโซ่ตรวน ให้ข้ามไปทันที
        if(!damage.target.isChained()){
            return;
        }
        // ค้นหาผู้เล่นคนอื่นที่ติดโซ่ตรวน
        const targets = this.getChainedPlayers(damage.target);
        console.log(targets);
    }
    // เมธอดสำหรับค้นหาผู้เล่นคนอื่นๆ ที่ติดโซ่ตรวน
    getChainedPlayers(source){
        // อ้างอิงตัวจัดการเกมกลาง
        const game = source.game;
        // คัดกรองเฉพาะผู้เล่นที่ไม่ใช่เป้าหมายเดิม
        return game.players.filter(player => 
            player !== source && 
            player.isAlive() && 
            player.isChained()
        );
    }
}