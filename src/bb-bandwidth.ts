import { BollingerBands } from './bands';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Bollinger BandWidth
 *
 *   BBW = ((upper - lower) / basis) * 100
 *
 * Reads the spread between the bands relative to the basis (SMA). Useful
 * for detecting volatility squeezes and expansions. Returns `undefined`
 * during BB warmup and when the basis is zero.
 */
export class BBBandWidth  implements StatefulIndicator<GenericIndicatorState> {
    private bb: BollingerBands;

    constructor(period = 20, stdDev = 2) {
        this.bb = new BollingerBands(period, stdDev);
    }

    nextValue(price: number) {
        const bb = this.bb.nextValue(price);
        if (!bb || bb.middle === 0) return;
        return ((bb.upper - bb.lower) / bb.middle) * 100;
    }

    momentValue(price: number) {
        const bb = this.bb.momentValue(price);
        if (!bb || bb.middle === 0) return;
        return ((bb.upper - bb.lower) / bb.middle) * 100;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
