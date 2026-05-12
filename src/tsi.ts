import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * True Strength Index (TSI)
 *
 * A momentum oscillator built on double-smoothed price changes.
 * Formula:
 *   pc       = close - prevClose
 *   tsi      = 100 * EMA(EMA(pc, longLen), shortLen) / EMA(EMA(|pc|, longLen), shortLen)
 *   signal   = EMA(tsi, signalLen)
 *
 * Defaults follow the LWC convention: longLen=25, shortLen=13, signalLen=13.
 */
export class TSI  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private pcLong: EMA;
    private pcShort: EMA;
    private absLong: EMA;
    private absShort: EMA;
    private signalEma: EMA;

    constructor(longLength = 25, shortLength = 13, signalLength = 13) {
        this.pcLong = new EMA(longLength);
        this.pcShort = new EMA(shortLength);
        this.absLong = new EMA(longLength);
        this.absShort = new EMA(shortLength);
        this.signalEma = new EMA(signalLength);
    }

    nextValue(close: number) {
        if (this.prevClose === undefined) {
            this.prevClose = close;
            return;
        }

        const pc = close - this.prevClose;
        this.prevClose = close;

        const pcLongVal = this.pcLong.nextValue(pc);
        const absLongVal = this.absLong.nextValue(Math.abs(pc));

        if (pcLongVal === undefined || absLongVal === undefined) {
            return;
        }

        const pcShortVal = this.pcShort.nextValue(pcLongVal);
        const absShortVal = this.absShort.nextValue(absLongVal);

        if (pcShortVal === undefined || absShortVal === undefined) {
            return;
        }

        const tsi = absShortVal === 0 ? 0 : (100 * pcShortVal) / absShortVal;
        const signal = this.signalEma.nextValue(tsi);

        return { tsi, signal };
    }

    momentValue(close: number) {
        if (this.prevClose === undefined) {
            return;
        }

        const pc = close - this.prevClose;

        const pcLongVal = this.pcLong.momentValue(pc);
        const absLongVal = this.absLong.momentValue(Math.abs(pc));

        if (pcLongVal === undefined || absLongVal === undefined) {
            return;
        }

        const pcShortVal = this.pcShort.momentValue(pcLongVal);
        const absShortVal = this.absShort.momentValue(absLongVal);

        if (pcShortVal === undefined || absShortVal === undefined) {
            return;
        }

        const tsi = absShortVal === 0 ? 0 : (100 * pcShortVal) / absShortVal;
        const signal = this.signalEma.momentValue(tsi);

        return { tsi, signal };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
