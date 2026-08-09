class DebugDamageListener{
    // ลงทะเบียนรับฟัง Event ที่เกี่ยวข้องกับความเสียหายในเกม
    register(eventManager){
        // ทำงานเมื่อเกิด Event "beforeDamage" (ก่อนหัก HP)
        eventManager.on("beforeDamage", (damage) => {
            // ตรวจสอบ source หากไม่มีผู้สร้างความเสียหาย (เช่น สายฟ้า) ให้ใช้ชื่อ "สายฟ้า" แทน เพื่อป้องกัน Error
            const sourceName = damage.source ? damage.source.name : "สายฟ้า";
            console.log("[BeforeDamage]", sourceName, "->", 
                damage.target.name, "(" + damage.amount + ")"
            );
        });
        // ทำงานเมื่อเกิด Event "afterDamage" (หลังหัก HP เรียบร้อยแล้ว)
        eventManager.on("afterDamage", (damage) => {
            // ตรวจสอบ source หากไม่มีผู้สร้างความเสียหาย (เช่น สายฟ้า) ให้ใช้ชื่อ "สายฟ้า" แทน เพื่อป้องกัน Error
            const sourceName = damage.source ? damage.source.name : "สายฟ้า";
            console.log("[AfterDamage]", sourceName, "->", 
                damage.target.name, "(" + damage.amount + ")"
            );
        });
    }
}