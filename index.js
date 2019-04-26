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
        var resampleOne = function(symbol, interval) {
            if (barData.hasOwnProperty(symbol)) {
                var data = barData[symbol];
            } else {
                try {
                    var data = barData.get(symbol);
                } catch {
                    var data = [];
                }
            }
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
        };
        this.pool.forEach(
            (i, sym) => {
                i.forEach(
                    (v, k) => {
                        var bars = resampleOne(sym, k);
                        bars.forEach(b => v.push(b));
                        v.begin = bars.begin;
                    }
                );
            }
        );
    }

    update(symbol, data) {
        try {
            // has previous bar
            var data = this.pool.get(symbol).get(interval);
        } catch {
            // do not have previous bar   

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