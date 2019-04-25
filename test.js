// import { PoolInfo } from './index.js'
let {PoolInfo, OHLCPool} = require('./index.js')

var pis = [new PoolInfo('USDJPY', [1, 5, 30, 60]),
    new PoolInfo('USDSGD', [5, 10]),
    new PoolInfo('USDSGD', 30)
];

var op = new OHLCPool('data', pis);
console.log(op.symbols)
