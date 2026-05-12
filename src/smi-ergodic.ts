import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * SMI Ergodic Indicator
 *
 *   pc     = close - prevClose
 *   smi    = EMA(EMA(pc, longLen), shortLen) / EMA(EMA(|pc|, longLen), shortLen)
 *   signal = EMA(smi, signalLen)
 *
 * Identical to TSI in formula except SMI Ergodic returns the raw ratio
 * (no 100x scaling). Defaults follow LWC: long=20, short=5, signal=5.
 */
export class SMIErgodic  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private pcLong: EMA;
    private pcShort: EMA;
    private absLong: EMA;
    private absShort: EMA;
    private signalEma: EMA;

    constructor(longLength = 20, shortLength = 5, signalLength = 5) {
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

        const pcL = this.pcLong.nextValue(pc);
        const absL = this.absLong.nextValue(Math.abs(pc));
        if (pcL === undefined || absL === undefined) return;

        const pcS = this.pcShort.nextValue(pcL);
        const absS = this.absShort.nextValue(absL);
        if (pcS === undefined || absS === undefined) return;

        const smi = absS === 0 ? 0 : pcS / absS;
        const signal = this.signalEma.nextValue(smi);
        return { smi, signal };
    }

    momentValue(close: number) {
        if (this.prevClose === undefined) return;
        const pc = close - this.prevClose;

        const pcL = this.pcLong.momentValue(pc);
        const absL = this.absLong.momentValue(Math.abs(pc));
        if (pcL === undefined || absL === undefined) return;

        const pcS = this.pcShort.momentValue(pcL);
        const absS = this.absShort.momentValue(absL);
        if (pcS === undefined || absS === undefined) return;

        const smi = absS === 0 ? 0 : pcS / absS;
        const signal = this.signalEma.momentValue(smi);
        return { smi, signal };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
