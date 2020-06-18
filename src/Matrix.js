/**
 * This matrix holds graph theoretical distances to all nodes in the graph.
 * Each row represents a pivot node, and each column represents a distance
 * form this pivot point to a node in the graph.
 */
module.exports = class Matrix {
  constructor(rows, columns) {
    this._rows = rows;
    this._columns = columns;
    this._matrix = new Float64Array(rows * columns);
    this._n = rows * columns;
  }

  set(row, column, value) {
    let index = row * this._columns + column;
    if (index >= this._n) throw new Error('Index out of range ' + row + ',' + column);
    this._matrix[index] = value;
  }

  get(row, column) {
    let index = row * this._columns + column;
    if (index >= this._n) throw new Error('Index out of range ' + row + ',' + column);
    return this._matrix[index];
  }

  centerMatrix() {
    if (this.isCentered) return this;

    for (let row = 0; row < this._rows; ++row) {
      let mean = this.getMean(row);
      this.translateRow(row, -mean)
    }

    this.isCentered = true;
    return this;
  }

  translateRow(row, delta) {
    if (row < 0 || row > this._rows) throw new Error('Row is out of range ' + row);
    let offset = row * this._columns;

    for (let col = 0; col < this._columns; ++col) {
      this._matrix[col + offset] += delta;
    }
  }

  getMean(row) {
    let sum = 0;
    if (row < 0 || row > this._rows) throw new Error('Row is out of range ' + row);
    let offset = row * this._columns;

    for (let col = 0; col < this._columns; ++col) {
      sum += this._matrix[col + offset];
    }

    return sum / this._columns;
  }

  applyVectorToColumn(column, vector) {
    let sum = 0;
    if (vector.length !== this._rows) throw new Error('Invalid vector dimensions');
    for (let row = 0; row < this._rows; ++row) {
      sum += this._matrix[row * this._columns + column] * vector[row];
    }
    return sum;
  }

  print() {
    let rows = [];
    for (let row = 0; row < this._rows; ++row) {
      let rowValues = [];
      let offset = row * this._columns;
      for (let col = 0; col < this._columns; ++col) {
        rowValues.push(this._matrix[offset + col].toFixed(2));
      }
      rows.push(rowValues.join(' '));
    }
    console.log(rows.join('\n'));
  }

  toArray() {
    let rows = [];
    for (let row = 0; row < this._rows; ++row) {
      let rowValues = [];
      let offset = row * this._columns;
      for (let col = 0; col < this._columns; ++col) {
        rowValues.push(this._matrix[offset + col]);
      }
      rows.push(rowValues);
    }
    return rows;
  }

  columnDistance(colA, colB) {
    let sum = 0;
    for (let row = 0; row < this._rows; ++row) {
      let delta = this.get(row, colA) - this.get(row, colB);
      sum += delta * delta;
    }
    return Math.sqrt(sum); 
  }

  getCovariant() {
    let result = new Matrix(this._rows, this._rows);

    for (let col = 0; col < this._rows; ++col) {
      for (let row = 0; row < this._rows; ++row) {
        let sum = 0;
        let offset0 = col * this._columns;
        let offset1 = row * this._columns;
        for (let i = 0; i < this._columns; ++i) {
          sum += this._matrix[offset0 + i] * this._matrix[offset1 + i];
        }
        result.set(row, col, sum);
      }
    }

    return result;
  }
}