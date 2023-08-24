import React from 'react';

function CoinTableRow({ coin, handleInputChange, handleCoinPrediction, removeCoinHandler, inputValue }) {
  return (
    <div className="coin-table-row" key={coin.id}>
       <div className="item rowCell" align="left">
                  {coin.website !== "N/A" ? (
                    <a href={coin.website}>{coin.name}</a>
                  ) : (
                    <div>{coin.name}</div>
                  )}
                </div>
                <div className="item rowCell" align="left">
                  {coin.marketCap}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.volume && parseInt(coin.volume.replace(/,/g, "")) > 250000 ? 'bold' : 'normal'}}>
                  {coin.volume}
                </div>
                <div className="item rowCell" align="left">
                  {coin.current_price.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 8})}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearPercentChange && parseInt(coin.oneYearPercentChange.replace(/,/g, "")) > 2 ? 'bold' : 'normal'}}>
                  {coin.oneYearPercentChange}                 
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearBTCPercentChange && parseInt(coin.oneYearBTCPercentChange.replace(/,/g, "")) > 2 ? 'bold' : 'normal'}}>
                  {coin.oneYearBTCPercentChange}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearBTCPriceChange && parseFloat(coin.oneYearBTCPriceChange) > 0.0000001 ? 'bold' : 'normal'}}>
                  {coin.oneYearBTCPriceChange}
                  {/* oneYearBTCPercentChange > 2.0) */}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.inceptionPriceChange && parseInt(coin.inceptionPriceChange.replace(/,/g, "")) > 30 ? 'bold' : 'normal'}}>
                  {coin.inceptionPriceChange}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.ninetyDaysPercentChange && parseInt(coin.ninetyDaysPercentChange.replace(/,/g, "")) > 14 ? 'bold' : 'normal'}}>
                  {coin.ninetyDaysPercentChange}
                </div>
                <div className="item rowCell" align="left"                
                style={{fontWeight: coin.inceptionPriceChange && parseInt(coin.inceptionPriceChange.replace(/,/g, "")) > 30 ? 'bold' : 'normal'}}>
                  {coin.maxChartGrade}
                </div>
                <div className="item rowCell" align="left">
                  <input
                    type="text"
                    onChange={
                        (e) => handleInputChange(e.target.value, coin?.id, coin?.buysellrating, coin?.gainPrediction, coin?.avgGainPrediction)
                    }
                  />
                </div>
                <div className="item rowCell" align="left"
                 style={{fontWeight: coin.gainPrediction && parseInt(coin.gainPrediction.replace(/,/g, "")) > 3 ? 'bold' : 'normal'}}>
                  {coin.gainPrediction || "-"}
                </div>
                <div className="item rowCell" align="left"
                 style={{fontWeight: coin.avgGainPrediction && parseInt(coin.avgGainPrediction.replace(/,/g, "")) > 3 ? 'bold' : 'normal'}}>
                  {coin.avgGainPrediction || "-"}
                </div>
                <div className="item rowCell" align="left"
                >
                  {coin.highestPricePercentage || "-"}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.twitterFollowers > 25000 ? 'bold' : 'normal'}}>             
                  <a href={coin.twitterURL} >{coin.twitterFollowers}</a>
                </div>
                <div className="item rowCell" align="left">
                  {coin.gitRepository !== "N/A" ? (
                    <a href={coin.gitRepository}>Git</a>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: parseInt(coin.rating) > 3 ? 'bold' : 'normal'}}>
                
                  {coin.rating}
                </div>
                <div className="item rowCell" align="left"
                style={{                  
                fontWeight: coin.buysell === "BUY" || coin.buysell === "SELL" ? 'bold' :
                            coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange.replace(/,/g, ""))  < 40 ? 
                                'bold' :
                                'normal', 
                color: coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange.replace(/,/g, "")) < 40 ?
                                'red' :
                                'inherit'              
                  }}>
                  {coin.buysell}
                </div>
                <div className="item rowCell" align="left">
                  <button
                    className="ui red basic button"
                    onClick={() =>
                      handleCoinPrediction(
                        inputValue,
                        coin.current_price,
                        coin.id,
                        coin.oneYearPercentChange,
                        coin.buysellrating,
                        coin.buysell,
                        coin.ninetyDaysPercentChange
                      )
                    }
                    
                    disabled={coin.prediction === inputValue ? false : !inputValue}
                  >
                    Update Rating
                  </button>
                  <button
                    className="ui red basic button"
                    onClick={() => removeCoinHandler(coin.id)}
                  >
                    Delete
                  </button>
                </div>
    </div>
  );
}

export default CoinTableRow;
