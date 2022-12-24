export default class WorldRules {
    /**
     * 虫出生时初始能量
     */
    public static WormEngergy:number = 1000;
    /**
     * 每移动一步要消耗的能量
     */
    public static WormMoveCost:number = 10;
    /**
     * 虫基本消耗（即使没动）
     */
    public static WormBaseCost:number = 1;
    /**
     * 每颗草总能量
     */
    public static GrassEngergy:number = 1000;
    /**
     * 每吃一口可增加多少能量
     */
    public static EatEngergy:number = 100;
    public static TopCount:number = 3;
}