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
        console.log("targets =", targets.map(p => p.name));
        // วนลูปสร้างความเสียหายส่งต่อให้ผู้เล่นที่ติดโซ่ตรวนทีละคน
        for(const target of targets){
            console.log("loop target =", target.name);
            // สร้าง Instance ความเสียหายใหม่สำหรับผู้เล่นเป้าหมายโซ่ตรวน
            const chainDamage = new Damage(
                damage.target, 
                target, 
                damage.amount, 
                damage.type
            );
            // ส่งต่อการ์ดที่เป็นต้นเหตุความเสียหาย
            chainDamage.card = damage.card;
            // ทำเครื่องหมายว่าเป็นความเสียหายจากการส่งต่อโซ่ตรวน
            chainDamage.chain = true;
            // บันทึก Log การส่งต่อความเสียหายลงระบบของเกม
            damage.target.game.log(damage.target.name + " ส่งต่อความเสียหาย" + 
                (damage.type === DamageType.FIRE ? "ไฟ" : "สายฟ้า")
            );
            // ส่งความเสียหายลูกใหม่เข้าระบบประมวลผลเกมจริง!
            damage.target.game.damage(chainDamage);
        }
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