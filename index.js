class PoolInfo {
    constructor(symbol, intervals) {
        this.symbol = symbol;
        if (intervals instanceof Array) {
            this.intervals = intervals.map(x => parseInt(x)).filter(x => !isNaN(x));
        } else {
            this.intervals = [parseInt(intervals)].filter(x => !isNaN(x));
        }
    }
}

class OHLCPool {
    constructor(barData, poolInfos) {
        this.symbols = new Map();
        for (let pi of poolInfos) {
            if (this.symbols.has(pi.symbol)) {
                pi.intervals.forEach(x => this.symbols.get(pi.symbol).add(x));
            } else {
                if (pi.intervals.length > 0)
                    this.symbols.set(pi.symbol, new Set(pi.intervals));
            }
        }
    }
    _resampleOne(symbol) {

    }
    update(symbol, data) {

    }
    get(symbol, interval) {

    }
}

module.exports = { PoolInfo, OHLCPool };