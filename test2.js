let { PoolInfo, OHLCPool } = require('./index.js');

// this data do not start time is adjusted 1 second
var now = (new Date('2019-01-01')).getTime() + 1000;
var data = { "Test": [] };
for (var i = 0; i < 100; i++) {
    data["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}
var pis = [new PoolInfo("Test", [5])];
var op = new OHLCPool(data, pis);
console.log(op.get("Test", 5));


var updateData = { "Test": [] };
for (var i = 100; i < 200; i++) {
    updateData["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}
console.log(updateData["Test"].slice(0, 10));

updateData["Test"].forEach(x => op.update("Test", x, 5));
console.log(op.get("Test", 5));