// import { PoolInfo } from './index.js'
let { PoolInfo, OHLCPool } = require('./index.js');
let fs = require('fs');

var barData = {};
var p = new Promise((resolve, reject) => {
    fs.readFile('./sample/usdjpy.json', (err, data) => {
        if (err) reject(err);
        barData.USDJPY = JSON.parse(data.toString());
        resolve(true);
    });
}).then((rep) => new Promise((resolve, reject) => {
    fs.readFile('./sample/usdsgd.json', (err, data) => {
        if (err) reject(err);
        barData.USDSGD = JSON.parse(data.toString());
        resolve(true);
    });
}).then(() => {
    var pis = [new PoolInfo('USDJPY', [1, 5, 30, 60]),
        new PoolInfo('USDSGD', [5, 10]),
        new PoolInfo('USDSGD', 30),
        new PoolInfo('USDSGD', 'spam'),
        new PoolInfo('USDSGD', [5, '60'])
    ];

    var op = new OHLCPool(barData, pis);
    console.log(op.pool);

    op.update('USDJPY', 99, [1, 1, 2, 3, 4]);
    console.log("USDJPY 5 min bars:");
    console.log(op.get('USDJPY', 5));
    console.log("USDJPY 7 min bars:");
    console.log(op.get('USDJPY', 7));
    console.log("USDJPY 30 min bars:");
    console.log(op.get('USDJPY', 30));
    console.log("USDJPY 60 min bars:");
    console.log(op.get('USDJPY', 60));
    console.log("USDCHF 5 min bars:");
    console.log(op.get('USDCHF', 5));
}).then(() => console.log("Test succeed."),
    console.error));