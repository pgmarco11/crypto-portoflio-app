import { React } from "react";

function CoinTableRow({ coin, handleCoinPrediction, removeCoinHandler, handleInputChange, coinInputValues  }) {

  // Handle input change
  async function handleChange(event, coin) { 
    const newValue = event.target.value;
    handleInputChange(newValue, coin);
  };



  console.log("handleCoinPrediction coinInputValues : ", coinInputValues)
  console.log("handleCoinPrediction coinInputValues coin: ", coin)
  console.log("handleCoinPrediction coinInputValues coin id: ", coin.id)
  console.log("handleCoinPrediction coinInputValues coinInputValues id: ", coinInputValues[coin.id])
  

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
                  {coin.marketCap.toLocaleString("en-US")}
                 </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.volume && parseInt(coin.volume) > 250000 ? 'bold' : 'normal'}}>
                  {coin.volume.toLocaleString("en-US")}
                </div>
                <div className="item rowCell" align="left">
                  {coin.current_price.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 8})}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearPercentChange && parseInt(coin.oneYearPercentChange) > 2 ? 'bold' : 'normal'}}>
                  {coin.oneYearPercentChange.toLocaleString(
                    undefined, {  minimumFractionDigits: 4, 
                                  style: "percent" 
                              }
                    )}                 
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearBTCPercentChange && parseInt(coin.oneYearBTCPercentChange) > 2 ? 'bold' : 'normal'}}>
                  {coin.oneYearBTCPercentChange.toLocaleString(
                    undefined,
                    { style: "percent" }
                  )}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.oneYearBTCPriceChange && parseFloat(coin.oneYearBTCPriceChange) > 0.0000001 ? 'bold' : 'normal'}}>
                  {coin.oneYearBTCPriceChange.toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 10 }
                  )}
                  {/* oneYearBTCPercentChange > 2.0) */}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.inceptionPriceChange && parseInt(coin.inceptionPriceChange) > 30 ? 'bold' : 'normal'}}>
                  {coin.inceptionPriceChange.toLocaleString(
                    undefined,
                    { style: "percent" }
                  )}
                </div>
                <div className="item rowCell" align="left"
                style={{fontWeight: coin.ninetyDaysPercentChange && parseInt(coin.ninetyDaysPercentChange) > 14 ? 'bold' : 'normal'}}>
                  {coin.ninetyDaysPercentChange.toLocaleString(
                    undefined,
                    { style: "percent" }
                  )}
                </div>
                <div className="item rowCell" align="left"                
                style={{fontWeight: coin.inceptionPriceChange && parseInt(coin.inceptionPriceChange) > 30 ? 'bold' : 'normal'}}>
                  {coin.maxChartGrade}
                </div>
                <div className="item rowCell" align="left">
                <input
                    type="number"
                    step="any" // Allows decimal input
                    style={{ width: '80px' }}               
                    value={coinInputValues[coin.id] !== '' && !coinInputValues[coin.id] ? coin.prediction : coinInputValues[coin.id]  } 
                    onChange={(e) => handleChange(e,coin.id)}
                  />
                </div>
                <div className="item rowCell" align="left"
                 style={{fontWeight: coin.gainPrediction && parseInt(coin.gainPrediction) > 3 ? 'bold' : 'normal'}}>
                  {coin.gainPrediction}
                </div>
                <div className="item rowCell" align="left"
                 style={{fontWeight: coin.avgGainPrediction && parseInt(coin.avgGainPrediction) > 3 ? 'bold' : 'normal'}}>
                  {coin.avgGainPrediction}
                </div>
                <div className="item rowCell" align="left"
                >
                  {coin.highestPricePercentage.toLocaleString(
                    undefined,
                    { style: "percent" }
                  ) || "-"}
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
                            coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange)  < 40 ? 
                                'bold' :
                                'normal', 
                color: coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange) < 40 ?
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
                        coinInputValues[coin.id],
                        coin.current_price,
                        coin.id,
                        coin.oneYearPercentChange,
                        coin.buysellrating,
                        coin.buysell,
                        coin.ninetyDaysPercentChange
                      )
                    }
                    
                    //disabled={coin.prediction === prediction ? false : !inputValue}
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

