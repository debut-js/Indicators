import { ATR } from './atr';
import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * SuperTrend indicator is one of the hybrid custom tools that show the current trend in the market.
 * The indicator name stands for Multi Time Frame SuperTrend.
 * The tool can show the direction of the trend on several timeframes at once.
 */
export class SuperTrend  implements StatefulIndicator<GenericIndicatorState> {
    private atr: ATR;
    private prevSuper: number | undefined;
    private prevUpper: number | undefined;
    private prevLower: number | undefined;
    private prevClose: number | undefined;

    constructor(
        period = 10,
        private multiplier = 3,
        smoothing: 'SMA' | 'EMA' | 'SMMA' | 'WEMA' | 'LWMA' | 'EWMA' | 'RMA' = 'WEMA',
    ) {
        this.atr = new ATR(period, smoothing);
    }

    nextValue(h: number, l: number, c: number) {
        const atr = this.atr.nextValue(h, l, c);

        if (atr !== undefined) {
            const src = (h + l) / 2;
            let upper = src + this.multiplier * atr;
            let lower = src - this.multiplier * atr;

            if (this.prevLower !== undefined && this.prevUpper !== undefined && this.prevClose !== undefined) {
                lower = lower > this.prevLower || this.prevClose < this.prevLower ? lower : this.prevLower;
                upper = upper < this.prevUpper || this.prevClose > this.prevUpper ? upper : this.prevUpper;
            }

            let superTrend = upper;

            if (this.prevSuper === this.prevUpper) {
                superTrend = c > upper ? lower : upper;
            } else {
                superTrend = c < lower ? upper : lower;
            }

            const direction = superTrend === upper ? 1 : -1;

            this.prevUpper = upper;
            this.prevLower = lower;
            this.prevSuper = superTrend;
            this.prevClose = c;

            return { upper, lower, superTrend, direction };
        }
    }

    momentValue(h: number, l: number, c: number) {
        const atr = this.atr.momentValue(h, l);
        if (atr === undefined) {
            return;
        }
        const src = (h + l) / 2;

        let upper = src + this.multiplier * atr;
        let lower = src - this.multiplier * atr;

        if (this.prevLower !== undefined && this.prevUpper !== undefined && this.prevSuper !== undefined && this.prevClose !== undefined) {
            lower = lower > this.prevLower || this.prevClose < this.prevLower ? lower : this.prevLower;
            upper = upper < this.prevSuper || this.prevClose > this.prevUpper ? upper : this.prevUpper;
        }

        let superTrend = upper;

        if (this.prevSuper === this.prevUpper) {
            superTrend = c > upper ? lower : upper;
        } else {
            superTrend = c < lower ? upper : lower;
        }

        const direction = superTrend === upper ? 1 : -1;

        return { upper, lower, superTrend, direction };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
