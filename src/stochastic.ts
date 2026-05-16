import { SMA } from './sma';
import { MaxProvider } from './providers/max-value';
import { MinProvider } from './providers/min-value';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * A stochastic oscillator is a momentum indicator comparing a particular closing price
 * of a security to a range of its prices over a certain period of time.
 * The sensitivity of the oscillator to market movements is reducible by adjusting that
 * time period or by taking a moving average of the result.
 * It is used to generate overbought and oversold trading signals,
 * utilizing a 0-100 bounded range of values.
 */
export class Stochastic  implements StatefulIndicator<GenericIndicatorState> {
    private max: MaxProvider;
    private min: MinProvider;
    private sma: SMA;

    constructor(private period: number = 14, private smaPeriod: number = 3) {
        this.sma = new SMA(this.smaPeriod);
        this.max = new MaxProvider(period);
        this.min = new MinProvider(period);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(high: number, low: number, close: number): { k: number; d: number } | undefined {
        const max = this.max.nextValue(high);
        const min = this.min.nextValue(low);

        if (!this.max.filled()) {
            return;
        }

        const k: number = ((close - min) / (max - min)) * 100;
        const d = this.sma.nextValue(k);
        if (d === undefined) {
            return;
        }

        return { k, d };
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(high: number, low: number, close: number): { k: number; d: number } | undefined {
        if (!this.max.filled()) {
            return;
        }

        const max = this.max.momentValue(high);
        const min = this.min.momentValue(low);

        const k: number = ((close - min) / (max - min)) * 100;
        const d = this.sma.momentValue(k);
        if (d === undefined) {
            return;
        }

        return { k, d };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
