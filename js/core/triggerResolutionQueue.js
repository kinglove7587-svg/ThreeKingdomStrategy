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
}