import { ROC } from './roc';
import { WMA } from './wma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Coppock Curve
 *
 *   curve = WMA(ROC(close, longRoc) + ROC(close, shortRoc), wmaLength)
 *
 * Long-cycle momentum oscillator, traditionally used on monthly bars
 * to identify major bottoms (rising-from-below-zero crossovers).
 *
 * Defaults follow LWC: wmaLength=10, longRoc=14, shortRoc=11.
 */
export class CoppockCurve  implements StatefulIndicator<GenericIndicatorState> {
    private rocLong: ROC;
    private rocShort: ROC;
    private wma: WMA;

    constructor(wmaLength = 10, longRoc = 14, shortRoc = 11) {
        this.rocLong = new ROC(longRoc);
        this.rocShort = new ROC(shortRoc);
        this.wma = new WMA(wmaLength);
    }

    nextValue(value: number) {
        const long = this.rocLong.nextValue(value);
        const short = this.rocShort.nextValue(value);
        if (long === undefined || short === undefined) return;
        return this.wma.nextValue(long + short);
    }

    momentValue(value: number) {
        const long = this.rocLong.momentValue(value);
        const short = this.rocShort.momentValue(value);
        if (long === undefined || short === undefined) return;
        return this.wma.momentValue(long + short);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
