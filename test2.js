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

console.log("update data");
var updateData = { "Test": [] };
for (var i = 100; i < 200; i++) {
    updateData["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}
console.log(updateData["Test"].slice(0, 10));

updateData["Test"].forEach(x => op.update("Test", x, 5));
console.log(op.get("Test", 5));

console.log("repeat update should raise error.");
updateData["Test"].slice(0, 3).forEach(x => op.update("Test", x, 5));
console.log(op.get("Test", 5));

console.log("add 30 min bars")
op.addInterval("Test", 30, data);
console.log(op.get("Test", 30));
updateData["Test"].forEach(x => op.update("Test", x, 30));

var updateData2 = { "Test": [] };
for (var i = 200; i < 250; i++) {
    updateData2["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}

console.log("add more data");
updateData2["Test"].forEach(x => op.updatePool("Test", x));
console.log(op.get("Test", 30));

console.log("remove 30 min bars");
var cache = op.get("Test", 30);
op.removeInterval("Test", 30);
console.log(op.get("Test", 30));

console.log("set back 30 min bars")
op.addInterval("Test", 30, cache);
console.log(op.get("Test", 30));

var updateData3 = { "Test": [] };
for (var i = 250; i < 300; i++) {
    updateData3["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}

console.log("add more data");
updateData3["Test"].forEach(x => op.updatePool("Test", x));
console.log(op.get("Test", 30));


console.log('test downdate')
op.addInterval("Test", 20, updateData);
console.log(op.get("Test", 20));
var data = { "Test": [] };
for (var i = 0; i < 150; i++) {
    data["Test"].push([now + i * 60 * 1000, i, i + 1, i - 1, i + 0.5, 1]);
}
op.downdate("Test", data["Test"], 20);
console.log(op.get("Test", 20));