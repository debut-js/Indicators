/**
 * Candlestick pattern detectors — debut port of the
 * `technicalindicators` candlestick library.
 *
 * Each pattern is a fully-isolated, self-contained class:
 *   • zero imports (uses only language built-ins);
 *   • no shared base class, no shared helpers, no shared state;
 *   • configurable constants per pattern via the constructor (with
 *     sensible defaults);
 *   • a private predicate method takes raw OHLC arrays of length
 *     `required`, so `nextValue` and `momentValue` differ only in
 *     whether they mutate the internal buffer.
 *
 * Every class exposes:
 *
 *   nextValue(open, high, low, close)
 *   momentValue(open, high, low, close)
 *
 * `nextValue` advances state and returns:
 *   • `true`      — pattern fired on this bar
 *   • `false`     — predicate evaluated, did not fire
 *   • `undefined` — not enough history yet (single-bar patterns
 *                   never return undefined since they need only
 *                   the current bar)
 *
 * `momentValue` previews the same verdict for a hypothetical close
 * without committing any state.
 */

// =====================================================================
// Single-bar patterns. Stateless: nextValue ≡ momentValue. Each takes
// an optional `precision` parameter that controls `approxEqual`'s
// fuzzy-match tolerance (default 0.001 = 0.1% of the reference value),
// matching the technicalindicators reference behaviour.
// =====================================================================

export class Doji {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        const isOpenEqualsClose = this.approxEqual(open, close);
        const isHighEqualsOpen = isOpenEqualsClose && this.approxEqual(open, high);
        const isLowEqualsClose = isOpenEqualsClose && this.approxEqual(close, low);
        return isOpenEqualsClose && isHighEqualsOpen === isLowEqualsClose;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class DragonFlyDoji {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        const isOpenEqualsClose = this.approxEqual(open, close);
        const isHighEqualsOpen = isOpenEqualsClose && this.approxEqual(open, high);
        const isLowEqualsClose = isOpenEqualsClose && this.approxEqual(close, low);
        return isOpenEqualsClose && isHighEqualsOpen && !isLowEqualsClose;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class GraveStoneDoji {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        const isOpenEqualsClose = this.approxEqual(open, close);
        const isHighEqualsOpen = isOpenEqualsClose && this.approxEqual(open, high);
        const isLowEqualsClose = isOpenEqualsClose && this.approxEqual(close, low);
        return isOpenEqualsClose && isLowEqualsClose && !isHighEqualsOpen;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BearishHammerStick {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return open > close
            && this.approxEqual(open, high)
            && (open - close) <= this.shadowToBodyRatio * (close - low);
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BullishHammerStick {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return close > open
            && this.approxEqual(close, high)
            && (close - open) <= this.shadowToBodyRatio * (open - low);
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BearishInvertedHammerStick {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return open > close
            && this.approxEqual(close, low)
            && (open - close) <= this.shadowToBodyRatio * (high - open);
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BullishInvertedHammerStick {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return close > open
            && this.approxEqual(open, low)
            && (close - open) <= this.shadowToBodyRatio * (high - close);
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BearishMarubozu {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return this.approxEqual(open, high)
            && this.approxEqual(low, close)
            && open > close
            && open > low;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BullishMarubozu {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        return this.approxEqual(close, high)
            && this.approxEqual(low, open)
            && open < close
            && open < high;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BearishSpinningTop {
    private readonly minShadowToBodyRatio: number;
    constructor(opts: { minShadowToBodyRatio?: number } = {}) {
        // Default 1 → both shadows must be strictly larger than the body.
        // Raise to require shadows to dominate the body more strongly.
        this.minShadowToBodyRatio = opts.minShadowToBodyRatio ?? 1;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        const bodyLength = Math.abs(close - open);
        const upperShadowLength = Math.abs(high - open);
        const lowerShadowLength = Math.abs(high - low);
        const r = this.minShadowToBodyRatio;
        return bodyLength * r < upperShadowLength && bodyLength * r < lowerShadowLength;
    }
}

export class BullishSpinningTop {
    private readonly minShadowToBodyRatio: number;
    constructor(opts: { minShadowToBodyRatio?: number } = {}) {
        this.minShadowToBodyRatio = opts.minShadowToBodyRatio ?? 1;
    }
    nextValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean {
        return this.predicate(open, high, low, close);
    }
    private predicate(open: number, high: number, low: number, close: number): boolean {
        const bodyLength = Math.abs(close - open);
        const upperShadowLength = Math.abs(high - close);
        const lowerShadowLength = Math.abs(open - low);
        const r = this.minShadowToBodyRatio;
        return bodyLength * r < upperShadowLength && bodyLength * r < lowerShadowLength;
    }
}

// =====================================================================
// Two-bar patterns. Each owns a 4-element trailing OHLC buffer (one
// `number[]` per series) sized to its `required` count. The private
// `predicate` is a pure function over those arrays; `nextValue`
// commits the new bar then runs it, `momentValue` evaluates against
// a fresh hypothetical buffer.
// =====================================================================

export class BearishEngulfingPattern {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], _high: number[], _low: number[], close: number[]): boolean {
        return (close[0] > open[0])
            && (open[0] < open[1])
            && (close[0] < open[1])
            && (open[0] > close[1]);
    }
}

export class BullishEngulfingPattern {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], _high: number[], _low: number[], close: number[]): boolean {
        return (close[0] < open[0])
            && (open[0] > open[1])
            && (close[0] > open[1])
            && (open[0] < close[1]);
    }
}

export class BearishHarami {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        return (open[0] < open[1])
            && (close[0] > open[1])
            && (close[0] > close[1])
            && (open[0] < low[1])
            && (high[0] > high[1]);
    }
}

export class BullishHarami {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], _close: number[]): boolean {
        const c = _close;
        return (open[0] > open[1])
            && (c[0] < open[1])
            && (c[0] < c[1])
            && (open[0] > low[1])
            && (high[0] > high[1]);
    }
}

export class BearishHaramiCross {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;
    private readonly precision: number;

    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const isHaramiCross = (open[0] < open[1])
            && (close[0] > open[1])
            && (close[0] > close[1])
            && (open[0] < low[1])
            && (high[0] > high[1]);
        const isSecondDoji = this.approxEqual(open[1], close[1]);
        return isHaramiCross && isSecondDoji;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class BullishHaramiCross {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;
    private readonly precision: number;

    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const isHaramiCross = (open[0] > open[1])
            && (close[0] < open[1])
            && (close[0] < close[1])
            && (open[0] > low[1])
            && (high[0] > high[1]);
        const isSecondDoji = this.approxEqual(open[1], close[1]);
        return isHaramiCross && isSecondDoji;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class DarkCloudCover {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], _low: number[], close: number[]): boolean {
        const firstMidpoint = (close[0] + open[0]) / 2;
        const isFirstBullish = close[0] > open[0];
        const isSecondBearish = close[1] < open[1];
        const isDarkCloud = (open[1] > high[0]) && (close[1] < firstMidpoint) && (close[1] > open[0]);
        return isFirstBullish && isSecondBearish && isDarkCloud;
    }
}

export class PiercingLine {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 2;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], _high: number[], low: number[], close: number[]): boolean {
        const firstMidpoint = (open[0] + close[0]) / 2;
        const isDowntrend = low[1] < low[0];
        const isFirstBearish = close[0] < open[0];
        const isSecondBullish = close[1] > open[1];
        const isPiercing = (low[0] > open[1]) && (close[1] > firstMidpoint);
        return isDowntrend && isFirstBearish && isPiercing && isSecondBullish;
    }
}

// =====================================================================
// Three-bar patterns.
// =====================================================================

export class AbandonedBaby {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;
    private readonly precision: number;

    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const isFirstBearish = close[0] < open[0];
        const isMiddleDoji = this.approxEqual(open[1], close[1])
            && this.approxEqual(open[1], high[1]) === this.approxEqual(close[1], low[1]);
        const gapExists = (high[1] < low[0]) && (low[2] > high[1]) && (close[2] > open[2]);
        const isThirdBullish = high[2] < open[0];
        return isFirstBearish && isMiddleDoji && gapExists && isThirdBullish;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class DownsideTasukiGap {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const isFirstBearish = close[0] < open[0];
        const isSecondBearish = close[1] < open[1];
        const isThirdBullish = close[2] > open[2];
        const gapExists = high[1] < low[0];
        const isTasuki = (open[1] > open[2])
            && (close[1] < open[2])
            && (close[2] > open[1])
            && (close[2] < close[0]);
        return isFirstBearish && isSecondBearish && isThirdBullish && gapExists && isTasuki;
    }
}

export class EveningStar {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const firstMidpoint = (open[0] + close[0]) / 2;
        const isFirstBullish = close[0] > open[0];
        const isSmallBody = (high[0] < low[1]) && (high[0] < high[1]);
        const isThirdBearish = open[2] > close[2];
        const gapExists = (high[1] > high[0]) && (low[1] > high[0]) && (open[2] < low[1]) && (close[1] > open[2]);
        const closesBelowMid = close[2] < firstMidpoint;
        return isFirstBullish && isSmallBody && gapExists && isThirdBearish && closesBelowMid;
    }
}

export class EveningDojiStar {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;
    private readonly precision: number;

    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const firstMidpoint = (open[0] + close[0]) / 2;
        const isFirstBullish = close[0] > open[0];
        const isMiddleDoji = this.approxEqual(open[1], close[1])
            && this.approxEqual(open[1], high[1]) === this.approxEqual(close[1], low[1]);
        const isThirdBearish = open[2] > close[2];
        const gapExists = (high[1] > high[0]) && (low[1] > high[0]) && (open[2] < low[1]) && (close[1] > open[2]);
        const closesBelowMid = close[2] < firstMidpoint;
        return isFirstBullish && isMiddleDoji && gapExists && isThirdBearish && closesBelowMid;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class MorningStar {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const firstMidpoint = (open[0] + close[0]) / 2;
        const isFirstBearish = close[0] < open[0];
        const isSmallBody = (low[0] > low[1]) && (low[0] > high[1]);
        const isThirdBullish = open[2] < close[2];
        const gapExists = (high[1] < low[0]) && (low[1] < low[0]) && (open[2] > high[1]) && (close[1] < open[2]);
        const closesAboveMid = close[2] > firstMidpoint;
        return isFirstBearish && isSmallBody && gapExists && isThirdBullish && closesAboveMid;
    }
}

export class MorningDojiStar {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;
    private readonly precision: number;

    constructor(opts: { precision?: number } = {}) {
        this.precision = opts.precision ?? 0.001;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        const firstMidpoint = (open[0] + close[0]) / 2;
        const isFirstBearish = close[0] < open[0];
        const isMiddleDoji = this.approxEqual(open[1], close[1])
            && this.approxEqual(open[1], high[1]) === this.approxEqual(close[1], low[1]);
        const isThirdBullish = open[2] < close[2];
        const gapExists = (high[1] < low[0]) && (low[1] < low[0]) && (open[2] > high[1]) && (close[1] < open[2]);
        const closesAboveMid = close[2] > firstMidpoint;
        return isFirstBearish && isMiddleDoji && isThirdBullish && gapExists && closesAboveMid;
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class ThreeBlackCrows {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], _high: number[], low: number[], close: number[]): boolean {
        const isDownTrend = (low[0] > low[1]) && (low[1] > low[2]);
        const isAllBearish = (open[0] > close[0]) && (open[1] > close[1]) && (open[2] > close[2]);
        const opensWithinBody = (open[0] > open[1])
            && (open[1] > close[0])
            && (open[1] > open[2])
            && (open[2] > close[1]);
        return isDownTrend && isAllBearish && opensWithinBody;
    }
}

export class ThreeWhiteSoldiers {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 3;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], _low: number[], close: number[]): boolean {
        const isUpTrend = (high[1] > high[0]) && (high[2] > high[1]);
        const isAllBullish = (open[0] < close[0]) && (open[1] < close[1]) && (open[2] < close[2]);
        const opensWithinBody = (close[0] > open[1])
            && (open[1] < high[0])
            && (high[1] > open[2])
            && (open[2] < close[1]);
        return isUpTrend && isAllBullish && opensWithinBody;
    }
}

// =====================================================================
// Five-bar patterns with confirmation candles + simple trend filter.
// The trend filter computes average gain / loss over the first three
// bars (or four if `confirm` is false) — same convention as the
// technicalindicators reference. `trendBars` is exposed via the
// constructor for callers who want to override the window.
// =====================================================================

export class HammerPattern {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 5;
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; confirm?: boolean } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
        this.confirm = opts.confirm ?? true;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        return this.downwardTrend(close)
            && this.includesHammer(open, high, low, close)
            && (!this.confirm || this.hasConfirmation(open, close));
    }
    private downwardTrend(close: number[]): boolean {
        const end = this.confirm ? 3 : 4;
        let gains = 0, losses = 0;
        for (let i = 1; i < end; i++) {
            const d = close[i] - close[i - 1];
            if (d > 0) gains += d;
            else losses += -d;
        }
        return losses > gains;
    }
    private includesHammer(open: number[], high: number[], low: number[], close: number[]): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = open[idx], h = high[idx], l = low[idx], c = close[idx];
        const r = this.shadowToBodyRatio;
        return (
            // bullish hammer
            (c > o && this.approxEqual(c, h) && (c - o) <= r * (o - l))
            // bearish hammer
            || (o > c && this.approxEqual(o, h) && (o - c) <= r * (c - l))
            // bullish inverted hammer
            || (c > o && this.approxEqual(o, l) && (c - o) <= r * (h - c))
            // bearish inverted hammer
            || (o > c && this.approxEqual(c, l) && (o - c) <= r * (h - o))
        );
    }
    private hasConfirmation(open: number[], close: number[]): boolean {
        return open[4] < close[4] && close[3] < close[4];
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class HammerPatternUnconfirmed {
    private inner: HammerPattern;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        this.inner = new HammerPattern({
            precision: opts.precision,
            shadowToBodyRatio: opts.shadowToBodyRatio,
            confirm: false,
        });
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.nextValue(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.momentValue(open, high, low, close);
    }
}

export class HangingMan {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 5;
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; confirm?: boolean } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
        this.confirm = opts.confirm ?? true;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        return this.upwardTrend(close)
            && this.includesHammer(open, high, low, close)
            && (!this.confirm || this.hasConfirmation(open, close));
    }
    private upwardTrend(close: number[]): boolean {
        const end = this.confirm ? 3 : 4;
        let gains = 0, losses = 0;
        for (let i = 1; i < end; i++) {
            const d = close[i] - close[i - 1];
            if (d > 0) gains += d;
            else losses += -d;
        }
        return gains > losses;
    }
    private includesHammer(open: number[], high: number[], low: number[], close: number[]): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = open[idx], h = high[idx], l = low[idx], c = close[idx];
        // bullish or bearish hammer (NOT inverted variants for HangingMan)
        return (
            (c > o && this.approxEqual(c, h) && (c - o) <= 2 * (o - l))
            || (o > c && this.approxEqual(o, h) && (o - c) <= 2 * (c - l))
        );
    }
    private hasConfirmation(open: number[], close: number[]): boolean {
        return open[4] > close[4] && close[3] > close[4];
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class HangingManUnconfirmed {
    private inner: HangingMan;

    constructor(opts: { precision?: number } = {}) {
        this.inner = new HangingMan({ precision: opts.precision, confirm: false });
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.nextValue(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.momentValue(open, high, low, close);
    }
}

export class ShootingStar {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 5;
    private readonly precision: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; confirm?: boolean } = {}) {
        this.precision = opts.precision ?? 0.001;
        this.confirm = opts.confirm ?? true;
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(open: number[], high: number[], low: number[], close: number[]): boolean {
        return this.upwardTrend(close)
            && this.includesInvertedHammer(open, high, low, close)
            && (!this.confirm || this.hasConfirmation(open, close));
    }
    private upwardTrend(close: number[]): boolean {
        const end = this.confirm ? 3 : 4;
        let gains = 0, losses = 0;
        for (let i = 1; i < end; i++) {
            const d = close[i] - close[i - 1];
            if (d > 0) gains += d;
            else losses += -d;
        }
        return gains > losses;
    }
    private includesInvertedHammer(open: number[], high: number[], low: number[], close: number[]): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = open[idx], h = high[idx], l = low[idx], c = close[idx];
        return (
            // bullish inverted hammer
            (c > o && this.approxEqual(o, l) && (c - o) <= 2 * (h - c))
            // bearish inverted hammer
            || (o > c && this.approxEqual(c, l) && (o - c) <= 2 * (h - o))
        );
    }
    private hasConfirmation(open: number[], close: number[]): boolean {
        return open[4] > close[4] && close[3] > close[4];
    }
    private approxEqual(a: number, b: number): boolean {
        const left = parseFloat(Math.abs(a - b).toPrecision(4));
        const right = parseFloat((a * this.precision).toPrecision(4));
        return left <= right;
    }
}

export class ShootingStarUnconfirmed {
    private inner: ShootingStar;

    constructor(opts: { precision?: number } = {}) {
        this.inner = new ShootingStar({ precision: opts.precision, confirm: false });
    }

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.nextValue(open, high, low, close);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        return this.inner.momentValue(open, high, low, close);
    }
}

export class TweezerBottom {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 5;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(_open: number[], _high: number[], low: number[], close: number[]): boolean {
        // Downward trend over the first 3 bars + matching lows on bars 4 and 5.
        let gains = 0, losses = 0;
        for (let i = 1; i < 3; i++) {
            const d = close[i] - close[i - 1];
            if (d > 0) gains += d;
            else losses += -d;
        }
        const isDownTrend = losses > gains;
        return isDownTrend && low[3] === low[4];
    }
}

export class TweezerTop {
    private opens: number[] = [];
    private highs: number[] = [];
    private lows: number[] = [];
    private closes: number[] = [];
    private readonly required = 5;

    nextValue(open: number, high: number, low: number, close: number): boolean | undefined {
        this.opens.push(open); this.highs.push(high); this.lows.push(low); this.closes.push(close);
        if (this.opens.length > this.required) {
            this.opens.shift(); this.highs.shift(); this.lows.shift(); this.closes.shift();
        }
        if (this.opens.length < this.required) return undefined;
        return this.predicate(this.opens, this.highs, this.lows, this.closes);
    }
    momentValue(open: number, high: number, low: number, close: number): boolean | undefined {
        const start = this.opens.length === this.required ? 1 : 0;
        const o = [...this.opens.slice(start), open];
        const h = [...this.highs.slice(start), high];
        const l = [...this.lows.slice(start), low];
        const c = [...this.closes.slice(start), close];
        if (o.length < this.required) return undefined;
        return this.predicate(o, h, l, c);
    }
    private predicate(_open: number[], high: number[], _low: number[], close: number[]): boolean {
        let gains = 0, losses = 0;
        for (let i = 1; i < 3; i++) {
            const d = close[i] - close[i - 1];
            if (d > 0) gains += d;
            else losses += -d;
        }
        const isUpTrend = gains > losses;
        return isUpTrend && high[3] === high[4];
    }
}
