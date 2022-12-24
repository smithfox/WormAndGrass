import Game from "./GamePixi";

class Program {
  public static Main(): void {
    
    //if uncomment the line, will disable console.log
    //console.log = function () {};
    
    let game = new Game();
    game.CreateScene("renderCanvas");
    
  }
}

window.onload = () => { Program.Main(); }
