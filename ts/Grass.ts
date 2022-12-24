import * as PIXI from "pixijs"
import GrassMap, {GrassType} from "./GrassMap";
import WorldRules from "./WorldRules";

export default class Grass {

    private grass_id:number = 0;
    private imageData:ImageData;
    private grassMap:GrassMap;

    private gtext:PIXI.Sprite|undefined;    
    private gmask:PIXI.Graphics|undefined;
    public GrassGraphics:PIXI.Container;
    private _energy_origin: number;
    private _energy: number;

    public constructor(grassMap: GrassMap, grassType: GrassType) {
        this.grassMap = grassMap;
        
        this.grass_id = Grass.GRASS_ID++;
        //this.imageData = grassType.ImageData;

        this.imageData = new ImageData(
            new Uint8ClampedArray(grassType.ImageData.data),
            grassType.ImageData.width,
            grassType.ImageData.height
          )

        this._energy_origin = WorldRules.GrassEngergy;
        this._energy = this._energy_origin;
        this.gtext = new PIXI.Sprite(grassType.Texture);
        
        this.gtext.position.x = Math.random() * this.grassMap.width;
        this.gtext.position.y = Math.random() * this.grassMap.height;

        this.gmask = new PIXI.Graphics();
        this.gmask.beginFill(0xDD0000, 0);
        this.gmask.drawRect(this.gtext.position.x, this.gtext.position.y, grassType.Texture.width, grassType.Texture.height);
        this.gmask.endFill();

        //console.log("this.container.width="+this.container.width);

        this.GrassGraphics= new PIXI.Container();
        this.GrassGraphics.addChild(this.gtext);
        this.GrassGraphics.addChild(this.gmask);
        //this.layerGroup.scale = new PIXI.Point(0.4, 0.4);
    }

    private NoEnergy():boolean {
        if (this._energy <= 0 && this.gtext && this.gmask) {
            this.Destroy();
            this.grassMap.RemoveGrass(this);
            return true;
        }
        return false;
    }

    public Update():void {
        if (this.NoEnergy()) return;
    }

    private hasPixelAt(x:number, y:number) : boolean{
        let dx = Math.floor(x - this.gtext!.position.x);
        let dy = Math.floor(y - this.gtext!.position.y);
        //console.log(`[${this.Name}]: hasPixelAt, x=${x.toFixed()}, y=${y.toFixed()}, grass.x=${this.sprite.position.x.toFixed()}, grass.y=${this.sprite.position.y.toFixed()}`);
        if (dx < 0 || dy < 0 || dx >= this.imageData.width || dy >= this.imageData.height) return false;

        const data = this.imageData.data;
        var index = Math.floor((dx + dy * this.imageData.width) * 4);
        
        //let r = data[index + 0];
        //let g = data[index + 1];
        //let b = data[index + 2];
        let a = data[index + 3];
        //console.log(`[${this.Name}]: hasPixelAt, imageData[${index}].apla=${a}`);
        return (a > 0);
    }

    private clearPixelAt(x:number, y:number) {
        let dx = Math.floor(x - this.gtext!.position.x);
        let dy = Math.floor(y - this.gtext!.position.y);

        if (dx < 0 || dy < 0 || dx >= this.imageData.width || dy >= this.imageData.height) return false;

        const data = this.imageData.data;
        var index = Math.floor((dx + dy * this.imageData.width) * 4);
        //data[index + 0]; //r
        //data[index + 1]; //g
        //data[index + 2]; //b
        data[index + 3] = 0;
    }

    public BeEaten(box: PIXI.Rectangle) : number {
        if (this._energy <= 0) {
            this.Update();
            return 0;
        }

        if(!this.BoxCollisionMe(box)) {
            return 0;
        }

        //console.log(`[${this.Name}]: beeaten, OK`);
        for(let x=box.x; x<box.width; x++) {
            for(let y=box.y; y<box.height; y++) {
                this.clearPixelAt(x,y);
            }
        }
        
        this._energy -= WorldRules.EatEngergy;
        //console.log(`[${this.Name}]: energy=${this._energy}, box=${box.x.toFixed()},${box.y.toFixed()}`);
        if (this._energy < 0) {
            let rr = WorldRules.EatEngergy + this._energy;
            this.Update();
            this._energy = 0;
            return rr;
        } else {
            this.gmask!.beginFill(0xDDDDDD, 1);
            this.gmask!.drawRect(box.x, box.y, box.width, box.height);
            this.gmask!.endFill();
    
            return WorldRules.EatEngergy;
        }
    }

    public BoxCollisionMe(box: PIXI.Rectangle): boolean {
        return (this.hasPixelAt(box.x,box.y)) || 
                (this.hasPixelAt(box.x+box.width,box.y+box.height));
    }

    public get BoundRect() : PIXI.Rectangle {
        return this.gtext!.getBounds();
    }

    public get Name(): string {
        return "grass" + this.grass_id;
    }
    private static GRASS_ID:number = 1;

    public Destroy(): void {
        this._energy = 0;

        if(this.gtext) {
            this.GrassGraphics.removeChild(this.gtext);
            this.gtext = undefined;
        }
        if (this.gmask) {
            this.GrassGraphics.removeChild(this.gmask);
            this.gmask = undefined;
        }
    }
}