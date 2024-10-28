import { React } from "react";

function CoinTableRow({ coin, coinInputValues, handleInputChange, handleCoinPrediction, removeCoinHandler }) {  


  async function handleChange(event, coin) { 
    const newValue = event.target.value;
    handleInputChange(newValue, coin);
  }

  console.log("coin rowCell Data: ", coin);
  console.log("coin rowCell coin id: ", coin.id);
  console.log("coin rowCell coinInputValues: ", coinInputValues);

  let formattedAvgGainPred; 
  let formattedGainPred;

  if(!isNaN(coin.gainPrediction) || !isNaN(coin.avgGainPrediction)){
    const coinGainPred  = coin.gainPrediction;
    const coinAvgGainPred  = coin.avgGainPrediction;
    formattedAvgGainPred = parseFloat((coinAvgGainPred * 100).toFixed(4));
    formattedGainPred = parseFloat((coinGainPred * 100).toFixed(4));
  } else {
    formattedAvgGainPred = parseInt(0);
    formattedGainPred = parseInt(0);
  }

  console.log("twitter url for "+coin.id+": "+coin.twitterURL);
  console.log("twitter followers for "+coin.id+": "+coin.twitterFollowers);

  return (
    <>
      <div className="item rowCell" align="left">
        {coin.website !== "N/A" ? (
          <a href={coin.website}>{coin.name}</a>
        ) : (
          <div>{coin.name}</div>
        )}
      </div>
      <div className="item rowCell" align="left">{parseInt(coin.marketCap) || parseInt(0)}</div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.volume && parseInt(coin.volume) > 250000 ? 'bold' : 'normal' }}>
        {coin.volume}
      </div>
      <div className="item rowCell" align="left">{parseFloat(coin.coinCurrentPrice)}</div>
      <div className="item rowCell" align="center" style={{ fontWeight: coin.oneYearPercentChange && parseInt(coin.oneYearPercentChange) > 2 ? 'bold' : 'normal' }}>
        {`${coin.oneYearPercentChange}%`}                 
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.oneYearBTCPercentChange && parseFloat(coin.oneYearBTCPercentChange) > 2 ? 'bold' : 'normal' }}>
       {`${coin.oneYearBTCPercentChange}%`}
      </div>   
      <div className="item rowCell" align="left" style={{ fontWeight: coin.oneYearBTCPriceChange && parseFloat(coin.oneYearBTCPriceChange) >  0.000001 ? 'bold' : 'normal' }}>
        {coin.oneYearBTCPriceChange}             
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.ninetyDaysPercentChange && parseInt(coin.ninetyDaysPercentChange) > 14 ? 'bold' : 'normal' }}>
        {`${coin.ninetyDaysPercentChange}%`}
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.inceptionPriceChange && parseInt(coin.inceptionPriceChange) > 50 ? 'bold' : 'normal' }}>
        {`${coin.inceptionPriceChange}%`}
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.maxChartGrade && parseInt(coin.maxChartGrade) > 50 ? 'bold' : 'normal' }}>
        {coin.maxChartGrade}
      </div>
      <div className="item rowCell" align="left">
      <input
          type="number"
          step="any"
          style={{ width: '80px' }}
          value={coinInputValues[coin.id] !== '' && !coinInputValues[coin.id] ? coin.prediction : coinInputValues[coin.id]}
          onChange={(e) => handleChange(e, coin.id)}
      />
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.gainPrediction && parseInt(coin.gainPrediction) > 3 ? 'bold' : 'normal' }}>
        {formattedGainPred}
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.avgGainPrediction && parseInt(coin.avgGainPrediction) > 3 ? 'bold' : 'normal' }}>
        {formattedAvgGainPred}
      </div>
      <div className="item rowCell" align="left">
        {`${parseFloat(coin.highestPricePercentage) || parseInt(0)}%`}
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: coin.twitterFollowers > 25000 ? 'bold' : 'normal' }}>
       { (isNaN(coin.twitterFollowers) || coin.twitterFollowers === null) && coin.twitterURL === null ? (
          "No Twitter Data"
        ) : isNaN(coin.twitterFollowers) || coin.twitterFollowers === null ? (
          <a href={coin.twitterURL}>Link</a>
        ) : (
          <a href={coin.twitterURL}>{coin.twitterFollowers}</a>
        )}
      </div>
      <div className="item rowCell" align="left">
        {coin.gitRepository !== "N/A" ? (
          <a href={coin.gitRepository}>Git</a>
        ) : (
          "No Git Data"
        )}
      </div>
      <div className="item rowCell" align="left" style={{ fontWeight: parseInt(coin.rating) > 3 ? 'bold' : 'normal' }}>
        {coin.rating}
      </div>
      <div className="item rowCell" align="left" style={{
        fontWeight: coin.buysell === "BUY" || coin.buysell === "SELL" ? 'bold' :
                    coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange) < 40 ? 
                      'bold' :
                      'normal', 
        color: coin.buysell === "BUY" && parseInt(coin.ninetyDaysPercentChange) < 40 ? 'red' : 'inherit'
      }}>
        {coin.buysell}
      </div>
      <div className="item rowCell" align="left">
        <button
          className="ui red basic button"
          onClick={() =>
            handleCoinPrediction(
              coinInputValues[coin.id],
              coin.coinCurrentPrice,
              coin.id,
              coin.oneYearPercentChange,
              coin.buysellrating,
              coin.buysell,
              coin.ninetyDaysPercentChange
            )
          }
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
      </>
  );
}
export default CoinTableRow;