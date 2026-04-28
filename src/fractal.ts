import { CircularBuffer } from './providers/circular-buffer';

/**
 * Fractal Indicator (Bill Williams Fractals)
 *
 * A fractal up is a high that is higher than two bars to the left and right.
 * A fractal down is a low that is lower than two bars to the left and right.
 */
export class Fractal {
    private highs: CircularBuffer;
    private lows: CircularBuffer;
    private fill = 0;

    /**
     * @param left Number of bars to the left (default: 2)
     * @param right Number of bars to the right (default: 2)
     */
    constructor(private left = 2, private right = 2) {
        this.highs = new CircularBuffer(left + right + 1);
        this.lows = new CircularBuffer(left + right + 1);
    }

    /**
     * Adds a new value and returns fractal up/down if found
     * @param high High price of the current bar
     * @param low Low price of the current bar
     */
    nextValue(high: number, low: number) {
        this.highs.push(high);
        this.lows.push(low);
        this.fill++;
        if (this.fill < this.left + this.right + 1) return;
        const arrHighs = this.highs.toArray();
        const arrLows = this.lows.toArray();
        const center = this.left;
        const isFractalUp = arrHighs[center] === Math.max(...arrHighs) && arrHighs[center] > Math.max(...arrHighs.slice(0, center), ...arrHighs.slice(center + 1));
        const isFractalDown = arrLows[center] === Math.min(...arrLows) && arrLows[center] < Math.min(...arrLows.slice(0, center), ...arrLows.slice(center + 1));
        return {
            up: isFractalUp ? arrHighs[center] : undefined,
            down: isFractalDown ? arrLows[center] : undefined
        };
    }

    /**
     * Calculates fractal up/down for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     */
    momentValue(high: number, low: number) {
        const arrHighs = this.highs.toArray().slice();
        const arrLows = this.lows.toArray().slice();
        arrHighs.push(high);
        arrLows.push(low);
        if (arrHighs.length > this.left + this.right + 1) arrHighs.shift();
        if (arrLows.length > this.left + this.right + 1) arrLows.shift();
        if (arrHighs.length < this.left + this.right + 1) return;
        const center = this.left;
        const isFractalUp = arrHighs[center] === Math.max(...arrHighs) && arrHighs[center] > Math.max(...arrHighs.slice(0, center), ...arrHighs.slice(center + 1));
        const isFractalDown = arrLows[center] === Math.min(...arrLows) && arrLows[center] < Math.min(...arrLows.slice(0, center), ...arrLows.slice(center + 1));
        return {
            up: isFractalUp ? arrHighs[center] : undefined,
            down: isFractalDown ? arrLows[center] : undefined
        };
    }
} 