import { EMA } from './ema';

/**
 * Elder Ray Index (Bull Power / Bear Power)
 *
 * Bull Power = High - EMA
 * Bear Power = Low - EMA
 */
export class ElderRay {
    private ema: EMA;
    private fill = 0;

    /**
     * @param period Period for EMA (default: 13)
     */
    constructor(private period = 13) {
        this.ema = new EMA(period);
    }

    /**
     * Adds a new value and returns Bull Power and Bear Power
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    nextValue(high: number, low: number, close: number) {
        const ema = this.ema.nextValue(close);
        this.fill++;
        if (this.fill < this.period) return;
        const bull = high - ema;
        const bear = low - ema;
        this.nextValue = (high: number, low: number, close: number) => {
            const ema = this.ema.nextValue(close);
            return { bull, bear };
        };
        return { bull, bear };
    }

    /**
     * Calculates Bull Power and Bear Power for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    momentValue(high: number, low: number, close: number) {
        const ema = this.ema.momentValue(close);
        return { bull: high - ema, bear: low - ema };
    }
} 