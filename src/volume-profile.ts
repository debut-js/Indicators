import { OptionalNumberState, StatefulIndicator, dumpOptionalNumber, restoreOptionalNumber } from './stateful-indicator';

/**
 * Volume Profile — distribution of traded volume across price levels
 * over a session.
 *
 * Each incoming candle's volume is allocated to one or more price
 * "rows" (bins of size `tickSize`); aggregating those rows over a
 * session yields a histogram. From that histogram three classical
 * measurements are derived:
 *
 *   - **POC** (Point of Control) — the row with the largest volume.
 *   - **VAH / VAL** (Value Area High / Low) — bounds of the
 *     contiguous price range around the POC that holds
 *     `valueAreaPercent` of the session's total volume (default 70%).
 *
 * Algorithm for VAH / VAL ("expand from POC"):
 *   1. Start with `cumulative = volume(POC)`.
 *   2. Look one row above and one row below the current envelope.
 *   3. Add whichever side has the larger row volume; advance that
 *      side's pointer.
 *   4. Repeat until `cumulative >= total * valueAreaPercent`.
 *   5. The envelope's upper edge is VAH, lower edge is VAL.
 *
 * **Session anchoring** controls when the histogram resets. Default
 * is `'daily'` so a long-running stream cannot accidentally grow
 * the row map without bound.
 *   - `'daily'` *(default)* — resets at UTC-day boundary, using
 *     `candle.time` (interpreted as ms since epoch). Pass an explicit
 *     `'continuous'` if you want the histogram to accumulate forever
 *     and reset only via `vp.reset()`.
 *   - `'weekly'` — same shape as `'daily'`, period is 7 days (UTC).
 *   - `'continuous'` — never resets automatically. Suitable for
 *     short, bounded backtests; for live streams call `vp.reset()`
 *     yourself at session boundaries.
 *   - `{ lookback: N }` — keeps a rolling window of the last `N`
 *     candles; bars older than the window are subtracted out as
 *     new bars arrive.
 *
 * **Volume distribution** controls how a single candle's volume is
 * allocated across rows in `[candle.low, candle.high]`:
 *   - `'uniform'` (default) — spread evenly across every row the
 *     candle's range touches. Most accurate when ticks are dense.
 *   - `'typical'` — concentrate at the typical price `(h + l + c) / 3`.
 *   - `'close'` — concentrate at the closing price.
 *
 * **Performance.** The hot path (`nextValue`) is
 * `O(rowsPerCandle · log N)`: each affected row is updated in the
 * `Map` (O(1)) and inserted/removed from the sorted-index array via
 * binary search (O(log N) lookup + O(N) splice; for typical
 * histograms with a few hundred rows this is microseconds).
 *
 * The POC is tracked incrementally — additive updates compare the
 * new row volume against the running max in O(1). Subtractive
 * updates (only used in `lookback` sessions) mark the POC dirty so
 * a single O(N) re-scan happens at the next query when needed.
 *
 * Getters:
 *   - `poc()`   — O(1) when clean, O(N) once after a relevant subtract.
 *   - `profile()` — O(N) (no re-sort, returns rows in committed order).
 *   - `valueArea()` — O(M) where M = rows inside the value area; walks
 *     two pointers outward from the POC across the sorted index.
 *
 * `momentValue(candle)` previews POC / VAH / VAL for a hypothetical
 * close without committing state. Implementation: commit the bar,
 * snapshot the metrics, then revert via the symmetric subtract path.
 * Cost is `2 × nextValue` (~constant relative to row count).
 */

export type Candle = {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    time: number;
};

export type VolumeProfileSession = 'continuous' | 'daily' | 'weekly' | { lookback: number };
export type VolumeProfileDistribution = 'uniform' | 'typical' | 'close';

export interface VolumeProfileOptions {
    /** Row size in price units (default `1`). Smaller = finer histogram, more rows. */
    tickSize?: number;
    /** Fraction of total volume that defines the Value Area (default `0.7`). */
    valueAreaPercent?: number;
    /** How a candle's volume is allocated across price rows (default `'uniform'`). */
    distribution?: VolumeProfileDistribution;
    /** Session boundary policy (default `'daily'` so unbounded
     *  streams can't grow the histogram forever). */
    session?: VolumeProfileSession;
}

export interface VolumeProfileRow {
    /** Lower edge of the row in price units (row covers `[price, price + tickSize)`). */
    price: number;
    volume: number;
}

export interface VolumeProfileSnapshot {
    poc: number | undefined;
    val: number | undefined;
    vah: number | undefined;
    total: number;
}

export interface VolumeProfileState {
    tickSize: number;
    valueAreaPercent: number;
    distribution: VolumeProfileDistribution;
    session: VolumeProfileSession;
    lookback: OptionalNumberState;
    rows: Array<[number, number]>;
    sortedIdx: number[];
    total: number;
    sessionStartMs: OptionalNumberState;
    pocIdx: OptionalNumberState;
    pocVol: number;
    pocDirty: boolean;
    history: Candle[];
}

const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export class VolumeProfile implements StatefulIndicator<VolumeProfileState> {
    private readonly tickSize: number;
    private readonly valueAreaPercent: number;
    private readonly distribution: VolumeProfileDistribution;
    private readonly session: VolumeProfileSession;
    private readonly lookback: number | undefined;

    private rows = new Map<number, number>();
    private sortedIdx: number[] = [];          // populated row indices, ascending
    private total = 0;
    private sessionStartMs: number | undefined;

    /** Committed POC (incrementally maintained). */
    private pocIdx: number | undefined;
    private pocVol = 0;
    private pocDirty = false;                  // set when a subtract may have lowered the POC

    /** Rolling-window history (only used when `session = { lookback }`). */
    private history: Candle[] = [];

    constructor(opts: VolumeProfileOptions = {}) {
        this.tickSize = opts.tickSize ?? 1;
        if (this.tickSize <= 0) throw new Error('tickSize must be > 0');
        this.valueAreaPercent = opts.valueAreaPercent ?? 0.7;
        if (this.valueAreaPercent <= 0 || this.valueAreaPercent > 1) {
            throw new Error('valueAreaPercent must be in (0, 1]');
        }
        this.distribution = opts.distribution ?? 'uniform';
        this.session = opts.session ?? 'daily';
        if (typeof this.session === 'object' && 'lookback' in this.session) {
            this.lookback = this.session.lookback;
            if (this.lookback <= 0) throw new Error('lookback must be > 0');
        }
    }

    /**
     * Feed one candle into the profile (commits state). Handles
     * session boundaries automatically (resets on day / week boundary
     * or evicts the oldest bar from the rolling window).
     *
     * Returns the post-commit snapshot so callers can avoid a
     * follow-up `poc()` / `valueArea()` query in the hot path.
     */
    nextValue(candle: Candle): VolumeProfileSnapshot {
        if (this.shouldReset(candle.time)) {
            this.reset();
        }
        if (this.sessionStartMs === undefined) {
            this.sessionStartMs = candle.time;
        }

        if (this.lookback !== undefined) {
            this.history.push(candle);
            if (this.history.length > this.lookback) {
                const evicted = this.history.shift() as Candle;
                this.subtract(evicted);
            }
        }
        this.add(candle);
        return this.snapshot();
    }

    /**
     * Preview the snapshot for a hypothetical bar without committing
     * state. Implementation: commit, snapshot, revert. Net mutation
     * is zero (modulo float rounding noise of order 1e-12, which the
     * subtract path clamps).
     */
    momentValue(candle: Candle): VolumeProfileSnapshot {
        if (this.shouldReset(candle.time)) {
            // A reset would discard everything anyway; the
            // hypothetical post-reset snapshot is whatever this single
            // candle would produce on a fresh profile.
            const tmp = new VolumeProfile({
                tickSize: this.tickSize,
                valueAreaPercent: this.valueAreaPercent,
                distribution: this.distribution,
                session: 'continuous',
            });
            tmp.add(candle);
            return tmp.snapshot();
        }

        // Save & restore the lookback-eviction state so revert is exact.
        let evicted: Candle | undefined;
        let savedSessionStart: number | undefined;
        if (this.sessionStartMs === undefined) {
            savedSessionStart = undefined;
            this.sessionStartMs = candle.time;
        } else {
            savedSessionStart = this.sessionStartMs;
        }

        if (this.lookback !== undefined && this.history.length >= this.lookback) {
            evicted = this.history[0];
            this.subtract(evicted);
        }
        this.add(candle);

        const snap = this.snapshot();

        // Revert.
        this.subtract(candle);
        if (evicted !== undefined) this.add(evicted);
        this.sessionStartMs = savedSessionStart;

        return snap;
    }

    /** Force a session reset (clears all rows). */
    reset(): void {
        this.rows.clear();
        this.sortedIdx = [];
        this.total = 0;
        this.pocIdx = undefined;
        this.pocVol = 0;
        this.pocDirty = false;
        this.sessionStartMs = undefined;
        this.history = [];
    }

    dumpState(): VolumeProfileState {
        return {
            tickSize: this.tickSize,
            valueAreaPercent: this.valueAreaPercent,
            distribution: this.distribution,
            session: this.session,
            lookback: dumpOptionalNumber(this.lookback),
            rows: Array.from(this.rows.entries()),
            sortedIdx: this.sortedIdx.slice(),
            total: this.total,
            sessionStartMs: dumpOptionalNumber(this.sessionStartMs),
            pocIdx: dumpOptionalNumber(this.pocIdx),
            pocVol: this.pocVol,
            pocDirty: this.pocDirty,
            history: this.history.map((candle: Candle): Candle => ({ ...candle })),
        };
    }

    restoreState(state: VolumeProfileState): this {
        if (state.tickSize !== this.tickSize) {
            throw new Error(`VolumeProfile tickSize mismatch: expected ${this.tickSize}, got ${state.tickSize}`);
        }
        if (state.valueAreaPercent !== this.valueAreaPercent) {
            throw new Error(
                `VolumeProfile valueAreaPercent mismatch: expected ${this.valueAreaPercent}, got ${state.valueAreaPercent}`,
            );
        }
        if (state.distribution !== this.distribution) {
            throw new Error(`VolumeProfile distribution mismatch: expected ${this.distribution}, got ${state.distribution}`);
        }

        this.rows = new Map<number, number>(state.rows);
        this.sortedIdx = state.sortedIdx.slice();
        this.total = state.total;
        this.sessionStartMs = restoreOptionalNumber(state.sessionStartMs);
        this.pocIdx = restoreOptionalNumber(state.pocIdx);
        this.pocVol = state.pocVol;
        this.pocDirty = state.pocDirty;
        this.history = state.history.map((candle: Candle): Candle => ({ ...candle }));

        return this;
    }

    /** Total volume aggregated in the current session. */
    totalVolume(): number {
        return this.total;
    }

    /** Time (ms) at which the current session started, or `undefined` if empty. */
    sessionStart(): number | undefined {
        return this.sessionStartMs;
    }

    /**
     * Histogram rows sorted by price ascending. Each row's `price`
     * is the lower edge of a `[price, price + tickSize)` bucket.
     * O(N), no allocation beyond the returned array.
     */
    profile(): VolumeProfileRow[] {
        const out: VolumeProfileRow[] = new Array(this.sortedIdx.length);
        for (let i = 0; i < this.sortedIdx.length; i++) {
            const idx = this.sortedIdx[i];
            out[i] = { price: this.priceFromIndex(idx), volume: this.rows.get(idx) as number };
        }
        return out;
    }

    /** Price of the row with the highest volume (Point of Control). */
    poc(): number | undefined {
        const idx = this.resolvePocIndex();
        return idx === undefined ? undefined : this.priceFromIndex(idx);
    }

    /** Lower / upper bounds of the Value Area around the POC. */
    valueArea(): { val: number; vah: number } | undefined {
        const pocIdx = this.resolvePocIndex();
        if (pocIdx === undefined || this.total === 0) return undefined;

        // Locate the POC in the sorted-index array. Binary search.
        const pocPos = this.sortedIdxLookup(pocIdx);
        const target = this.total * this.valueAreaPercent;
        const sorted = this.sortedIdx;

        let lo = pocPos;
        let hi = pocPos;
        let cumulative = this.rows.get(sorted[pocPos]) as number;

        while (cumulative < target) {
            const above = hi + 1 < sorted.length ? (this.rows.get(sorted[hi + 1]) as number) : 0;
            const below = lo > 0 ? (this.rows.get(sorted[lo - 1]) as number) : 0;
            if (above === 0 && below === 0) break;
            if (above >= below) {
                hi++;
                cumulative += above;
            } else {
                lo--;
                cumulative += below;
            }
        }

        return {
            val: this.priceFromIndex(sorted[lo]),
            vah: this.priceFromIndex(sorted[hi]) + this.tickSize,
        };
    }

    /** Value Area High (price). */
    vah(): number | undefined {
        return this.valueArea()?.vah;
    }

    /** Value Area Low (price). */
    val(): number | undefined {
        return this.valueArea()?.val;
    }

    /** Combined snapshot of every published metric (one O(N) pass). */
    snapshot(): VolumeProfileSnapshot {
        const va = this.valueArea();
        const idx = this.pocIdx;
        return {
            poc: idx === undefined ? undefined : this.priceFromIndex(idx),
            val: va?.val,
            vah: va?.vah,
            total: this.total,
        };
    }

    // ---- internals ---------------------------------------------------

    private shouldReset(timeMs: number): boolean {
        if (this.session === 'continuous') return false;
        if (typeof this.session === 'object') return false; // lookback handled per-bar
        if (this.sessionStartMs === undefined) return false;
        const period = this.session === 'daily' ? MS_PER_DAY : MS_PER_WEEK;
        return Math.floor(timeMs / period) !== Math.floor(this.sessionStartMs / period);
    }

    private add(candle: Candle): void {
        if (candle.v === 0) return;
        if (this.distribution === 'typical') {
            this.allocateIndex(this.indexFromPrice((candle.h + candle.l + candle.c) / 3), candle.v);
            return;
        }
        if (this.distribution === 'close') {
            this.allocateIndex(this.indexFromPrice(candle.c), candle.v);
            return;
        }
        // 'uniform': spread across every row touched by [low, high].
        const loIdx = this.indexFromPrice(candle.l);
        const hiIdx = this.indexFromPrice(candle.h);
        const span = hiIdx - loIdx + 1;
        if (span <= 1) {
            this.allocateIndex(loIdx, candle.v);
            return;
        }
        const per = candle.v / span;
        for (let idx = loIdx; idx <= hiIdx; idx++) this.allocateIndex(idx, per);
    }

    private subtract(candle: Candle): void {
        if (candle.v === 0) return;
        if (this.distribution === 'typical') {
            this.deallocateIndex(this.indexFromPrice((candle.h + candle.l + candle.c) / 3), candle.v);
            return;
        }
        if (this.distribution === 'close') {
            this.deallocateIndex(this.indexFromPrice(candle.c), candle.v);
            return;
        }
        const loIdx = this.indexFromPrice(candle.l);
        const hiIdx = this.indexFromPrice(candle.h);
        const span = hiIdx - loIdx + 1;
        if (span <= 1) {
            this.deallocateIndex(loIdx, candle.v);
            return;
        }
        const per = candle.v / span;
        for (let idx = loIdx; idx <= hiIdx; idx++) this.deallocateIndex(idx, per);
    }

    private allocateIndex(idx: number, volume: number): void {
        const cur = this.rows.get(idx);
        if (cur === undefined) {
            this.rows.set(idx, volume);
            this.sortedIdxInsert(idx);
        } else {
            this.rows.set(idx, cur + volume);
        }
        this.total += volume;

        // Incrementally maintain the POC for the additive case.
        const newVol = (cur ?? 0) + volume;
        if (this.pocIdx === undefined) {
            this.pocIdx = idx;
            this.pocVol = newVol;
        } else if (newVol > this.pocVol) {
            this.pocIdx = idx;
            this.pocVol = newVol;
        } else if (newVol === this.pocVol && idx < this.pocIdx) {
            // Tie-break: smaller index wins.
            this.pocIdx = idx;
        }
    }

    private deallocateIndex(idx: number, volume: number): void {
        const cur = this.rows.get(idx);
        if (cur === undefined) return; // nothing to subtract from
        const next = cur - volume;
        if (next <= 1e-12) {
            this.rows.delete(idx);
            this.sortedIdxRemove(idx);
            if (idx === this.pocIdx) {
                // The POC row vanished entirely — find a new one.
                this.pocIdx = undefined;
                this.pocVol = 0;
                this.pocDirty = true;
            }
        } else {
            this.rows.set(idx, next);
            if (idx === this.pocIdx) {
                this.pocVol = next;
                // Volume at the POC dropped — some other row may now
                // be the maximum. Rescan lazily on next query.
                this.pocDirty = true;
            }
        }
        this.total = Math.max(0, this.total - volume);
    }

    private resolvePocIndex(): number | undefined {
        if (this.pocDirty) {
            this.recomputePoc();
            this.pocDirty = false;
        }
        return this.pocIdx;
    }

    private recomputePoc(): void {
        let bestIdx: number | undefined;
        let best = -Infinity;
        // Walk sortedIdx (ascending) — first occurrence of the max is
        // also the smallest-index tied row, which matches our tie-break.
        for (let i = 0; i < this.sortedIdx.length; i++) {
            const idx = this.sortedIdx[i];
            const vol = this.rows.get(idx) as number;
            if (vol > best) {
                best = vol;
                bestIdx = idx;
            }
        }
        this.pocIdx = bestIdx;
        this.pocVol = bestIdx === undefined ? 0 : best;
    }

    private indexFromPrice(price: number): number {
        return Math.floor(price / this.tickSize);
    }

    private priceFromIndex(idx: number): number {
        // Multiply then round to absorb tiny FP drift introduced by
        // tickSize values like 0.1 / 0.05 that aren't exactly representable.
        const raw = idx * this.tickSize;
        return Math.round(raw * 1e12) / 1e12;
    }

    /** Binary search insertion point for `idx` in `sortedIdx` (lower-bound). */
    private sortedIdxLookup(idx: number): number {
        let lo = 0;
        let hi = this.sortedIdx.length;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (this.sortedIdx[mid] < idx) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    private sortedIdxInsert(idx: number): void {
        const pos = this.sortedIdxLookup(idx);
        // Splice insert. For typical row counts (≤ a few hundred), the
        // O(N) shift cost is negligible; if profiles ever balloon to
        // tens of thousands of rows this would be the place to swap
        // in a balanced BST or skip-list.
        this.sortedIdx.splice(pos, 0, idx);
    }

    private sortedIdxRemove(idx: number): void {
        const pos = this.sortedIdxLookup(idx);
        if (this.sortedIdx[pos] === idx) this.sortedIdx.splice(pos, 1);
    }
}
