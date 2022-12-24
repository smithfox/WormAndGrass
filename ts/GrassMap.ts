import * as PIXI from "pixijs"
import Grass from "./Grass";

export default class GrassMap {
    private static _offscreen_canvas:HTMLCanvasElement;
    private static _offscreen_context:CanvasRenderingContext2D;

    /*
    public static CreateGrassFromImage(app: PIXI.Application, img) : GrassMap {
        if (GrassMap._offscreen_canvas == undefined) {
            GrassMap._offscreen_canvas = document.createElement('canvas');
            GrassMap._offscreen_context = GrassMap._offscreen_canvas.getContext('2d')!;
        }
        GrassMap._offscreen_canvas.width = img.width;
        GrassMap._offscreen_canvas.height = img.height;
        
        GrassMap._offscreen_context.drawImage(img, 0, 0);

        const imageData = GrassMap._offscreen_context.getImageData(0, 0, img.width, img.width);
        var normalData = new Uint8Array(imageData.data.buffer);
        
        var texture = PIXI.Texture.fromBuffer(normalData, img.width, img.height);
        
        let grass = new GrassMap(app, texture);
        grass.imageData = imageData;

        return grass;
    }
    */

    public static CreateGrassMap(images:string[], callback ): void {
        type Image = InstanceType<typeof Image>;

        let grassMap = new GrassMap();

        const checkImage = path =>
        new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({img, status: 'ok'});
            img.onerror = () => resolve({img, status: 'error'});
            
            img.src = path;
        });

        const loadImg = paths => Promise.all(paths.map(checkImage));

        loadImg(images).then((responses:any[])=>{
            responses.forEach(response => {
                if(response && response["status"] == 'ok') {
                    //console.log(response);
                    let img = response.img;
                    grassMap.AddGrassType(img);
                }
            });

            callback(grassMap);
        });
    }

    private groundGraphics:PIXI.Graphics;
    private grassTypes:GrassType[] = [];
    private app:PIXI.Application;

    public AddGrassType(img) {
        if (GrassMap._offscreen_canvas == undefined) {
            GrassMap._offscreen_canvas = document.createElement('canvas');
            GrassMap._offscreen_context = GrassMap._offscreen_canvas.getContext('2d')!;
        }
        GrassMap._offscreen_canvas.width = img.width;
        GrassMap._offscreen_canvas.height = img.height;
        
        GrassMap._offscreen_context.drawImage(img, 0, 0);

        const imageData = GrassMap._offscreen_context.getImageData(0, 0, img.width, img.width);
        var normalData = new Uint8Array(imageData.data.buffer);
        
        let texture:PIXI.Texture = PIXI.Texture.fromBuffer(normalData, img.width, img.height);
        let grassType = new GrassType();
        grassType.TypeId = GrassType.GRASS_TYPE_ID++;
        grassType.Texture = texture;
        grassType.ImageData = imageData;
        
        this.grassTypes.push(grassType);
    }

    private grass_list:Grass[]= [];
    
    public get width():number {
        return this.app.screen.width;
    }
    public get height():number {
        return this.app.screen.height;
    }
    public GenerateGrass(app: PIXI.Application, count:number) {
        this.app = app;
        
        this.groundGraphics = new PIXI.Graphics();
        this.groundGraphics.beginFill(0xDDDDDD, 1);
        this.groundGraphics.drawRect(0,0,this.width, this.height);
        this.groundGraphics.endFill();

        this.app.stage.addChild(this.groundGraphics);

        for(let i=0; i<count; i++) {
            let typeIndex = Math.random() * this.grassTypes.length;
            typeIndex = Math.floor(typeIndex);
            let grassType = this.grassTypes[typeIndex];
            if (grassType) {
                let grass = new Grass(this, grassType);
                this.AddGrass(grass);
            }
        }
    }

    public AddGrass(grass: Grass):void {
        this.groundGraphics.addChild(grass.GrassGraphics);
        this.grass_list.push(grass);
    }

    public RemoveGrass(grass: Grass):void{
        this.groundGraphics.removeChild(grass.GrassGraphics);
        let index = this.grass_list.indexOf(grass);
        this.grass_list.splice(index, 1);
    }

    public Destroy():void {
        for (const grass of this.grass_list) {
            this.groundGraphics.removeChild(grass.GrassGraphics);
            grass.Destroy();
        }
        this.grass_list = [];
    }

    public BeEaten(box: PIXI.Rectangle) : number {
        for (const grass of this.grass_list) {
            let s = grass.BeEaten(box);
            if (s>0) {
                return s;
            }
        }
        
        return 0;
    }
}

export class GrassType {
    public TypeId:number;
    public Texture:PIXI.Texture;
    public ImageData:ImageData;
    public static GRASS_TYPE_ID:number = 0;
}
