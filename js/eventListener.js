class EventListener{
    // กำหนด constructor สร้างวัตถุสำหรับเก็บ Event และ Callback ฟังก์ชันทั้งหมด
    constructor(){
        // สร้างออบเจกต์ว่างเพื่อใช้เก็บอาร์เรย์ของ callback แยกตามชื่อ eventName
        this.events = {};
    }
    // ลงทะเบียนรับฟัง Event ฟังว่าถ้ามี Event ชื่อ eventName เกิดขึ้น ให้รันฟังก์ชัน callback
    on(eventName, callback){
        // ถ้ายังไม่เคยมีการลงทะเบียน Event ชื่อนี้มาก่อน ให้สร้างอาร์เรย์ว่างเตรียมไว้
        if (!this.events[eventName]){
            this.events[eventName] = [];
        }
        // นำฟังก์ชัน callback เพิ่มเข้าไปในอาร์เรย์ของ Event นั้น
        this.events[eventName].push(callback);
    }
    // ส่งสัญญาณ Event ออกไปพร้อมส่งข้อมูลตัวแปรเพิ่มเติม ...args ไปให้ callback ทุกตัวรันทำงาน
    emit(eventName, ...args){
        // ถ้าไม่มีใครลงทะเบียนรับฟัง Event ชื่อนี้ไว้ ให้ยกเลิกการทำงานทันที
        if (!this.events[eventName]){
            return;
        }
        // วนลูปสั่งให้ฟังก์ชัน callback ทุกตัวที่ลงทะเบียนไว้ใน Event ชื่อนี้ทำงาน
        for (const callback of this.events[eventName]){
            // เรียกใช้ฟังก์ชัน callback โดยส่งอาร์กิวเมนต์ทั้งหมด ...args เข้าไป
            callback(...args);
        }
    }
}