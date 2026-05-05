import { CircularBuffer } from '../providers/circular-buffer';

/**
 * Tiny shared utilities for candlestick pattern detectors.
 *
 * Patterns COMPOSE these via field initialisers — they don't inherit
 * from anything. The point of pulling these out is to keep predicate
 * logic legible without copy-pasting the same fuzzy-match / buffer /
 * trend-detection plumbing across 35 classes.
 */

/**
 * Fuzzy-equality check used by Doji-style patterns.
 *
 * Returns `true` when `|a - b|` is within `a * precision` (with
 * 4-significant-digit rounding to match the `technicalindicators`
 * reference exactly). Default `precision = 0.001` ≈ 0.1% relative
 * tolerance.
 */
export function approxEqual(a: number, b: number, precision = 0.001): boolean {
    const left = parseFloat(Math.abs(a - b).toPrecision(4));
    const right = parseFloat((a * precision).toPrecision(4));
    return left <= right;
}

/**
 * Read-only random access over a window of OHLC bars. `idx = 0` is
 * the oldest bar in the window, `idx = required - 1` is the newest.
 * Implemented directly by `OhlcBuffer` (committed view) and by a
 * tiny inline literal returned from `OhlcBuffer.tailMoment`
 * (hypothetical view that injects a candidate newest bar without
 * committing). It's typed as a structural alias so predicates
 * don't need to know whether they're reading committed or
 * hypothetical state — they just call `buf.open(i)` and so on.
 */
type OhlcView = {
    open(idx: number): number;
    high(idx: number): number;
    low(idx: number): number;
    close(idx: number): number;
};
export type { OhlcView };

/**
 * Trailing OHLC ring used by every multi-bar pattern.
 *
 * Backed by four `CircularBuffer<number>` rings — push is O(1) and
 * never allocates an array, so 40+ patterns fed the same stream stay
 * fast. `nextValue(o, h, l, c)` advances the buffer (committing the
 * new bar) and returns `this` (a `OhlcView`) once `required` bars
 * have been observed; predicates read individual cells via
 * `buf.open(idx)` etc. without any intermediate arrays.
 *
 * `momentValue(o, h, l, c)` returns a `OhlcView` that pretends the
 * given bar is the newest entry, without mutating the underlying
 * buffer. The view is a small object literal — no array
 * allocation on the hot path.
 */
export class OhlcBuffer implements OhlcView {
    private opens: CircularBuffer;
    private highs: CircularBuffer;
    private lows: CircularBuffer;
    private closes: CircularBuffer;

    constructor(private readonly required: number) {
        this.opens = new CircularBuffer(required);
        this.highs = new CircularBuffer(required);
        this.lows = new CircularBuffer(required);
        this.closes = new CircularBuffer(required);
    }

    nextValue(open: number, high: number, low: number, close: number): OhlcView | undefined {
        this.opens.push(open);
        this.highs.push(high);
        this.lows.push(low);
        this.closes.push(close);
        return this.opens.filled ? this : undefined;
    }

    /**
     * Hypothetical post-push reader. Index `required - 1` resolves to
     * the candidate `(open, high, low, close)`; lower indices come
     * from the committed ring — shifted by one when the ring is
     * already full, since the oldest entry would be evicted.
     */
    momentValue(open: number, high: number, low: number, close: number): OhlcView | undefined {
        const filled = this.opens.filled;
        const loaded = this.opens.loaded;
        if (!filled && loaded < this.required - 1) return undefined;
        const start = filled ? 1 : 0;
        const last = this.required - 1;
        const opens = this.opens;
        const highs = this.highs;
        const lows = this.lows;
        const closes = this.closes;
        return {
            open: (idx: number) => idx === last ? open : (opens.at(idx + start) as number),
            high: (idx: number) => idx === last ? high : (highs.at(idx + start) as number),
            low:  (idx: number) => idx === last ? low  : (lows.at(idx + start) as number),
            close: (idx: number) => idx === last ? close : (closes.at(idx + start) as number),
        };
    }

    open(idx: number): number {
        return this.opens.at(idx) as number;
    }
    high(idx: number): number {
        return this.highs.at(idx) as number;
    }
    low(idx: number): number {
        return this.lows.at(idx) as number;
    }
    close(idx: number): number {
        return this.closes.at(idx) as number;
    }

    /** How many bars have been pushed (0..required). */
    get loaded(): number {
        return this.opens.loaded;
    }

    /** Capacity (number of bars the ring holds when full). */
    get required_(): number {
        return this.required;
    }

    /**
     * Read-only view of the most recent `count` bars (oldest →
     * newest, indexed `[0..count-1]`). Used by individual patterns
     * to read from a larger shared buffer without caring how it's
     * sized. Returns `undefined` until at least `count` bars have
     * been observed.
     */
    tail(count: number): OhlcView | undefined {
        if (this.opens.loaded < count) return undefined;
        const start = this.opens.loaded - count;
        const opens = this.opens;
        const highs = this.highs;
        const lows = this.lows;
        const closes = this.closes;
        return {
            open: (i: number) => opens.at(start + i) as number,
            high: (i: number) => highs.at(start + i) as number,
            low: (i: number) => lows.at(start + i) as number,
            close: (i: number) => closes.at(start + i) as number,
        };
    }

    /**
     * Hypothetical-tail: what `tail(count)` would return *after* a
     * push of `(o, h, l, c)`, without committing state. Used by the
     * `momentValue` paths. Returns `undefined` when the hypothetical
     * push wouldn't have produced enough history.
     *
     * Conceptually we project a virtual post-push layout indexed
     * `[0..newLoaded - 1]`, where the bar at index `newLoaded - 1`
     * is the hypothetical entry. When the buffer is already full
     * the would-be evicted oldest bar is dropped, so committed
     * indices shift down by one.
     */
    tailMoment(count: number, open: number, high: number, low: number, close: number): OhlcView | undefined {
        const filled = this.opens.filled;
        const loaded = this.opens.loaded;
        const newLoaded = filled ? this.required : loaded + 1;
        if (newLoaded < count) return undefined;
        const last = newLoaded - 1;
        const start = newLoaded - count;
        const opens = this.opens;
        const highs = this.highs;
        const lows = this.lows;
        const closes = this.closes;
        const lookup = (buf: CircularBuffer, i: number, hypothetical: number): number => {
            const j = start + i;
            if (j === last) return hypothetical;
            return buf.at(filled ? j + 1 : j) as number;
        };
        return {
            open: (i: number) => lookup(opens, i, open),
            high: (i: number) => lookup(highs, i, high),
            low: (i: number) => lookup(lows, i, low),
            close: (i: number) => lookup(closes, i, close),
        };
    }
}

/**
 * Sum of upward / downward close-to-close moves over `[0, end)` of a
 * `OhlcView`'s closes — used by Hammer/HangingMan/ShootingStar/
 * Tweezer trend filters in the `technicalindicators` reference.
 */
export function gainLossSum(close: OhlcView, end: number): { gains: number; losses: number } {
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < end; i++) {
        const d = close.close(i) - close.close(i - 1);
        if (d > 0) gains += d;
        else losses += -d;
    }
    return { gains, losses };
}
