class DebugDamageListener{
    // ลงทะเบียนรับฟัง Event ที่เกี่ยวข้องกับความเสียหายในเกม
    register(eventManager){
        // ทำงานเมื่อเกิด Event "beforeDamage" (ก่อนหัก HP)
        eventManager.on("beforeDamage", (damage) => {
            console.log("[BeforeDamage]", damage.source.name, "->", 
                damage.target.name, "(" + damage.amount + ")"
            );
        });
        // ทำงานเมื่อเกิด Event "afterDamage" (หลังหัก HP เรียบร้อยแล้ว)
        eventManager.on("afterDamage", (damage) => {
            console.log("[AfterDamage]", damage.source.name, "->", 
                damage.target.name, "(" + damage.amount + ")"
            );
        });
    }
}