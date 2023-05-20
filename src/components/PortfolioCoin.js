import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import useCoinData from './useCoinData';
import api from '../api/portfolios';


const PortfolioCoin = (props) => {  

    const { coinData, resetCoinData, updateCoinData, change7Days, change24Hours, change30Days} = useCoinData(props.coinId);      

    const [newMarketCap, setNewMarketCap] = useState('');
    const [newChange7Days, setNewChange7Days] = useState(''); 
    const [newChange30Days, setNewChange30Days] = useState('');

    useEffect(() => {
      // Sort the coins based on coinData.PRICE, change7Days, or change30Days
      if (coinData) {
        // Example sorting logic using coinData.PRICE
        const sortedCoinsByPrice = coins.sort((a, b) => {
          return a.coinData.PRICE - b.coinData.PRICE;
        });
  
        // Use the sorted coins in your parent component logic
      }
    }, [coinData]);
  


    async function getMarketCap(coinId) {
      try {
  
        const response = await api.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);
  
        const marketCap = response.data.data.marketcap.current_marketcap_usd;
        
        return marketCap;
        
      } catch (error) {
        console.error(error);
      }
    }  
   
    async function get7DayChange(coinId) {

    try { 
            // Get historical price data for the asset
            const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`, {
              params: {
                interval: '1d',
                format: 'json',
                timestamp_start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Get data from 7 days ago to now
              },
            });

            if (response.status === 404) {
              return '-';
            }

            if(response.data.data.values){

              const priceData = response.data.data.values; 
              const sevenDaysAgo = new Date();

              if(priceData !== null) {

                  console.log("priceData: "+priceData);            
            
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

                  console.log("sevenDaysAgo: "+sevenDaysAgo);
                
                  const filteredData = priceData.filter(
                    (item) => item[0] >= sevenDaysAgo.getTime()
                  );      
            
                  const timestamps = filteredData.map((item) => item[0]); 

                  console.log("timestamps: "+timestamps);            

                  const sevenDaysAgoPrice = priceData.filter(row => row[0] === timestamps[0]).map(row => row[3]);

                  console.log("sevenDaysAgoPrice: "+sevenDaysAgoPrice);

                  console.log("coinData.PRICE: "+coinData.PRICE);
            
                  const priceNow = coinData.PRICE;
            
                if(timestamps[0] !== undefined && timestamps){
            
                  const new7DayChangePercentage = ((priceNow - sevenDaysAgoPrice) / sevenDaysAgoPrice);
                  return new7DayChangePercentage;
            
                } else {
            
                  return '-'
            
                }       
            }
        } else {
            
          return '-'
    
        }
       
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return '-';
        }
        console.error(error);
      }

    }
  
    async function get30DayChange(coinId) {

      try {

            // Get historical price data for the asset
            const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`, {
                params: {
                  interval: '1d',
                  format: 'json',
                  timestamp_start: Date.now() - 30 * 24 * 60 * 60 * 1000, // Get data from 7 days ago to now
                },
            });

            if (response.status === 404) {
              return '-';
            }

          if(response.data.data.values){
                
              const priceData = response.data.data.values; 
              const thirtyDaysAgo = new Date();
          
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

              if(priceData !== null) {

                const filteredData = priceData.filter(

                  (item) => item[0] >= thirtyDaysAgo.getTime()
                );      

         
                const timestamps = filteredData.map((item) => item[0]); 
                const thirtyDaysAgoPrice = priceData.filter(row => row[0] === timestamps[0]).map(row => row[3]);

                console.log(coinId+" thirtyDaysAgoPrice: "+thirtyDaysAgoPrice)

                const priceNow = coinData.PRICE;
          
                if(timestamps[0] !== undefined && timestamps){
            
                  const new30DayChangePercentage = ((priceNow - thirtyDaysAgoPrice) / thirtyDaysAgoPrice);
            
                  return new30DayChangePercentage;
            
                } else {
            
                  return '-'
            
                }   

              }
            
          } else {
            
            return '-'
      
          }
                    
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return '-';
        }
        console.error(error);
      }
    }  
    
    const marketCap = parseInt(coinData.MKTCAP);

    if (marketCap === 0 ) {      

      async function fetchMarketCap() {
        const result = await getMarketCap(props.coinId);        
        setNewMarketCap(result);
      }
      fetchMarketCap();

    }

    console.log(props.coinId+" change7Days: "+change7Days);    

    if(change7Days === 'N/A'){

      async function fetch7DayChange() {
        const result = await get7DayChange(props.coinId)      
        setNewChange7Days(result);
      }
      fetch7DayChange(); 
      
      console.log(props.coinId+" new change7Days: "+newChange7Days);
 
    }

    console.log(props.coinId+" change30Days: "+change30Days);   

    if(change30Days === 'N/A'){

      async function fetch30DayChange() {
        const result = await get30DayChange(props.coinId)      
        setNewChange30Days(result);
      }
      fetch30DayChange(); 

      console.log(props.coinId+" new change30Days: "+newChange30Days); 
  
    }


    const handleReset = () => {
      resetCoinData();
      // Perform additional actions if needed
    };

    const handleUpdateData = () => {
      updateCoinData();
    };   

    const removeCoinHandler = async (coinId) => {        // your logic to delete the coin from the API
        try { 
            const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
            const portfolio = response.data;
            // find the index of the coin in the portfolio's coins array
            const coinIndex = portfolio.coins.indexOf(coinId);

            if (coinIndex === -1) {
            throw new Error(`Coin with id ${coinId} not found in portfolio with id ${props.PortfolioId}`);
            }
            // remove the coin from the portfolio's coins array
            portfolio.coins.splice(coinIndex, 1);

            // update the portfolio with the new coins array
            await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { coins: portfolio.coins });

            // Fetch the updated list of coins from the API
            const updatedCoinsResponse = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);

            const updatedCoins = updatedCoinsResponse.data.coins;
            const updatedCoinData =  updatedCoins.map( async coinId => {
            return axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinId}&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`)
                .then(res => {
                  const data = res.data.DISPLAY[coinId].USD;
                  return data;
                })
                .catch(err => {
                    console.error(err);
                });
            });
            handleReset();
            handleUpdateData();

            props.CoinRefresh();            

          } catch (error) {
            console.error(error);
          }
    }; 

    const addcoinIdToAnalysis = async (coinId) => {

      try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
          const portfolio = response.data;            
        
          const coinNameData = await api.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
      
          let coinName = coinNameData.data.Data.NAME.toLowerCase();

          console.log("matchingCoin: "+coinName);


          if (coinName.includes(" ")) {
              coinName = coinName.replace(/ /g, "-"); // replace all spaces with dashes
          }
          if (coinName.includes(".")) {
            coinName = coinName.replace(".", "-"); // replace all spaces with dashes
          }
          if (coinName.charAt(0) === '-') {
            coinName = coinName.substring(1); // remove first character if it is a dash
          }
          if (coinName.includes("travala")) {
             coinName = coinName.replace("travala", "concierge-io");
          }
          if (coinName.includes("juno")) {
            coinName = coinName.replace("juno", "juno-network");
          }
          if (coinName.includes("vectorspace-ai")) {
            coinName = coinName.replace("vectorspace-ai", "vectorspace");
          }
          if (coinName.includes("solve")) {
          coinName = coinName.replace("solve", "solve-care");
          }
          if (coinName.includes("retreeb")) {
            coinName = coinName.replace("retreeb", "treeb");
          }
          if (coinName.includes("floki-inu")) {
            coinName = coinName.replace("floki-inu", "floki");
          }
          if (coinName.includes("rich-quack")) {
          coinName = coinName.replace("rich-quack", "richquack");
          }
          if (coinName.includes("xrp")) {
            coinName = coinName.replace("xrp", "ripple");
          }
          if (coinName.includes("quant")) {
            coinName = coinName.replace("quant", "quant-network");
          }
          if (coinName.includes("polygon")) {
            coinName = coinName.replace("polygon", "matic-network");
          }
          if (coinName.includes("binance-coin")) {
            coinName = coinName.replace("binance-coin", "binancecoin");
          }
          if (coinName.includes("avalanche")) {
            coinName = coinName.replace("avalanche", "avalanche-2");
          }
          if (coinName.includes("cronos")) {
            coinName = coinName.replace("cronos", "crypto-com-chain");
          }
          if (coinName.includes("egold")) {
            coinName = coinName.replace("egold", "elrond-erd-2");
          }
          if (coinName.includes("haven-protocol")) {
            coinName = coinName.replace("haven-protocol", "haven");
          }
          if (coinName.includes("firo")) {
            coinName = coinName.replace("firo", "zcoin");
          }
          if (coinName.includes("stacks")) {
            coinName = coinName.replace("stacks", "blockstack");
          }
          if (coinName.includes("conflux-network")) {
            coinName = coinName.replace("conflux-network", "conflux-token");  
          }
          if (coinName.includes("babydoge")) {
            coinName = coinName.replace("babydoge", "baby-doge-coin");  
          }
          if (coinName.includes("iotex-network")) {
            coinName = coinName.replace("iotex-network", "iotex");  
          }
          if (coinName.includes("hello")) {
            coinName = coinName.replace("hello", "hello-labs");  
          }
          if (coinName.includes("lukso")) {
            coinName = coinName.replace("lukso", "lukso-token");  
          }
          if (coinName.includes("oasis-labs")) {
            coinName = coinName.replace("oasis-labs", "oasis-network");  
          }
          if (coinName.includes("flux")) {
            coinName = coinName.replace("flux", "zelcash");  
          }
          if (coinName.includes("spool-dao")) {
            coinName = coinName.replace("spool-dao", "spool-dao-token");  
          }  
          
          const analysisItem = { coinName: coinName, coinId: coinId };
          portfolio.analysis.push(analysisItem);
            
          await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { analysis: portfolio.analysis } );
      
          console.log(response.data);
          props.CoinRefresh();
          
      } catch (error) {

          console.error(error);

      }

    };    

    const imagePath = "https://www.cryptocompare.com/"+coinData.IMAGEURL;    

    return ( 
      
      <div className="ui relaxed divided list"> 
   
        <div className="coin-table-row" key={props.coinId}>                
            <div className="item rowCell image">
                {coinData.IMAGEURL && <img src={imagePath} alt={props.coinId} />}
                {coinData.FROMSYMBOL && <span className='coindata'>{coinData.FROMSYMBOL.toUpperCase()}</span> }
            </div>
            <div className="item rowCell marketcap">            
            {coinData.MKTCAP !== 0 && coinData.MKTCAP ? coinData.MKTCAP.toLocaleString('en-US') : newMarketCap !== undefined && newMarketCap ? newMarketCap.toLocaleString('en-US') : 'N/A'}        
            </div>
            <div className="item rowCell price">            
               {coinData.PRICE && coinData.PRICE.toLocaleString(
                'en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 8}                
                )}                 
            </div>
            <div className="item rowCell price">            
               {change24Hours && change24Hours.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}                
            </div>
            <div className="item rowCell price">            
               {change7Days !== 'N/A' && change7Days ? change7Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : newChange7Days ? newChange7Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : 'N/A'}                 
            </div>
            <div className="item rowCell price">            
            {change30Days !== 'N/A' && change30Days ? change30Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : newChange30Days ? newChange30Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : 'N/A'}                 
            </div>
  
            <div className="item rowCell button grey">
              <div className="item btn-group">
                  <button className="ui red basic button"
                  onClick={() => removeCoinHandler(props.coinId)}>
                  Delete</button>   
                  <button className="ui basic button blue"    
                  onClick={() => addcoinIdToAnalysis(props.coinId)}>
                  Add to Analysis</button>           
              </div>                
            </div>
      </div>

      </div>
    )

    

 }
export default PortfolioCoin;
