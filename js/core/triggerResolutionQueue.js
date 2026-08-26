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
    addEventListeners(players, eventName, damage = null){

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
        if(damage){
            this.sortByDamage(damage);
        }
        return count;
    }
    // จัดเรียง Trigger ในคิวตามลำดับความสำคัญของความเสียหาย (Damage) ที่เกิดขึ้น
    sortByDamage(damage){

        if(!damage || !damage.target || !damage.source){
            return this.queue;
        }
        // ดึงข้อมูลเกมและดัชนีของผู้เล่น
        const game = damage.target.game;
        const targetIndex = game.players.indexOf(damage.target);
        const sourceIndex = game.players.indexOf(damage.source);
        const playerCount = game.players.length;
        // ฟังก์ชันช่วยในการจัดหมวดหมู่ Trigger ตามความสัมพันธ์กับความเสียหาย
        const getCategory = (trigger) => {
            if(trigger.owner === damage.target){
                return 1;
            }
            if(trigger.owner === damage.source){
                return 2;
            }
            return 3;
        };
        // ฟังก์ชันช่วยในการจัดลำดับผู้เล่นอื่น ๆ ตามความสัมพันธ์กับความเสียหาย
        const getOtherPlayerOrder = (trigger) => {

            const ownerIndex = game.players.indexOf(trigger.owner);
            if(ownerIndex === -1){
                return Number.MAX_SAFE_INTEGER;
            }
            return (
                ownerIndex - sourceIndex + playerCount
            ) % playerCount;
        };
        this.queue.sort((a, b) => {

            const categoryA = getCategory(a);
            const categoryB = getCategory(b);
            if(categoryA !== categoryB){
                return categoryA - categoryB;
            }
            if(categoryA !== 3){
                return 0;
            }
            return (
                getOtherPlayerOrder(a) - getOtherPlayerOrder(b)
            );
        });
        return this.queue;
    }
}