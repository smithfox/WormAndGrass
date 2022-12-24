import * as PIXI from "pixijs"

export default class Grid {
    private app:PIXI.Application;
    private _grid_graphics : PIXI.Graphics | undefined;
    public constructor(_app:PIXI.Application) {
        this.app = _app;

        this._grid_graphics = new PIXI.Graphics();
        //grid.position.x = 0;
        //grid.position.y = 0;
        this._grid_graphics.width = this.app.screen.width;
        this._grid_graphics.height = this.app.screen.height;

        this._grid_graphics.lineStyle(1, 0xFFFFFF);

        for(let tmpx=0;tmpx< this.app.screen.width; tmpx+=64) {
            this._grid_graphics.moveTo(tmpx, 0);
            this._grid_graphics.lineTo(tmpx, this.app.screen.height);
            
        }

        for(let tmpy=0;tmpy< this.app.screen.height; tmpy+=64) {
            this._grid_graphics.moveTo(0, tmpy);
            this._grid_graphics.lineTo(this.app.screen.width, tmpy);
        }
        
        this.app.stage.addChild(this._grid_graphics);
    }

    public Destory():void {
        if(this._grid_graphics) {
            this.app.stage.removeChild(this._grid_graphics);
            this._grid_graphics = undefined;
        }
    }
}