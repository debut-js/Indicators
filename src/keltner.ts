import { EMA } from './ema';
import { ATR } from './atr';

/**
 * Keltner Channel
 *
 * Channels are based on an EMA (middle) and ATR (for band width).
 *
 * - Upper Band: EMA + (ATR * multiplier)
 * - Middle Band: EMA
 * - Lower Band: EMA - (ATR * multiplier)
 */
export class KeltnerChannel {
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
    nextValue(high: number, low: number, close: number) {
        const middle = this.ema.nextValue(close);
        const atr = this.atr.nextValue(high, low, close);
        this.fill++;
        if (this.fill !== this.period) {
            return;
        }
        const upper = middle + this.multiplier * atr;
        const lower = middle - this.multiplier * atr;
        this.nextValue = (high: number, low: number, close: number) => {
            const middle = this.ema.nextValue(close);
            const atr = this.atr.nextValue(high, low, close);
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
    momentValue(high: number, low: number, close: number) {
        const middle = this.ema.momentValue(close);
        const atr = this.atr.momentValue(high, low);
        const upper = middle + this.multiplier * atr;
        const lower = middle - this.multiplier * atr;
        return { lower, middle, upper };
    }
} 