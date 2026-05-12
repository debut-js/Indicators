import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Money Flow Index (MFI) is a movement indicator used in technical analysis that looks at time and price
 * to measure the trading pressure — buying or selling. It is also called volume-weighted
 * Relative Strength Index (RSI), as it includes volume, unlike RSI, which only incorporates price.
 */
export class MFI  implements StatefulIndicator<GenericIndicatorState> {
    private positiveMoneyFlowSum = 0;
    private negativeMoneyFlowSum = 0;
    private pevTypicalPrice = 0;
    private posCircular: CircularBuffer;
    private negCircular: CircularBuffer;

    constructor(period = 14) {
        this.posCircular = new CircularBuffer(period);
        this.negCircular = new CircularBuffer(period);
    }

    nextValue(high: number, low: number, close: number, volume: number) {
        const typicalPrice = (high + low + close) / 3;
        const moneyFlow = typicalPrice * volume;

        if (!this.pevTypicalPrice) {
            this.pevTypicalPrice = typicalPrice;
            return;
        }

        const positiveMoneyFlow = typicalPrice > this.pevTypicalPrice ? moneyFlow : 0;
        const negativeMoneyFlow = typicalPrice < this.pevTypicalPrice ? moneyFlow : 0;
        
        this.pevTypicalPrice = typicalPrice;
        this.negativeMoneyFlowSum += negativeMoneyFlow;
        this.positiveMoneyFlowSum += positiveMoneyFlow;
       
        const posRedunant = this.posCircular.push(positiveMoneyFlow);
        const negRedunant = this.negCircular.push(negativeMoneyFlow);

        if (!this.posCircular.filled) {
            return;
        }

        this.negativeMoneyFlowSum -= negRedunant || 0;
        this.positiveMoneyFlowSum -= posRedunant || 0;

        const moneyFlowRatio = this.positiveMoneyFlowSum / this.negativeMoneyFlowSum;

        return 100 - 100 / (1 + moneyFlowRatio);
    }

    momentValue(high: number, low: number, close: number, volume: number) {
        const typicalPrice = (high + low + close) / 3;
        const moneyFlow = typicalPrice * volume;

        if (!this.pevTypicalPrice) {
            return;
        }

        const positiveMoneyFlow = typicalPrice > this.pevTypicalPrice ? moneyFlow : 0;
        const negativeMoneyFlow = typicalPrice < this.pevTypicalPrice ? moneyFlow : 0;
        
        if (!this.posCircular.filled) {
            return;
        }
        
        const posRedunant = this.posCircular.peek();
        const negRedunant = this.negCircular.peek();
        const negativeMoneyFlowSum = this.negativeMoneyFlowSum + negativeMoneyFlow - negRedunant;
        const positiveMoneyFlowSum = this.positiveMoneyFlowSum + positiveMoneyFlow - posRedunant;
        const moneyFlowRatio = positiveMoneyFlowSum / negativeMoneyFlowSum;

        return 100 - 100 / (1 + moneyFlowRatio);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
