import * as PIXI from "pixijs"
import Worm from "./Worm";

export default class WorldMap {
    private static DEBUG:boolean = false;
    // https://matthias-research.github.io/pages/publications/tetraederCollision.pdf
    // https://zhuanlan.zhihu.com/p/480181565

    private CELL_SIZE:number = 64;
    private rows:any[] = [];
    
    public printWorld() {
        let c = 0;
        this.rows.forEach(row => {
            row.forEach(cells => {
                cells.forEach(cell => {
                    console.log("cell.x="+cell._bodygraphics[0].x.toFixed()+", y="+cell._bodygraphics[0].y.toFixed());
                    c++;
                });
            });
        });
        console.log("c="+c);
    }
    private setObjPos(rowIndex:number, colIndex:number, obj:any) {
        let row = this.rows[rowIndex];
        if (row == undefined) {
            row = [];
            this.rows[rowIndex] = row;
        }
        let cells = row[colIndex];
        if (cells == undefined) {
            cells = [];
            row[colIndex] = cells;
        }
        cells.push(obj);
        /*
        console.log("add cells["+rowIndex+"]["+colIndex+"]=["+obj.Name+"]");

        for (let i=0;i<cells.length;i++) {
            console.log("now cells["+rowIndex+"]["+colIndex+"]["+i+"]="+cells[i].Name);
        }
        */
    }

    public getWormAtPos(x:number, y:number) : any {
        let rowIndex = Math.floor(x / this.CELL_SIZE);
        let colIndex = Math.floor(y / this.CELL_SIZE);

        console.log(`x=${x}, y=${y}, rowIndex=${rowIndex}, colIndex=${colIndex}`);
        let row = this.rows[rowIndex];
        if (row) {
            let objs = row[colIndex];
            if (objs && objs.length > 0) {
                for (const obj of objs) {
                    let boundRect:PIXI.Rectangle = obj.BoundRect;
                    if (boundRect.contains(x, y)) {
                        return obj;
                    }
                }
            }
        }
        return undefined;
    }

    public getOtherObjsInMapCells(obj:any) {
        let objs_incell:any[] = [];
        if(obj.cellIndices) {
            for (const cellIndex of obj.cellIndices) {
                let rowIndex = cellIndex >> 16;
                let colIndex = cellIndex - (rowIndex << 16);
                let row = this.rows[rowIndex];
                if (row) {
                    let objs = row[colIndex];
                    //console.log("["+obj.Name+"]: row="+rowIndex+", col="+colIndex, "objs in cell:"+objs.length);
                    if (objs && objs.length > 1) { //exclude self
                        for (const otherObj of objs) {
                            if (otherObj != obj) {
                                objs_incell.push(otherObj);
                            }
                        }
                    }
                }
            }
        }
        
        return objs_incell;
    }

    public removeObjFromMap(obj:any) {
        if(!obj || !obj.cellIndices) return;
        
        for (const cellIndex of obj.cellIndices) {
            this.removeObjFromCellIndex(obj, cellIndex);
            //console.log(`[${obj.Name}]: cellIndices.size=${obj.cellIndices.size}, cellIndices=[${[...obj.cellIndices].join(',')}]`);
        }

        obj.cellIndices = new Set<number>();
    }

    private removeObjFromCellIndex(obj:any, cellIndex:number) {
        if (WorldMap.DEBUG) console.log(`[${obj.Name}]: will remove from cell index=${cellIndex}`);
        let rowIndex = cellIndex >> 16;
        let colIndex = cellIndex - (rowIndex << 16);

        let row = this.rows[rowIndex];
        if (row) {
            let cells = row[colIndex];
            if (cells) {
                let objIndex = cells.indexOf(obj);
                if (objIndex >= 0) {
                    cells.splice(objIndex, 1);
                    if (WorldMap.DEBUG) console.log(`[${obj.Name}]: remove from cell[${rowIndex}][${colIndex}]`);
                    //console.log(`[${obj.Name}]: cellIndices.size=${obj.cellIndices.size}, cellIndices=[${[...obj.cellIndices].join(',')}]`);
                }
            }
        }
    }
    /**
     * 将一个对象(obj) 加入到地图中, 归入合适的 地图小区块 map cell 中
     * @param obj 可以是 Worm, Grass, Stone
     */
    public setObjToMap(obj:any) {
        // 1. 记录该对象之前所在的 地图小区块索引信息保存到 old_CellIndices
        var old_CellIndices:Set<number> = new Set<number>();
        if (obj.cellIndices) {
            for (const cellIndex of obj.cellIndices) {
                old_CellIndices.add(cellIndex);
            }
        }

        // 2. 将对象原来分布的区块全部清除
        obj.cellIndices = new Set<number>;
        if (WorldMap.DEBUG) console.log(`[${obj.Name}]: reset cellIndices`);

        // 3. obj.BoundRect 是表示紧包围对象的最小方形区域
        let rect = obj.BoundRect;

        // 0 表示 Bound 的最左上角， 1表示 Bound的最右下角
        // rowIndex 表示所在地图区块的行编号
        // colIndex 表示所在地图区块的列编号
        let rowIndex0 = Math.floor(rect.x / this.CELL_SIZE);
        let colIndex0 = Math.floor(rect.y / this.CELL_SIZE);
        let rowIndex1 = Math.floor((rect.x + rect.width)  / this.CELL_SIZE);
        let colIndex1 = Math.floor((rect.y + rect.height) / this.CELL_SIZE);

        //console.log("rect=("+rect.x.toFixed()+", "+rect.y.toFixed() + ","+rect.width.toFixed() + ","+rect.height.toFixed()+")");
        //console.log("cell=("+rowIndex0+", "+colIndex0 + ","+rowIndex1 + ","+colIndex1+")");

        let quadrant = 0;//左上为第 0 象限 quadrant
        let row = rowIndex0;
        let col = colIndex0;
        let cell_index = (row << 16) + col; //将行编号和列编号整合在一起变成一个数字 cell_index

        // 如果之前的区块信息没有包含最左上的cell，就需要重新设置位置
        if (!old_CellIndices.has(cell_index)) {
            this.setObjPos(row, col, obj);
            obj.cellIndices.add(cell_index);
            if (WorldMap.DEBUG) console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
        } else {
            obj.cellIndices.add(cell_index);
            if (WorldMap.DEBUG) console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
        }

        if (rowIndex0 != rowIndex1) {
            quadrant = 1;//右上为第1象限 quadrant
            row = rowIndex1;
            col = colIndex0;
            cell_index = (row << 16) + col;

            if (!old_CellIndices.has(cell_index)) {
                this.setObjPos(row, col, obj);
                obj.cellIndices.add(cell_index);
                if (WorldMap.DEBUG) console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
            } else {
                obj.cellIndices.add(cell_index);
                if (WorldMap.DEBUG) console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
            }
        } 

        if (colIndex0 != colIndex1) {
            quadrant = 2;//左下为第2象限 quadrant
            row = rowIndex0;
            col = colIndex1;
            cell_index = (row << 16) + col;

            if (!old_CellIndices.has(cell_index)) {
                this.setObjPos(row, col, obj);
                obj.cellIndices.add(cell_index);
                if (WorldMap.DEBUG) console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
            } else {
                obj.cellIndices.add(cell_index);
                if (WorldMap.DEBUG) console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
            }

            if (rowIndex0 != rowIndex1) {
                quadrant = 3;//右下为第3象限 quadrant
                row = rowIndex1;
                col = colIndex1;
                cell_index = (row << 16) + col;

                if (!old_CellIndices.has(cell_index)) {
                    this.setObjPos(row, col, obj);
                    obj.cellIndices.add(cell_index);
                    if (WorldMap.DEBUG) console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
                } else {
                    obj.cellIndices.add(cell_index);
                    if (WorldMap.DEBUG) console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
                }
            }
        }

        //old_CellIndices.size
        if (WorldMap.DEBUG) console.log(`[${obj.Name}]: cellIndices=[${[...obj.cellIndices].join(',')}]`);
        // 6. 从之前的cell中删除
        for (const old_cellIndex of old_CellIndices) {
            if (!obj.cellIndices.has(old_cellIndex)) {
                this.removeObjFromCellIndex(obj, old_cellIndex);
                //console.log(`[${obj.Name}]: cellIndices.size=${obj.cellIndices.size}, cellIndices=[${[...obj.cellIndices].join(',')}]`);
            }
        }
    }

    public Destory():void {
        this.rows = [];
        if (WorldMap.DEBUG) console.log(`WorldMap Destory`);
    }

    public static BoxCollisionDetect(box1:PIXI.Rectangle, box2:PIXI.Rectangle) {
        return (
        (box1.x + box1.width >= box2.x) && (box2.x + box2.width >= box1.x) &&
        (box1.y + box1.height >= box2.y) && (box2.y + box2.height >= box1.y)
        );
    }

    public static BoxCollisionDetect1(box1:PIXI.Rectangle, x:number, y:number, w:number, h:number) {
        return (
          ((box1.x + box1.width) >= x) && 
          ((x + w) >= box1.x) &&
          ((box1.y + box1.height) >= y) && 
          ((y + h) >= box1.y)
        );
    }
}