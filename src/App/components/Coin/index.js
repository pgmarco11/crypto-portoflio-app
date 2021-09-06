import React from 'react';

const Coin = ({ timeframe, timeframe2M, launchDate, coinName, coinSymbol, price, marketCap, capCategory, volume, change24h, oneYearUSDpercent, oneYearBTCchange,  oneYearBTCpercentChange, twoMonthChange,inceptionPercentageNow, futureGain,zoneRating }) => {
        return(
          <div className="card">
              <div className="card-body">
                <table className="w-100 coinTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Market Cap</th>
                    <th>Cap Category</th>
                    <th>Volume</th>
                    <th>USD % Change <br/>in 24H</th>
                    <th>USD {timeframe} % <br/>Increase / Decrease</th>
                    <th>BTC {timeframe}  <br/>Increase / Decrease</th>
                    <th>BTC {timeframe}  % <br/>Increase / Decrease</th>
                    <th>USD {timeframe2M} % <br/>Increase / Decrease</th>
                    <th>USD Launch {launchDate} % <br/>Increase / Decrease</th>
                    <th>1Y Prediction</th>
                    <th>Future 1Y %<br/>Gain</th>
                    <th>Zone Points</th>
                    <th>Exchange</th>
                    <th>Wallet Name</th>
                    <th>Notes</th>
                  </tr>
                  </thead>
                  <tbody>            
                  <tr>
                    <td>{coinName} &middot; <span style={{textTransform:'uppercase'}}>{coinSymbol}</span></td>
                    <td>{price}</td>
                    <td>{marketCap}</td>
                    <td>{capCategory}</td>
                    <td>{volume}</td>
                    <td>{change24h}</td>
                    <td>{oneYearUSDpercent}</td>	
                    <td>{oneYearBTCchange}</td>
                    <td>{oneYearBTCpercentChange}</td>
                    <td>{twoMonthChange}</td>                             
                    <td>{inceptionPercentageNow}</td>                           
                    <td><input type='text' name='predictionAmount' />
                    <button>Save</button>
                    </td>
                    <td>{futureGain}</td>
                    <td>{zoneRating}</td>                             
                  </tr>                               
                  </tbody>
                </table>
              </div>
            </div> 
        );
}
export default Coin;