import React, { useEffect, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import api from '../api/portfolios';

const PortfolioCoinList = (props) => {

  const [isLoading, setIsLoading] = useState(true);
  const [coinData, setCoinData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("MKTCAP");
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    if(props.portfolioCoins.length > 0){
        fetchData();
    }    
      
  }, [props.portfolioCoins]); 

  useEffect(() => {
    // Simulate loading data (you can replace this with your actual data fetching logic)
    setTimeout(() => {
      setIsLoading(false);
    }, 7000); // Adjust the time as needed
  }, []);

  const handleSort = (attribute) => {
    // Update sort order and attribute
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
    setSortBy(attribute);
  };
   

    async function handleAmountChange(event, coinId) {

      const inputValue = event.target.value;

      if (inputValue === '') {

        setInputValues((prevInputValues) => ({
          ...prevInputValues,
          [coinId]: ''
        }));
      } else {  
  
      const newValue = !isNaN(inputValue) ? inputValue : 0;    
  
      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [coinId]: newValue,
      }));

      }
    
      console.log(inputValues);
    };
  
    async function updateAmtHandler(coinId) {
      try {


        console.log('Update button clicked for coin ID:', coinId);        

        const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
        const portfolio = response.data;  

        console.log('Update button before clicked for portfolio:', portfolio);
        console.log('Update button before clicked for portfolio.values:', portfolio.values);

        let portfolioValues = 0;

        portfolioValues = [...portfolio.values]; // Create a copy of the portfolio values array    
        
        console.log("Update button before patch setting portfolioValues",portfolioValues); 
  
        const existingIndex = portfolioValues.findIndex((item) => item.coinId === coinId);

        if (existingIndex !== -1) {

          // If the coinId already exists in the portfolio, update the amount and patch api
          portfolioValues[existingIndex].amount = inputValues[coinId];          

        } else {

          // If the coinId doesn't exist, create a new portfolio amount object
          const newPortfolioAmount = { coinId: coinId, amount: inputValues[coinId] };
          portfolioValues.push(newPortfolioAmount);

        }  

        await api.patch(`http://localhost:3006/portfolios/${props.id}`, { values: portfolioValues });      
        
        console.log('Update button after clicked for portfolio:', portfolio);
        console.log('Update button after clicked for portfolio.values:', portfolio.values);

        fetchData();
        
      } catch (error) {
        console.error(error);
      }
    };

    console.log("portfolioCoins: "+props.portfolioCoins);
    console.log("props.id: "+props.id);
    
    let portfolioTotalValue = [];     

    const fetchData = useCallback(async () => {

      portfolioTotalValue = [];

      try {
        const coinList = props.portfolioCoins.join(',');

        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinList}&tsyms=USD&extraParams=cryptocompare&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
        );
    
        const coinDataArray = [];
    
        for (let coin of props.portfolioCoins) {
          console.log("coin: "+coin);
          console.log(coin+" ccoindata response.data:",response.data)
          console.log(coin+" coindata response.data.RAW[coin]:",response.data.RAW[coin])
          

          if(response.data.RAW[coin] !== undefined){

            const coinData = response.data.RAW[coin].USD;

         
          let change24Hours = null;

          if(coinData.CHANGEPCT24HOUR){

            change24Hours = coinData?.CHANGEPCT24HOUR / 100;

          } 

          console.log(coin+" ccoindata change24Hours :",change24Hours)

          let price = null;
          if(coinData.PRICE){

             price = parseFloat(coinData?.PRICE);

          }

      
          const imagePath = "https://www.cryptocompare.com/" + coinData.IMAGEURL;       
    
    
          let coinChange7DaysData = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin}&tsym=USD&limit=7&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
          );
    
          let coinChange30DaysData = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin}&tsym=USD&limit=30&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
          );
    
          let coinChange7DaysDataValues =
            coinChange7DaysData?.data?.Data?.Data || [];
          let coinChange30DaysDataValues =
            coinChange30DaysData?.data?.Data?.Data || [];
          let coinChange7DayPercent = null;
          let coinChange30DayPercent = null;
    
          if (coinChange7DaysDataValues && coinChange7DaysDataValues.length > 0) {
            const coinChange7Days = coinChange7DaysDataValues[0].close;
            coinChange7DayPercent = (price - coinChange7Days) / coinChange7Days;

            console.log(coin+" coinChange7DaysDataValues: "+coinChange7DaysDataValues[0].close);

            if (coinChange7Days === 0 ) {
              console.log(coin+" get7DayChange")
              const result = await get7DayChange(coin, price);
              coinChange7DayPercent = result;
            }
          } else {
            const result = await get7DayChange(coin, price);
            coinChange7DayPercent = result;
          }
    
          if (coinChange30DaysDataValues && coinChange30DaysDataValues.length > 0) {

            console.log(coin+" coinChange30DaysDataValues: "+coinChange30DaysDataValues[0].close);

            const coinChange30Days = coinChange30DaysDataValues[0].close;
            coinChange30DayPercent = (price - coinChange30Days) / coinChange30Days;

            console.log(coin+" coinChange30Days: "+coinChange30Days);
            console.log(coin+" coinChange30DayPercent: "+coinChange30DayPercent);
    
            if (coinChange30Days === 0 ) {
              console.log(coin+" get30DayChange")
              const result = await get30DayChange(coin, price);
              coinChange30DayPercent = result;
            }
          } else {
            console.log(coin+" get30DayChange")
            const result = await get30DayChange(coin, price);
            coinChange30DayPercent = result;
          }
    
          let marketCap = coinData.MKTCAP ? coinData.MKTCAP : null;

          console.log(coin+" marketCap: "+marketCap)
    
          if (marketCap === null) {
            const result = await getMarketCap(coin);
            console.log("marketCap result: "+result)
            marketCap = result;
          }
    
          const portfolioData = await api.get(
            `http://localhost:3006/portfolios/${props.id}`
          );
          const portfolio = portfolioData.data;
    
          const amountValue = portfolio?.values?.find(
            (value) => value.coinId === coin
          )?.amount;

          let value = 0;

          if(amountValue !== 0){
            const totalValue = amountValue * price;
            value = isNaN(totalValue) ? 0 : totalValue;
            console.log("update button before fetchData total value data:",totalValue)  
          }

          if (value !== 0 ){
            portfolioTotalValue.push(value);    
          }                
    
          coinDataArray.push({
            key: coin,
            FROMSYMBOL: coinData.FROMSYMBOL,
            IMGURL: imagePath,
            MKTCAP: marketCap,
            PRICE: price,
            VALUE: value,
            CHANGEPCT24HOUR: change24Hours,
            change7Days: coinChange7DayPercent,
            change30Days: coinChange30DayPercent,
            amount: amountValue
          });
        }
    
        setCoinData(coinDataArray);

      }
        

      console.log("Update button before loop then fetching data again for total portfolioTotalValue",portfolioTotalValue); 

      let portfolioValue = 0;        
        
        
      console.log("Update button before loop then fetching data again for portfolioValue",portfolioValue); 
    

        for (let v = 0; v < portfolioTotalValue.length; v++) {     
            
            console.log("Update button loop then fetching data again for portfolioValues",portfolioValue); 

            console.log("Update button loop then fetching data again for portfolioTotalValue",portfolioTotalValue);               

            portfolioValue = portfolioValue + portfolioTotalValue[v];
        }   
    

         

            if(portfolioValue !== 0) {

              console.log("Update button then fetching data again for portfolioValues",portfolioValue);  

              props.sendValueToCoin(portfolioValue);  
            }
      
          
          
          
        
 

      } catch (error) {
        console.error(error);
      }
    }, [props.portfolioCoins]);


    async function getMarketCap(coinId) {
      try {
  
        const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);  
        let marketCap = response.data.data.marketcap.current_marketcap_usd;

        console.log(coinId+" marketCap: "+marketCap)

        if(marketCap === null){
          return null;
        } else {
          return parseInt(marketCap);
        }       
                
      } catch (error) {
        console.error(error);
      }
    }  
   
    async function get7DayChange(coinId, priceNow) {
    try { 
            // Get historical price data for the asset
            const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`, {
              params: {
                interval: '1d',
                format: 'json',
                timestamp_start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Get data from 7 days ago to now
              },
            });

            console.log("get7DayChange.status: ",response.status); 

            if (response.status === 404) {
              return 'N/A';
            }

            if(response.data.data.values){

              const priceData = response.data.data.values; 
              const sevenDaysAgo = new Date();

              if(priceData !== null) {       
            
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);
                       
                  const filteredData = priceData.filter(
                    (item) => item[0] >= sevenDaysAgo.getTime()
                  );      
            
                  const timestamps = filteredData.map((item) => item[0]);          

                  const sevenDaysAgoPrice = priceData.filter(row => row[0] === timestamps[0]).map(row => row[3]);
                
                if(timestamps[0] !== undefined && timestamps){
            
                  const new7DayChangePercentage = ((priceNow - sevenDaysAgoPrice) / sevenDaysAgoPrice);
                  return new7DayChangePercentage;
            
                } else {
            
                  return 0;
            
                }       
            }
        } else {
            
          return 0;
    
        }
       
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return 'N/A';
        }
        console.error(error);
      }

    }
  
    async function get30DayChange(coinId, priceNow) {

      try {

            // Get historical price data for the asset
            const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`, {
                params: {
                  interval: '1d',
                  format: 'json',
                  timestamp_start: Date.now() - 30 * 24 * 60 * 60 * 1000, 
                },
            });

            console.log("get30DayChange.status: ",response.status); 

            if (response.status === 404) {
              return 'N/A';
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

                console.log("30 day priceNow: "+priceNow);

                console.log("30 day thirtyDaysAgoPrice: "+thirtyDaysAgoPrice);
            
                if(timestamps[0] !== undefined && timestamps){
            
                  const new30DayChangePercentage = ((priceNow - thirtyDaysAgoPrice) / thirtyDaysAgoPrice);

                  console.log("30 day new30DayChangePercentage: "+new30DayChangePercentage);
            
                  return new30DayChangePercentage;
            
                } else {
            
                  return 0;
            
                }   

              }
            
          } else {
            
            return 0;
      
          }
                    
        } catch (error) {
          if (error.response && error.response.status === 404) {
            return 'N/A';
          }
          console.error(error);
        }
    }  

    async function fetchCoinData(coin) {
      try {
        const response = await axios.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coin}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
        return response;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`Coin '${coin}' not found. Skipping...`);
        } else {
          console.error(`Error fetching coin '${coin}':`, error);
        }
        return null;
      }
    };
    
      async function addAllCoinsToAnalysis() {
      
        try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;
          if (!portfolio.analysis) {
            portfolio.analysis = [];
          }

          const portfolioCoins = portfolio.coins;

          const promises = portfolioCoins.map((coin) => {
            return fetchCoinData(coin);
          });

          const responses = await Promise.all(promises);
          const analysisItems = responses.map((response) => {
            if (response) {
              let coinName = response.data.Data.NAME.toLowerCase();
              let coinSymbol = response.data.Data.SYMBOL;
              let coinId = null;

            console.log("adding coinName: "+coinName)
            console.log("adding coinSymbol: "+coinSymbol)

            // Find the coinId from the props array using the coinName             
              const matchingCoin = portfolioCoins.find((coin) => coin === coinSymbol);
              console.log("matchingCoin: "+matchingCoin);

              if (matchingCoin) {
                coinId = matchingCoin;
                console.log("adding coinId: "+coinId)
              }

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
              if (coinName.includes("bob-token")) {
                coinId = coinId.replace("BOBT", "BOB");  
              } 
              if (coinName.includes("volt-inu")) {
                coinName = coinName.replace("volt-inu", "volt-inu-2");  
              } 
              if (coinName.includes("theta-network")) {
                coinName = coinName.replace("theta-network", "theta-token");  
              }
              if (coinName.includes("rocketpool")) {
                coinName = coinName.replace("rocketpool", "rocket-pool");  
              }  
              if (coinName.includes("conzelcash-token")) {
                coinName = coinName.replace("conzelcash-token", "conflux-token");  
              }
              if (coinName.includes("ethereumpow")) {
                coinName = coinName.replace("ethereumpow", "ethereum-pow-iou");  
              }
              if (coinName === "terra") {
                coinName = coinName.replace("terra", "terra-luna-2");  
              }
              if (coinName === "terra-classic") {
                coinName = coinName.replace("terra-classic", "terra-luna");  
              }
              if (coinName.includes("flare")) {
                coinName = coinName.replace("flare", "flare-networks");  
              }
              if (coinName.includes("horizen")) {
                coinName = coinName.replace("horizen", "zencash");  
              }
              if (coinName.includes("fun-token")) {
                coinName = coinName.replace("fun-token", "funfair");  
              }
              if (coinName.includes("guaranteed-entrance-token")) {
                coinName = coinName.replace("guaranteed-entrance-token", "get-token");  
              }
              //constellation-labs
              if (coinName.includes("constellation")) {
                coinName = coinName.replace("constellation", "constellation-labs");  
              }
              if (coinName.includes("pancakeswap")) {
                coinName = coinName.replace("pancakeswap", "pancakeswap-token");  
              }
              //worldwide-asset-exchange
              if (coinName.includes("worldwide-asset-exchange")) {
                coinName = coinName.replace("worldwide-asset-exchange", "wax");  
              }
              //render-token
              if (coinName.includes("render")) {
                coinName = coinName.replace("render", "render-token");  
              }


              
              
              return { coinName: coinName, coinId: coinId };
            } else {
              return null; // Skip the coin with a 404 error
            }
          });

          const filteredAnalysisItems = analysisItems.filter((item) => item !== null);
          portfolio.analysis.push(...filteredAnalysisItems);

          await api.patch(`http://localhost:3006/portfolios/${props.id}`, { analysis: portfolio.analysis });
          console.log(response.data);

          // Show success toast
          toast.success('All Coins added to analysis!', {
            position: toast.POSITION.TOP_CENTER
          });
        } catch (error) {
          console.error(error);
        }
    };


    async function addcoinIdToAnalysis(coinId) {

      try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;    

          
          const coinNameData = await axios.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
      
          let coinName = coinNameData.data.Data.NAME.toLowerCase();

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
          if (coinName.includes("bob-token")) {
            coinId = coinId.replace("BOBT", "BOB");  
          }
          if (coinName.includes("volt-inu")) {
            coinName = coinName.replace("volt-inu", "volt-inu-2");  
          }   
          if (coinName.includes("theta-network")) {
            coinName = coinName.replace("theta-network", "theta-token");
          }   
          if (coinName.includes("rocketpool")) {
            coinName = coinName.replace("rocketpool", "rocket-pool");  
          }
          if (coinName.includes("conzelcash-token")) {
            coinName = coinName.replace("conzelcash-token", "conflux-token");  
          }
          if (coinName.includes("ethereumpow")) {
            coinName = coinName.replace("ethereumpow", "ethereum-pow-iou");  
          }
          if (coinName === "terra") {
            coinName = coinName.replace("terra", "terra-luna-2");  
          }
          if (coinName === "terra-classic") {
            coinName = coinName.replace("terra-classic", "terra-luna");  
          }
          if (coinName.includes("flare")) {
            coinName = coinName.replace("flare", "flare-networks");         
          }
          if (coinName.includes("horizen")) {
            coinName = coinName.replace("horizen", "zencash");  
          }
          if (coinName.includes("fun-token")) {
            coinName = coinName.replace("fun-token", "funfair");  
          }
          if (coinName.includes("guaranteed-entrance-token")) {
            coinName = coinName.replace("guaranteed-entrance-token", "get-token");  
          }
          if (coinName.includes("constellation")) {
            coinName = coinName.replace("constellation", "constellation-labs");  
          }
          if (coinName.includes("pancakeswap")) {
            coinName = coinName.replace("pancakeswap", "pancakeswap-token");  
          }
          if (coinName.includes("worldwide-asset-exchange")) {
            coinName = coinName.replace("worldwide-asset-exchange", "wax");  
          }
          if (coinName.includes("render")) {
            coinName = coinName.replace("render", "render-token");  
          }
  
          
          
         
          console.log("coinlist coinId: "+coinId)
          console.log("coinlist coinName: "+coinName)          



          const analysisItem = { coinName: coinName, coinId: coinId };
          portfolio.analysis.push(analysisItem);
            
          await api.patch(`http://localhost:3006/portfolios/${props.id}`, { analysis: portfolio.analysis } );  
          
            // Show success toast
          toast.success('Coin added to analysis!', {
            position: toast.POSITION.TOP_CENTER
          });
          
      } catch (error) {



        if (error.response && error.response.status === 404) {
          // Coin not found, skip it
          console.error('Coin not found:', coinId);

        } else {
          // Handle other errors
          console.error(error);
        }

      }

    }; 


    async function removeCoinHandler(coinId) {        
      // your logic to delete the coin from the API
      try { 

          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;
          // find the index of the coin in the portfolio's coins array
          console.log("removing coinId: "+coinId);
          console.log("removing from portfolio.values: ",portfolio.values);

          console.log("portfolio.coins : ",portfolio.coins)

          if(coinId !== undefined){

            const coinIndex = portfolio.coins.indexOf(coinId);            

            if(portfolio.values !== undefined){   
              const coinValue = portfolio.values.findIndex(value => value.coinId === coinId);
              portfolio.values.splice(coinValue, 1);  
            }
            
            if (coinIndex === -1) {
            throw new Error(`Coin with id ${coinId} not found in portfolio with id ${props.id}`);
            }

            // remove the coin from the portfolio's coins array
            portfolio.coins.splice(coinIndex, 1);

            // update the portfolio with the new coins array
            await api.patch(`http://localhost:3006/portfolios/${props.id}`, { coins: portfolio.coins, values: portfolio.values });       

          } else {

            throw new Error(`Coin with id ${coinId} not found in portfolio with id ${props.id}`);

          }           

          props.coinRefresh(); 
          

        } catch (error) {
          console.error(error);
        }
  };   

  const sortedCoins = coinData.slice().sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];


     // Check if both values are strings before performing alphabetical sorting
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    // Perform alphabetical sorting
    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  } else {

    // If one or both values are not strings, maintain the existing order
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

  }  
    
  });

   
if(props.portfolioCoins !== undefined){

return (

  <div className="ui container coin-portfolio">

    <div className="ui relaxed divided list">  
     
        <div className="coin-table-header">
                    <div 
                    className={`headerCell ${sortBy === "FROMSYMBOL" ? "active" : ""}`}
                    align="left"
                    onClick={() => handleSort("FROMSYMBOL")}
                    >
                    Coin</div>
                    <div 
                     className={`headerCell ${sortBy === "MKTCAP" ? "active" : ""}`}
                     align="left"
                     onClick={() => handleSort("MKTCAP")}
                    >
                     Market Cap</div>
                     <div 
                     className={`headerCell ${sortBy === "amount" ? "active" : ""}`}
                     align="left"
                     onClick={() => handleSort("amount")}
                    >
                     Amount</div>
                    <div 
                    className={`headerCell ${sortBy === "PRICE" ? "active" : ""}`}
                    align="left" 
                    onClick={() => handleSort("PRICE")}
                    >                   
                    Price</div>
                    <div 
                    className={`headerCell ${sortBy === "VALUE" ? "active" : ""}`}
                    align="left" 
                    onClick={() => handleSort("VALUE")}
                    >                   
                    Value</div>
                    <div 
                    className={`headerCell ${sortBy === "CHANGEPCT24HOUR" ? "active" : ""}`}
                    align="left"
                    onClick={() => handleSort("CHANGEPCT24HOUR")}
                    >
                    24-Hour Change</div>
                    <div 
                    className={`headerCell ${sortBy === "change7Days" ? "active" : ""}`}
                    align="left"
                    onClick={() => handleSort("change7Days")}
                    >
                    7-Day Change</div>
                    <div 
                    className={`headerCell ${sortBy === "change30Days" ? "active" : ""}`}
                    align="left"
                    onClick={() => handleSort("change30Days")}
                    >
                    30-Day Change</div>  
        </div>   
            
      
        {
        sortedCoins.length !== 0 && isLoading ? (
          <h3>Loading...</h3>
        ) : (
          sortedCoins.map((coin, index) => (                      
                <div className="coin-table-row" key={coin.key}>
                      <div className="item rowCell image">
                      {coin.IMGURL && <img src={coin?.IMGURL} alt={coin?.FROMSYMBOL} />}
                      {coin?.FROMSYMBOL}
                      </div>
                      <div className="item rowCell marketcap">{coin?.MKTCAP?.toLocaleString('en-US')}</div>
                      <div className="item rowCell" align="left">
                          <input
                            type="number"
                            step="any" // Allows decimal input
                            style={{ width: '110px' }} 
                            value={inputValues[coin.key] !== undefined ? inputValues[coin.key] : coin.amount}
                            onChange={(event) => handleAmountChange(event, coin.key)}
                          />
                      </div>
                      <div className="item rowCell price">{coin?.PRICE?.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 5})}</div>
                      <div className="item rowCell price">{coin?.VALUE?.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}</div>
                      <div className="item rowCell price">{coin?.CHANGEPCT24HOUR?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}</div>
                      <div className="item rowCell price">{coin?.change7Days?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}</div>
                      <div className="item rowCell price">{coin?.change30Days?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}</div>
                      <div className="item rowCell button grey">
                        <div className="item btn-group">
                        <button
                            className="ui red basic button"
                            onClick={() => updateAmtHandler(coin.key)}
                          >
                            Update
                          </button>
                          <button
                            className="ui red basic button"
                            onClick={() => removeCoinHandler(coin.key)}
                          >
                            Delete
                          </button>
                          <button
                            className="ui basic button blue"
                            onClick={() => addcoinIdToAnalysis(coin.key)}
                          >
                            Add to Analysis
                          </button>
                        </div>
                      </div>
                </div>
        ))
        )
      }
          <ToastContainer className="custom-toast-container" />
          <button className="ui button blue right" onClick={addAllCoinsToAnalysis}>Add All Coins to Analysis</button>
      </div>
    </div>
);
 
} else {
    return (
      <div className="ui container coin-portfolio">
        <div className="ui relaxed divided list">
                <div className="coin-table-header">                 
                    <div className="headerCell" align="left">Coin</div>
                    <div className="headerCell" align="left">Market Cap</div>
                    <div className="headerCell" align="left">Price</div>
                    <div className="headerCell" align="left">24-Hour Change</div>
                    <div className="headerCell" align="left">7-Day Change</div>
                    <div className="headerCell" align="left">30-Day Change</div>               
                </div> 
                <div></div>
                <button className="ui button blue right" onClick={addAllCoinsToAnalysis}>Add All Coins to Analysis</button>
        </div>
      </div>
    );

  }

};

export default PortfolioCoinList;