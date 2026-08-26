class TriggerResolutionQueue{

    constructor(){
        // เก็บ Trigger ที่รอการประมวลผล
        this.queue = [];
        this.current = null;
    }
    // เพิ่ม Trigger ลงในคิว
    add(trigger){

        if(!trigger){
            return false;
        }
        this.queue.push(trigger);
        return true;
    }
    // ดึง Trigger ถัดไปจากคิว (ถ้ามี) และตั้งค่าเป็น Trigger ปัจจุบัน
    next(){

        if(this.current){
            return this.current;
        }
        if(this.queue.length === 0){
            return null;
        }
        this.current = this.queue.shift();
        return this.current;
    }
    // ยกเลิก Trigger ปัจจุบันและดึง Trigger ถัดไปจากคิว
    resume(){

        this.current = null;
        return this.next();
    }
    // ตรวจสอบว่าคิวว่างหรือไม่ (ไม่มี Trigger ปัจจุบันและไม่มี Trigger รออยู่ในคิว)
    isEmpty(){
        
        return this.current === null && 
            this.queue.length === 0;
    }
    // รวบรวม Listener ตาม eventName ที่เกิดขึ้น
    addEventListeners(players, eventName){

        if(!Array.isArray(players) || !eventName){
            return 0;
        }

        let count = 0;
        for(const player of players){
            if(!player || typeof player.getTriggerSkills !== "function"){
                continue;
            }
            for(const skill of player.getTriggerSkills()){
                if(!skill.listeners){
                    continue;
                }
                for(const listener of skill.listeners){
                    if(listener.eventName !== eventName){
                        continue;
                    }
                    this.add(listener);
                    count++;
                }
            }
        }
        return count;
    }
}