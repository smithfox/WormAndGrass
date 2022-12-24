import WorldRules from "./WorldRules";
import Worm from "./Worm";

export default class ControlPanel {
    private domRoot:HTMLDivElement;
    private infoDiv0:HTMLDivElement;
    private infoDiv1:HTMLDivElement;
    private infoDiv2:HTMLDivElement;
    private infoDiv3:HTMLDivElement;
    //private toggleButton:HTMLButtonElement;
    private toggleSuspendButton:HTMLButtonElement;
    private summaryInfoDiv:HTMLElement;
    private selectedWormDiv:HTMLElement;
    private topContianerDiv:HTMLElement;
    private topElements:HTMLElement[];

    private game;

    public constructor(domID, game) {
        this.game = game;
        this.domRoot = document.getElementById(domID)! as HTMLDivElement;
        //this.toggleButton = <HTMLButtonElement>document.getElementById("toggleButton")!;
        this.toggleSuspendButton = <HTMLButtonElement>document.getElementById("toggleSuspendButton")!;
        this.infoDiv0 = <HTMLDivElement>document.getElementById("infoDiv0")!;
        this.infoDiv1 = <HTMLDivElement>document.getElementById("infoDiv1")!;
        this.infoDiv2 = <HTMLDivElement>document.getElementById("infoDiv2")!;
        this.infoDiv3 = <HTMLDivElement>document.getElementById("infoDiv3")!;

        let fpsText = <HTMLInputElement>document.getElementById("fpsText")!;
        fpsText.value = "" + game.FPS;

        fpsText.addEventListener('change', (e:Event) =>{
            //console.log("fpsText changed, "+fpsText.value);
            game.FPS = fpsText.value;
        });

        let wormText = <HTMLInputElement>document.getElementById("wormText")!;
        wormText.value = ""+this._worm_count;
        wormText.addEventListener('change', (e:Event) =>{
            //console.log("fpsText changed, "+fpsText.value);
            this._worm_count = parseInt(wormText.value, 10);
        });

        let grassText = <HTMLInputElement>document.getElementById("grassText")!;
        grassText.value = ""+this._grass_count;
        grassText.addEventListener('change', (e:Event) =>{
            //console.log("fpsText changed, "+fpsText.value);
            this._grass_count = parseInt(grassText.value, 10);
        });

        let createBtn = <HTMLButtonElement>document.getElementById("createButton")!;
        createBtn.addEventListener('click', (e:Event) =>{
            game.CreateWorld();
        });

        let stepDebugBtn = <HTMLButtonElement>document.getElementById("stepDebugButton")!;
        stepDebugBtn.addEventListener('click', (e:Event) =>{
            game.StepDebug();
        });
        
        this.domRoot.querySelectorAll(".infoDivToggleBtn").forEach(toggleBtn => {
                let infoContentDiv = toggleBtn.parentElement?.nextElementSibling;
                toggleBtn.addEventListener("click", () => infoContentDiv?.classList.toggle("hidden"));
            }
        )
        
        this.toggleSuspendButton.addEventListener('click', (e:Event) =>{
            this.game.ToggleSuspend();
            if (this.game.IsSuspend) {
                this.toggleSuspendButton.innerText = '开始';
            } else {
                this.toggleSuspendButton.innerText = '暂停';
            }
        });

        this.summaryInfoDiv = document.createElement('div');
        this.infoDiv0.appendChild(this.summaryInfoDiv);
        
        this.selectedWormDiv = document.createElement('div');
        this.infoDiv1.appendChild(this.selectedWormDiv);

        this.topContianerDiv = document.createElement('div');
        this.infoDiv2.appendChild(this.topContianerDiv);

        this.topElements = [];
        for(let i=0;i<WorldRules.TopCount;i++) {
            let topButton = document.createElement('button');
            topButton.className = "topWormInfo";
            topButton.style.color = "#000000";

            topButton.addEventListener('click', (e:Event) =>{
                let wormName = topButton.getAttribute('worm-name');
                topButton.className = "topWormInfo selected";
                this.game.SelectWorm(wormName);
            });
            
            this.topContianerDiv.appendChild(topButton);
            this.topElements.push(topButton);
        }

        // 世界规则
        let EatEngergyInput = <HTMLInputElement>document.getElementById("EatEngergyInput")!;
        let WormMoveCostInput = <HTMLInputElement>document.getElementById("WormMoveCostInput")!;
        let WormEngergyInput = <HTMLInputElement>document.getElementById("WormEngergyInput")!;
        let GrassEngergyInput = <HTMLInputElement>document.getElementById("GrassEngergyInput")!;

        EatEngergyInput.value = ""+WorldRules.EatEngergy;
        WormMoveCostInput.value = ""+WorldRules.WormMoveCost;
        WormEngergyInput.value = ""+WorldRules.WormEngergy;
        GrassEngergyInput.value = ""+WorldRules.GrassEngergy;

        let confirmButton = <HTMLButtonElement>document.getElementById("confirmButton")!;
        confirmButton.addEventListener('click', (e:Event) =>{
            WorldRules.EatEngergy = parseInt(EatEngergyInput.value, 10);
            WorldRules.WormMoveCost = parseInt(WormMoveCostInput.value, 10);
            WorldRules.WormEngergy = parseInt(WormEngergyInput.value, 10);
            WorldRules.GrassEngergy = parseInt(GrassEngergyInput.value, 10);
            console.log("WorldRules.WormMoveCost="+WorldRules.WormMoveCost);
        });
    }

    public toggleDiv(div:HTMLElement, show:boolean|undefined = undefined):boolean {
        if (show == undefined) {
            if (div.style.display == 'none') {
                show = true;
            } else {
                show = false;
            }
        }
        if (show) {
            div.style.display = 'inline';
        } else {
            div.style.display = 'none';
        }
        return show;
    }
    public update(infos) : void{
        
        this.summaryInfoDiv.innerText = infos.summary;
        let selectedWorm = infos.selected;
        let next_action_str = "";
        if(selectedWorm) {
            next_action_str = selectedWorm.NextAction;
        }
        let actions_str = "[";
        for(let i=0; i<selectedWorm?.Actions.length; i++) {
            let action = selectedWorm?.Actions[i];
            actions_str += Worm.FormatAction(action) + ",";
        }
        actions_str += "]";
        let selectedWormInfo = `选择的虫子:<br>
名称:  ${selectedWorm?.Name}<br>
年龄:  ${selectedWorm?.Age.toFixed()}<br>
能量:  ${selectedWorm?.Energy.toFixed()}<br>
序列:  ${actions_str}<br>
下步:  ${next_action_str}
`;
/*
<br>
宽度:  ${selectedWorm?.Thickness.toFixed(2)}<br>
步耗:  ${selectedWorm?.MoveCost.toFixed(2)}
*/

        this.selectedWormDiv.innerHTML = selectedWormInfo;
        let tops = infos.tops;
        if (tops) {
            let index = 0;
            for (const worm of tops) {
                let topElement = this.topElements[index];
                topElement.style.color = `#${worm.Color.toString(16)}`;
                topElement.setAttribute('worm-name', worm.Name);
                topElement.innerHTML = `${worm.Name}&nbsp;&nbsp;${worm.Energy.toFixed(0)}`;
                if (selectedWorm && (selectedWorm.Name == worm.Name)) {
                    topElement.className = "topWormInfo selected";
                } else {
                    topElement.className = "topWormInfo";
                }
                index++;
            }
            for(let i=index;i<WorldRules.TopCount;i++) {
                let topElement = this.topElements[i];
                topElement.style.color = 'color: #000000';
                topElement.className = "topWormInfo";
                topElement.setAttribute('worm-name', '');
                topElement.innerHTML = ``;
                topElement.className = "topWormInfo";
            }
        }
    }

    private _worm_count:number = 100;
    public get WormCount() :number{
        return this._worm_count;
    }
    private _grass_count:number = 100;
    public get GrassCount():number {
        return this._grass_count;
    }
}