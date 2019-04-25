// import { PoolInfo } from './index.js'
let { PoolInfo, OHLCPool } = require('./index.js');

var pis = [new PoolInfo('USDJPY', [1, 5, 30, 60]),
    new PoolInfo('USDSGD', [5, 10]),
    new PoolInfo('USDSGD', 30),
    new PoolInfo('USDSGD', 'spam'),
    new PoolInfo('USDSGD', [5, '60'])
];

var op = new OHLCPool('data', pis);
console.log(op.symbols);

op.update('USDJPY', [1, 1, 2, 3, 4]);
console.log(op.get('USDJPY', 5));
console.log(op.get('USDJPY', 7));
console.log(op.get('USDJPY', 30));
console.log(op.get('USDJPY', 10));
console.log(op.get('USDCHF', 5));