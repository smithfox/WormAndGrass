import * as PIXI from "pixijs"
class Program {
    public static Main(): void {
        const dpr = window.devicePixelRatio;
        const canvasElementName = "renderCanvas";
        const canvas = document.getElementById(canvasElementName) as HTMLCanvasElement;
        console.log("canvas.width="+canvas.width);
        console.log("canvas.height="+canvas.height);
        let app = new PIXI.Application({
            view: canvas,
            width: 800,         // default: 800 宽度
            height: 600,        // default: 600 高度
            antialias: true,    // default: false 反锯齿
            resolution: dpr,     // default: 1 分辨率
            backgroundColor: 0xDDDDDD,
            resizeTo: window,
            autoDensity: true,
        });
        
        //app.renderer.autoResize = true;
        //app.renderer.resize(window.innerWidth, window.innerHeight);

        let rectangle = new PIXI.Graphics();
        rectangle.beginFill(0x000000);
        rectangle.drawRect(0, 0, 1440/2, 900/2);
        rectangle.endFill();
        
        let textStyle = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 32,
            fill: "red",
            strokeThickness: 0,
            dropShadow: false
        });
        let text = new PIXI.Text("Hello Worm and Grass!", textStyle);
        app.stage.addChild(rectangle);
        app.stage.addChild(text);
    }
}

window.onload = () => { Program.Main(); }
