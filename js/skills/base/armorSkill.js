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
        // ลงทะเบียน Event และเก็บ Reference ไว้สำหรับ Unregister ในอนาคต
        eventManager.on(eventName, wrappedCallback);
        this.listeners.push({
            eventManager: eventManager, 
            eventName: eventName, 
            callback: wrappedCallback
        });
    }
}