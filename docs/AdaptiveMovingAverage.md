# Adaptive Moving Average (AMA)

The **Adaptive Moving Average (AMA)** is a trend-following technical indicator developed by Perry Kaufman. It adjusts its sensitivity to price changes based on market volatility, making it useful for smoothing price data and filtering out market noise.

## Key Features

- **Dynamic Adjustments**: AMA adapts to market conditions by using a variable smoothing constant. This allows the indicator to react quickly to market trends while minimizing false signals during sideways markets.
- **Sensitivity to Volatility**: The smoother the market (less volatility), the slower the AMA will move, filtering out the noise. In contrast, in volatile market conditions, the AMA will respond faster to price movements.
- **Trend Detection**: AMA is particularly useful in identifying trends and spotting reversals.

## Calculation

The formula for AMA involves several steps, including determining the efficiency ratio (ER), which measures the market's trend strength relative to volatility.

1. **Efficiency Ratio (ER)**:  
   The ER is calculated by dividing the absolute price change over a period by the sum of the absolute price changes for each bar within the same period.
   
   \[
   ER = \frac{\text{Price Change (Abs)}}{\text{Sum of Absolute Price Changes}}
   \]

2. **Smoothing Constant (SC)**:  
   The smoothing constant adjusts based on the ER. A higher ER leads to a faster reaction, while a lower ER results in slower smoothing. The smoothing constant is calculated as:

   \[
   SC = \left( ER \times (FastSC - SlowSC) + SlowSC \right)^2
   \]

   Where:
   - **FastSC**: Faster smoothing constant (commonly set to 2)
   - **SlowSC**: Slower smoothing constant (commonly set to 30)

3. **AMA Formula**:  
   Once the ER and SC are determined, the AMA is calculated as:

   \[
   AMA_{today} = AMA_{yesterday} + SC \times (Price_{today} - AMA_{yesterday})
   \]

## Usage

- **Identifying Trends**: AMA can be used to determine the overall trend direction. When the price is above the AMA, it indicates a bullish trend; when below, it suggests a bearish trend.
- **Reversal Signals**: A significant change in AMA's direction may signal a potential market reversal.
- **Filtering Noise**: By adjusting to market conditions, AMA helps traders avoid reacting to minor price fluctuations and focus on significant trends.

## Settings

Typical parameters for the AMA indicator include:
- **Fast Period**: 2 (for faster response)
- **Slow Period**: 30 (for slower smoothing)

## Conclusion

The Adaptive Moving Average (AMA) is a powerful tool for trend-following strategies, providing a dynamic approach to adjusting sensitivity based on market volatility. It’s widely used by traders to detect trends and reduce the impact of market noise, helping them make more informed trading decisions.

---

For more details, refer to the official MetaTrader 5 documentation on [AMA](https://www.metatrader5.com/en/terminal/help/indicators/trend_indicators/ama).
