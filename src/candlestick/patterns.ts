import { OhlcBuffer, OhlcView, approxEqual, gainLossSum } from './helpers';

// =====================================================================
// Module-level singleton OHLC ring shared by every multi-bar pattern.
// Sized to the deepest lookback any pattern in the library needs (5
// for FallingThreeMethods / RisingThreeMethods etc., 5 here too for
// the technicalindicators-style HammerPattern / TweezerBottom).
//
// All multi-bar patterns read from this single buffer. The first
// pattern that sees a brand-new bar (different OHLC tuple from the
// previous one) advances the buffer; subsequent patterns invoked
// with the same bar within the same tick are dedup'd. This means
// you can run any number of multi-bar pattern instances on a single
// bar stream without spawning per-pattern buffers.
//
// Limitation: the singleton assumes a single bar stream. If you're
// scanning two independent streams concurrently, call
// `BasePattern.reset()` between switches (or accept that the
// singleton interleaves).
// =====================================================================

const BUFFER_SIZE = 5;
let sharedBuf = new OhlcBuffer(BUFFER_SIZE);
let lastO = NaN, lastH = NaN, lastL = NaN, lastC = NaN;

function commitBar(o: number, h: number, l: number, c: number): void {
    if (o !== lastO || h !== lastH || l !== lastL || c !== lastC) {
        sharedBuf.nextValue(o, h, l, c);
        lastO = o; lastH = h; lastL = l; lastC = c;
    }
}

/**
 * Candlestick pattern detectors — debut port of the
 * [`technicalindicators`](https://github.com/anandanand84/technicalindicators)
 * candlestick library.
 *
 * Each pattern owns the state it needs and exposes:
 *
 *   nextValue(open, high, low, close)
 *   momentValue(open, high, low, close)
 *
 * `nextValue` advances state and returns:
 *   • `true`      — pattern fired on this bar
 *   • `false`     — predicate evaluated, did not fire
 *   • `undefined` — not enough history yet
 *
 * `momentValue` previews the same verdict for a hypothetical close
 * without committing any state.
 *
 * Configurable thresholds come through the constructor's options
 * bag with sensible defaults — `precision` (Doji-like fuzzy-match
 * tolerance, default 0.001), `shadowToBodyRatio` (hammer family,
 * default 2), `minShadowToBodyRatio` (spinning-top family, default 1),
 * `equalityTolerance` (Tweezers, default 0).
 *
 * Multi-bar patterns share a module-level singleton `OhlcBuffer`
 * (size 5) declared at the top of this file. The first pattern to
 * see a brand-new bar advances the buffer; subsequent calls within
 * the same tick are dedup'd by OHLC equality. Use
 * `BasePattern.reset()` to reset the singleton between independent
 * bar streams or test cases.
 */

// =====================================================================
// Single-bar Doji family.
// =====================================================================

abstract class StatelessSingleBar {
    nextValue(o: number, h: number, l: number, c: number): boolean {
        return this.predicate(o, h, l, c);
    }
    momentValue(o: number, h: number, l: number, c: number): boolean {
        return this.predicate(o, h, l, c);
    }
    protected abstract predicate(o: number, h: number, l: number, c: number): boolean;
}

// NB: `StatelessSingleBar` exists only so the seven trivially stateless
// single-bar patterns share their `nextValue` / `momentValue` plumbing
// (each is a one-liner forwarding to a pure predicate). It is not part
// of the public API and isn't extended by any pattern that owns state.

export class Doji extends StatelessSingleBar {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        const oc = approxEqual(o, c, this.precision);
        const ho = oc && approxEqual(o, h, this.precision);
        const lc = oc && approxEqual(c, l, this.precision);
        return oc && ho === lc;
    }
}

export class DragonFlyDoji extends StatelessSingleBar {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        const oc = approxEqual(o, c, this.precision);
        const ho = oc && approxEqual(o, h, this.precision);
        const lc = oc && approxEqual(c, l, this.precision);
        return oc && ho && !lc;
    }
}

export class GraveStoneDoji extends StatelessSingleBar {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        const oc = approxEqual(o, c, this.precision);
        const ho = oc && approxEqual(o, h, this.precision);
        const lc = oc && approxEqual(c, l, this.precision);
        return oc && lc && !ho;
    }
}

// =====================================================================
// Single-bar hammer-stick family.
// =====================================================================

export class BearishHammerStick extends StatelessSingleBar {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return o > c
            && approxEqual(o, h, this.precision)
            && (o - c) <= this.shadowToBodyRatio * (c - l);
    }
}

export class BullishHammerStick extends StatelessSingleBar {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return c > o
            && approxEqual(c, h, this.precision)
            && (c - o) <= this.shadowToBodyRatio * (o - l);
    }
}

export class BearishInvertedHammerStick extends StatelessSingleBar {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return o > c
            && approxEqual(c, l, this.precision)
            && (o - c) <= this.shadowToBodyRatio * (h - o);
    }
}

export class BullishInvertedHammerStick extends StatelessSingleBar {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return c > o
            && approxEqual(o, l, this.precision)
            && (c - o) <= this.shadowToBodyRatio * (h - c);
    }
}

// =====================================================================
// Single-bar Marubozu (full-body candle, near-zero shadows).
// =====================================================================

export class BearishMarubozu extends StatelessSingleBar {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return approxEqual(o, h, this.precision)
            && approxEqual(l, c, this.precision)
            && o > c
            && o > l;
    }
}

export class BullishMarubozu extends StatelessSingleBar {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super();
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        return approxEqual(c, h, this.precision)
            && approxEqual(l, o, this.precision)
            && o < c
            && o < h;
    }
}

// =====================================================================
// Single-bar SpinningTop. `minShadowToBodyRatio` (default 1).
// =====================================================================

export class BearishSpinningTop extends StatelessSingleBar {
    private readonly minShadowToBodyRatio: number;
    constructor(opts: { minShadowToBodyRatio?: number } = {}) {
        super();
        this.minShadowToBodyRatio = opts.minShadowToBodyRatio ?? 1;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        const body = Math.abs(c - o);
        const upper = Math.abs(h - o);
        const lower = Math.abs(h - l);
        const r = this.minShadowToBodyRatio;
        return body * r < upper && body * r < lower;
    }
}

export class BullishSpinningTop extends StatelessSingleBar {
    private readonly minShadowToBodyRatio: number;
    constructor(opts: { minShadowToBodyRatio?: number } = {}) {
        super();
        this.minShadowToBodyRatio = opts.minShadowToBodyRatio ?? 1;
    }
    protected predicate(o: number, h: number, l: number, c: number): boolean {
        const body = Math.abs(c - o);
        const upper = Math.abs(h - c);
        const lower = Math.abs(o - l);
        const r = this.minShadowToBodyRatio;
        return body * r < upper && body * r < lower;
    }
}

// =====================================================================
// Multi-bar pattern infrastructure.
//
// Every multi-bar pattern follows the same shape:
//   - reads the module-level singleton `OhlcBuffer` (size 5)
//   - on `nextValue(o,h,l,c)`: pushes (if owner) and runs predicate via `detect`
//   - on `momentValue(o,h,l,c)`: builds a hypothetical view via
//     `OhlcBuffer.tailMoment(required, …)` and runs predicate
//   - on `detect()`: pulls a `OhlcView` view via
//     `OhlcBuffer.tail(required)` and runs predicate
//
// `BasePattern` houses that boilerplate so each concrete pattern body
// is just: `constructor(opts) { super(N, opts) } predicate(buf) { … }`.
// Subclasses do not share state across the inheritance edge — each
// instance owns its own thresholds and (by default) its own
// `OhlcBuffer`. The base only consolidates plumbing.
// =====================================================================

abstract class BasePattern {
    constructor(protected readonly required: number) {}

    nextValue(o: number, h: number, l: number, c: number): boolean | undefined {
        commitBar(o, h, l, c);
        return this.detect();
    }

    detect(): boolean | undefined {
        const view = sharedBuf.tail(this.required);
        if (!view) return undefined;
        return this.predicate(view);
    }

    momentValue(o: number, h: number, l: number, c: number): boolean | undefined {
        const view = sharedBuf.tailMoment(this.required, o, h, l, c);
        if (!view) return undefined;
        return this.predicate(view);
    }

    protected abstract predicate(buf: OhlcView): boolean;

    /**
     * Reset the module-level singleton buffer. Use when switching
     * between independent bar streams or between test cases.
     */
    static reset(): void {
        sharedBuf = new OhlcBuffer(BUFFER_SIZE);
        lastO = NaN; lastH = NaN; lastL = NaN; lastC = NaN;
    }
}

export { BasePattern };

// =====================================================================
// Two-bar patterns.
// =====================================================================

export class BearishEngulfingPattern extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        return (b.close(0) > b.open(0))
            && (b.open(0) < b.open(1))
            && (b.close(0) < b.open(1))
            && (b.open(0) > b.close(1));
    }
}

export class BullishEngulfingPattern extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        return (b.close(0) < b.open(0))
            && (b.open(0) > b.open(1))
            && (b.close(0) > b.open(1))
            && (b.open(0) < b.close(1));
    }
}

export class BearishHarami extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        return (b.open(0) < b.open(1))
            && (b.close(0) > b.open(1))
            && (b.close(0) > b.close(1))
            && (b.open(0) < b.low(1))
            && (b.high(0) > b.high(1));
    }
}

export class BullishHarami extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        return (b.open(0) > b.open(1))
            && (b.close(0) < b.open(1))
            && (b.close(0) < b.close(1))
            && (b.open(0) > b.low(1))
            && (b.high(0) > b.high(1));
    }
}

export class BearishHaramiCross extends BasePattern {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super(2);
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(b: OhlcView): boolean {
        const harami = (b.open(0) < b.open(1))
            && (b.close(0) > b.open(1))
            && (b.close(0) > b.close(1))
            && (b.open(0) < b.low(1))
            && (b.high(0) > b.high(1));
        const secondDoji = approxEqual(b.open(1), b.close(1), this.precision);
        return harami && secondDoji;
    }
}

export class BullishHaramiCross extends BasePattern {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super(2);
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(b: OhlcView): boolean {
        const harami = (b.open(0) > b.open(1))
            && (b.close(0) < b.open(1))
            && (b.close(0) < b.close(1))
            && (b.open(0) > b.low(1))
            && (b.high(0) > b.high(1));
        const secondDoji = approxEqual(b.open(1), b.close(1), this.precision);
        return harami && secondDoji;
    }
}

export class DarkCloudCover extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.close(0) + b.open(0)) / 2;
        const isFirstBullish = b.close(0) > b.open(0);
        const isSecondBearish = b.close(1) < b.open(1);
        const isDarkCloud = (b.open(1) > b.high(0)) && (b.close(1) < mid) && (b.close(1) > b.open(0));
        return isFirstBullish && isSecondBearish && isDarkCloud;
    }
}

export class PiercingLine extends BasePattern {
    constructor() { super(2); }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.open(0) + b.close(0)) / 2;
        const isDowntrend = b.low(1) < b.low(0);
        const isFirstBearish = b.close(0) < b.open(0);
        const isSecondBullish = b.close(1) > b.open(1);
        const isPiercing = (b.low(0) > b.open(1)) && (b.close(1) > mid);
        return isDowntrend && isFirstBearish && isPiercing && isSecondBullish;
    }
}

// =====================================================================
// Three-bar patterns.
// =====================================================================

export class AbandonedBaby extends BasePattern {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super(3);
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(b: OhlcView): boolean {
        const isFirstBearish = b.close(0) < b.open(0);
        const isMidDoji = approxEqual(b.open(1), b.close(1), this.precision)
            && approxEqual(b.open(1), b.high(1), this.precision)
                === approxEqual(b.close(1), b.low(1), this.precision);
        const gap = (b.high(1) < b.low(0)) && (b.low(2) > b.high(1)) && (b.close(2) > b.open(2));
        const isThirdBullish = b.high(2) < b.open(0);
        return isFirstBearish && isMidDoji && gap && isThirdBullish;
    }
}

export class DownsideTasukiGap extends BasePattern {
    constructor() { super(3); }
    protected predicate(b: OhlcView): boolean {
        const isFirstBearish = b.close(0) < b.open(0);
        const isSecondBearish = b.close(1) < b.open(1);
        const isThirdBullish = b.close(2) > b.open(2);
        const gap = b.high(1) < b.low(0);
        const tasuki = (b.open(1) > b.open(2))
            && (b.close(1) < b.open(2))
            && (b.close(2) > b.open(1))
            && (b.close(2) < b.close(0));
        return isFirstBearish && isSecondBearish && isThirdBullish && gap && tasuki;
    }
}

export class EveningStar extends BasePattern {
    constructor() { super(3); }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.open(0) + b.close(0)) / 2;
        const isFirstBullish = b.close(0) > b.open(0);
        const isSmallBody = (b.high(0) < b.low(1)) && (b.high(0) < b.high(1));
        const isThirdBearish = b.open(2) > b.close(2);
        const gap = (b.high(1) > b.high(0)) && (b.low(1) > b.high(0)) && (b.open(2) < b.low(1)) && (b.close(1) > b.open(2));
        const closesBelowMid = b.close(2) < mid;
        return isFirstBullish && isSmallBody && gap && isThirdBearish && closesBelowMid;
    }
}

export class EveningDojiStar extends BasePattern {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super(3);
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.open(0) + b.close(0)) / 2;
        const isFirstBullish = b.close(0) > b.open(0);
        const isMidDoji = approxEqual(b.open(1), b.close(1), this.precision)
            && approxEqual(b.open(1), b.high(1), this.precision)
                === approxEqual(b.close(1), b.low(1), this.precision);
        const isThirdBearish = b.open(2) > b.close(2);
        const gap = (b.high(1) > b.high(0)) && (b.low(1) > b.high(0)) && (b.open(2) < b.low(1)) && (b.close(1) > b.open(2));
        const closesBelowMid = b.close(2) < mid;
        return isFirstBullish && isMidDoji && gap && isThirdBearish && closesBelowMid;
    }
}

export class MorningStar extends BasePattern {
    constructor() { super(3); }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.open(0) + b.close(0)) / 2;
        const isFirstBearish = b.close(0) < b.open(0);
        const isSmallBody = (b.low(0) > b.low(1)) && (b.low(0) > b.high(1));
        const isThirdBullish = b.open(2) < b.close(2);
        const gap = (b.high(1) < b.low(0)) && (b.low(1) < b.low(0)) && (b.open(2) > b.high(1)) && (b.close(1) < b.open(2));
        const closesAboveMid = b.close(2) > mid;
        return isFirstBearish && isSmallBody && gap && isThirdBullish && closesAboveMid;
    }
}

export class MorningDojiStar extends BasePattern {
    private readonly precision: number;
    constructor(opts: { precision?: number } = {}) {
        super(3);
        this.precision = opts.precision ?? 0.001;
    }
    protected predicate(b: OhlcView): boolean {
        const mid = (b.open(0) + b.close(0)) / 2;
        const isFirstBearish = b.close(0) < b.open(0);
        const isMidDoji = approxEqual(b.open(1), b.close(1), this.precision)
            && approxEqual(b.open(1), b.high(1), this.precision)
                === approxEqual(b.close(1), b.low(1), this.precision);
        const isThirdBullish = b.open(2) < b.close(2);
        const gap = (b.high(1) < b.low(0)) && (b.low(1) < b.low(0)) && (b.open(2) > b.high(1)) && (b.close(1) < b.open(2));
        const closesAboveMid = b.close(2) > mid;
        return isFirstBearish && isMidDoji && isThirdBullish && gap && closesAboveMid;
    }
}

export class ThreeBlackCrows extends BasePattern {
    constructor() { super(3); }
    protected predicate(b: OhlcView): boolean {
        const isDownTrend = (b.low(0) > b.low(1)) && (b.low(1) > b.low(2));
        const isAllBearish = (b.open(0) > b.close(0)) && (b.open(1) > b.close(1)) && (b.open(2) > b.close(2));
        const opensWithinBody = (b.open(0) > b.open(1))
            && (b.open(1) > b.close(0))
            && (b.open(1) > b.open(2))
            && (b.open(2) > b.close(1));
        return isDownTrend && isAllBearish && opensWithinBody;
    }
}

export class ThreeWhiteSoldiers extends BasePattern {
    constructor() { super(3); }
    protected predicate(b: OhlcView): boolean {
        const isUpTrend = (b.high(1) > b.high(0)) && (b.high(2) > b.high(1));
        const isAllBullish = (b.open(0) < b.close(0)) && (b.open(1) < b.close(1)) && (b.open(2) < b.close(2));
        const opensWithinBody = (b.close(0) > b.open(1))
            && (b.open(1) < b.high(0))
            && (b.high(1) > b.open(2))
            && (b.open(2) < b.close(1));
        return isUpTrend && isAllBullish && opensWithinBody;
    }
}

// =====================================================================
// Five-bar patterns with confirmation candle + simple gain/loss
// trend filter.
// =====================================================================

export class HammerPattern extends BasePattern {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; confirm?: boolean } = {}) {
        super(5);
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
        this.confirm = opts.confirm ?? true;
    }
    protected predicate(b: OhlcView): boolean {
        const end = this.confirm ? 3 : 4;
        const { gains, losses } = gainLossSum(b, end);
        if (losses <= gains) return false;
        if (!this.includesHammer(b)) return false;
        return !this.confirm || (b.open(4) < b.close(4) && b.close(3) < b.close(4));
    }
    private includesHammer(b: OhlcView): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = b.open(idx), h = b.high(idx), l = b.low(idx), c = b.close(idx);
        const r = this.shadowToBodyRatio;
        const p = this.precision;
        return (
            (c > o && approxEqual(c, h, p) && (c - o) <= r * (o - l))
            || (o > c && approxEqual(o, h, p) && (o - c) <= r * (c - l))
            || (c > o && approxEqual(o, l, p) && (c - o) <= r * (h - c))
            || (o > c && approxEqual(c, l, p) && (o - c) <= r * (h - o))
        );
    }
}

export class HammerPatternUnconfirmed extends HammerPattern {
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super({ ...opts, confirm: false });
    }
}

export class HangingMan extends BasePattern {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; confirm?: boolean } = {}) {
        super(5);
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
        this.confirm = opts.confirm ?? true;
    }
    protected predicate(b: OhlcView): boolean {
        const end = this.confirm ? 3 : 4;
        const { gains, losses } = gainLossSum(b, end);
        if (gains <= losses) return false;
        if (!this.includesHammer(b)) return false;
        return !this.confirm || (b.open(4) > b.close(4) && b.close(3) > b.close(4));
    }
    private includesHammer(b: OhlcView): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = b.open(idx), h = b.high(idx), l = b.low(idx), c = b.close(idx);
        const r = this.shadowToBodyRatio;
        const p = this.precision;
        return (
            (c > o && approxEqual(c, h, p) && (c - o) <= r * (o - l))
            || (o > c && approxEqual(o, h, p) && (o - c) <= r * (c - l))
        );
    }
}

export class HangingManUnconfirmed extends HangingMan {
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super({ ...opts, confirm: false });
    }
}

export class ShootingStar extends BasePattern {
    private readonly precision: number;
    private readonly shadowToBodyRatio: number;
    private readonly confirm: boolean;

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; confirm?: boolean } = {}) {
        super(5);
        this.precision = opts.precision ?? 0.001;
        this.shadowToBodyRatio = opts.shadowToBodyRatio ?? 2;
        this.confirm = opts.confirm ?? true;
    }
    protected predicate(b: OhlcView): boolean {
        const end = this.confirm ? 3 : 4;
        const { gains, losses } = gainLossSum(b, end);
        if (gains <= losses) return false;
        if (!this.includesInverted(b)) return false;
        return !this.confirm || (b.open(4) > b.close(4) && b.close(3) > b.close(4));
    }
    private includesInverted(b: OhlcView): boolean {
        const idx = this.confirm ? 3 : 4;
        const o = b.open(idx), h = b.high(idx), l = b.low(idx), c = b.close(idx);
        const r = this.shadowToBodyRatio;
        const p = this.precision;
        return (
            (c > o && approxEqual(o, l, p) && (c - o) <= r * (h - c))
            || (o > c && approxEqual(c, l, p) && (o - c) <= r * (h - o))
        );
    }
}

export class ShootingStarUnconfirmed extends ShootingStar {
    constructor(opts: { precision?: number; shadowToBodyRatio?: number } = {}) {
        super({ ...opts, confirm: false });
    }
}

export class TweezerBottom extends BasePattern {
    private readonly equalityTolerance: number;
    constructor(opts: { equalityTolerance?: number } = {}) {
        super(5);
        this.equalityTolerance = opts.equalityTolerance ?? 0;
    }
    protected predicate(b: OhlcView): boolean {
        const { gains, losses } = gainLossSum(b, 3);
        const isDownTrend = losses > gains;
        const lowsEqual = Math.abs(b.low(3) - b.low(4)) <= this.equalityTolerance;
        return isDownTrend && lowsEqual;
    }
}

export class TweezerTop extends BasePattern {
    private readonly equalityTolerance: number;
    constructor(opts: { equalityTolerance?: number } = {}) {
        super(5);
        this.equalityTolerance = opts.equalityTolerance ?? 0;
    }
    protected predicate(b: OhlcView): boolean {
        const { gains, losses } = gainLossSum(b, 3);
        const isUpTrend = gains > losses;
        const highsEqual = Math.abs(b.high(3) - b.high(4)) <= this.equalityTolerance;
        return isUpTrend && highsEqual;
    }
}
