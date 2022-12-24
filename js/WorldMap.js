(() => {
  // ts/WorldMap.ts
  var _WorldMap = class {
    constructor() {
      this.CELL_SIZE = 64;
      this.rows = [];
    }
    printWorld() {
      let c = 0;
      this.rows.forEach((row) => {
        row.forEach((cells) => {
          cells.forEach((cell) => {
            console.log("cell.x=" + cell._bodygraphics[0].x.toFixed() + ", y=" + cell._bodygraphics[0].y.toFixed());
            c++;
          });
        });
      });
      console.log("c=" + c);
    }
    setObjPos(rowIndex, colIndex, obj) {
      let row = this.rows[rowIndex];
      if (row == void 0) {
        row = [];
        this.rows[rowIndex] = row;
      }
      let cells = row[colIndex];
      if (cells == void 0) {
        cells = [];
        row[colIndex] = cells;
      }
      cells.push(obj);
    }
    getWormAtPos(x, y) {
      let rowIndex = Math.floor(x / this.CELL_SIZE);
      let colIndex = Math.floor(y / this.CELL_SIZE);
      console.log(`x=${x}, y=${y}, rowIndex=${rowIndex}, colIndex=${colIndex}`);
      let row = this.rows[rowIndex];
      if (row) {
        let objs = row[colIndex];
        if (objs && objs.length > 0) {
          for (const obj of objs) {
            let boundRect = obj.BoundRect;
            if (boundRect.contains(x, y)) {
              return obj;
            }
          }
        }
      }
      return void 0;
    }
    getOtherObjsInMapCells(obj) {
      let objs_incell = [];
      if (obj.cellIndices) {
        for (const cellIndex of obj.cellIndices) {
          let rowIndex = cellIndex >> 16;
          let colIndex = cellIndex - (rowIndex << 16);
          let row = this.rows[rowIndex];
          if (row) {
            let objs = row[colIndex];
            if (objs && objs.length > 1) {
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
    removeObjFromMap(obj) {
      if (!obj || !obj.cellIndices)
        return;
      for (const cellIndex of obj.cellIndices) {
        this.removeObjFromCellIndex(obj, cellIndex);
      }
      obj.cellIndices = /* @__PURE__ */ new Set();
    }
    removeObjFromCellIndex(obj, cellIndex) {
      if (_WorldMap.DEBUG)
        console.log(`[${obj.Name}]: will remove from cell index=${cellIndex}`);
      let rowIndex = cellIndex >> 16;
      let colIndex = cellIndex - (rowIndex << 16);
      let row = this.rows[rowIndex];
      if (row) {
        let cells = row[colIndex];
        if (cells) {
          let objIndex = cells.indexOf(obj);
          if (objIndex >= 0) {
            cells.splice(objIndex, 1);
            if (_WorldMap.DEBUG)
              console.log(`[${obj.Name}]: remove from cell[${rowIndex}][${colIndex}]`);
          }
        }
      }
    }
    setObjToMap(obj) {
      var old_CellIndices = /* @__PURE__ */ new Set();
      if (obj.cellIndices) {
        for (const cellIndex of obj.cellIndices) {
          old_CellIndices.add(cellIndex);
        }
      }
      obj.cellIndices = /* @__PURE__ */ new Set();
      if (_WorldMap.DEBUG)
        console.log(`[${obj.Name}]: reset cellIndices`);
      let rect = obj.BoundRect;
      let rowIndex0 = Math.floor(rect.x / this.CELL_SIZE);
      let colIndex0 = Math.floor(rect.y / this.CELL_SIZE);
      let rowIndex1 = Math.floor((rect.x + rect.width) / this.CELL_SIZE);
      let colIndex1 = Math.floor((rect.y + rect.height) / this.CELL_SIZE);
      let quadrant = 0;
      let row = rowIndex0;
      let col = colIndex0;
      let cell_index = (row << 16) + col;
      if (!old_CellIndices.has(cell_index)) {
        this.setObjPos(row, col, obj);
        obj.cellIndices.add(cell_index);
        if (_WorldMap.DEBUG)
          console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
      } else {
        obj.cellIndices.add(cell_index);
        if (_WorldMap.DEBUG)
          console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
      }
      if (rowIndex0 != rowIndex1) {
        quadrant = 1;
        row = rowIndex1;
        col = colIndex0;
        cell_index = (row << 16) + col;
        if (!old_CellIndices.has(cell_index)) {
          this.setObjPos(row, col, obj);
          obj.cellIndices.add(cell_index);
          if (_WorldMap.DEBUG)
            console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
        } else {
          obj.cellIndices.add(cell_index);
          if (_WorldMap.DEBUG)
            console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
        }
      }
      if (colIndex0 != colIndex1) {
        quadrant = 2;
        row = rowIndex0;
        col = colIndex1;
        cell_index = (row << 16) + col;
        if (!old_CellIndices.has(cell_index)) {
          this.setObjPos(row, col, obj);
          obj.cellIndices.add(cell_index);
          if (_WorldMap.DEBUG)
            console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
        } else {
          obj.cellIndices.add(cell_index);
          if (_WorldMap.DEBUG)
            console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
        }
        if (rowIndex0 != rowIndex1) {
          quadrant = 3;
          row = rowIndex1;
          col = colIndex1;
          cell_index = (row << 16) + col;
          if (!old_CellIndices.has(cell_index)) {
            this.setObjPos(row, col, obj);
            obj.cellIndices.add(cell_index);
            if (_WorldMap.DEBUG)
              console.log(`[${obj.Name}]: add  cell index ${cell_index}`);
          } else {
            obj.cellIndices.add(cell_index);
            if (_WorldMap.DEBUG)
              console.log(`[${obj.Name}]: keep cell index ${cell_index}`);
          }
        }
      }
      if (_WorldMap.DEBUG)
        console.log(`[${obj.Name}]: cellIndices=[${[...obj.cellIndices].join(",")}]`);
      for (const old_cellIndex of old_CellIndices) {
        if (!obj.cellIndices.has(old_cellIndex)) {
          this.removeObjFromCellIndex(obj, old_cellIndex);
        }
      }
    }
    Destory() {
      this.rows = [];
      if (_WorldMap.DEBUG)
        console.log(`WorldMap Destory`);
    }
    static BoxCollisionDetect(box1, box2) {
      return box1.x + box1.width >= box2.x && box2.x + box2.width >= box1.x && box1.y + box1.height >= box2.y && box2.y + box2.height >= box1.y;
    }
    static BoxCollisionDetect1(box1, x, y, w, h) {
      return box1.x + box1.width >= x && x + w >= box1.x && box1.y + box1.height >= y && y + h >= box1.y;
    }
  };
  var WorldMap = _WorldMap;
  WorldMap.DEBUG = false;
})();
