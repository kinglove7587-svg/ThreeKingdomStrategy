class ZhangFei extends Player{ // เตียวหุย
    //
    constructor(name){
        super(name);
        //
        this.maxHp = 4;
        this.hp = 4;
        // 
        this.skills = [
            new Paoxiao()
        ];
    }
}