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
        // ถ้าเป้าหมายไม่ได้ติดโซ่ตรวน ให้ข้ามไปทันที
        if(!damage.target.isChained()){
            return;
        }
        //
        const target = this.getChainedPlayers(damage.target);
        console.log("ผู้เล่นติดโซ่", target.map(p => p.name));
    }
    //
    getChainedPlayers(source){
        //
        const game = source.game;
        //
        return game.players.filter(player => 
            player !== source && 
            player.isAlive() && 
            player.isChained()
        );
    }
}