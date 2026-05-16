import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * TRIX (Triple Exponential Average Oscillator)
 *
 * TRIX = (TEMA - previous TEMA) / previous TEMA * 100
 * where TEMA is the triple EMA of price
 */
export class TRIX  implements StatefulIndicator<GenericIndicatorState> {
    private ema1: EMA;
    private ema2: EMA;
    private ema3: EMA;
    private prevTrix: number | undefined;
    private prevTema: number | undefined;
    private fill = 0;

    /**
     * @param period Period for all EMAs (default: 15)
     */
    constructor(private period = 15) {
        this.ema1 = new EMA(period);
        this.ema2 = new EMA(period);
        this.ema3 = new EMA(period);
    }

    /**
     * Adds a new value and returns the TRIX oscillator
     * @param value Input value (e.g., close price)
     */
    nextValue(value: number): number | undefined {
        const ema1 = this.ema1.nextValue(value);
        if (ema1 === undefined) return;
        const ema2 = this.ema2.nextValue(ema1);
        if (ema2 === undefined) return;
        const ema3 = this.ema3.nextValue(ema2);
        if (ema3 === undefined) return;
        this.fill++;
        if (this.fill < this.period * 2) return;
        if (this.prevTema === undefined) {
            this.prevTema = ema3;
            return;
        }
        const trix = ((ema3 - this.prevTema) / this.prevTema) * 100;
        this.prevTema = ema3;
        this.nextValue = (value: number): number => {
            const ema1 = this.ema1.nextValue(value)!;
            const ema2 = this.ema2.nextValue(ema1)!;
            const ema3 = this.ema3.nextValue(ema2)!;
            const trix = ((ema3 - this.prevTema!) / this.prevTema!) * 100;
            this.prevTema = ema3;
            return trix;
        };
        return trix;
    }

    /**
     * Calculates TRIX for the current (not closed) bar without changing the internal state
     * @param value Input value (e.g., close price)
     */
    momentValue(value: number): number | undefined {
        const ema1 = this.ema1.momentValue(value);
        if (ema1 === undefined) return;
        const ema2 = this.ema2.momentValue(ema1);
        if (ema2 === undefined) return;
        const ema3 = this.ema3.momentValue(ema2);
        if (ema3 === undefined) return;
        if (this.prevTema === undefined) return;
        return ((ema3 - this.prevTema) / this.prevTema) * 100;
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
        if (this.fill <= this.period * 2 || this.prevTema === undefined) return;

        this.nextValue = (value: number): number => {
            const ema1 = this.ema1.nextValue(value)!;
            const ema2 = this.ema2.nextValue(ema1)!;
            const ema3 = this.ema3.nextValue(ema2)!;
            const trix = ((ema3 - this.prevTema!) / this.prevTema!) * 100;
            this.prevTema = ema3;
            return trix;
        };
    }
}
