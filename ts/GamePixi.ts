import * as PIXI from "pixijs"
import ControlPanel from "./ControlPanel";
import Grass from "./Grass";
import GrassMap from "./GrassMap";
import Grid from "./Grid";
import WorldMap from "./WorldMap";
import WorldRules from "./WorldRules";
import Worm, { Direction } from "./Worm";

export default class GamePixi{
    private _canvas: HTMLCanvasElement;
    private _app: PIXI.Application;
    private worms: Worm[];
    private _world_map: WorldMap;
    private _grass_map: GrassMap;
    private _grid: Grid | undefined;

    public CreateScene(canvasElementName:string):void {
        if(!this._grass_map) {
            GrassMap.CreateGrassMap([
                //"res\\grass.png",
                "res\\grass24_1.png",
                "res\\grass24_2.png",
                "res\\grass24_3.png",
                //"res\\grass24_4.png",
                "res\\grass24_5.png",
            ], (grassMap)=>{
                console.log("load all png!");
                this._grass_map = grassMap;
                this._world_map = new WorldMap();
                this._CreateScene(canvasElementName);
            });
        }
    }
    
    public _CreateScene(canvasElementName:string):void {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElementName) as HTMLCanvasElement;
        console.warn("_canvas.width="+this._canvas.width);
        console.warn("_canvas.height="+this._canvas.height);
        this._app = new PIXI.Application({
            view: this._canvas,
            width: this._canvas.width,
            height: this._canvas.height,
            resolution: 2,
            backgroundColor: "#DDDDDD",
            antialias: true,
            resizeTo: window,
        });
        
        this.worms = [];
        this._app.stage.scale = new PIXI.Point(1,1);
        this._app.ticker.minFPS = 0.1;
        this._app.ticker.maxFPS = 10;

        this.controlPanel = new ControlPanel("controlPanel", this);
        this.keyEventInit();

        this._app.stage.interactive = true;
        this._app.stage.on("mousedown", this.mouseClick.bind(this));
        
        this._grid = new Grid(this._app);
        this.DoRender();
    }
    
    public CreateWorld(): void {
        this._isSuspend = true;
        this.DestroyWorld();
        console.log("CreateWorld!!");
        
        this._grass_map.GenerateGrass(this._app, this.controlPanel.GrassCount);
        
        if(!this._grid) {
            this._grid = new Grid(this._app);
        }

        for (let index = 0; index < this.controlPanel.WormCount; index++) {
            let worm = new Worm(this._app, this._world_map, this._grass_map);
            this.worms.push(worm);
        }
        
        // let worm1 = new Worm(this._app, this._world_map, 64*2+20, 64*2+10, Direction.Right);
        // let worm2 = new Worm(this._app, this._world_map, 64*2+40, 64*2+10, Direction.Left);
        // this.worms.push(worm1);
        // this.worms.push(worm2);
    }

    public DestroyWorld() : void {
        // 清除网格
        if (this._grid) {
            this._grid.Destory();
            this._grid = undefined;
        }

        // 清除虫
        for (const worm of this.worms) {
            worm.Destory();
        }
        this.worms = [];
        // 清除草
        this._grass_map.Destroy();
        // 清除虫图
        this._world_map.Destory();
    }

    private keyEventInit(): void {
        let self = this;
        document.addEventListener('keydown', (event) => {
            console.log(event);
            const keyName = event.key;
            if (keyName === ' ') {
              self.ToggleSuspend();
              return;
            }
          }, false);
    }

    private mouseClick(this:GamePixi, event): void {
        //console.log('X', event.data.global.x, 'Y', event.data.global.y);
        let x = event.data.global.x;
        let y = event.data.global.y;
        if (this.selectedWorm) {
            this.selectedWorm.Selected = false;
        }

        this.selectedWorm = this._world_map.getWormAtPos(x, y);
        if (this.selectedWorm) {
            this.selectedWorm.Selected = true;
        }
    }

    private ToggleSuspend(): void {
        if (this._fps_before_debug >= 0) {
            this.FPS = this._fps_before_debug;
            this._fps_before_debug = -1;
        }
        this._stepDebuging = false;
        //console.log("click, this._allowUpdate="+this._allowUpdate);
        this._isSuspend = !this._isSuspend;
    }
    private _isSuspend = true;
    public get IsSuspend():boolean {
        return this._isSuspend;
    }
    public DoRender():void {
        this._stepDebuging = false;
        this._fps_before_debug = -1;
        
        // Add a ticker callback to move the sprite back and forth
        let elapsed = 0.0;
        this._app.ticker.add((delta) => {
            elapsed += delta;
            this.Update(elapsed);
        });

        // The canvas/window resize event handler.
        window.addEventListener("resize", () =>
        {
            this._app.resize();
        });
    }

    private controlPanel:ControlPanel;

    private selectedWorm: Worm|undefined;

    private Update(elapsed):void {
        this.controlPanel.update({
            "summary": `现有虫子: ${this.worms.length}, FPS: ${this._app.ticker.FPS.toFixed()}`,
            "selected": this.selectedWorm,
            "tops":this.sortWorms(),
        });

        if (this.IsSuspend) return;
        
        for (let index = 0; index < this.worms.length; index++) {
            const element = this.worms[index];
            element.Update();
            if (element.IsDead) {
                this.worms.splice(index,1);
                console.log("remove --- ", index);
            }
        }

        if (this._stepDebuging) {
            this._isSuspend = true;
        }
    }

    public sortWorms(): Worm[] {
        const tmpWorms = [...this.worms];
        tmpWorms.sort((a,b)=>{
            return b.Energy - a.Energy;
        })
        return tmpWorms.slice(0, WorldRules.TopCount);
    }

    public SelectWorm(wormName:string) : void {
        if(!wormName) {
            if (this.selectedWorm) {
                this.selectedWorm.Selected = false;
                this.selectedWorm = undefined;
            }
        } else {
            var newSelectedWorm: Worm|undefined;
            for (const worm of this.worms) {
                if(worm && worm.Name == wormName) {
                    newSelectedWorm = worm;
                    break;
                }
            }
            if (newSelectedWorm) {
                if(this.selectedWorm) {
                    this.selectedWorm.Selected = false;
                }
                this.selectedWorm = newSelectedWorm;
                this.selectedWorm.Selected = true;
            } else {
                if(this.selectedWorm) {
                    this.selectedWorm.Selected = false;
                    this.selectedWorm = undefined;
                }
            }
        }
    }

    private _stepDebuging:boolean = false;
    private _fps_before_debug:number = 10;
    public StepDebug(): void {
        if (!this._stepDebuging) {
            this._isSuspend = true;
            this._fps_before_debug = this.FPS;
            this.FPS = 1;
        }
        this._stepDebuging = true;
        this._isSuspend = false;
    }

    public get FPS(): number {
        return this._app.ticker.maxFPS;
    }
    
    public set FPS(fps:number) {
        if(!fps || fps < -10 || fps > 100) return;
        if (fps < 0) {
            fps = -1 / fps;
        }
        this._app.ticker.maxFPS = fps;
    }
}