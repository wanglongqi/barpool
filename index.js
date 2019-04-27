var moment = require('moment');

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
        this.pool = new Map();
        for (let pi of poolInfos) {
            if (this.pool.has(pi.symbol)) {
                pi.intervals.forEach(x => this.pool.get(pi.symbol).set(x, []));
            } else {
                if (pi.intervals.length > 0)
                    this.pool.set(pi.symbol, new Map(pi.intervals.map((x) => [x, []])));
            }
        }
        this.pool.forEach(
            (i, sym) => {
                i.forEach(
                    (v, k) => {
                        if (barData.hasOwnProperty(sym)) {
                            var data = barData[sym];
                        } else {
                            try {
                                var data = barData.get(sym);
                            } catch {
                                var data = [];
                            }
                        };
                        var bars = this.resampleOne(data, sym, k);
                        bars.forEach(b => v.push(b));
                        v.begin = bars.begin;
                    }
                );
            }
        );
    }
    resampleOne(data, symbol, interval) {
        var out = [];
        if (data.length > 0) {
            if (typeof data[0][0] === "number") {
                interval = interval * 60 * 1000;
                var begin = moment(data[0][0]).utc().startOf("day").toDate().getTime();
                begin += Math.ceil((data[0][0] - begin) / interval) * interval * 60 * 1000;
                out.begin = begin;
                var o = data[0][1],
                    h = data[0][2],
                    l = data[0][3],
                    c = data[0][4],
                    v = data[0][5] ? undefined : 0,
                    last = begin;
                for (let bar of data) {
                    var dt = bar[0];
                    if (dt < begin) {
                        continue;
                    } else {
                        if ((dt - last) >= interval) {
                            if (c !== 0) out.push([last, o, h, l, c, v]);
                            while (last + interval <= dt)
                                last += interval;
                            o = bar[1];
                            h = bar[2];
                            l = bar[3];
                            c = bar[4];
                            v = bar[5] ? undefined : 0;
                        } else {
                            if (bar[2] > h) h = bar[2];
                            if (bar[3] < l) l = bar[3];
                            c = bar[4];
                            v += bar[5] ? undefined : 0;
                        }
                    }
                }
                // add immature bar here
                if (dt >= last) out.push([last, o, h, l, c, v]);
                return out;
            }

        }
        out.begin = moment().utc().startOf("day").toDate().getTime();
        return out;
    }
    addInterval(symbol, interval, barData) {
        // object
        if (barData.hasOwnProperty(symbol))
            barData = barData[symbol];
        // map
        if (barData.has(symbol))
            barData = barData.get(symbol);
        // barData is Array now
        bars = this.resampleOne(barData, symbol, interval);
        if (!this.pool.has(symbol))
            this.pool.set(symbol, new Map());
        this.pool.get(symbol).set(interval, bars);
    }
    removeInterval(symbol, interval) {
        if (this.pool.has(symbol))
            return this.pool.get(symbol).delete(interval);
        console.error(`${symbol} not presented in pool`);
        return false;
    }
    updatePool(symbol, data) {
        if (this.pool.has(symbol)) {
            for (var interval of this.pool.get(symbol).keys())
                this.update(symbol, data, interval);
            return true;
        }
        console.error(`${symbol} not presented in pool`);
        return false;
    }
    update(symbol, data, interval) {
        try {
            var bars = this.pool.get(symbol).get(interval);
            if (bars.length == 0) {
                // do not have previous bar
                var last = bars.begin;
                while (last + interval <= data[0])
                    last += interval;
                bars.push([last,
                    data[1],
                    data[2],
                    data[3],
                    data[4],
                    data[5] ? undefined : 0
                ]);
            } else {
                // has previous bar
                var bar = bars[bars.length - 1];
                var o = bar[1],
                    h = bar[2],
                    l = bar[3],
                    c = bar[4],
                    v = bar[5] ? undefined : 0,
                    last = bar[0];
                interval = interval * 60 * 1000;
                if (data[0] >= last + interval) {
                    while (last + interval <= data[0])
                        last += interval;
                    bars.push([last,
                        data[1],
                        data[2],
                        data[3],
                        data[4],
                        data[5] ? undefined : 0
                    ]);
                } else {
                    if (data[2] > h) h = data[2];
                    if (data[3] < l) l = data[3];
                    c = data[4];
                    v += data[5] ? undefined : 0;
                }
            };
        } catch (err) {
            console.error("Symbol or interval not presented in pool.");
            console.error(err);
        }
    }
    get(symbol, interval) {
        try {
            var out = this.pool.get(symbol).get(interval);
            if (out === undefined) {
                console.log(`bar for ${symbol} with interval of ${interval} minutes is not defined.`)
                return [];
            } else {
                return out;
            }
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}

module.exports = { PoolInfo, OHLCPool };