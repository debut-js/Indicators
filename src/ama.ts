import { CircularBuffer } from './providers/circular-buffer';

export class AMA {
    private circular: CircularBuffer;
    private sumNoise = 0;
    private prevAMA: number | null = null;
    private nfastend: number;
    private nslowend: number;

    constructor(length: number, fastend: number = 4, slowend: number = 30) {
        this.circular = new CircularBuffer(length);
        this.nfastend = 2 / (fastend + 1);
        this.nslowend = 2 / (slowend + 1);
    }

    nextValue(price: number) {
        // Add the new value to the circular buffer and get the noise
        const noise = this.circular.push(Math.abs(price - (this.circular.peek() ?? price)));

        // Sum of absolute price differences (noise)
        this.sumNoise += noise;

        if (!this.circular.filled) {
            // Not enough data to calculate yet
            return;
        }

        this.nextValue = (price: number) => {
            const prevPrice = this.circular.peek() ?? price;
            const priceChange = Math.abs(price - prevPrice);
            this.sumNoise = this.sumNoise - this.circular.push(priceChange) + priceChange;

            // Efficiency Ratio (ER)
            const signal = Math.abs(price - prevPrice);
            const noiseSum = this.sumNoise;
            const er = noiseSum !== 0 ? signal / noiseSum : 0;

            // Smoothing Constant (SC)
            const smooth = Math.pow(er * (this.nfastend - this.nslowend) + this.nslowend, 2);

            // AMA Calculation
            const currentAMA = this.prevAMA !== null
                ? this.prevAMA + smooth * (price - this.prevAMA)
                : price; // Initialize with the price if first value

            this.prevAMA = currentAMA;
            return currentAMA;
        };

        this.momentValue = (price: number) => {
            const prevPrice = this.circular.peek() ?? price;
            const signal = Math.abs(price - prevPrice);
            const noiseSum = this.sumNoise;
            const er = noiseSum !== 0 ? signal / noiseSum : 0;
            const smooth = Math.pow(er * (this.nfastend - this.nslowend) + this.nslowend, 2);

            return this.prevAMA !== null
                ? this.prevAMA + smooth * (price - this.prevAMA)
                : price; // Use price as initial value if no previous AMA
        };

        // Calculate the initial AMA value when enough data is available
        return price;
    }

    momentValue(price: number): number {
        return price; // Placeholder until `nextValue` is fully initialized
    }
}
