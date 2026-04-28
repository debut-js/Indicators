import { EMA } from './ema';

/**
 * Triple Exponential Moving Average (TEMA)
 *
 * TEMA = 3 * EMA1 - 3 * EMA2 + EMA3
 * where:
 *   EMA1 = EMA of price
 *   EMA2 = EMA of EMA1
 *   EMA3 = EMA of EMA2
 */
export class TEMA {
    private ema1: EMA;
    private ema2: EMA;
    private ema3: EMA;
    private fill = 0;

    /**
     * @param period Period for all EMAs (default: 20)
     */
    constructor(private period = 20) {
        this.ema1 = new EMA(period);
        this.ema2 = new EMA(period);
        this.ema3 = new EMA(period);
    }

    /**
     * Adds a new value and returns the TEMA
     * @param value Input value (e.g., close price)
     */
    nextValue(value: number) {
        const ema1 = this.ema1.nextValue(value);
        if (ema1 === undefined) return;
        const ema2 = this.ema2.nextValue(ema1);
        if (ema2 === undefined) return;
        const ema3 = this.ema3.nextValue(ema2);
        this.fill++;
        if (this.fill < this.period * 2) return;
        const tema = 3 * ema1 - 3 * ema2 + ema3;
        this.nextValue = (value: number) => {
            const ema1 = this.ema1.nextValue(value);
            const ema2 = this.ema2.nextValue(ema1);
            const ema3 = this.ema3.nextValue(ema2);
            return 3 * ema1 - 3 * ema2 + ema3;
        };
        return tema;
    }

    /**
     * Calculates TEMA for the current (not closed) bar without changing the internal state
     * @param value Input value (e.g., close price)
     */
    momentValue(value: number) {
        const ema1 = this.ema1.momentValue(value);
        const ema2 = this.ema2.momentValue(ema1);
        const ema3 = this.ema3.momentValue(ema2);
        return 3 * ema1 - 3 * ema2 + ema3;
    }
} 