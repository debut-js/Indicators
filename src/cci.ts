import { SMA } from './sma';
import { MeanDeviationProvider } from './providers/mean-deviation';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * The CCI, or Commodity Channel Index, was developed by Donald Lambert,
 * a technical analyst who originally published the indicator in Commodities magazine (now Futures)
 * in 1980.1 Despite its name, the CCI can be used in any market and is not just for commodities
 */
export class CCI  implements StatefulIndicator<GenericIndicatorState> {
    private md: MeanDeviationProvider;
    private sma: SMA;

    constructor(period = 20) {
        this.md = new MeanDeviationProvider(period);
        this.sma = new SMA(period);
    }

    nextValue(high: number, low: number, close: number) {
        const typicalPrice = (high + low + close) / 3;
        const average = this.sma.nextValue(typicalPrice);
        const meanDeviation = this.md.nextValue(typicalPrice, average);

        return meanDeviation && (typicalPrice - average) / (0.015 * meanDeviation);
    }

    momentValue(high: number, low: number, close: number) {
        const typicalPrice = (high + low + close) / 3;
        const average = this.sma.momentValue(typicalPrice);
        const meanDeviation = this.md.momentValue(typicalPrice, average);

        return meanDeviation && (typicalPrice - average) / (0.015 * meanDeviation);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
