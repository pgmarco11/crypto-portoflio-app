import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Coin from '../Coin';
  
const CoinList = ({ coinId }) => {

  const [setCoinInfo] = useState([]);
   
  useEffect(() => {
        // GET request using axios inside useEffect React hook
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`)
            .then(coin => {
              setCoinInfo(coin.data)
            });
    
    // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }, []);

  console.log(setCoinInfo);


return(
          <Coin 

				        //timeframe={} 
				        //timeframe2M={} 
				      //launchDate={coinInfo.email}
              //  coinName={coinInfo.name}
               // coinSymbol={coinSymbol.symbol}
               // price={coinInfo.price}
              //  marketCap={coinInfo.marketCap}
              //  capCategory={coinInfo.capCategory}
            //    volume={coinInfo.volume}
             //   change24h={change24h}
            //    oneYearUSDpercent={oneYearUSDpercent}
            //    oneYearBTCchange={oneYearBTCchange}
            //    oneYearBTCpercentChange={oneYearBTCpercentChange}
             ///   twoMonthChange={twoMonthChange}
             //   inceptionPercentageNow={inceptionPercentageNow}
             //   futureGain={futureGain}
             //   zoneRating={zoneRating}

           />
   
  );
}

export default CoinList;