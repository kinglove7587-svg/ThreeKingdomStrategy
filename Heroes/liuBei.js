class LiuBei extends Player{ // เล่าปี่
    //
    constructor(name){
        super(name);
        //
        this.maxHp = 4;
        this.hp = 4;
        //
        this.skills = [
            new Rende(),
            new Jijiang()
        ];
    }
}