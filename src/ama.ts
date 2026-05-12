import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Adaptive Moving Average (AMA) is a powerful tool that can significantly improve your trading strategy. 
 * In this ultimate guide, I’ll walk you through everything you need to know about AMA – from its 
 * basics to implementing it in your own trading approach. 
 * Get ready to take your trading game to the next level!
 */
export class AMA  implements StatefulIndicator<GenericIndicatorState> {
    private circular: CircularBuffer;
    private sumNoise = 0;
    private prevPrice: number;
    private prevAMA: number;
    private nfastend: number;
    private nslowend: number;

    constructor(length: number, fastend: number = 4, slowend: number = 30) {
        this.circular = new CircularBuffer(length);
        this.nfastend = 2 / (fastend + 1);
        this.nslowend = 2 / (slowend + 1);
        this.prevPrice = 0; // Можно инициализировать значением, например, первым полученным значением цены
        this.prevAMA = 0; // Аналогично
    }

    nextValue(price: number) {
        // Add the new value to the circular buffer and get the noise
        const prevPrice = this.prevPrice;
        const priceChange = Math.abs(price - prevPrice);
        const prevChange = this.circular.push(priceChange) ?? 0;
        this.sumNoise += priceChange - (this.circular.filled ? prevChange : 0);

        if (!this.circular.filled) {
            // Not enough data to calculate yet, return undefined
            this.prevAMA = price;
            this.prevPrice = price; // Update prevPrice
            return;
        }

        // Efficiency Ratio (ER)
        const signal = Math.abs(price - prevPrice);
        const noiseSum = this.sumNoise;
        const er = noiseSum !== 0 ? signal / noiseSum : 0;

        // Smoothing Constant (SC)
        const smooth = Math.pow(er * (this.nfastend - this.nslowend) + this.nslowend, 2);

        // AMA Calculation
        const currentAMA = this.prevAMA + smooth * (price - this.prevAMA);

        this.prevAMA = currentAMA;
        this.prevPrice = price; // Update prevPrice
        return currentAMA;
    }

    momentValue(): number {
        // Return the last calculated AMA value
        return this.prevAMA;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
