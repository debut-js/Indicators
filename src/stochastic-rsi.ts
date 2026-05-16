import { SMA } from './sma';
import { MaxProvider } from './providers/max-value';
import { MinProvider } from './providers/min-value';
import { RSI } from './rsi';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Developed by Tushar Chande and Stanley Kroll, StochRSI is an oscillator that measures the level of RSI relative
 * to its high-low range over a set time period. StochRSI applies the Stochastics formula to RSI values, rather
 * than price values, making it an indicator of an indicator. The result is an oscillator that
 * fluctuates between 0 and 1.
 */
export class StochasticRSI  implements StatefulIndicator<GenericIndicatorState> {
    private max: MaxProvider;
    private min: MinProvider;
    private rsi: RSI;
    private sma1: SMA;
    private sma2: SMA;

    constructor(rsiPeriod = 14, kPeriod = 3, dPeriod = 3, stochPeriod = 14) {
        this.rsi = new RSI(rsiPeriod);
        this.sma1 = new SMA(kPeriod);
        this.sma2 = new SMA(dPeriod);
        this.max = new MaxProvider(stochPeriod);
        this.min = new MinProvider(stochPeriod);
    }

    /**
     * Get next value for closed candle
     * affect all next calculations
     */
    nextValue(close: number): { k: number; d: number; stochRsi: number } | undefined {
        const rsi = this.rsi.nextValue(close);

        if (rsi === undefined) {
            return;
        }

        const max = this.max.nextValue(rsi);
        const min = this.min.nextValue(rsi);

        if (!this.max.filled()) {
            return;
        }

        const stochRsi = ((rsi - min) / (max - min)) * 100;
        const k = this.sma1.nextValue(stochRsi);

        if (k === undefined) {
            return;
        }

        const d = this.sma2.nextValue(k);
        if (d === undefined) {
            return;
        }

        return { k, d, stochRsi };
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(close: number): { k: number; d: number; stochRsi: number } | undefined {
        if (!this.max.filled()) {
            return;
        }

        const rsi = this.rsi.momentValue(close);
        if (rsi === undefined) {
            return;
        }
        const max = this.max.momentValue(rsi);
        const min = this.min.momentValue(rsi);

        const stochRsi = ((rsi - min) / (max - min)) * 100;
        const k = this.sma1.momentValue(stochRsi);
        if (k === undefined) {
            return;
        }
        const d = this.sma2.momentValue(k);
        if (d === undefined) {
            return;
        }

        return { k, d, stochRsi };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
