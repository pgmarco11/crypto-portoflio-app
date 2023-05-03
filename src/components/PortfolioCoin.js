import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../api/portfolios';


const PortfolioCoinList = (props) => {

    const [coinData, setCoinData] = useState([]); 
    const [change24Hours, setChange24Hours] = useState([]);  
    const [change7Days, setchange7Days] = useState([]);
    const [change30Days, setChange30Days] = useState([]);    

    console.log("PortfolioCoin props PortfolioId: "+props.PortfolioId);
    console.log("PortfolioCoin props coinId: "+props.CoinId);
   


//https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD
      useEffect(() => {    

        axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${props.CoinId}&tsyms=USD&extraParams=cryptocompare&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`)
        .then(res => {
            const data = res.data.RAW[props.CoinId].USD;
            setCoinData(data);            
            coinChanges(props.CoinId, data);
            })
            .catch(err => {
                console.error(err);                
            });

    }, [props.CoinId]);

    const coinChanges = async (CoinId, coinData) => {

      let coinChange24HrPercent = coinData.CHANGEPCT24HOUR / 100;
      let coinPrice = coinData.PRICE;
      console.log(CoinId+" coinChange24HrPercent: "+coinChange24HrPercent);
      console.log(CoinId+" coinPrice: "+coinPrice);

      setChange24Hours(coinChange24HrPercent);  

      let coinChange7DaysData = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${CoinId}&tsym=USD&limit=7&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);

      let coinChange30DaysData = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${CoinId}&tsym=USD&limit=30&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`); 

      console.log(CoinId+" coinChange7DaysData: "+coinChange7DaysData.data.Data.Data);
      console.log(CoinId+" coinChange30DaysData: "+coinChange30DaysData.data.Data.Data);

      let coinChange7DaysDataValues = coinChange7DaysData.data.Data.Data;
      let coinChange30DaysDataValues = coinChange30DaysData.data.Data.Data;
      

      if(coinChange7DaysDataValues !== null && coinChange7DaysDataValues !== undefined){

        const coinChange7Days = coinChange7DaysData.data.Data.Data[0].close; 
        let coinChange7DayPercent = (coinPrice - coinChange7Days) / coinChange7Days;
        console.log(CoinId+" coinChange7Days: "+coinChange7Days);
        console.log(CoinId+" coinChange7DayPercent: "+coinChange7DayPercent);
        setchange7Days(coinChange7DayPercent);

      } else {

        let change = "N/A";
        setchange7Days(change);
        console.log(CoinId+" change7Days: "+change7Days);               

      }

      if(coinChange30DaysDataValues !== null && coinChange30DaysDataValues !== undefined){

        const coinChange30Days = coinChange30DaysData.data.Data.Data[0].close; 
        let coinChange30DayPercent = (coinPrice - coinChange30Days) / coinChange30Days;
        console.log(CoinId+" coinChange30Days: "+coinChange30Days);
        console.log(CoinId+" coinChange30DayPercent: "+coinChange30DayPercent);
        setChange30Days(coinChange30DayPercent);

      } else {

        let change = "N/A";
        console.log(CoinId+" change30Days: "+change30Days);
        setChange30Days(change);

      }      

    };

        const removeCoinHandler = async (CoinId) => {
        // your logic to delete the coin from the API
        try { 
            const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
            const portfolio = response.data;
            // find the index of the coin in the portfolio's coins array
            const coinIndex = portfolio.coins.indexOf(CoinId);

            if (coinIndex === -1) {
            throw new Error(`Coin with id ${CoinId} not found in portfolio with id ${props.PortfolioId}`);
            }
            // remove the coin from the portfolio's coins array
            portfolio.coins.splice(coinIndex, 1);

            // update the portfolio with the new coins array
            await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { coins: portfolio.coins });

            // Fetch the updated list of coins from the API
            const updatedCoinsResponse = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);

            const updatedCoins = updatedCoinsResponse.data.coins;
            const updatedCoinData =  updatedCoins.map( async coinId => {
            return axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${CoinId}&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`)
                .then(res => {
                  const data = res.data.DISPLAY[CoinId].USD;
                  return data;
                })
                .catch(err => {
                    console.error(err);
                });
            });
            setCoinData([]);
            const resolvedCoinData = await Promise.all(updatedCoinData);
            setCoinData(resolvedCoinData);

            props.CoinRefresh();            

          } catch (error) {
            console.error(error);
          }
    }; 

    const addCoinIdToAnalysis = async (coinId) => {

      try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
          const portfolio = response.data;            
        
          const coinNameData = await api.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
      
          let coinName = coinNameData.data.Data.NAME.toLowerCase();

          console.log("matchingCoin: "+coinName);


          if (coinName.includes(" ")) {
              coinName = coinName.replace(/ /g, "-"); // replace all spaces with dashes
          }
          if (coinName.charAt(0) === '-') {
            coinName = coinName.substring(1); // remove first character if it is a dash
          }
          if (coinName.includes("travala")) {
             coinName = coinName.replace("travala", "concierge-io");
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
        
          
          const analysisItem = { coinName: coinName, coinId: coinId };
          portfolio.analysis.push(analysisItem);
            
          await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { analysis: portfolio.analysis } );
      
          console.log(response.data);
          props.CoinRefresh();
      } catch (error) {
          console.error(error);
      }

    };
    
    console.log("coinData: "+coinData);
    const imagePath = "https://www.cryptocompare.com/"+coinData.IMAGEURL;
    console.log("coinData.MKTCAP: "+coinData.MKTCAP);

    console.log(props.CoinId+" change24Hours: "+change24Hours);
    console.log(props.CoinId+" : "+change7Days);
    console.log(props.CoinId+" change30Days: "+change30Days);
    

    return ( 
             
    
        <div className="coin-table-row" key={props.CoinId}>                
            <div className="item rowCell image">
                {coinData.IMAGEURL && <img src={imagePath} alt={props.CoinId} />}
                {coinData.FROMSYMBOL && <span className='coindata'>{coinData.FROMSYMBOL.toUpperCase()}</span> }
            </div>
            <div className="item rowCell marketcap">            
               {coinData.MKTCAP && coinData.MKTCAP.toLocaleString('en-US')}                 
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
               {change7Days && change7Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}                 
            </div>
            <div className="item rowCell price">            
               {change30Days && change30Days.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}                 
            </div>
  
            <div className="item rowCell button grey">
            <div className="item btn-group">
                <button className="ui red basic button"
                onClick={() => removeCoinHandler(props.CoinId)}>
                Delete</button>   
                <button className="ui basic button blue"    
                onClick={() => addCoinIdToAnalysis(props.CoinId)}>
                Add to Analysis</button>           
            </div>                
            </div> 
      </div>
    )

};
export default PortfolioCoinList;