import React from 'react';


function CoinTableHeader( {           
    handleSortByName,
    handleSortByMarketCap,
    handleSortByVolume,
    handleSortByUSD1YR,
    handleSortByBTC1YR,
    handleSortByBTC1YrPrice,
    handleSortByInPriceChange,
    handleCoinRating,
    handleBuySell,
    handleAvgFutureGain,
    handleSortTwitter,
    handleSortByThreeMonthChange,
    handleSortByMaxGrade,
    handleSortFutureGain,
    handleAllTimeHigh,
    handleSortGitSource,    
    nameSortOrder, 
    marketCapSortOrder, 
    volumeSortOrder,
    BTC1YRSortOrder,
    USD1YRSortOrder,
    BTC1YrPriceSortOrder,
    inPriceChangeSortOrder,
    threeMonthsChangeSortOrder,
    maxGradeSortOrder,
    futurePredSortOrder,
    avgGainPredSortOrder,
    allTimeHighSortOrder,
    twitterSortOrder,
    gitSourceSortOrder,
    coinRatingSortOrder,
    buySellSortOrder }) {
  return (
    <div className="coin-table-header">
      <div className="headerCell" align="left" onClick={handleSortByName}>
        Coin {nameSortOrder === "asc" ? <i className="arrow up icon"></i> : nameSortOrder === "desc" ? <i className="arrow down icon"></i> : <i className="arrow icon"></i>}
      </div>
      <div className="headerCell" align="left"                onClick={handleSortByMarketCap}
              >
                Market Cap{" "}
                {marketCapSortOrder === "asc" ? (
                  <i className="arrow up icon"></i>
                ) : marketCapSortOrder === "desc" ? (
                  <i className="arrow down icon"></i>
                ) : (
                  <i className="arrow icon"></i>
                )}
              </div>
              <div
                className="headerCell"
                align="left"
                onClick={handleSortByVolume}
              >
                Volume{" "}
                {volumeSortOrder === "asc" ? (
                  <i className="arrow up icon"></i>
                ) : volumeSortOrder === "desc" ? (
                  <i className="arrow down icon"></i>
                ) : (
                  <i className="arrow icon"></i>
                )}
              </div>
              <div className="headerCell" align="left"
              >              
                Price{" "}
                
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByUSD1YR}
              >
                USD 1YR % Change{" "}
                {USD1YRSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : USD1YRSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )}
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByBTC1YR}
              >
                BTC 1YR % Change{" "}
                {BTC1YRSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : BTC1YRSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByBTC1YrPrice}
              >
                BTC 1YR Change{" "}
                {BTC1YrPriceSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : BTC1YrPriceSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByInPriceChange}
              >
                Inception % Change{" "}
                {inPriceChangeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : inPriceChangeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell"
              align="left"
              onClick={handleSortByThreeMonthChange}
              >
                3 Months % Change{" "}
                {threeMonthsChangeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : threeMonthsChangeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell"
              align="left"
              onClick={handleSortByMaxGrade}
              >
                Max Chart Grade{" "}
                 {maxGradeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : maxGradeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div className="headerCell" align="left">
                Price Prediction{" "}
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortFutureGain}
              >
                Future Gain Prediction{" "}
                { futurePredSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) :  futurePredSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleAvgFutureGain}
              >
                Avg. Gain Prediction{" "}
                {avgGainPredSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : avgGainPredSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div className="headerCell"
                   align="left"
                   onClick={handleAllTimeHigh}
              >
                % from ATH{" "}
                {allTimeHighSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : allTimeHighSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div  className="headerCell" 
                    align="left"
                    onClick={handleSortTwitter}
              >
                Twitter Followers{" "}
                 {twitterSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : twitterSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div  className="headerCell" 
                    align="left"
                    onClick={handleSortGitSource}
              >
                Git Source{" "}
                 {gitSourceSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : gitSourceSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>

              <div  className="headerCell" 
                    align="left"
                    onClick={handleCoinRating}
              >
                Coin Rating{" "}
                 {coinRatingSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : coinRatingSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div  className="headerCell" 
                    align="left"
                    onClick={handleBuySell}
              >
                Buy/Sell{" "}
                {buySellSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : buySellSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>


    </div>
  );
}

export default CoinTableHeader;
