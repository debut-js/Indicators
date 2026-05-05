import * as TrendLines from './src/trendlines';

export { Extremums } from './src/providers/extremum';
export { TrendLines };
export { Level, UniLevel } from './src/providers/levels';
export { Correlation } from './src/providers/correlation';
export { SMA } from './src/sma';
export { WEMA } from './src/wema';
export { WMA } from './src/wma';
export { EMA } from './src/ema';
export { EWMA } from './src/ewma';
export { SMMA } from './src/smma';
export { RMA } from './src/rma';
export { AO } from './src/ao';
export { AC } from './src/ac';
export { MFI } from './src/mfi';
export { Move } from './src/move';
export { Wave } from './src/wave';
export { Stochastic } from './src/stochastic';
export { StochasticRSI } from './src/stochastic-rsi';
export { RSI } from './src/rsi';
export { CCI } from './src/cci';
export { ATR } from './src/atr';
export { ROC } from './src/roc';
export { DC } from './src/dc';
export { cRSI } from './src/crsi';
export { BollingerBands } from './src/bands';
export { StandardDeviation } from './src/providers/standard-deviation';
export { MACD } from './src/macd';
export { HeikenAshi } from './src/heiken-ashi';
export { Pivot } from './src/pivot';
export { LWMA } from './src/lwma';
export { PSAR } from './src/psar';
export { ADX } from './src/adx';
export { WWS } from './src/wws';
export { SuperTrend } from './src/supertrend';
export { CircularBuffer } from './src/providers/circular-buffer';
export { Sampler } from './src/providers/sampler';
export { VolumeProfile } from './src/volume-profile'; /** BETA UNSTABLE */
export { ChaikinOscillator } from './src/chaikin';
export { AMA } from './src/ama';
export { Ichimoku } from './src/ichimoku';
export { Envelopes } from './src/envelopes';
export { KeltnerChannel } from './src/keltner';
export { DMI } from './src/dmi';
export { TEMA } from './src/tema';
export { TRIX } from './src/trix';
export { CMO } from './src/cmo';
export { DPO } from './src/dpo';
// export { OrderBlock } from './src/order-block';
export { UltimateOscillator } from './src/ultimate-oscillator';
export { ElderRay } from './src/elder-ray';
export { ForceIndex } from './src/force-index';
export { Fractal } from './src/fractal';
export { VolumeOscillator } from './src/volume-oscillator';
export { HMA } from './src/hma';
export { DEMA } from './src/dema';
export { OBV } from './src/obv';
export { VWMA } from './src/vwma';
export { TSI } from './src/tsi';
export { ALMA } from './src/alma';
export { Aroon } from './src/aroon';
export { BBPercentB } from './src/bb-percent-b';
export { BBBandWidth } from './src/bb-bandwidth';
export { BOP } from './src/bop';
export { Momentum } from './src/momentum';
export { PVT } from './src/pvt';
export { EaseOfMovement } from './src/ease-of-movement';
export { MassIndex } from './src/mass-index';
export { Vortex } from './src/vortex';
export { LSMA } from './src/lsma';
export { McGinleyDynamic } from './src/mcginley-dynamic';
export { CoppockCurve } from './src/coppock-curve';
export { Klinger } from './src/klinger';
export { KST } from './src/kst';
export { FisherTransform } from './src/fisher-transform';
export { ChandeMO } from './src/chande-mo';
export { ChaikinMF } from './src/chaikin-mf';
export { Choppiness } from './src/choppiness';
export { TrendStrengthIndex } from './src/trend-strength';
export { ADR } from './src/adr';
export { HistoricalVolatility } from './src/historical-volatility';
export { PriceOscillator } from './src/price-oscillator';
export { NetVolume } from './src/net-volume';
export { BullBearPower } from './src/bull-bear-power';
export { SMIErgodic } from './src/smi-ergodic';
export { RVI } from './src/rvi';
export { RelativeVolatilityIndex } from './src/relative-volatility-index';
export { ChandeKrollStop } from './src/chande-kroll-stop';
export { Median } from './src/median';

// 44 candlestick pattern detectors. Each class is self-contained — no
// shared base class, no shared context. Two import styles:
//   1. Individual — `import { Doji, Hammer } from '@debut/indicators'`
//   2. Namespaced — `import { Candlestick } from '@debut/indicators'; new Candlestick.Doji()`
//
// `AllCandlestickPatterns` is a separate self-contained scanner that
// runs every pattern in one pass — useful for "what just fired?".
import * as Candlestick from './src/candlestick';
export { Candlestick };
export {
    AllCandlestickPatterns,
    Doji,
    DragonflyDoji,
    GravestoneDoji,
    Hammer,
    HangingMan,
    InvertedHammer,
    ShootingStar,
    LongLowerShadow,
    LongUpperShadow,
    MarubozuBlack,
    MarubozuWhite,
    SpinningTopBlack,
    SpinningTopWhite,
    DarkCloudCover,
    DojiStarBearish,
    DojiStarBullish,
    EngulfingBearish,
    EngulfingBullish,
    FallingWindow,
    RisingWindow,
    HaramiBearish,
    HaramiBullish,
    HaramiCrossBearish,
    HaramiCrossBullish,
    KickingBearish,
    KickingBullish,
    OnNeck,
    Piercing,
    TweezerBottom,
    TweezerTop,
    AbandonedBabyBearish,
    AbandonedBabyBullish,
    DownsideTasukiGap,
    UpsideTasukiGap,
    EveningStar,
    EveningDojiStar,
    MorningStar,
    MorningDojiStar,
    ThreeBlackCrows,
    ThreeWhiteSoldiers,
    TriStarBearish,
    TriStarBullish,
    FallingThreeMethods,
    RisingThreeMethods,
} from './src/candlestick';
export type { CandlestickPatternName } from './src/candlestick';
