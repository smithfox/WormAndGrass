import * as PIXI from "pixijs"
import GrassMap from "./GrassMap";
import WorldMap from "./WorldMap";
import WorldRules from "./WorldRules";

export default class Worm {
    private static DEBUG: boolean = false;
    private _bodygraphics: PIXI.Graphics[];
    private _origin_e: number;
    private _energy: number;
    private _age: number = 0;
    private color:number = 0xFFFF00;
    private thickness = 5;

    //private moveCost = 5;
    private deadCutDown = 10;

    private app: PIXI.Application;
    private world_map: WorldMap;
    private grass_map: GrassMap;
    private worm_id:number = 0;

    public get IsDead(){ return this._energy<=0 && this.deadCutDown<=0;}
    public get Energy() { return this._energy; }
    public get Age() { return this._age; }
    public get Thickness() { return this.thickness; }
    //public get MoveCost() { return this.moveCost; }
    public get MoveCost() { return WorldRules.WormMoveCost; }
    public get Color() { return this.color; }
    public get Actions() { return this._actions; }
    public get NextAction() {
        let next = this._action_index + 1;
        next = next % this.ACTION_COUNT;

        let action = this._actions[next];
        let action_str = "" + next + ", ";
        action_str += Worm.FormatAction(action);
        return action_str;
    }
    public static FormatAction(action:number):string {
        let action_str = "";
        let d = Math.floor(action / 100);
        let p = Math.floor(action % 100);
        if (d == 0) {
            action_str += "随" + p;
        } else if (d == 1) {
            action_str += "右" + p;
        } else if (d == 2) {
            action_str += "左" + p;
        } else if (d == 3) {
            action_str += "前" + p;
        } else {
            action_str += "?" + p;
        }
        return action_str;
    }

    private selected: boolean = false;
    private selectedBorder:PIXI.Graphics|undefined;

    public constructor(app: PIXI.Application, 
        worldmap:WorldMap, grassmap:GrassMap, 
        x=-1, y=-1, init_direction=Direction.None) {

        this._origin_e = WorldRules.WormEngergy;
        this._energy = this._origin_e;

        this.app = app;
        this.world_map = worldmap;
        this.grass_map = grassmap;

        this.worm_id = Worm.WORM_ID++;
        this.color = Math.round(Math.random() * 0xFFFFFF);
        //this.thickness = 2 + Math.random() * 4;
        //this.moveCost = WorldRules.WormMoveCost;

        if (x<0) x = Math.random() * this.app.screen.width;
        if (y<0) y = Math.random() * this.app.screen.height;

        if (init_direction == Direction.None) {
            init_direction = this.RandomFoward();
        }

        this.initBody(x, y, init_direction);
        this.InitActions();
    }
    public get Selected() : boolean {
        return this.selected;
    }

    public set Selected(f : boolean) {
        this.selected = f;
        
        if (!this.selected) {
            if(this.selectedBorder) {
                this.app.stage.removeChild(this.selectedBorder);
                this.selectedBorder = undefined;
            }
        }
    }
    private drawSprite(sprite: PIXI.Graphics, color:number, alpha:number, fill:boolean, head:boolean = false): void {
        sprite.clear();
        if(fill) {
            sprite.beginFill(color, alpha);
            sprite.lineStyle({ color: color, width: 1, alignment: 0 });
        } else {
            sprite.lineStyle({ color: color, width: 1, alignment: 0 });
        }
        if(head) {
            //let half = this.thickness/2;
            //sprite.drawCircle(half,half,half);
            sprite.drawRect(0,0,this.thickness, this.thickness);
        } else {
            sprite.drawRect(0,0,this.thickness, this.thickness);
        }
        
        if(fill) {
            sprite.endFill();
        }
    }

    //private _actions:number[] = [0, 0, 0, 0, 0, 0, 0, 0]; //完全随机
    //private _actions:number[] = [229, 229, 229, 229, 229, 229, 229, 229]; //绝大概率右转
    //private _actions:number[] = [330, 330, 330, 229, 330, 330, 120, 120]; //前前前右前前左左
    //private _actions:number[] = [330, 330, 330, 330, 330, 330, 330, 330]; //一直向前
    private _actions:number[] = [320, 325, 330, 0, 320, 327, 0, 327]; //一直向前
    private _action_index = 0;
    private readonly ACTION_COUNT = 8;

    private InitActions() {
        for(let i=0;i<this.ACTION_COUNT;i++) {
            this._actions[i] = Math.floor(Math.random() * 4 - 0.0001) * 100;
            if (this._actions[i] <0) {
                this._actions[i] = 0;
            }
            this._actions[i] += 20 + (Math.random() * 10); // 20 ~ 30概率， 3个方向，各占10，若30必然发生
        }
    }
    private RandomFoward(): Direction {
        let r = Math.random() * 40;

        //console.log(`dir_toward=${dir_toward}, cond=${cond}, n_max=${n_max}, r_max=${r_max}, l_max=${l_max}, h_max=${h_max}`);

        if (r < 10) {
            return Direction.None; //down
        } else if (r < 20) {
            return Direction.Right;
        } else if (r < 30) {
            return Direction.Left;
        } else if (r < 40) {
            return Direction.GoHead; //up
        } else {
            return Direction.GoHead; //!!!!
        }
    }

    private RandomDirection(): Direction {
        let action = this._actions[this._action_index];
        this._action_index = (this._action_index+1) % this.ACTION_COUNT;

        let dir_toward = Math.floor(action / 100); //0 random, 1 right, 2 left, 3 head
        let cond = action % 100; //0 ~ 30, 默认三个方向总平均分布，每个都是10，单个方向最大30

        let n_cond = 10;  //默认4个方向几率一致, back   0 ~ 10
        let r_cond = 10;  //默认4个方向几率一致, right 10 ~ 20
        let l_cond = 10;  //默认4个方向几率一致, left  20 ~ 30
        let h_cond = 10;  //默认4个方向几率一致, head  30 ~ 40

        let total_cond = 30; //只考虑3个方向的变化

        if (dir_toward == Direction.GoHead) { //倾向 head
            h_cond = cond;
            l_cond = (total_cond - cond) * 0.5;
            r_cond = (total_cond - cond) * 0.5;
        } else if (dir_toward == Direction.Left) {
            l_cond = cond;
            r_cond = (total_cond - cond) * 0.5;
            h_cond = (total_cond - cond) * 0.5;
        } else if (dir_toward == Direction.Right) {
            r_cond = cond;
            h_cond = (total_cond - cond) * 0.5;
            l_cond = (total_cond - cond) * 0.5;
        } else { // random
            // do nothing
        }

        let n_max = 0 + n_cond;
        let h_max = n_max + r_cond;
        let l_max = h_max + l_cond;
        let r_max = l_max + h_cond;
        
        let r = n_max + Math.random() * 30;

        //console.log(`dir_toward=${dir_toward}, cond=${cond}, n_max=${n_max}, r_max=${r_max}, l_max=${l_max}, h_max=${h_max}`);

        if (r < n_max) { //default 0 ~ 10
            return Direction.None;
        } else if (r < h_max) { //default 10 ~ 20
            return Direction.GoHead;
        } else if (r < l_max) { //default 20 ~ 30
            return Direction.Left;
        } else if (r < r_max) { //default 30 ~ 40
            return Direction.Right;
        } else {
            return Direction.GoHead; //!!!!
        }
    }

    private initBody(x:number, y:number, direction):void {
        this._bodygraphics = [];
        this._bodygraphics.push(new PIXI.Graphics());
        this._bodygraphics.push(new PIXI.Graphics());
        this._bodygraphics.push(new PIXI.Graphics());
        this._bodygraphics.push(new PIXI.Graphics());

        if(false) {
            this.drawSprite(this._bodygraphics[0], 0xFF0000, 1, true, true);
            this.drawSprite(this._bodygraphics[1], this.color, 1, true);
            this.drawSprite(this._bodygraphics[2], this.color, 1, true);
            this.drawSprite(this._bodygraphics[3], this.color, 1, true);
        } else {
            this.drawSprite(this._bodygraphics[0], this.color, 1, true);
            this.drawSprite(this._bodygraphics[1], this.color, 1, false);
            this.drawSprite(this._bodygraphics[2], this.color, 1, false);
            this.drawSprite(this._bodygraphics[3], this.color, 1, false);
        }
        this.app.stage.addChild(this._bodygraphics[0]);
        this.app.stage.addChild(this._bodygraphics[1]);
        this.app.stage.addChild(this._bodygraphics[2]);
        this.app.stage.addChild(this._bodygraphics[3]);

        if (direction == Direction.GoHead) { // means up
            this._bodygraphics[0].x = x;
            this._bodygraphics[0].y = y;

            this._bodygraphics[1].x = this._bodygraphics[0].x;
            this._bodygraphics[1].y = this._bodygraphics[0].y + this.thickness;

            this._bodygraphics[2].x = this._bodygraphics[1].x;
            this._bodygraphics[2].y = this._bodygraphics[1].y + this.thickness;

            this._bodygraphics[3].x = this._bodygraphics[2].x;
            this._bodygraphics[3].y = this._bodygraphics[2].y + this.thickness;

        } else if (direction == Direction.Left) { //means left
            this._bodygraphics[0].x = x;
            this._bodygraphics[0].y = y;

            this._bodygraphics[1].x = this._bodygraphics[0].x + this.thickness;
            this._bodygraphics[1].y = this._bodygraphics[0].y;

            this._bodygraphics[2].x = this._bodygraphics[1].x + this.thickness;
            this._bodygraphics[2].y = this._bodygraphics[1].y;

            this._bodygraphics[3].x = this._bodygraphics[2].x + this.thickness;
            this._bodygraphics[3].y = this._bodygraphics[2].y;
        } else if (direction == Direction.Right) { //means right
            this._bodygraphics[0].x = x;
            this._bodygraphics[0].y = y;

            this._bodygraphics[1].x = this._bodygraphics[0].x - this.thickness;
            this._bodygraphics[1].y = this._bodygraphics[0].y;

            this._bodygraphics[2].x = this._bodygraphics[1].x - this.thickness;
            this._bodygraphics[2].y = this._bodygraphics[1].y;

            this._bodygraphics[3].x = this._bodygraphics[2].x - this.thickness;
            this._bodygraphics[3].y = this._bodygraphics[2].y;
        } else { // means bottom
            this._bodygraphics[0].x = x;
            this._bodygraphics[0].y = y;

            this._bodygraphics[1].x = this._bodygraphics[0].x;
            this._bodygraphics[1].y = this._bodygraphics[0].y - this.thickness;

            this._bodygraphics[2].x = this._bodygraphics[1].x;
            this._bodygraphics[2].y = this._bodygraphics[1].y - this.thickness;

            this._bodygraphics[3].x = this._bodygraphics[2].x;
            this._bodygraphics[3].y = this._bodygraphics[2].y - this.thickness;
        }
    }
    
    private s = 0;

    private DirectionBox(d:Direction): PIXI.Rectangle {
        let dx = this._bodygraphics[0].x - this._bodygraphics[1].x;
        let dy = this._bodygraphics[0].y - this._bodygraphics[1].y;

        let n_dx = 0;
        let n_dy = 0;
        if (d == Direction.GoHead) {
            n_dx = dx;
            n_dy = dy;
        } else if (d == Direction.Left) {
            n_dx = -dy;
            n_dy = +dx;
        } else if (d == Direction.Right){
            n_dx = +dy;
            n_dy = -dx;
        } else { // go back?
            console.warn("GoBack!");
            n_dx = -dx;
            n_dy = -dy;
        }
        
        return new PIXI.Rectangle(
            this._bodygraphics[0].x + n_dx,
            this._bodygraphics[0].y + n_dy,
            this._bodygraphics[0].width,
            this._bodygraphics[0].height,
            );
    }

    private boundaryLimit(x, y) {
        //let gap = (this.thickness + 0);
        let gap = 0;
        return (x < gap ||
            y < gap ||
            x > (this.app.screen.width - gap) ||
            y > (this.app.screen.height - gap));
    }

    private BoxCollisionOthers(box: PIXI.Rectangle): boolean {
        let otherObjs = this.world_map.getOtherObjsInMapCells(this);
        if (!otherObjs) return false;
        for (const _obj of otherObjs) {
            // FIXME: obj 不一定都是 Worm
            if(_obj.BoxCollisionMe(box)) return true;
        }
        return false;
    }

    private BoxCollisionMe(box: PIXI.Rectangle): boolean {
        if (this.IsDead) return false;

        return (
            WorldMap.BoxCollisionDetect(box, this._bodygraphics[0].getBounds()) ||
            WorldMap.BoxCollisionDetect(box, this._bodygraphics[1].getBounds()) ||
            WorldMap.BoxCollisionDetect(box, this._bodygraphics[2].getBounds()) ||
            WorldMap.BoxCollisionDetect(box, this._bodygraphics[3].getBounds())
        );
    }

    private Move():void {
        let d = this.RandomDirection();
        let moveToBox = this.DirectionBox(d);
        //console.log(`[${this.Name}]: move direction [${d}], new box=${moveToBox.x},${moveToBox.y}`);
        if (this.BoxCollisionOthers(moveToBox)) {
            if (Worm.DEBUG) console.log(`[${this.Name}]: want move to [${d}], but collistion others`);
            return;
        }

        if (this.boundaryLimit(moveToBox.x, moveToBox.y)) {
            return;
        }

        this._bodygraphics[3].x = this._bodygraphics[2].x;
        this._bodygraphics[3].y = this._bodygraphics[2].y;

        this._bodygraphics[2].x = this._bodygraphics[1].x;
        this._bodygraphics[2].y = this._bodygraphics[1].y;

        this._bodygraphics[1].x = this._bodygraphics[0].x;
        this._bodygraphics[1].y = this._bodygraphics[0].y;

        this._bodygraphics[0].x = moveToBox.x;
        this._bodygraphics[0].y = moveToBox.y;

        this.world_map.setObjToMap(this);
        /*
        let objs = this.world_map.getOtherObjsInMapCells(this);
        if (objs) {
            objs.forEach(obj => {
                if (Worm.DEBUG) console.log("["+this.Name+"]: cells container " + obj.Name);
            });
        }
        */
        //this.world_map.printWorld();

        if (this.Selected) {
            if(!this.selectedBorder) {
                this.selectedBorder = new PIXI.Graphics();
                this.selectedBorder.lineStyle(1, 0xFFFF88);
                let rr = this.BoundRect;
                this.selectedBorder.drawRect(rr.x-1, rr.y-1, rr.width+2, rr.height+2);
                this.app.stage.addChild(this.selectedBorder);
            } else {
                this.selectedBorder.clear();
                this.selectedBorder.lineStyle(1, 0xFFFF88);
                let rr = this.BoundRect;
                this.selectedBorder.drawRect(rr.x-1, rr.y-1, rr.width+2, rr.height+2);
            }
        } else {
            if(this.selectedBorder) {
                this.app.stage.removeChild(this.selectedBorder);
                this.selectedBorder == undefined;
            }
        }
        this._energy-=this.MoveCost;
        //console.log(`[${this.Name}]: MoveCost=${this.MoveCost}`);
        if(this._energy < 0) {
            this._energy = 0
        }
    }

    private NoEnergy():boolean {
        if (this._energy <= 0) {
            if (this.deadCutDown<=1) {
                this.Destory();
            } else {
                let alpha = this.deadCutDown / 10;
                this._bodygraphics[0].alpha = alpha;
                this._bodygraphics[1].alpha = alpha;
                this._bodygraphics[2].alpha = alpha;
                this._bodygraphics[3].alpha = alpha;
            }

            this.deadCutDown--;
            return true;
        }
        return false;
    }

    private UpdateEnergyColor() {
        //原能量占2格子
        const onebody_e = this._origin_e * 0.5;
        let r:number = (this._energy / onebody_e) + 0.0000001;
        //console.log(`r=${r.toFixed(2)}, floor(r)=${Math.floor(r).toFixed(2)}`);
        let h:number = r;
        if (h>=1.0) {
            h = 1;
        } else {
            h = h / 2;
            //console.log(`engery=${this._energy.toFixed(2)}, h=${h.toFixed(2)}`);
        }
        this.drawSprite(this._bodygraphics[0], this.color, h, true, false);
        this.drawSprite(this._bodygraphics[1], this.color, 1, r>2, false);
        this.drawSprite(this._bodygraphics[2], this.color, 1, r>3, false);
        this.drawSprite(this._bodygraphics[3], this.color, 1, r>4, false);
    }

    private Eat(): void {
        let grassEngery = this.grass_map.BeEaten(this._bodygraphics[0].getBounds());
        if (grassEngery > 0) {
            //console.log(`[${this.Name}]: eat engery=${grassEngery}`);
            this._energy += grassEngery;
        }
    }

    public Update():void {
        this._age++;
        this._energy -= WorldRules.WormBaseCost;
        if (this.NoEnergy()) return;

        //this.Percept 感知

        if (this._energy >= this.MoveCost) {
            this.Move();
            this.Eat();
        }
        this.UpdateEnergyColor();
    }

    public get BoundRect() : PIXI.Rectangle{
        if (this.IsDead) {
            return PIXI.Rectangle.EMPTY;
        }

        var minx=Number.MAX_VALUE, miny=Number.MAX_VALUE, maxx=0, maxy=0;
        let index = 0;
        if (minx > this._bodygraphics[index].x) {
            minx = this._bodygraphics[index].x;
        }
        if (maxx < this._bodygraphics[index].x) {
            maxx = this._bodygraphics[index].x
        }
        if (miny > this._bodygraphics[index].y) {
            miny = this._bodygraphics[index].y;
        }
        if (maxy < this._bodygraphics[index].y) {
            maxy = this._bodygraphics[index].y
        }

        index = 1;
        if (minx > this._bodygraphics[index].x) {
            minx = this._bodygraphics[index].x;
        }
        if (maxx < this._bodygraphics[index].x) {
            maxx = this._bodygraphics[index].x
        }
        if (miny > this._bodygraphics[index].y) {
            miny = this._bodygraphics[index].y;
        }
        if (maxy < this._bodygraphics[index].y) {
            maxy = this._bodygraphics[index].y
        }

        index = 2;
        if (minx > this._bodygraphics[index].x) {
            minx = this._bodygraphics[index].x;
        }
        if (maxx < this._bodygraphics[index].x) {
            maxx = this._bodygraphics[index].x
        }
        if (miny > this._bodygraphics[index].y) {
            miny = this._bodygraphics[index].y;
        }
        if (maxy < this._bodygraphics[index].y) {
            maxy = this._bodygraphics[index].y
        }

        index = 3;
        if (minx > this._bodygraphics[index].x) {
            minx = this._bodygraphics[index].x;
        }
        if (maxx < this._bodygraphics[index].x) {
            maxx = this._bodygraphics[index].x
        }
        if (miny > this._bodygraphics[index].y) {
            miny = this._bodygraphics[index].y;
        }
        if (maxy < this._bodygraphics[index].y) {
            maxy = this._bodygraphics[index].y
        }

        maxx += this.thickness;
        maxy += this.thickness;

        return new PIXI.Rectangle(minx, miny, maxx - minx, maxy - miny);
    }

    public get Name(): string {
        return "worm" + this.worm_id;
    }
    private static WORM_ID:number = 1;

    public Destory():void {
        this._energy = 0;

        if(this.selectedBorder) {
            this.app.stage.removeChild(this.selectedBorder);
            this.selectedBorder = undefined;
        }
        if(this._bodygraphics.length > 0) {
            this.app.stage.removeChild(this._bodygraphics[0]);
            this.app.stage.removeChild(this._bodygraphics[1]);
            this.app.stage.removeChild(this._bodygraphics[2]);
            this.app.stage.removeChild(this._bodygraphics[3]);
            this._bodygraphics = [];
            
            this.world_map.removeObjFromMap(this);
            if (Worm.DEBUG) console.log(`[${this.Name}]: Destory`);
        }
    }
}

export enum Direction {
    None,   //0
    GoHead, //1
    Left,   //2
    Right,  //3
}

//https://pixijs.io/examples/#/events/hit-testing-with-spatial-hash.js
//https://zhuanlan.zhihu.com/p/480181565
//https://zhuanlan.zhihu.com/p/451243910