import { CircularBuffer } from './providers/circular-buffer';

/**
 * Volume Weighted Moving Average (VWMA)
 *
 * A moving average where each price is weighted by the bar's volume.
 * Formula: VWMA = sum(price * volume) / sum(volume) over the last `period` bars.
 */
export class VWMA {
    private prices: CircularBuffer;
    private volumes: CircularBuffer;
    private numerator = 0;
    private denominator = 0;

    constructor(private period = 20) {
        this.prices = new CircularBuffer(period);
        this.volumes = new CircularBuffer(period);
    }

    nextValue(price: number, volume: number) {
        const oldPrice = this.prices.push(price);
        const oldVolume = this.volumes.push(volume);

        this.numerator += price * volume;
        this.denominator += volume;

        if (!this.prices.filled) {
            return;
        }

        this.nextValue = (price: number, volume: number) => {
            const removedPrice = this.prices.push(price);
            const removedVolume = this.volumes.push(volume);

            this.numerator += price * volume - removedPrice * removedVolume;
            this.denominator += volume - removedVolume;

            return this.denominator === 0 ? 0 : this.numerator / this.denominator;
        };

        return this.denominator === 0 ? 0 : this.numerator / this.denominator;
    }

    momentValue(price: number, volume: number) {
        if (!this.prices.filled) {
            if (this.prices.loaded === this.period - 1) {
                const num = this.numerator + price * volume;
                const den = this.denominator + volume;
                return den === 0 ? 0 : num / den;
            }
            return;
        }

        const removedPrice = this.prices.peek();
        const removedVolume = this.volumes.peek();
        const num = this.numerator - removedPrice * removedVolume + price * volume;
        const den = this.denominator - removedVolume + volume;
        return den === 0 ? 0 : num / den;
    }
}
