class EventManager{
    // กำหนด constructor รับอินสแตนซ์ของเกม game เข้ามาเก็บไว้ใช้งาน
    constructor(game){
        // บันทึกออบเจกต์ game ไว้ใน property this.game
        this.game = game;
        // สร้างอินสแตนซ์ของ EventListener เพื่อใช้จัดการการลงทะเบียนและการยิง Event ภายในเกม
        this.listener = new EventListener();
    }
    // ลงทะเบียนรับฟัง Event โดยส่งชื่อ eventName และฟังก์ชัน callback เข้าไปเก็บไว้ใน listener
    on(eventName, callback){
        // ส่งต่อการลงทะเบียน Event ไปให้ตัวจัดการ EventListener
        this.listener.on(eventName, callback);
    }
    // ยกเลิกการลงทะเบียน Event โดยส่งชื่อ eventName และฟังก์ชัน callback ที่ต้องการยกเลิก
    off(eventName, callback){
        // ส่งต่อการยกเลิกการลงทะเบียน Event ไปให้ตัวจัดการ EventListener
        this.listener.off(eventName, callback);
    }
    // กระจาย Event ทั่วไปออกไป พร้อมส่งอาร์กิวเมนต์ต่างๆ ...args ไปให้ฟังก์ชันที่ดักฟังอยู่
    emit(eventName, ...args){
        // สั่งให้ EventListener ยิง Event ตามชื่อที่ระบุพร้อมตัวแปรเสริม
        this.listener.emit(eventName, ...args);
    }
    // ส่ง Event เจาะจงไปยังผู้เล่นเป้าหมาย โดยส่งทั้งผู้เล่น player และออบเจกต์เกม this.game ไปให้ callback
    emitToPlayer(eventName, player){
       // สั่งยิง Event ไปยัง listener โดยแนบข้อมูล player และ this.game ไปด้วย
       this.listener.emit(eventName, player, this.game);
    }
}