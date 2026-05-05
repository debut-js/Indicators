import { EMA } from './ema';

/**
 * Klinger Oscillator (KVO)
 *
 *   sv     = change(hlc3) >= 0 ? volume : -volume     // first bar's "change" is treated as 0 → +volume
 *   kvo    = EMA(sv, fastLength) - EMA(sv, slowLength)
 *   signal = EMA(kvo, signalLength)
 *
 * Defaults: fast=34, slow=55, signal=13.
 */
export class Klinger {
    private prevHlc3: number | undefined;
    private fastEma: EMA;
    private slowEma: EMA;
    private signalEma: EMA;

    constructor(fastLength = 34, slowLength = 55, signalLength = 13) {
        this.fastEma = new EMA(fastLength);
        this.slowEma = new EMA(slowLength);
        this.signalEma = new EMA(signalLength);
    }

    nextValue(high: number, low: number, close: number, volume: number) {
        const hlc3 = (high + low + close) / 3;
        // First-bar nuance: the LWC klinger reference checks
        // `change === null`, which is `false` for the JS `NaN`
        // returned by `ta.change`. The else branch then evaluates
        // `NaN >= 0` (also false) and pushes `-volume`. Mirror that
        // behaviour so the EMA seeds line up exactly.
        const isFirst = this.prevHlc3 === undefined;
        const change = isFirst ? NaN : hlc3 - this.prevHlc3;
        this.prevHlc3 = hlc3;
        const sv = !isFirst && change >= 0 ? volume : -volume;

        const fast = this.fastEma.nextValue(sv);
        const slow = this.slowEma.nextValue(sv);
        if (fast === undefined || slow === undefined) return;

        const kvo = fast - slow;
        const signal = this.signalEma.nextValue(kvo);
        return { kvo, signal };
    }

    momentValue(high: number, low: number, close: number, volume: number) {
        const hlc3 = (high + low + close) / 3;
        const isFirst = this.prevHlc3 === undefined;
        const change = isFirst ? NaN : hlc3 - this.prevHlc3;
        const sv = !isFirst && change >= 0 ? volume : -volume;

        const fast = this.fastEma.momentValue(sv);
        const slow = this.slowEma.momentValue(sv);
        if (fast === undefined || slow === undefined) return;

        const kvo = fast - slow;
        const signal = this.signalEma.momentValue(kvo);
        return { kvo, signal };
    }
}
