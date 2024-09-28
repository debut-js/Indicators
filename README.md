![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)
# Streaming Technical Indicators
## High performance for you trading application

The main feature of these indicators is their continuous operation, which means that you can use them both for real trading and for teaching trading strategies on history, since this is a passage from the beginning to the end of the stream of candles. This approach allows you to reduce the number of necessary calculations by tens of times and is the most optimal in terms of performance.

## Features
- High performance
- Easy to use with candles streaming
- Minimal state for calculation
- Moment value (possible to calculate every tick)
- Typescript
- Unit Tested / Cross SDK Validated

## Available Indicators
- [Accelerator Oscillator (AO)](./docs/AcceleratorOscillator.md).
- [Adaptive Moving Average (AMA)](./docs/AdaptiveMovingAverage.md).
- [Average True Range (ATR)](./docs/AverageTrueRange.md).
- [Awesome Oscillator (AC)](./docs/AwesomeOscillator.md).
- [Average Directional Index  (ADX)](./docs/AverageDirectionalIndex.md).
- [Bollinger Bands (BB)](./docs/BollingerBands.md).
- [Chaikin Oscillator](./docs/ChaikinOscillator.md).
- [Commodity Channel Index (CCI)](./docs/CommodityChannelIndex.md).
- [Connor's RSI (CRSI)](./docs/ConnorsRSI.md).
- [Donchian Channels (DC)](./docs/DonchianChannels.md).
- [Exponential Moving Average (EMA)](./docs/ExponentialMovingAverage.md).
- [Exponential Weighted Moving Average (EWMA)](./docs/ExponentialWeightedMovingAverage.md).
- [Linearly Weighted Moving Average (LWMA)](./docs/LinearlyWeightedMovingAverage.md).
- [Moving Average Convergence Divergence (MACD)](./docs/MovingAverageConvergenceDivergence.md).
- [Money Flow Index (MFI)](./docs/MoneyFlowIndex.md).
- [Pivot Point Levels (classic / woodie /camarilla / fibonacci)](./docs/PivotPointLevels.md).
- [Rate of Change (ROC)](./docs/RateofChange.md).
- [Relative Strength Index (RSI)](./docs/RelativeStrengthIndex.md).
- [Simple Moving Average (SMA)](./docs/SimpleMovingAverage.md).
- [Smoothed Moving Average (SMMA)](./docs/SmoothedMovingAverage.md).
- [SuperTrend MTF (ST MTF)](./docs/SuperTrend.md).
- [Stochastic Oscillator (KD)](./docs/StochasticOscillator.md).
- [Stochastic Rsi (KD)](./docs/StochasticRsi.md).
- [Wilder's Smoothed Moving Average (WEMA)](./docs/WildersSmoothedMovingAverage.md).
- [Welles Wilder's Smoothing Average (WWS)](./docs/WellesWildersSmoothingAverage.md).
- [Weighted moving average (WMA)](./docs/WeightedMovingAverage.md)
- [Parabolic Stop And Reverse (PSAR)](./docs/ParabolicStopAndReverse.md).
- Volume Profile (TBD)

## Candles
- Heiken Ashi.

## Utils
- Standard Deviation (SD).
- Correlation.
- Circullar buffer. This is simple streaming array for pop and push (performance optimized).
- Sampler. This is sample creator, for indicators like `SMA`, for easy getting SMA(SMA(SMA(SMA())) some sampled x-times values.
- [UniLevel](./docs/UniLevel.md). Dynamic levels for single number value 0 balanced (values between -N and +N).


## Next value (indicator.nextValue)
This method allows you to get the current value of the indicator, usually performed according to the data of a closed candle. The method call affects all subsequent calculations of the indicator readings.

## Moment value (indicator.momentValue)
The method of calculating the instantaneous value of the indicator allows you to obtain information about the indicator readings in real time, without affecting future readings. This allows you to work with the indicator inside the candle.

## Download

Releases are available under Node Package Manager (npm):

    npm install @debut/indicators

## Example with Simple Moving Average

```js
import { SMA } from '@debut/indicators';
const sma = new SMA(4); // Create SMA with 4 period

// SMA workflow
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

sma.nextValue(1); // undefined
sma.nextValue(2); // undefined
sma.nextValue(3); // undefined
sma.nextValue(4); // 2.50
sma.nextValue(5); // 3.50
sma.nextValue(6); // 4.50
sma.nextValue(7); // 5.50
sma.momentValue(8); // 6.50
sma.nextValue(8); // 6.50
sma.momentValue(9); // 7.50
sma.nextValue(9); // 7.50

```
### Extra custom indicators
- MOVE (direction move with power no less than p)
- WAVE (directional move with bearish or bullish candle series and power p)

## Benchmarks

Apple M1 Pro, Node v16.14.0. Tested on dateset with 100k elements.

| Indicator name | @debut/indicators (ops/sec)|technicalindicators (ops/sec)|indicatorts (ops/sec)|
|:---------------:|:---------------:|:---------------:|:---------------:|
|AwesomeOscillator|318|23|158|
|ADX|358|42|x|
|ATR|613|136|95|
|Bollinger Bands|347|9|219|
|CCI|151|12|158|
|DC|474|x|74|
|PSAR|1,453|278|666|
|EMA|1,720|452|1,537|
|MACD|1,417|90|467|
|ROC|3,625|64|x|
|RSI|1,239|38|315|
|SMA|678|65|645|
|WEMA|1,462|455|x|
|WMA|287|41|x|
|Stochastic|340|25|67|


*Benchmarks results is autogenerated by https://github.com/coin-unknown/indicators-benchmark*


