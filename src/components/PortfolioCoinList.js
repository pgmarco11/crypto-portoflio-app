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

    console.log("inputValue old: "+coinId+" ",inputValue);

    if (inputValue === ''|| inputValue === undefined) {
      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [coinId]: '' // Reset to empty if the input is cleared
      }));
    } else {  
      const newValue = !isNaN(inputValue) ? parseFloat(inputValue) : 0; // Ensure value is a number

      console.log("inputValue new: "+coinId+" ",newValue);

      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [coinId]: newValue, // Update the corresponding coin amount

      }));
    }          
  };

  async function updateAmtHandler(coinId) {
    try {
      const response = await api.get(`http://localhost:8888/portfolios/${props.id}`);
      const portfolio = response.data;  
      let portfolioValues = [...portfolio.values]; // Create a copy of the portfolio values array 

      console.log("portfolioValues: ",portfolioValues);
  
      const existingIndex = portfolioValues.findIndex((item) => item.coinId === coinId);

      console.log("existingIndex: ",existingIndex);
  
      if (existingIndex !== -1) {
        // If the coinId exists, update the amount
        portfolioValues[existingIndex].amount = inputValues[coinId];

        console.log("portfolioValues "+coinId+" ",portfolioValues[existingIndex]);
        
        console.log("inputValues: "+coinId+" ",inputValues[coinId]);
  
      } else {
        // If coinId doesn't exist, create a new entry
        const newPortfolioAmount = { coinId: coinId, amount: inputValues[coinId] };
        console.log("newPortfolioAmount: "+coinId+" ",newPortfolioAmount);
  
        portfolioValues.push(newPortfolioAmount);
      }
  
      console.log("all inputValues: "+coinId+" ",inputValues);
      console.log("inputValues: "+coinId+" ",inputValues[coinId]);

      // Ensure the input value exists before making the patch request
      if (inputValues[coinId]) {
        await api.patch(`http://localhost:8888/portfolios/${props.id}`, { values: portfolioValues });
        console.log("portfolioValues: "+coinId+" ",portfolioValues);

        fetchData(); // Refresh data after patching
      } else {
        console.error('Amount is invalid or missing for coinId:', coinId);
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  };
  
  
  let portfolioTotalValue = [];     

  const fetchData = useCallback(async () => {
    portfolioTotalValue = [];
  
    try {
      const coinList = props.portfolioCoins.join(',');
  
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinList}&tsyms=USD&extraParams=cryptocompare&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
      );
  
      const coinDataArray = [];
  
      for (let coin of props.portfolioCoins) {
        let coinData = response.data.RAW[coin]?.USD;
        let source = 'cryptocompare';
        let imagePath = coinData ? `https://www.cryptocompare.com${coinData.IMAGEURL}` : '';
  
        if (!coinData || coinData.CONVERSIONTYPE === 'not_possible') {
          // Try CoinPaprika API
          try {
            const coinPaprikaResponse = await axios.get(
              `https://api.coinpaprika.com/v1/tickers/${coin.toLowerCase()}-usd`
            );
            coinData = {
              PRICE: coinPaprikaResponse.data.quotes.USD.price,
              MKTCAP: coinPaprikaResponse.data.quotes.USD.market_cap,
            };
            imagePath = coinPaprikaResponse.data.logo || ''; // Adjust the image path if needed
            source = 'coinpaprika';
          } catch (error) {
            console.error(`CoinPaprika error for ${coin}:`, error);
          }
        }
  
        if (!coinData || coinData.PRICE === undefined) {
          // Try Messari API
          try {
            const messariResponse = await axios.get(
              `https://data.messari.io/api/v1/assets/${coin.toLowerCase()}/metrics`
            );
            coinData = {
              PRICE: messariResponse.data.data.market_data.price_usd,
              MKTCAP: messariResponse.data.data.marketcap.marketcap_dominance_percent,
            };
            imagePath = messariResponse.data.data.logo || ''; // Adjust the image path if needed
            source = 'messari';
          } catch (error) {
            console.error(`Messari error for ${coin}:`, error);
          }
        }
  
        if (coinData && coinData.PRICE !== undefined) {
          let change24Hours = coinData.CHANGEPCT24HOUR ? coinData.CHANGEPCT24HOUR / 100 : null;
          let price = coinData.PRICE ? parseFloat(coinData.PRICE) : null;
  
          let coinChange7DaysData = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin}&tsym=USD&limit=7&api_key=&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
          );
  
          let coinChange30DaysData = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin}&tsym=USD&limit=30&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
          );
  
          let coinChange7DaysDataValues = coinChange7DaysData?.data?.Data?.Data || [];
          let coinChange30DaysDataValues = coinChange30DaysData?.data?.Data?.Data || [];
          let coinChange7DayPercent = null;
          let coinChange30DayPercent = null;
  
          if (coinChange7DaysDataValues && coinChange7DaysDataValues.length > 0) {
            const coinChange7Days = coinChange7DaysDataValues[0].close;
            coinChange7DayPercent = (price - coinChange7Days) / coinChange7Days;
  
            if (coinChange7Days === 0) {
              const result = await get7DayChange(coin, price);
              coinChange7DayPercent = result;
            }
          } else {
            const result = await get7DayChange(coin, price);
            coinChange7DayPercent = result;
          }
  
          if (coinChange30DaysDataValues && coinChange30DaysDataValues.length > 0) {
            const coinChange30Days = coinChange30DaysDataValues[0].close;
            coinChange30DayPercent = (price - coinChange30Days) / coinChange30Days;
  
            if (coinChange30Days === 0) {
              const result = await get30DayChange(coin, price);
              coinChange30DayPercent = result;
            }
          } else {
            const result = await get30DayChange(coin, price);
            coinChange30DayPercent = result;
          }
  
          let marketCap = coinData.MKTCAP ? coinData.MKTCAP : null;
  
          if (marketCap === null) {
            const result = await getMarketCap(coin);
            marketCap = result;
          }
  
          const portfolioData = await api.get(
            `http://localhost:8888/portfolios/${props.id}`
          );
          const portfolio = portfolioData.data;
  
          const amountValue = portfolio?.values?.find(
            (value) => value.coinId === coin
          )?.amount;
  
          let value = 0;
  
          if (amountValue !== 0) {
            const totalValue = amountValue * price;
            value = isNaN(totalValue) ? 0 : totalValue;
          }
  
          if (value !== 0) {
            portfolioTotalValue.push(value);
          }
  
          coinDataArray.push({
            key: coin,
            FROMSYMBOL: coin,
            IMGURL: imagePath,
            MKTCAP: marketCap,
            PRICE: price,
            VALUE: value,
            CHANGEPCT24HOUR: change24Hours,
            change7Days: coinChange7DayPercent,
            change30Days: coinChange30DayPercent,
            amount: amountValue,
            source: source
          });
        }
      }
  
      setCoinData(coinDataArray);
  
      let portfolioValue = 0;
  
      for (let v = 0; v < portfolioTotalValue.length; v++) {
        portfolioValue = portfolioValue + portfolioTotalValue[v];
      }
  
      if (portfolioValue !== 0) {
        props.sendValueToCoin(portfolioValue);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [props.portfolioCoins]);
  

    async function getMarketCap(coinId) {
      try {
  
        const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);  
        let marketCap = response.data.data.marketcap.current_marketcap_usd;

        if(marketCap === null){
          return null;
        } else {
          return parseInt(marketCap);
        }       
                
      } catch (error) {
        console.log(error.message);
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


            if (response.status === 404 || response.status === 400) {
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

            if (response.status === 404 || response.status === 400) {
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
           
                if(timestamps[0] !== undefined && timestamps){
            
                  const new30DayChangePercentage = ((priceNow - thirtyDaysAgoPrice) / thirtyDaysAgoPrice);
            
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
        const response = await axios.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coin}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
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
        const response = await api.get(`http://localhost:8888/portfolios/${props.id}`);
        const portfolio = response.data;
        if (!portfolio.analysis) {
            portfolio.analysis = [];
        }

        const portfolioCoins = portfolio.coins;

        const promises = portfolioCoins.map((coin) => {
            return fetchCoinData(coin);
        });

        const responses = await Promise.all(promises);
        const analysisItemsPromises = responses.map(async (response) => {
            if (response) {
                let coinName = response.data.Data.NAME.toLowerCase();
                let coinSymbol = response.data.Data.SYMBOL;

                // Find the coinId from the props array using the coinName
                let coinId = null;
                const matchingCoin = portfolioCoins.find((coin) => coin === coinSymbol);
                if (matchingCoin) {
                    coinId = matchingCoin;
                }
        
                // Update coinId
                let coinReplace = await coinID_replacements(coinName, coinId);
       
                return { coinName: coinReplace.coinName, coinId: coinReplace.coinId };
            } else {
                return null; // Skip the coin with a 404 error
            }
        });

        const analysisItems = await Promise.all(analysisItemsPromises);
        const filteredAnalysisItems = analysisItems.filter((item) => item !== null);
        portfolio.analysis.push(...filteredAnalysisItems);
   
            await api.patch(`http://localhost:8888/portfolios/${props.id}`, { analysis: portfolio.analysis });
    
            // Show success toast
            toast.success('All Coins added to analysis!', {
                position: toast.POSITION.TOP_CENTER
            });
        } catch (error) {
            console.error(error);
        }
    };

    async function coinID_replacements(coinName, coinId){   

      coinId = coinId.toLowerCase();
      coinName = coinName.toLowerCase();

      console.log("analysis outside coinName: "+coinName);
      console.log("analysis outside coinId: "+coinId);

      if (coinName.includes(" ")) {
        coinName = coinName.replace(/ /g, "-"); // replace all spaces with dashes
      }
      if (coinName.includes(".")) {
        coinName = coinName.replace(".", "-"); // replace all dots with dashes
      }
      if (coinName.charAt(0) === '-') {
        coinName = coinName.substring(1); // remove first character if it is a dash
      }
      if (coinName.charAt(coinName.length - 1) === '-') {
        coinName = coinName.substring(0, coinName.length - 1); // remove last character if it is a dash
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
      //concierge-io-com -> concierge-io
      if (coinName.includes("concierge-io-com")) {
        coinName = coinName.replace("concierge-io-com", "concierge-io");  
      }
      if (coinName.includes("spartan-casino")) {
        coinName = coinName.replace("spartan-casino", "iron-fish");  
      }
      if (coinName.includes("gamestop")) {  
        coinName = coinName.replace("gamestop", "gme");
      }
      if (coinName.includes("turbo")) {
        coinId = coinId.replace("turbot", "turbo");
      }
      if (coinName.includes("the-open-network")) {
        coinId = coinId.replace("toncoin", "ton");
      }
     // GST-SOL
     if (coinName.includes("green-satoshi-token-(sol)") ) {  
        coinName = coinName.replace("green-satoshi-token-(sol)", "green-satoshi-token");
     }
     if (coinId.includes("gst-sol")) {  
        coinId = coinId.replace("gst-sol", "gstsol");  
      }
      return { coinName: coinName, coinId: coinId }
    }

    async function addcoinIdToAnalysis(coinId) {
      try {      

        // Call the external API for coin details
        const coinNameData = await axios.get(
          `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
        );

        let coinName = coinNameData.data.Data.NAME.toLowerCase();
        let coinReplace = await coinID_replacements(coinName, coinId);

        // Prepare the analysis item to be added
        const analysisItem = { coinName: coinReplace.coinName, coinId: coinReplace.coinId };

        // Get the portfolio from the API
        const response = await api.get(`http://localhost:8888/portfolios/${props.id}`);
        const portfolio = response.data;

        const updatedAnalysis = Array.isArray(portfolio.analysis)
        ? [...portfolio.analysis, analysisItem]
        : [analysisItem];        

        // PATCH request to update the server with the new analysis array
        await api.patch(`http://localhost:8888/portfolios/${props.id}`, { analysis: updatedAnalysis });

        // Show success toast after completion
        toast.success('Coin added to analysis!', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } catch (error) {
        console.error('Error adding coin to analysis:', error);        
      }
    }

    async function removeCoinHandler(coinId) {        
      try { 
        const response = await api.get(`http://localhost:8888/portfolios/${props.id}`);
        const portfolio = response.data;
        
        if (coinId !== undefined) {
          const coinIndex = portfolio.coins.indexOf(coinId);            
    
          if (portfolio.values !== undefined) {   
            const coinValue = portfolio.values.findIndex(value => value.coinId === coinId);
            portfolio.values.splice(coinValue, 1);  
          }
          
          if (coinIndex === -1) {
            throw new Error(`Coin with id ${coinId} not found in portfolio with id ${props.id}`);
          }
    
          // Remove the coin from the portfolio's coins array
          portfolio.coins.splice(coinIndex, 1);    

          await api.patch(`http://localhost:8888/portfolios/${props.id}`, { coins: portfolio.coins, values: portfolio.values });   
          
          // Directly update coinData state after removing the coin          
          setCoinData(prevCoins => prevCoins.filter(coin => coin.key !== coinId));
    
        } else {
          throw new Error(`Coin with id ${coinId} not found in portfolio with id ${props.id}`);
        }           
    
        // Call the CoinRefresh method directly to refresh the coins after the removal
        await props.coinRefresh();
    
      } catch (error) {
        console.log(error.message);
      }
    }
  
  

    const sortedCoins = coinData
    .slice() // Copy the array to avoid mutating the original state
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
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
              Coin
            </div>
            <div
              className={`headerCell ${sortBy === "MKTCAP" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("MKTCAP")}
            >
              Market Cap
            </div>
            <div
              className={`headerCell ${sortBy === "amount" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("amount")}
            >
              Amount
            </div>
            <div
              className={`headerCell ${sortBy === "PRICE" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("PRICE")}
            >
              Price
            </div>
            <div
              className={`headerCell ${sortBy === "VALUE" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("VALUE")}
            >
              Value
            </div>
            <div
              className={`headerCell ${sortBy === "CHANGEPCT24HOUR" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("CHANGEPCT24HOUR")}
            >
              24-Hour Change
            </div>
            <div
              className={`headerCell ${sortBy === "change7Days" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("change7Days")}
            >
              7-Day Change
            </div>
            <div
              className={`headerCell ${sortBy === "change30Days" ? "active" : ""}`}
              align="left"
              onClick={() => handleSort("change30Days")}
            >
              30-Day Change
            </div>
          </div>
  
          {
            sortedCoins.length !== 0 && isLoading ? (
              <h3>Loading...</h3>
            ) : (
              sortedCoins.map((coin) => (
                <div className="coin-table-row" key={coin.key}>
                  <div className="item rowCell image">
                    {coin.IMGURL && <img src={coin?.IMGURL} alt={coin?.FROMSYMBOL} />}
                    {coin?.FROMSYMBOL}
                  </div>
                  <div className="item rowCell marketcap">
                    {coin?.MKTCAP?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                  </div>
                  <div className="item rowCell" align="left">
                    <input
                      type="number"
                      step="any" // Allows decimal input
                      style={{ width: '110px' }}
                      value={inputValues[coin.key] !== undefined ? inputValues[coin.key] : coin.amount}
                      onChange={(event) => handleAmountChange(event, coin.key)}
                    />
                  </div>
                  <div className="item rowCell price">
                    {coin?.PRICE?.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 5})}
                  </div>
                  <div className="item rowCell price">
                    {coin?.VALUE?.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}
                  </div>
                  <div className="item rowCell price">
                    {coin?.CHANGEPCT24HOUR?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}
                  </div>
                  <div className="item rowCell price">
                    {coin?.change7Days?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}
                  </div>
                  <div className="item rowCell price">
                    {coin?.change30Days?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}
                  </div>
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