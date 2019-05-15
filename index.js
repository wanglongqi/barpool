const moment = require('moment');

class PoolInfo {
  constructor(symbol, intervals) {
    this.symbol = symbol;
    if (intervals instanceof Array) {
      this.intervals = intervals.map(x => parseInt(x, 10)).filter(x => !Number.isNaN(x));
    } else {
      this.intervals = [parseInt(intervals, 10)].filter(x => !Number.isNaN(x));
    }
  }
}

class OHLCPool {
  constructor(barData, poolInfos) {
    let data = [];
    this.pool = new Map();
    poolInfos.forEach((pi) => {
      if (this.pool.has(pi.symbol)) {
        pi.intervals.forEach(x => this.pool.get(pi.symbol).set(x, []));
      } else if (pi.intervals.length > 0) {
        this.pool.set(pi.symbol,
          new Map(pi.intervals.map(x => [x, []])));
      }
    });
    this.pool.forEach(
      (i, sym) => {
        i.forEach(
          (v, k) => {
            if (Object.prototype.hasOwnProperty.call(barData, sym)) {
              data = barData[sym];
            } else {
              try {
                data = barData.get(sym);
              } catch (e) {
                data = [];
              }
            }
            const bars = this.resampleOne(data, sym, k);
            bars.forEach(b => v.push(b));
            v.begin = bars.begin;
          },
        );
      },
    );
  }

  resampleOne(data, symbol, interval) {
    let dt = 0;
    const out = [];
    if (data.length > 0) {
      if (typeof data[0][0] === 'number') {
        interval = interval * 60 * 1000;
        let begin = moment(data[0][0]).utc().startOf('day').toDate()
          .getTime();
        begin += Math.ceil((data[0][0] - begin) / interval) * interval;
        out.begin = begin;
        let o; let h; let l; let c; let v; let
          last = begin;
        data.forEach((bar) => {
          dt = bar[0];
          if (dt >= begin) {
            if (c === undefined) {
              o = bar[1];
              h = bar[2];
              l = bar[3];
              c = bar[4];
              v = 0;
            }
            if ((dt - last) >= interval) {
              if (c !== 0) out.push([last, o, h, l, c, v]);
              while (last + interval <= dt) last += interval;
              o = bar[1];
              h = bar[2];
              l = bar[3];
              c = bar[4];
              v = bar[5] ? bar[5] : 0;
            } else {
              if (bar[2] > h) h = bar[2];
              if (bar[3] < l) l = bar[3];
              c = bar[4];
              v += bar[5] ? bar[5] : 0;
            }
          }
        });
        // add immature bar here
        if (dt >= last) out.push([last, o, h, l, c, v]);
        return out;
      }
    }
    out.begin = moment().utc().startOf('day').toDate()
      .getTime();
    return out;
  }

  addInterval(symbol, interval, barData) {
    // object
    if (Object.prototype.hasOwnProperty.call(barData, symbol)) barData = barData[symbol];
    // map
    if (Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(barData), 'has') && barData.has(symbol)) barData = barData.get(symbol);
    // barData is Array now
    const bars = this.resampleOne(barData, symbol, interval);
    if (!this.pool.has(symbol)) this.pool.set(symbol, new Map());
    this.pool.get(symbol).set(interval, bars);
  }

  removeInterval(symbol, interval) {
    if (this.pool.has(symbol)) return this.pool.get(symbol).delete(interval);
    console.error(`${symbol} not presented in pool`);
    return false;
  }

  updatePool(symbol, data) {
    if (this.pool.has(symbol)) {
      this.pool.get(symbol).forEach((v, interval) => this.update(symbol, data, interval));
      return true;
    }
    console.error(`${symbol} not presented in pool`);
    return false;
  }

  update(symbol, data, interval) {
    let last = 0;
    try {
      const bars = this.pool.get(symbol).get(interval);
      if (bars.length === 0) {
        // do not have previous bar, this should not happen. But we
        // also make partial support here.
        console.log('historical data not found, please consider add more historical data.');
        last = bars.begin;
        while (last + interval < data[0]) last += interval;
        // only push if the bar start time match with one begin time, for completeness
        // of bar content, but this may lead to missing starting bars for illiquid data.
        // For illiquid data, historical data should be passed in advance.
        // Do NOT make hot start for illiquid data.
        if (last === data[0]) {
          bars.push([last,
            data[1],
            data[2],
            data[3],
            data[4],
            data[5] ? data[5] : 0,
          ]);
        }
      } else {
        // has previous bar
        const bar = bars[bars.length - 1];
        const h = bar[2];
        const l = bar[3];
        last = bar[0];
        if (data[0] < last) throw new Error(`update data @${new Date(data[0])} should newer than historical data @ ${new Date(last)}.`);
        interval = interval * 60 * 1000;
        if (data[0] >= last + interval) {
          while (last + interval <= data[0]) last += interval;
          bars.push([last,
            data[1],
            data[2],
            data[3],
            data[4],
            data[5] ? data[5] : 0,
          ]);
        } else {
          if (data[2] > h) bar[2] = data[2];
          if (data[3] < l) bar[3] = data[3];
          bar[4] = data[4];
          bar[5] += data[5] ? data[5] : 0;
        }
      }
    } catch (err) {
      console.error('Symbol or interval not presented in pool.');
      console.error(err);
    }
  }

  downdate(symbol, data, interval) {
    // only consider a special case, where the last new data is newer than pool.begin
    const cache = this.pool.get(symbol).get(interval);
    if (data[data.length - 1][0] >= cache.begin && data[0][0] < cache.begin) {
      const bars = this.resampleOne(data, symbol, interval).filter(x => (x[0] < cache.begin));
      this.pool.get(symbol).set(interval, bars.concat(cache));
    } else {
      console.log(data[data.length - 1][0] >= cache.begin ? 'You have new old data?' : 'Last new data newer than begin of old data?');
    }
  }

  get(symbol, interval) {
    try {
      const out = this.pool.get(symbol).get(interval);
      if (out === undefined) {
        console.log(`bar for ${symbol} with interval of ${interval} minutes is not defined.`);
        return [];
      }
      return out;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

module.exports = { PoolInfo, OHLCPool };
