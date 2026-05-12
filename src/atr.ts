import { SMMA } from './smma';
import { EMA } from './ema';
import { WEMA } from './wema';
import { LWMA } from './lwma';
import { SMA } from './sma';
import { EWMA } from './ewma';
import { getTrueRange } from './providers/true-range';
import { RMA } from './rma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
export class ATR  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number;
    private avg: EMA | SMMA | WEMA | LWMA | SMA | EWMA | RMA;

    /**
     * Конструктор
     * @param period - период по умолчанию 14
     */
    constructor(period = 14, smoothing: 'SMA' | 'EMA' | 'SMMA' | 'WEMA' | 'LWMA' | 'EWMA' | 'RMA' = 'WEMA') {
        switch (smoothing) {
            case 'SMA':
                this.avg = new SMA(period);
                break;
            case 'EMA':
                this.avg = new EMA(period);
                break;
            case 'SMMA':
                this.avg = new SMMA(period);
                break;
            case 'WEMA':
                this.avg = new WEMA(period);
                break;
            case 'LWMA':
                this.avg = new LWMA(period);
                break;
            case 'EWMA':
                this.avg = new EWMA(0.2);
                break;
            case 'RMA':
                this.avg = new RMA(period);
                break;
        }

        this.prevClose = 0;
    }

    nextValue(high: number, low: number, close: number) {
        const trueRange = getTrueRange(high, low, this.prevClose);

        this.prevClose = close;

        if (trueRange === undefined) {
            return;
        }

        return this.avg.nextValue(trueRange);
    }

    momentValue(high: number, low: number) {
        const trueRange = getTrueRange(high, low, this.prevClose);

        if (trueRange === undefined) {
            return;
        }

        return this.avg.momentValue(trueRange);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
