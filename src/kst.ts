import { ROC } from './roc';
import { SMA } from './sma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Know Sure Thing (KST)
 *
 *   smaroc(rocLen, smaLen) = SMA(ROC(close, rocLen), smaLen)
 *   kst    = smaroc1 + 2*smaroc2 + 3*smaroc3 + 4*smaroc4
 *   signal = SMA(kst, signalLength)
 *
 * Defaults follow LWC: rocLen={10,15,20,30}, smaLen={10,10,10,15}, signal=9.
 */
export class KST  implements StatefulIndicator<GenericIndicatorState> {
    private roc1: ROC;
    private roc2: ROC;
    private roc3: ROC;
    private roc4: ROC;
    private sma1: SMA;
    private sma2: SMA;
    private sma3: SMA;
    private sma4: SMA;
    private signalSma: SMA;

    constructor(
        rocLen1 = 10,
        rocLen2 = 15,
        rocLen3 = 20,
        rocLen4 = 30,
        smaLen1 = 10,
        smaLen2 = 10,
        smaLen3 = 10,
        smaLen4 = 15,
        signalLength = 9,
    ) {
        this.roc1 = new ROC(rocLen1);
        this.roc2 = new ROC(rocLen2);
        this.roc3 = new ROC(rocLen3);
        this.roc4 = new ROC(rocLen4);
        this.sma1 = new SMA(smaLen1);
        this.sma2 = new SMA(smaLen2);
        this.sma3 = new SMA(smaLen3);
        this.sma4 = new SMA(smaLen4);
        this.signalSma = new SMA(signalLength);
    }

    nextValue(value: number) {
        const r1 = this.roc1.nextValue(value);
        const r2 = this.roc2.nextValue(value);
        const r3 = this.roc3.nextValue(value);
        const r4 = this.roc4.nextValue(value);

        // Each inner SMA must be fed when its ROC has a value, otherwise
        // the streaming SMA would advance past warmup before its own
        // upstream is ready.
        const s1 = r1 === undefined ? undefined : this.sma1.nextValue(r1);
        const s2 = r2 === undefined ? undefined : this.sma2.nextValue(r2);
        const s3 = r3 === undefined ? undefined : this.sma3.nextValue(r3);
        const s4 = r4 === undefined ? undefined : this.sma4.nextValue(r4);

        if (s1 === undefined || s2 === undefined || s3 === undefined || s4 === undefined) {
            return;
        }

        const kst = s1 + 2 * s2 + 3 * s3 + 4 * s4;
        const signal = this.signalSma.nextValue(kst);
        return { kst, signal };
    }

    momentValue(value: number) {
        const r1 = this.roc1.momentValue(value);
        const r2 = this.roc2.momentValue(value);
        const r3 = this.roc3.momentValue(value);
        const r4 = this.roc4.momentValue(value);

        const s1 = r1 === undefined ? undefined : this.sma1.momentValue(r1);
        const s2 = r2 === undefined ? undefined : this.sma2.momentValue(r2);
        const s3 = r3 === undefined ? undefined : this.sma3.momentValue(r3);
        const s4 = r4 === undefined ? undefined : this.sma4.momentValue(r4);

        if (s1 === undefined || s2 === undefined || s3 === undefined || s4 === undefined) {
            return;
        }

        const kst = s1 + 2 * s2 + 3 * s3 + 4 * s4;
        const signal = this.signalSma.momentValue(kst);
        return { kst, signal };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
