![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)

# Streaming Technical Indicators

> **Sponsored by [Backticks](https://backticks.io)** — a visual canvas to build, backtest and optimize trading strategies in your browser. Built on top of this library.

A streaming, allocation-light technical-analysis toolkit for JavaScript / TypeScript. Every indicator is a class with a `nextValue(...)` method that consumes one bar at a time, so the same code path drives both backtests and live trading without rebuilding state. A second method, `momentValue(...)`, computes the indicator's value for a hypothetical bar without committing any state — useful for tick-by-tick recalculation inside an unfinished candle.

## Features

- **Streaming-first.** O(period) per bar; no full-array recomputation.
- **`momentValue` everywhere.** Ask "what would the value be if this bar closed now?" without mutating state.
- **TypeScript.** Strongly-typed across the public surface.
- **Cross-SDK validated.** 130+ vitest/jest tests cross-check our output against `lightweight-charts-indicators` (oakscriptjs / Pine Script reference) and `technicalindicators` with epsilon ≤ 1e-9.
- **Tiny package.** Ships only the prebuilt `lib/` bundle — ~85 kB tarball.

## Install

```bash
npm install @debut/indicators
```

## Quick start

```ts
import { SMA, RSI, MACD, BollingerBands } from '@debut/indicators';

const sma = new SMA(20);
const rsi = new RSI(14);
const macd = new MACD(12, 26, 9);
const bb = new BollingerBands(20, 2);

for (const bar of bars) {
    const sm = sma.nextValue(bar.close);
    const r = rsi.nextValue(bar.close);
    const m = macd.nextValue(bar.close);   // → { macd, signal, histogram }
    const b = bb.nextValue(bar.close);     // → { lower, middle, upper }
    // ...indicator outputs are `undefined` until each one's warmup completes.
}
```

`nextValue` returns `undefined` until the indicator has seen enough bars to produce a result (its "warmup" — typically `period` bars). After that it returns the current value on every call.

## Streaming model

### `nextValue(...)` — close-of-bar

Call this once per closed bar. The method advances internal state and returns the new indicator value. Subsequent calls reflect the committed state.

### `momentValue(...)` — intra-bar

Call this with the live (still-forming) candle's price/volume to read what the indicator *would* report if the bar closed now, **without** committing any state. Useful when you want to react inside the candle but recompute cleanly when the next real `nextValue` arrives.

```ts
const sma = new SMA(4);
[1, 2, 3].forEach((v) => sma.nextValue(v));   // warmup
sma.momentValue(8);   // 3.5  ← preview if close=8
sma.nextValue(4);     // 2.5  ← actual close=4 commits state
sma.momentValue(8);   // 4.75 ← preview based on committed state
sma.nextValue(8);     // 4.25 ← actual close=8 commits state
```

---

## Available indicators

Below is the full catalog grouped by category. Names in `code style` are the exact named export from `@debut/indicators`.

### Moving Averages

| Indicator | Export | Description |
|-----------|--------|-------------|
| Simple Moving Average | `SMA` | Arithmetic mean over a period. |
| Exponential Moving Average | `EMA` | Weighted average emphasizing recent prices. |
| Weighted Moving Average | `WMA` | Linearly increasing weights toward the latest bar. |
| Linearly Weighted MA | `LWMA` | Linear weighting variant. |
| Exponential Weighted MA | `EWMA` | Configurable α; lighter than EMA for tick smoothing. |
| Smoothed Moving Average | `SMMA` | Wilder smoothing (α = 1/period). |
| Wilder's Smoothed MA | `WEMA` | Same shape as `RMA`, included for compatibility. |
| Welles Wilder's Smoothing | `WWS` | Classic Wilder smoothing. |
| Adaptive Moving Average | `AMA` | Kaufman adaptive — speeds up in trend, slows in chop. |
| Running Moving Average | `RMA` | α = 1/period; SMA-seeded. |
| Hull Moving Average | `HMA` | Reduced-lag MA via WMA chaining. |
| Double EMA | `DEMA` | 2 × EMA − EMA(EMA). |
| Triple EMA | `TEMA` | Three-stage EMA reduction of lag. |
| Arnaud Legoux MA | `ALMA` | Gaussian-weighted MA. |
| Volume Weighted MA | `VWMA` | Each bar weighted by volume. |
| McGinley Dynamic | `McGinleyDynamic` | Self-adjusting MA reacting to market speed. |
| Least Squares MA | `LSMA` | Endpoint of rolling linear regression. |

### Oscillators

| Indicator | Export | Description |
|-----------|--------|-------------|
| Relative Strength Index | `RSI` | Classic 14-period momentum oscillator. |
| Stochastic | `Stochastic` | Close vs. high-low range. |
| Stochastic RSI | `StochasticRSI` | Stochastic applied to RSI. |
| Commodity Channel Index | `CCI` | Deviation-from-mean cyclic oscillator. |
| Williams %R | `Williams` | Inverse-stochastic momentum. |
| Awesome Oscillator | `AO` | Bill Williams 5/34 SMA difference of HL2. |
| Accelerator Oscillator | `AC` | Bill Williams AO derivative. |
| Chande Momentum Oscillator | `CMO` | Wilder-style CMO. |
| Chande MO (LWC) | `ChandeMO` | LWC reference variant; raw rolling sums. |
| Detrended Price Oscillator | `DPO` | SMA-detrended price. |
| Relative Vigor Index | `RVI` | SWMA-based vigor / signal pair. |
| SMI Ergodic | `SMIErgodic` | Double-smoothed momentum (TSI without 100×). |
| True Strength Index | `TSI` | Double-EMA momentum oscillator with signal. |
| Bollinger Bands %B | `BBPercentB` | Price position relative to BB. |
| Fisher Transform | `FisherTransform` | Gaussian-mapped price extremes. |
| Ultimate Oscillator | `UltimateOscillator` | Multi-timeframe weighted momentum. |
| Connor's RSI | `cRSI` | Composite RSI / streak / percent-rank. |
| Relative Volatility Index | `RelativeVolatilityIndex` | RSI on stdev of close. |

### Momentum

| Indicator | Export | Description |
|-----------|--------|-------------|
| MACD | `MACD` | Difference of two EMAs with signal/histogram. |
| Momentum | `Momentum` | `close − close[length]`. |
| Rate of Change | `ROC` | Percentage change over a period. |
| Balance of Power | `BOP` | `(close − open) / (high − low)`. |
| Bull-Bear Power | `BullBearPower` | Elder: `high + low − 2·EMA(close)`. |
| Force Index | `ForceIndex` | Elder: signed price-volume impulse. |
| Elder Ray | `ElderRay` | Bull / bear power split. |
| Price Oscillator | `PriceOscillator` | Percent-PPO with signal/histogram. |
| Coppock Curve | `CoppockCurve` | WMA of summed long/short ROCs. |
| TRIX | `TRIX` | ROC of triple-smoothed EMA. |
| KST | `KST` | "Know Sure Thing" weighted ROC sum + signal. |

### Trend

| Indicator | Export | Description |
|-----------|--------|-------------|
| Average Directional Index | `ADX` | Trend strength irrespective of direction. |
| Directional Movement Index | `DMI` | `+DI`, `−DI`, ADX. |
| Ichimoku Cloud | `Ichimoku` | Conversion / base / spans / lagging. |
| Parabolic SAR | `PSAR` | Welles Wilder's trailing stop. |
| Supertrend | `SuperTrend` | ATR-based dynamic support/resistance. |
| Aroon | `Aroon` | Bars-since-extreme up/down lines. |
| Choppiness | `Choppiness` | Range-vs-volatility chop measure. |
| Mass Index | `MassIndex` | Reversal detection via H-L EMA ratio. |
| Vortex | `Vortex` | VI+ / VI− directional pair. |
| Trend Strength Index | `TrendStrengthIndex` | Pearson correlation of close vs. bar index. |
| Chande Kroll Stop | `ChandeKrollStop` | Long / short ATR-based stop levels. |

### Volatility

| Indicator | Export | Description |
|-----------|--------|-------------|
| Average True Range | `ATR` | Wilder ATR with selectable smoothing. |
| Average Daily Range | `ADR` | SMA of `high − low`. |
| Historical Volatility | `HistoricalVolatility` | Annualized stdev of log returns. |
| Bollinger BandWidth | `BBBandWidth` | `(upper − lower) / basis × 100`. |
| Standard Deviation | `StandardDeviation` | Streaming biased stdev provider. |

### Channels & Bands

| Indicator | Export | Description |
|-----------|--------|-------------|
| Bollinger Bands | `BollingerBands` | SMA ± k × stdev. |
| Donchian Channels | `DC` | Highest-high / lowest-low envelope. |
| Keltner Channel | `KeltnerChannel` | EMA / ATR envelope. |
| Envelopes | `Envelopes` | Fixed-percentage MA bands. |
| Median (with bands ready upstream) | `Median` | Rolling median of HL2. |

### Volume

| Indicator | Export | Description |
|-----------|--------|-------------|
| On Balance Volume | `OBV` | Cumulative signed volume. |
| Money Flow Index | `MFI` | Volume-weighted RSI. |
| Price Volume Trend | `PVT` | Volume scaled by relative price change. |
| Volume Oscillator | `VolumeOscillator` | Difference between volume EMAs. |
| Chaikin Oscillator | `ChaikinOscillator` | EMA spread of A/D line. |
| Chaikin Money Flow | `ChaikinMF` | A/D divided by volume over a window. |
| Ease of Movement | `EaseOfMovement` | Price change vs. volume. |
| Klinger Oscillator | `Klinger` | Long-term money-flow oscillator. |
| Net Volume | `NetVolume` | Signed volume by candle direction. |
| Volume Profile *(beta)* | `VolumeProfile` | Volume distribution by price levels. |

### Candles & Pivots

| Indicator | Export | Description |
|-----------|--------|-------------|
| Heiken Ashi | `HeikenAshi` | Smoothed candle stream. |
| Fractal | `Fractal` | Bill Williams 5-bar fractals. |
| Pivot Levels | `Pivot` | Classic / Woodie / Camarilla / Fibonacci. |
| Trend Lines | `TrendLines` | Pivot-derived trend line detection. |
| Extremums | `Extremums` | Fractal-style local extrema provider. |

### Move / Wave (custom)

| Indicator | Export | Description |
|-----------|--------|-------------|
| Move | `Move` | Direction move with minimum power `p`. |
| Wave | `Wave` | Bullish/bearish candle series with power `p`. |

## Candlestick Patterns

```ts
import { Doji, BullishEngulfingPattern, HammerPattern } from '@debut/indicators';

const doji = new Doji();
const engulfing = new BullishEngulfingPattern();
const hammer = new HammerPattern();   // 5-bar with confirmation candle

for (const bar of bars) {
    if (doji.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Doji', bar.time);
    if (engulfing.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Bull Engulfing', bar.time);
    if (hammer.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Hammer', bar.time);
}
```

`nextValue` returns `true` when the pattern fires, `false` if not, and `undefined` while it's still warming up (multi-bar patterns need their full lookback first).

### Configurable thresholds

Each pattern accepts an options bag in its constructor. The defaults match `technicalindicators` exactly; tighten or loosen them as you see fit.

| Option | Used by | Default | Description |
|--------|---------|---------|-------------|
| `precision` | Doji-family, Marubozu, hammer-stick, HaramiCross, HammerPattern, HangingMan, ShootingStar, Abandoned/Doji-Star variants | `0.001` | Fuzzy-match tolerance: how close `open`≈`close` (or `body`-touches-`high`/`low`) must be to qualify as "equal". `0.001` ≈ 0.1% relative. |
| `shadowToBodyRatio` | Hammer-stick variants, HammerPattern, HangingMan, ShootingStar | `2` | The opposing shadow must be at least this many times the body length. |
| `minShadowToBodyRatio` | SpinningTop variants | `1` | Both shadows must be strictly larger than the body by this ratio. |
| `equalityTolerance` | Tweezer-Bottom/Top | `0` (exact) | How close `low[i]`/`high[i]` of the two candles must be. |
| `confirm` | HammerPattern, HangingMan, ShootingStar | `true` | Require the 5th bar's confirmation candle. The `*Unconfirmed` variants flip this to `false`. |

```ts
const wideDoji = new Doji({ precision: 0.005 });           // 0.5% relative tolerance
const fastHammer = new HammerPattern({ confirm: false });  // skip the confirmation candle
const looseTweezer = new TweezerBottom({ equalityTolerance: 0.0001 });
```

### Combined scanners

If you want to scan a bar against many patterns at once, use one of the three combined scanners. They share the singleton `OhlcBuffer` declared inside the patterns module so you don't pay for per-pattern buffers.

```ts
import { AllCandlestickPatterns, BullishPatterns, BearishPatterns } from '@debut/indicators';

const all = new AllCandlestickPatterns();
const bull = new BullishPatterns();
const bear = new BearishPatterns();

for (const bar of bars) {
    const fired = all.nextValue(bar.open, bar.high, bar.low, bar.close);
    if (fired.length) console.log(bar.time, fired);
    // → e.g. [1700000000, ['BullishHammerStick', 'BullishMarubozu']]

    if (bull.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('any bullish');
    if (bear.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('any bearish');
}
```

`AllCandlestickPatterns.nextValue` returns the array of pattern names that fired on the bar; `BullishPatterns` / `BearishPatterns` return a single boolean ("did *any* pattern fire").

### Singleton buffer & resetting between streams

All multi-bar patterns share one `OhlcBuffer(5)` declared at module scope in `src/candlestick/patterns.ts`. The first pattern that sees a brand-new bar advances the buffer; later calls within the same tick are dedup'd by OHLC equality. This means dropping in a fresh pattern instance is essentially free — there's no per-pattern ring allocation.

If you switch between independent bar streams (or want a clean slate between test cases), call `BasePattern.reset()`:

```ts
import { BasePattern } from '@debut/indicators/lib/src/candlestick/patterns';

BasePattern.reset(); // clears the singleton OHLC ring + dedupe state
```

### Namespaced import

If you'd rather not pull 35 symbols into scope:

```ts
import { Candlestick } from '@debut/indicators';

const doji = new Candlestick.Doji();
const all = new Candlestick.AllCandlestickPatterns();
```

### Pattern catalog

| Lookback | Patterns |
|----------|----------|
| 1 bar    | `Doji`, `DragonFlyDoji`, `GraveStoneDoji`, `BearishHammerStick`, `BullishHammerStick`, `BearishInvertedHammerStick`, `BullishInvertedHammerStick`, `BearishMarubozu`, `BullishMarubozu`, `BearishSpinningTop`, `BullishSpinningTop` |
| 2 bars   | `BearishEngulfingPattern`, `BullishEngulfingPattern`, `BearishHarami`, `BullishHarami`, `BearishHaramiCross`, `BullishHaramiCross`, `DarkCloudCover`, `PiercingLine` |
| 3 bars   | `AbandonedBaby`, `DownsideTasukiGap`, `EveningStar`, `EveningDojiStar`, `MorningStar`, `MorningDojiStar`, `ThreeBlackCrows`, `ThreeWhiteSoldiers` |
| 5 bars   | `HammerPattern`, `HammerPatternUnconfirmed`, `HangingMan`, `HangingManUnconfirmed`, `ShootingStar`, `ShootingStarUnconfirmed`, `TweezerBottom`, `TweezerTop` |

## Utilities

| Export | Description |
|--------|-------------|
| `CircularBuffer` | Fixed-size ring buffer with `at()` / `peek()` / `forEach()`. Powers most rolling-window indicators. |
| `Sampler` | Sample-of-sample provider for stacking smoothing (e.g. `SMA(SMA(SMA(...)))`). |
| `Correlation` | Streaming Pearson correlation. |
| `Level`, `UniLevel` | Dynamic level (UniLevel: balanced around 0). |
| `Extremums` | Fractal-style local extrema. |
| `Candles` | Per-bar candlestick context (body, shadows, doji, trend) shared by pattern detectors. |

## Cross-SDK validation

Every ported indicator and candlestick pattern has a vitest-style spec in `tests/<name>/<name>.spec.ts` that:

1. Generates deterministic synthetic OHLCV bars with a seeded LCG (see `tests/lwc-fixtures.ts`).
2. Runs them through the streaming `@debut/indicators` class.
3. Runs the same bars through the corresponding [`lightweight-charts-indicators`](https://github.com/deepentropy/lightweight-charts-indicators) `calculate()` (or `technicalindicators` for the older specs).
4. Asserts numeric equality with epsilon ≤ 1e-9 (or set membership for boolean pattern firings).

Run `npm test` to execute the full suite.

## Benchmarks

Apple M1 Pro, Node v16.14.0. Tested on dataset with 100k elements.

| Indicator name | @debut/indicators (ops/sec) | technicalindicators (ops/sec) | indicatorts (ops/sec) |
|:---:|:---:|:---:|:---:|
| AwesomeOscillator | 318 | 23 | 158 |
| ADX | 358 | 42 | x |
| ATR | 613 | 136 | 95 |
| Bollinger Bands | 347 | 9 | 219 |
| CCI | 151 | 12 | 158 |
| DC | 474 | x | 74 |
| PSAR | 1,453 | 278 | 666 |
| EMA | 1,720 | 452 | 1,537 |
| MACD | 1,417 | 90 | 467 |
| ROC | 3,625 | 64 | x |
| RSI | 1,239 | 38 | 315 |
| SMA | 678 | 65 | 645 |
| WEMA | 1,462 | 455 | x |
| WMA | 287 | 41 | x |
| Stochastic | 340 | 25 | 67 |

*Benchmarks results is autogenerated by https://github.com/debut-js/indicators-benchmark*

## License

GPL-3.0
