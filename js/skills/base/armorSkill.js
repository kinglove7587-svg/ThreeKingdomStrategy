class ArmorSkill extends TriggerSkill{
    constructor(name){
        super(name);
    }
    // ลงทะเบียน Event Listener โดยครอบ (Wrap) Callback เพื่อตรวจจับการ ignoreArmor
    registerListener(eventManager, eventName, callback){
        // หาก Context ระบุว่าทะลวงเกราะ (ignoreArmor) ให้ข้ามการทำงานของเกราะทันที
        const wrappedCallback = (context) => {
            if(context && context.ignoreArmor === true){
                return;
            }
            callback(context);
        };
        // ใช้ระบบลงทะเบียนของ TriggerSkill เพื่อให้ ArmorSkill เข้า Trigger Queue ด้วย
        super.registerListener(
            eventManager, 
            eventName, 
            wrappedCallback
        );
    }
}