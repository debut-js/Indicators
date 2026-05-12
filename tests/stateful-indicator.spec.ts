import { BollingerBands } from '../src/bands';
import { EMA } from '../src/ema';
import { RMA } from '../src/rma';
import { RSI } from '../src/rsi';
import { SMA } from '../src/sma';
import { WMA } from '../src/wma';
import { WEMA } from '../src/wema';
import { CircularBuffer } from '../src/providers/circular-buffer';
import { StandardDeviation } from '../src/providers/standard-deviation';
import { StatefulIndicator } from '../src/stateful-indicator';

function jsonRoundTrip<T>(state: T): T {
    return JSON.parse(JSON.stringify(state));
}

function expectSameContinuation<TState, TIndicator extends StatefulIndicator<TState>, TValue>(
    factory: () => TIndicator,
    warmup: TValue[],
    continuation: TValue[],
    next: (indicator: TIndicator, value: TValue) => unknown,
): void {
    const source = factory();
    warmup.forEach((value: TValue): void => {
        next(source, value);
    });

    const restored = factory();
    restored.restoreState(jsonRoundTrip(source.dumpState()));

    const runtime = factory();
    warmup.forEach((value: TValue): void => {
        next(runtime, value);
    });

    continuation.forEach((value: TValue): void => {
        expect(next(restored, value)).toEqual(next(runtime, value));
    });
}

describe('Stateful indicators', () => {
    it('restores circular buffer internals through JSON', () => {
        const buffer = new CircularBuffer(4);
        buffer.push(10);
        buffer.push(20);

        const restored = new CircularBuffer(4).restoreState(jsonRoundTrip(buffer.dumpState()));

        expect(restored.loaded).toBe(2);
        expect(restored.at(0)).toBe(10);
        expect(restored.at(1)).toBe(20);

        restored.push(30);
        restored.push(40);
        restored.push(50);

        expect(restored.toArray()).toEqual([50, 20, 30, 40]);
        expect(restored.at(0)).toBe(20);
        expect(restored.at(-1)).toBe(50);
    });

    it('restores SMA continuation', () => {
        expectSameContinuation(
            () => new SMA(4),
            [120, 150, 240, 540, 210, 380, 120],
            [870, 250, 1100, 500, 950],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores WMA continuation', () => {
        expectSameContinuation(
            () => new WMA(4),
            [120, 150, 240, 540, 210, 380, 120],
            [870, 250, 1100, 500, 950],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores StandardDeviation continuation', () => {
        expectSameContinuation(
            () => new StandardDeviation(4),
            [
                { value: 120, mean: 120 },
                { value: 150, mean: 135 },
                { value: 240, mean: 170 },
                { value: 540, mean: 262.5 },
                { value: 210, mean: 285 },
            ],
            [
                { value: 380, mean: 342.5 },
                { value: 120, mean: 312.5 },
                { value: 870, mean: 395 },
            ],
            (indicator, item) => indicator.nextValue(item.value, item.mean),
        );
    });

    it('restores EMA continuation', () => {
        expectSameContinuation(
            () => new EMA(5),
            [120, 150, 240, 540, 210, 380, 120, 870],
            [250, 1100, 500, 950, 430],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores EMA continuation when warmup average is zero', () => {
        expectSameContinuation(
            () => new EMA(3),
            [0, 0, 0, 3],
            [0, 6, 0, 9],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores WEMA continuation when warmup average is zero', () => {
        expectSameContinuation(
            () => new WEMA(3),
            [0, 0, 0, 3],
            [0, 6, 0, 9],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores RMA continuation when warmup average is zero', () => {
        expectSameContinuation(
            () => new RMA(3),
            [0, 0, 0, 3],
            [0, 6, 0, 9],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores RSI continuation with nested providers', () => {
        expectSameContinuation(
            () => new RSI(5),
            [44, 44.15, 43.9, 44.35, 44.2, 45.1, 44.8, 45.4, 45.2],
            [45.8, 45.1, 44.7, 46.2, 46],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores RSI continuation when previous value is zero', () => {
        expectSameContinuation(
            () => new RSI(3),
            [0, 1, 0, 2, 1],
            [3, 0, 4, 2],
            (indicator, value) => indicator.nextValue(value),
        );
    });

    it('restores BollingerBands continuation with nested providers', () => {
        expectSameContinuation(
            () => new BollingerBands(4, 2),
            [120, 150, 240, 540, 210, 380, 120],
            [870, 250, 1100, 500, 950],
            (indicator, value) => indicator.nextValue(value),
        );
    });
});
