import * as Indicators from '../index';

type IndicatorArgs = unknown[];
type ArgsMapper = (bar: Bar) => IndicatorArgs;

type AnyIndicator = {
    nextValue: (...args: IndicatorArgs) => unknown;
    momentValue?: (...args: IndicatorArgs) => unknown;
    dumpState: () => unknown;
    restoreState: (state: unknown) => AnyIndicator;
};

type StateCase = {
    name: string;
    factory: () => AnyIndicator;
    args: ArgsMapper;
};

type Bar = {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: number;
};

const bars: Bar[] = Array.from({ length: 180 }, (_: unknown, i: number): Bar => {
    const base = 100 + i * 0.7 + Math.sin(i / 3) * 4;
    const open = base + Math.sin(i) * 1.5;
    const close = base + Math.cos(i / 2) * 1.2;
    const high = Math.max(open, close) + 1 + (i % 5) * 0.2;
    const low = Math.min(open, close) - 1 - (i % 3) * 0.15;

    return {
        open,
        high,
        low,
        close,
        volume: 1000 + (i % 13) * 37 + i * 3,
        time: Date.UTC(2020, 0, 1) + i * 60000,
    };
});

const value: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.close];
const highLow: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.high, bar.low];
const highLowClose: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.high, bar.low, bar.close];
const highLowCloseVolume: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.high, bar.low, bar.close, bar.volume];
const highLowVolume: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.high, bar.low, bar.volume];
const openHighLowClose: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.open, bar.high, bar.low, bar.close];
const openCloseHighLow: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.open, bar.close, bar.high, bar.low];
const closeVolume: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.close, bar.volume];
const openCloseVolume: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.open, bar.close, bar.volume];
const volumeOnly: ArgsMapper = (bar: Bar): IndicatorArgs => [bar.volume];
const volumeProfileCandle: ArgsMapper = (bar: Bar): IndicatorArgs => [
    { o: bar.open, h: bar.high, l: bar.low, c: bar.close, v: bar.volume, time: bar.time },
];

const cases: StateCase[] = [
    { name: 'SMA', factory: () => new Indicators.SMA(5) as unknown as AnyIndicator, args: value },
    { name: 'WEMA', factory: () => new Indicators.WEMA(5) as unknown as AnyIndicator, args: value },
    { name: 'WMA', factory: () => new Indicators.WMA(5) as unknown as AnyIndicator, args: value },
    { name: 'EMA', factory: () => new Indicators.EMA(5) as unknown as AnyIndicator, args: value },
    { name: 'EWMA', factory: () => new Indicators.EWMA(0.2) as unknown as AnyIndicator, args: value },
    { name: 'SMMA', factory: () => new Indicators.SMMA(5) as unknown as AnyIndicator, args: value },
    { name: 'RMA', factory: () => new Indicators.RMA(5) as unknown as AnyIndicator, args: value },
    { name: 'AO', factory: () => new Indicators.AO(3, 8) as unknown as AnyIndicator, args: highLow },
    { name: 'AC', factory: () => new Indicators.AC() as unknown as AnyIndicator, args: highLow },
    { name: 'MFI', factory: () => new Indicators.MFI(5) as unknown as AnyIndicator, args: highLowCloseVolume },
    { name: 'Move', factory: () => new Indicators.Move(5) as unknown as AnyIndicator, args: value },
    { name: 'Wave', factory: () => new Indicators.Wave() as unknown as AnyIndicator, args: openCloseHighLow },
    { name: 'Stochastic', factory: () => new Indicators.Stochastic(5, 3) as unknown as AnyIndicator, args: highLowClose },
    { name: 'StochasticRSI', factory: () => new Indicators.StochasticRSI(5, 3, 3, 5) as unknown as AnyIndicator, args: value },
    { name: 'RSI', factory: () => new Indicators.RSI(5) as unknown as AnyIndicator, args: value },
    { name: 'CCI', factory: () => new Indicators.CCI(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'ATR', factory: () => new Indicators.ATR(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'ROC', factory: () => new Indicators.ROC(5) as unknown as AnyIndicator, args: value },
    { name: 'DC', factory: () => new Indicators.DC(5) as unknown as AnyIndicator, args: highLow },
    { name: 'cRSI', factory: () => new Indicators.cRSI(3, 2, 5) as unknown as AnyIndicator, args: value },
    { name: 'BollingerBands', factory: () => new Indicators.BollingerBands(5, 2) as unknown as AnyIndicator, args: value },
    { name: 'MACD', factory: () => new Indicators.MACD(5, 8, 3) as unknown as AnyIndicator, args: value },
    { name: 'HeikenAshi', factory: () => new Indicators.HeikenAshi() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Pivot', factory: () => new Indicators.Pivot() as unknown as AnyIndicator, args: highLowClose },
    { name: 'LWMA', factory: () => new Indicators.LWMA(5) as unknown as AnyIndicator, args: value },
    { name: 'PSAR', factory: () => new Indicators.PSAR() as unknown as AnyIndicator, args: highLowClose },
    { name: 'ADX', factory: () => new Indicators.ADX(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'WWS', factory: () => new Indicators.WWS(5) as unknown as AnyIndicator, args: value },
    { name: 'SuperTrend', factory: () => new Indicators.SuperTrend(5, 2) as unknown as AnyIndicator, args: highLowClose },
    { name: 'VolumeProfile', factory: () => new Indicators.VolumeProfile({ tickSize: 1, session: 'continuous' }) as unknown as AnyIndicator, args: volumeProfileCandle },
    { name: 'ChaikinOscillator', factory: () => new Indicators.ChaikinOscillator(3, 8) as unknown as AnyIndicator, args: highLowCloseVolume },
    { name: 'AMA', factory: () => new Indicators.AMA(5) as unknown as AnyIndicator, args: value },
    { name: 'Ichimoku', factory: () => new Indicators.Ichimoku(5, 8, 12, 4) as unknown as AnyIndicator, args: highLowClose },
    { name: 'Envelopes', factory: () => new Indicators.Envelopes(5, 2) as unknown as AnyIndicator, args: value },
    { name: 'KeltnerChannel', factory: () => new Indicators.KeltnerChannel(5, 2) as unknown as AnyIndicator, args: highLowClose },
    { name: 'DMI', factory: () => new Indicators.DMI(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'TEMA', factory: () => new Indicators.TEMA(5) as unknown as AnyIndicator, args: value },
    { name: 'TRIX', factory: () => new Indicators.TRIX(5) as unknown as AnyIndicator, args: value },
    { name: 'CMO', factory: () => new Indicators.CMO(5) as unknown as AnyIndicator, args: value },
    { name: 'DPO', factory: () => new Indicators.DPO(5) as unknown as AnyIndicator, args: value },
    { name: 'UltimateOscillator', factory: () => new Indicators.UltimateOscillator(4, 6, 8) as unknown as AnyIndicator, args: highLowClose },
    { name: 'ElderRay', factory: () => new Indicators.ElderRay(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'ForceIndex', factory: () => new Indicators.ForceIndex() as unknown as AnyIndicator, args: closeVolume },
    { name: 'Fractal', factory: () => new Indicators.Fractal(2, 2) as unknown as AnyIndicator, args: highLow },
    { name: 'VolumeOscillator', factory: () => new Indicators.VolumeOscillator(3, 5) as unknown as AnyIndicator, args: volumeOnly },
    { name: 'HMA', factory: () => new Indicators.HMA(9) as unknown as AnyIndicator, args: value },
    { name: 'DEMA', factory: () => new Indicators.DEMA(5) as unknown as AnyIndicator, args: value },
    { name: 'OBV', factory: () => new Indicators.OBV() as unknown as AnyIndicator, args: closeVolume },
    { name: 'VWMA', factory: () => new Indicators.VWMA(5) as unknown as AnyIndicator, args: closeVolume },
    { name: 'TSI', factory: () => new Indicators.TSI(5, 3, 3) as unknown as AnyIndicator, args: value },
    { name: 'ALMA', factory: () => new Indicators.ALMA(5) as unknown as AnyIndicator, args: value },
    { name: 'Aroon', factory: () => new Indicators.Aroon(5) as unknown as AnyIndicator, args: highLow },
    { name: 'BBPercentB', factory: () => new Indicators.BBPercentB(5, 2) as unknown as AnyIndicator, args: value },
    { name: 'BBBandWidth', factory: () => new Indicators.BBBandWidth(5, 2) as unknown as AnyIndicator, args: value },
    { name: 'BOP', factory: () => new Indicators.BOP() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Momentum', factory: () => new Indicators.Momentum(5) as unknown as AnyIndicator, args: value },
    { name: 'PVT', factory: () => new Indicators.PVT() as unknown as AnyIndicator, args: closeVolume },
    { name: 'EaseOfMovement', factory: () => new Indicators.EaseOfMovement(5, 10000) as unknown as AnyIndicator, args: highLowVolume },
    { name: 'MassIndex', factory: () => new Indicators.MassIndex(5) as unknown as AnyIndicator, args: highLow },
    { name: 'Vortex', factory: () => new Indicators.Vortex(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'LSMA', factory: () => new Indicators.LSMA(5) as unknown as AnyIndicator, args: value },
    { name: 'McGinleyDynamic', factory: () => new Indicators.McGinleyDynamic(5) as unknown as AnyIndicator, args: value },
    { name: 'CoppockCurve', factory: () => new Indicators.CoppockCurve(8, 5, 4) as unknown as AnyIndicator, args: value },
    { name: 'Klinger', factory: () => new Indicators.Klinger(5, 8, 3) as unknown as AnyIndicator, args: highLowCloseVolume },
    { name: 'KST', factory: () => new Indicators.KST(3, 4, 5, 6, 3, 3, 3, 3, 3) as unknown as AnyIndicator, args: value },
    { name: 'FisherTransform', factory: () => new Indicators.FisherTransform(5) as unknown as AnyIndicator, args: highLow },
    { name: 'ChandeMO', factory: () => new Indicators.ChandeMO(5) as unknown as AnyIndicator, args: value },
    { name: 'ChaikinMF', factory: () => new Indicators.ChaikinMF(5) as unknown as AnyIndicator, args: highLowCloseVolume },
    { name: 'Choppiness', factory: () => new Indicators.Choppiness(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'TrendStrengthIndex', factory: () => new Indicators.TrendStrengthIndex(5) as unknown as AnyIndicator, args: value },
    { name: 'ADR', factory: () => new Indicators.ADR(5) as unknown as AnyIndicator, args: highLow },
    { name: 'HistoricalVolatility', factory: () => new Indicators.HistoricalVolatility(5) as unknown as AnyIndicator, args: value },
    { name: 'PriceOscillator', factory: () => new Indicators.PriceOscillator(5, 8, 3) as unknown as AnyIndicator, args: value },
    { name: 'NetVolume', factory: () => new Indicators.NetVolume() as unknown as AnyIndicator, args: openCloseVolume },
    { name: 'BullBearPower', factory: () => new Indicators.BullBearPower(5) as unknown as AnyIndicator, args: highLowClose },
    { name: 'SMIErgodic', factory: () => new Indicators.SMIErgodic(5, 3, 3) as unknown as AnyIndicator, args: value },
    { name: 'RVI', factory: () => new Indicators.RVI(5) as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'RelativeVolatilityIndex', factory: () => new Indicators.RelativeVolatilityIndex(5) as unknown as AnyIndicator, args: value },
    { name: 'ChandeKrollStop', factory: () => new Indicators.ChandeKrollStop(5, 1, 4) as unknown as AnyIndicator, args: highLowClose },
    { name: 'Median', factory: () => new Indicators.Median(5) as unknown as AnyIndicator, args: highLow },
];

function jsonRoundTrip<T>(state: T): T {
    return JSON.parse(JSON.stringify(state));
}

function normalize(value: unknown): unknown {
    if (typeof value === 'number') {
        if (Number.isNaN(value)) return 'NaN';
        if (value === Infinity) return 'Infinity';
        if (value === -Infinity) return '-Infinity';
        return Object.is(value, -0) ? 0 : value;
    }

    if (Array.isArray(value)) {
        return value.map((item: unknown): unknown => normalize(item));
    }

    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        Object.keys(value as Record<string, unknown>).forEach((key: string): void => {
            out[key] = normalize((value as Record<string, unknown>)[key]);
        });
        return out;
    }

    return value;
}

describe('All public indicators state restore', () => {
    test.each(cases)('$name continues identically after JSON state restore', ({ factory, args }: StateCase): void => {
        const warmup = bars.slice(0, 130);
        const continuation = bars.slice(130);

        const source = factory();
        warmup.forEach((bar: Bar): void => {
            source.nextValue(...args(bar));
        });

        expect(typeof source.dumpState).toBe('function');
        expect(typeof source.restoreState).toBe('function');

        const restored = factory().restoreState(jsonRoundTrip(source.dumpState()));
        const runtime = factory();
        warmup.forEach((bar: Bar): void => {
            runtime.nextValue(...args(bar));
        });

        if (typeof restored.momentValue === 'function' && typeof runtime.momentValue === 'function') {
            const runtimeMoment = runtime.momentValue(...args(continuation[0]));
            const restoredMoment = restored.momentValue(...args(continuation[0]));

            expect(runtimeMoment).not.toBeUndefined();
            expect(restoredMoment).not.toBeUndefined();
            expect(normalize(restoredMoment)).toEqual(normalize(runtimeMoment));
        }

        continuation.forEach((bar: Bar): void => {
            expect(normalize(restored.nextValue(...args(bar)))).toEqual(normalize(runtime.nextValue(...args(bar))));
        });
    });
});

const candlestickCases: StateCase[] = [
    { name: 'Candlestick.Doji', factory: () => new Indicators.Doji() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.DragonFlyDoji', factory: () => new Indicators.DragonFlyDoji() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.GraveStoneDoji', factory: () => new Indicators.GraveStoneDoji() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishHammerStick', factory: () => new Indicators.BearishHammerStick() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishHammerStick', factory: () => new Indicators.BullishHammerStick() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishInvertedHammerStick', factory: () => new Indicators.BearishInvertedHammerStick() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishInvertedHammerStick', factory: () => new Indicators.BullishInvertedHammerStick() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishMarubozu', factory: () => new Indicators.BearishMarubozu() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishMarubozu', factory: () => new Indicators.BullishMarubozu() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishSpinningTop', factory: () => new Indicators.BearishSpinningTop() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishSpinningTop', factory: () => new Indicators.BullishSpinningTop() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishEngulfingPattern', factory: () => new Indicators.BearishEngulfingPattern() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishEngulfingPattern', factory: () => new Indicators.BullishEngulfingPattern() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishHarami', factory: () => new Indicators.BearishHarami() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishHarami', factory: () => new Indicators.BullishHarami() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishHaramiCross', factory: () => new Indicators.BearishHaramiCross() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishHaramiCross', factory: () => new Indicators.BullishHaramiCross() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.DarkCloudCover', factory: () => new Indicators.DarkCloudCover() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.PiercingLine', factory: () => new Indicators.PiercingLine() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.AbandonedBaby', factory: () => new Indicators.AbandonedBaby() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.DownsideTasukiGap', factory: () => new Indicators.DownsideTasukiGap() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.EveningStar', factory: () => new Indicators.EveningStar() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.EveningDojiStar', factory: () => new Indicators.EveningDojiStar() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.MorningStar', factory: () => new Indicators.MorningStar() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.MorningDojiStar', factory: () => new Indicators.MorningDojiStar() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.ThreeBlackCrows', factory: () => new Indicators.ThreeBlackCrows() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.ThreeWhiteSoldiers', factory: () => new Indicators.ThreeWhiteSoldiers() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.HammerPattern', factory: () => new Indicators.HammerPattern() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.HammerPatternUnconfirmed', factory: () => new Indicators.HammerPatternUnconfirmed() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.HangingMan', factory: () => new Indicators.HangingMan() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.HangingManUnconfirmed', factory: () => new Indicators.HangingManUnconfirmed() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.ShootingStar', factory: () => new Indicators.ShootingStar() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.ShootingStarUnconfirmed', factory: () => new Indicators.ShootingStarUnconfirmed() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.TweezerBottom', factory: () => new Indicators.TweezerBottom() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.TweezerTop', factory: () => new Indicators.TweezerTop() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.AllCandlestickPatterns', factory: () => new Indicators.AllCandlestickPatterns() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BullishPatterns', factory: () => new Indicators.BullishPatterns() as unknown as AnyIndicator, args: openHighLowClose },
    { name: 'Candlestick.BearishPatterns', factory: () => new Indicators.BearishPatterns() as unknown as AnyIndicator, args: openHighLowClose },
];

describe('Candlestick state restore', () => {
    test.each(candlestickCases)('$name continues identically after JSON state restore', ({ factory, args }: StateCase): void => {
        const warmup = bars.slice(0, 8);
        const continuation = bars.slice(8, 30);

        Indicators.Candlestick.BasePattern.reset();
        const source = factory();
        warmup.forEach((bar: Bar): void => {
            source.nextValue(...args(bar));
        });

        expect(typeof source.dumpState).toBe('function');
        expect(typeof source.restoreState).toBe('function');
        const state = jsonRoundTrip(source.dumpState());

        Indicators.Candlestick.BasePattern.reset();
        const restored = factory().restoreState(state);
        const restoredOutput = continuation.map((bar: Bar): unknown => normalize(restored.nextValue(...args(bar))));

        Indicators.Candlestick.BasePattern.reset();
        const runtime = factory();
        warmup.forEach((bar: Bar): void => {
            runtime.nextValue(...args(bar));
        });
        const runtimeOutput = continuation.map((bar: Bar): unknown => normalize(runtime.nextValue(...args(bar))));

        expect(restoredOutput).toEqual(runtimeOutput);
    });
});
