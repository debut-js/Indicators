import { EMA } from './ema';
import { ATR } from './atr';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Keltner Channel
 *
 * Channels are based on an EMA (middle) and ATR (for band width).
 *
 * - Upper Band: EMA + (ATR * multiplier)
 * - Middle Band: EMA
 * - Lower Band: EMA - (ATR * multiplier)
 */
export class KeltnerChannel  implements StatefulIndicator<GenericIndicatorState> {
    private ema: EMA;
    private atr: ATR;
    private fill = 0;

    /**
     * @param period Period for EMA and ATR (default: 20)
     * @param multiplier ATR multiplier (default: 2)
     */
    constructor(private period = 20, private multiplier = 2) {
        this.ema = new EMA(period);
        this.atr = new ATR(period);
    }

    /**
     * Adds a new value and returns the Keltner Channel bands
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    nextValue(high: number, low: number, close: number): { lower: number; middle: number; upper: number } | undefined {
        const middle = this.ema.nextValue(close);
        const atr = this.atr.nextValue(high, low, close);
        this.fill++;
        if (middle === undefined || atr === undefined) {
            return;
        }

        const upper = middle + this.multiplier * atr;
        const lower = middle - this.multiplier * atr;
        this.nextValue = (high: number, low: number, close: number): { lower: number; middle: number; upper: number } => {
            const middle = this.ema.nextValue(close)!;
            const atr = this.atr.nextValue(high, low, close)!;
            const upper = middle + this.multiplier * atr;
            const lower = middle - this.multiplier * atr;
            return { lower, middle, upper };
        };
        return { lower, middle, upper };
    }

    /**
     * Calculates Keltner Channel bands for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    momentValue(high: number, low: number, close: number): { lower: number; middle: number; upper: number } | undefined {
        const middle = this.ema.momentValue(close);
        const atr = this.atr.momentValue(high, low);
        if (middle === undefined || atr === undefined) {
            return;
        }
        const upper = middle + this.multiplier * atr;
        const lower = middle - this.multiplier * atr;
        return { lower, middle, upper };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        restoreObjectState(this, state);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (this.fill <= this.period) return;

        this.nextValue = (high: number, low: number, close: number): { lower: number; middle: number; upper: number } => {
            const middle = this.ema.nextValue(close)!;
            const atr = this.atr.nextValue(high, low, close)!;
            const upper = middle + this.multiplier * atr;
            const lower = middle - this.multiplier * atr;
            return { lower, middle, upper };
        };
    }
}
