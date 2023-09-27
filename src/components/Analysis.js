import { useState, useEffect } from "react";
import CoinTableRow from './CoinTableRow';
import axios from "axios";
import api from "../api/portfolios";

function Analysis() {

  const [analysisCoins, setAnalysisCoins] = useState([]);
  const [coinInputValues, setCoinInputValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [noCoins, setNoCoins] = useState(false);  
  const [coinData, setCoinData] = useState([]); 
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("MKTCAP"); 
  const [totalScore, setTotalScore] = useState(0);
  const [highestPrice, setHighestPrice] = useState(null); 

    async function updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell){
    
        const updatedCoinData = Object.values(coinData).map((coin) => {
          if (coin.id === coinId) {
            // Found the coin with the matching coinId
            const newGainPredictionFormatted = newGainPrediction.toLocaleString(undefined, {
              style: "percent",
            });
            const newAvgGainPredictionFormatted = newAvgGainPrediction.toLocaleString(undefined, {
              style: "percent",
            });  
    
            return {
              ...coin,
              prediction: predictionPrice,
              gainPrediction: newGainPredictionFormatted,
              avgGainPrediction: newAvgGainPredictionFormatted,
              buysell: buysell,
              buysellrating: totalrating
            };
          }
          return coin;
        });
    
        setCoinData(updatedCoinData);  

  }

  async function updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell){
            
      try {     

        // Check if the new input value is the opposite of the prediction in API, if it is update or add to API
        if (predictionPrice === Object.values(coinData.find(coin => coin.id === coinId))[11])  {
          updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell); 
        } else {
            const apiUrl = `http://localhost:3006/portfolios`;
            const response = await axios.get(apiUrl);
            const portfolios = response.data;
            let portfolioId = null;

          // Find the portfolio containing the analysis for the specified coinId
          const portfolio = portfolios.find((p) =>      
            p.analysis.some((analysisItem) => analysisItem.coinName === coinId)      
          );          

          if (!portfolio) {

            console.error(`No portfolio found for coinId: ${coinId}`);
            return;    

          } else {

            portfolioId = portfolio.id;
            const portfolioUrl = `http://localhost:3006/portfolios/${portfolioId}`;

            const responsePortfolio = await axios.get(portfolioUrl);
            const portfolioAnalysis = responsePortfolio.data;
    
            // Update the analysis array with the new prediction
            const updatedAnalysis = portfolioAnalysis.analysis.map((analysisItem) => {
              if (analysisItem.coinName === coinId) {
                return {
                  ...analysisItem,
                  prediction: predictionPrice            
                };
              }
              return analysisItem;
            });

            // Update the portfolio object with the updated coins and analysis
            const updatedPortfolio = {
              ...portfolio,
              analysis: updatedAnalysis,
            };  

            // Make a PUT request to update the portfolio API with the modified data
            await axios.put(apiUrl + `/${portfolioId}`, updatedPortfolio);
            updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell);      

          }
      } 

    } catch (error){
        console.log(error);
    }

  }

  async function handleCoinPrediction(
    predictionPrice,
    current_price,
    coinId,
    oneYearPercentChange,
    buysellrating,
    buysell,
    ninetyDaysPercentChange
  ) {

  console.log("handleCoinPrediction input value : ",predictionPrice)

  let newGainPredictionScore = 0;
  let newAvgGainPredictionScore = 0;
  let newGainPrediction = null;
  let newAvgGainPrediction = null;
  let totalrating = null;

  // Find the coin object in coinData with the matching coinId    
  let coin = coinData.find((coin) => coin.id === coinId);

    if (!predictionPrice) {
      predictionPrice = parseFloat(coin.prediction);
      newGainPrediction = parseFloat(
        (predictionPrice - current_price) / current_price
      );   
    } else {
      newGainPrediction = parseFloat(
          (parseFloat(predictionPrice) - current_price) / current_price
      );
    }   

    if (oneYearPercentChange === 0) {
      newAvgGainPrediction = parseFloat((newGainPrediction + 0) / 2);
    } else {
      newAvgGainPrediction = parseFloat(
        (newGainPrediction + parseFloat(oneYearPercentChange) / 100) / 2
      );
    } 
      
    if (!predictionPrice) {

      newGainPredictionScore = 0;
      newAvgGainPredictionScore = 0;  

    } else {

      if ( newGainPrediction > 0.0300 ) {
        newGainPredictionScore = 2;
      } 
      if ( newAvgGainPrediction > 0.0300 ) {
        newAvgGainPredictionScore = 1;
      } 

     totalrating = buysellrating + newGainPredictionScore + newAvgGainPredictionScore;
 
      if(buysell === 'BUY' && totalrating > 2 && parseInt(ninetyDaysPercentChange) < 40){  
      
        buysell = "BUY"; 

      }  else if(buysell === null && totalrating > 3 && parseInt(ninetyDaysPercentChange) < 40){  

        buysell = "BUY"; 

      } else if(buysell === 'SELL' && totalrating < 4 && parseInt(ninetyDaysPercentChange) > 50){  
      
        buysell = "SELL"; 

      } else if(buysell === 'HODL' && totalrating > 2 && parseInt(ninetyDaysPercentChange) < 40){  
      
        buysell = "BUY"; 

      } else if(buysell === 'HODL' && totalrating > 4  && parseInt(ninetyDaysPercentChange) > 50){  
    
        buysell = "BUY"; 

      } else {

        buysell = "HODL"; 

      }  

    updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell);          
 
    }

    
  };

  useEffect(() => {
    GetAnalysisCoins();
  }, []);


  async function GetAnalysisCoins() {

          const portfolios = await api.get("http://localhost:3006/portfolios");
          let allAnalysisCoins = [];
          
          for (let i = 0; i < portfolios.data.length; i++) {
            const response = await api.get(
              `http://localhost:3006/portfolios/${portfolios.data[i].id}`
            );
            let analysisCoins = response.data.analysis;

            for (let [index, value] of Object.entries(analysisCoins)) {
              let coinNameAnalysis = value.coinName;
              let coinIdAnalysis = value.coinId;
              
              allAnalysisCoins.push({
                coinName: coinNameAnalysis,
                coinId: coinIdAnalysis,
              });
              
            }
          }

          setAnalysisCoins(allAnalysisCoins);

          let allAnalysisCoinsArray = Object.keys(allAnalysisCoins);

          if (allAnalysisCoinsArray.length === 0) {    

            setIsLoading(false);
            setNoCoins(true);

          } else {

            setNoCoins(false);
            setIsLoading(true);

            const allCoinNames = [];
            const allCoinIds = [];

            for (let a = 0; a < allAnalysisCoinsArray.length; a++) {
                 allCoinNames.push(allAnalysisCoins[a].coinName);
              allCoinIds.push(allAnalysisCoins[a].coinId);
            }
            let allCoinNamesjoin = allCoinNames.join(",");
            let allCoinIdsjoin = allCoinIds.join(",");
            let allCoinNamesArray = Object.keys(allCoinNames);
         
            if (allCoinNamesArray.length !== 0) {       

              const cache = {}; // initialize an empty cache object

              const marketChartData = await axios.get(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${allCoinNamesjoin}&price_change_percentage=30d%2C200d%2C1y`
              );
              
              // function to fetch data from API
              async function fetchData(coinName) {
                if (cache[coinName]) {
                  // check if the data for the coin already exists in the cache
                  return cache[coinName]; // return the cached data
                } else {
                  const response = await axios.get(
                    `https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=usd&days=max`
                  );
                  const data = response.data;
                  cache[coinName] = data; // store the data in the cache
                  return data; // return the API response
                }
              }
              const coinDataCache = {}; // Create a cache object to store coin data

              const historicalDataPromises = marketChartData.data.map((coinData) => {

                // Check if the coin data is already in the cache
                if (coinDataCache[coinData.id]) {
                  // If the data is in the cache, return a resolved promise with the cached data
                  return Promise.resolve(coinDataCache[coinData.id]);
                } else if (localStorage.getItem(coinData.id)) {
                  // If the data is in the local storage, parse and return the data
                  const data = JSON.parse(localStorage.getItem(coinData.id));
                  coinDataCache[coinData.id] = data;
                  return data;
                } else {
                  // If the data is not in the cache or local storage, make an API request to fetch it
                  return fetchData(coinData.id).then((data) => {
                    // Store the data in the cache and local storage
                    coinDataCache[coinData.id] = data;
                    localStorage.setItem(coinData.id, JSON.stringify(data));
                    return data;
                  });
                }
              });

              const historicalData = await Promise.all(historicalDataPromises);      

              let now = new Date();
              const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
              const ninetyDaysAgoTimestamp = Math.floor(ninetyDaysAgo - 1 / 1000);
              const ninetyDaysAgoDate = new Date(ninetyDaysAgoTimestamp);
              const ninetyDaysAgoDay = ninetyDaysAgoDate.getDate().toString();
              const ninetyDaysAgoMonth = ninetyDaysAgoDate.getMonth() + 1;
              const ninetyDaysAgoYear = ninetyDaysAgoDate.getFullYear();

              let coinData = [];

              for (let [index, value] of Object.entries(marketChartData.data)) {
                
                let volumeScore = 0;
                let oneYearPercentScore = 0;
                let btcChangeScore = 0;
                let btcPercentScore = 0;
                let inceptionPercentScore = 0;
                let threeMonthsPercentScore = 0;
                let maxGradeScore = 0;
                let twitterScore = 0;
                let gitScore = 0;
                let highPercentScore = 0;

                const market_chart_prices = historicalData[index].prices;

                const highestPrice = market_chart_prices.reduce((prev, curr) => (prev[1] > curr[1] ? prev : curr));
                setHighestPrice(highestPrice[1]);        
                
                let HighPrice = highestPrice[1];
                let highestPricePercentage = parseFloat((value.current_price - HighPrice) /  HighPrice);

                let ninetyDaysAgoPrice = null;
                for (let i = 0; i < market_chart_prices.length; i++) {
                  const ninetyDayArrayTimestamp = market_chart_prices[i][0];
                  const ninetyDayArrayPrice = market_chart_prices[i][1];
                  const ninetyDaysAgoArrayDate = new Date(ninetyDayArrayTimestamp);
                  const ninetyDaysAgoArrayDay = ninetyDaysAgoArrayDate
                    .getDate()
                    .toString();
                  const ninetyDaysAgoArrayMonth =
                    ninetyDaysAgoArrayDate.getMonth() + 1;
                  const ninetyDaysAgoArrayYear = ninetyDaysAgoArrayDate.getFullYear();

                  if (
                    ninetyDaysAgoArrayDay === ninetyDaysAgoDay &&
                    ninetyDaysAgoArrayMonth === ninetyDaysAgoMonth &&
                    ninetyDaysAgoArrayYear === ninetyDaysAgoYear
                  ) {
                    ninetyDaysAgoPrice = ninetyDayArrayPrice;
                    break;
                  }
                }

                let coinId = null;

                for (let i = 0; i < allAnalysisCoins.length; i++) {

                  coinId = allAnalysisCoins.find(
                    (coin) => coin.coinName === value.id
                  )?.coinId;

                }            

                let getCurrentBtcPrice = await axios.get(
                  `https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=BTC&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                );      
                let currentBtcPrice = null;    

                if(getCurrentBtcPrice.data === undefined){         

                  getCurrentBtcPrice = await axios.get(`https://data.messari.io/api/v2/assets/${coinId}/metrics`);       
                  currentBtcPrice = getCurrentBtcPrice.data.market_data.price_btc;                  

                } else {

                  currentBtcPrice = getCurrentBtcPrice.data.BTC;           

                }

                let getYearAgoBtcPrice = await axios.get(
                  `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=BTC&limit=365&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                );
               
                let yearAgoBtcPrice = null;   
                let getYearAgoBtcPriceValues = getYearAgoBtcPrice.data.Data.Data;

                if (getYearAgoBtcPriceValues !== undefined) {
                  yearAgoBtcPrice = getYearAgoBtcPrice.data.Data.Data[0].close;
                } else {  
                  const endDate = new Date().toISOString().split('T')[0]; // Today's date
                  const startDate = new Date(); // Current date/time
                  startDate.setDate(startDate.getDate() - 365); // Subtract 365 days
                  const startDateFormatted = startDate.toISOString().split('T')[0]; // Formatted start date                
                    
                    const response = await axios.get(
                      `https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`,
                      {
                        params: {
                          start: startDateFormatted,
                          end: endDate,
                          format: 'json',
                          interval: '1d',
                          market: 'btc', // Specify 'btc' to get BTC price data
                        },
                      }
                    );
                   

                    if(response.data.data.values !== null ) {
                      const priceData = response.data.data.values[0]; 
                      yearAgoBtcPrice = priceData[4];
                    } else {
                      yearAgoBtcPrice = 0;
                    }              

                }

                let oneYearBTCPercentChange = null;
                let oneYearBTCPriceChange = null;

                if (yearAgoBtcPrice === null || yearAgoBtcPrice === 0) {
                  oneYearBTCPercentChange = 0;
                  oneYearBTCPriceChange = parseFloat(currentBtcPrice) - 0;
                  oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(10);
                  if (oneYearBTCPriceChange > 0.0000001) {
                    btcChangeScore = 1;
                  } else {
                    btcChangeScore = 0;
                  }
                  btcPercentScore = 0;
                } else {
                  oneYearBTCPercentChange =
                    (currentBtcPrice - yearAgoBtcPrice) / yearAgoBtcPrice;
                  oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice);
                  oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(10);
                  if (oneYearBTCPriceChange > 0.0000001) {
                    btcChangeScore = 1;
                  }
                  if (oneYearBTCPercentChange > 0.2) {
                    btcPercentScore = 2;
                  }
                }
                  

                const earliestTimestamp = market_chart_prices[2][0]; // timestamp of the first recorded price
                const earliestDate = new Date(earliestTimestamp); // convert timestamp to Date object
                let startyear = earliestDate.getFullYear();
                let startday = earliestDate.getDate();
                let startmonth = earliestDate.getMonth() + 2;

                if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
                  if (startday >= 30) {
                    startday = 28;
                  }
                } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
                  if (startday > 28) {
                    startday = 1;
                  }
                } else if (startmonth > 12) {
                  startmonth = startmonth - 12;
                  startyear = earliestDate.getFullYear() + 1;
                
                }

                startday = startday.length < 2 ? "0" + startday : startday;
                startmonth = startmonth.toString().length < 2 ? "0" + startmonth : startmonth;

                let coincache = {};
                let inceptionDate = startday + "-" + startmonth + "-" + startyear;
                let cacheKey = `${value.id}_${inceptionDate}`;
                let startDateCoinData = null;

                if (coincache[cacheKey]) {
                  // Use cached data
                  startDateCoinData = coincache[cacheKey];

                }  else if (localStorage.getItem(cacheKey)) {    
                  
                  startDateCoinData = JSON.parse(localStorage.getItem(cacheKey));                     
                  coincache[cacheKey] = JSON.stringify(startDateCoinData);            
                
                } else {
                  // Fetch data from API
                  startDateCoinData = await axios.get(
                    `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
                  );
                  
                }
                
                let coinDataPass = startDateCoinData?.data?.market_data?.current_price?.usd;

                if (coinDataPass === undefined) {

                  startmonth = earliestDate.getMonth() + 6;

                  if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
              
                    if (startday >= 30) {
                      startday = 28;
                    }

                  } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
             
                    if (startday > 28) {
                      startday = 1;
                    }
                  } else if (startmonth > 12) {
                    startmonth = startmonth - 12;
                    startyear = earliestDate.getFullYear() + 1;        
                  }

                  startday = startday.length < 2 ? "0" + startday : startday;
                  startmonth =
                  startmonth.toString().length < 2 ? "0" + startmonth : startmonth;   
                  let inceptionDate = startday + "-" + startmonth + "-" + startyear;

                  if (coincache[cacheKey]) {
                  // Use cached data
                  startDateCoinData = coincache[cacheKey];
                  
                  }  else if (localStorage.getItem(cacheKey)) {                        
                    startDateCoinData = JSON.parse(localStorage.getItem(cacheKey));                     
                    coincache[cacheKey] = JSON.stringify(startDateCoinData);
                  } else {
                    // Fetch data from API
                    startDateCoinData = await axios.get(
                      `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
                    );
                    
                  }
                  coinDataPass = startDateCoinData?.data?.market_data?.current_price?.usd;

                  if (coinDataPass === undefined) {
                    const todaysDate = new Date();
                    const currentMonth = todaysDate.getMonth();
                    const currentYearNow = todaysDate.getFullYear();
                    startmonth = parseInt(earliestDate.getMonth() + 12);
      
                    if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {                 
                      if (startday >= 30) {
                        startday = 28;
                      }
                    } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
                    
                      if (startday > 28) {
                        startday = 1;
                      }
                    } else if (startmonth > 12) {
                      startmonth = startmonth - 12;
                      startyear = earliestDate.getFullYear() + 1;
                  
                      if(startyear === currentYearNow + 1){     

                        startyear = currentYearNow;
                        startmonth = currentMonth;

                      }
                  }

                    startday = startday.length < 2 ? "0" + startday : startday;
                    startmonth =
                      startmonth.toString().length < 2
                        ? "0" + startmonth
                        : startmonth;

                    let inceptionDate = startday + "-" + startmonth + "-" + startyear;      

                    if (coincache[cacheKey]) {
                      // Use cached data
                      startDateCoinData = coincache[cacheKey];
                      
                    }  else if (localStorage.getItem(cacheKey)) {    
                      
                      startDateCoinData = JSON.parse(localStorage.getItem(cacheKey));                     
                      coincache[cacheKey] = JSON.stringify(startDateCoinData);            
                    
                    } else {
                      // Fetch data from API
                      startDateCoinData = await axios.get(
                        `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
                      );                      
                    }

                  } else {
                    // Store data in cache and local storage
                    coincache[cacheKey] = JSON.stringify(startDateCoinData);
                    localStorage.setItem(cacheKey, JSON.stringify(startDateCoinData));
                  }

                  coinDataPass = startDateCoinData?.data?.market_data?.current_price?.usd;

                  if (coinDataPass === undefined) {         
                    
                    const todaysDate = new Date();
                    const currentMonth = todaysDate.getMonth();
                    const currentYearNow = todaysDate.getFullYear();
                    startmonth = parseInt(startmonth);   

                    if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
                    
                      if (startday >= 30) {
                        startday = 28;
                      }
                    } else if ([1, 3, 5, 7, 8, 10].includes(startmonth)) {
                   
                      if (startday > 28) {
                        startday = 1;
                      }
                    } else if (startmonth >= 12) {
                      startmonth = startmonth - 12;
                      startyear = earliestDate.getFullYear() + 1;

                      if(startyear === currentYearNow + 1){     

                        startyear = currentYearNow;
                        startmonth = currentMonth + 1;

                      }

                  }
                    startday = startday.length < 2 ? "0" + startday : startday;
                    startmonth = startmonth.toString().length < 2 ? "0" + startmonth : startmonth;
                    let inceptionDate = startday + "-" + startmonth + "-" + startyear;    
                    
                    if (coincache[cacheKey]) {
                      // Use cached data
                      startDateCoinData = coincache[cacheKey];
                      
                    }  else if (localStorage.getItem(cacheKey)) {    
                      
                      startDateCoinData = JSON.parse(localStorage.getItem(cacheKey));                     
                      coincache[cacheKey] = JSON.stringify(startDateCoinData);            
                    
                    } else if(inceptionDate !== undefined) {
                      // Fetch data from API
                      startDateCoinData = await axios.get(
                        `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
                      );
                      
                    }

                  }  else {
                    // Store data in cache
                    coincache[cacheKey] = startDateCoinData;
                    localStorage.setItem(cacheKey, JSON.stringify(startDateCoinData));
                  }

                } else {
                  // Store data in cache
                  coincache[cacheKey] = startDateCoinData;
                  localStorage.setItem(cacheKey, JSON.stringify(startDateCoinData));
                }
          
                let inceptionPriceChange =
                  (value.current_price -
                    startDateCoinData.data.market_data.current_price.usd) /
                  startDateCoinData.data.market_data.current_price.usd;          

                if (inceptionPriceChange > 0.3) {
                  inceptionPercentScore = 2;                 
                } else {
                  inceptionPercentScore = 0;                  
                }
                let maxChartGrade = null;

                if (parseFloat(inceptionPriceChange) >= 2.0) {
                  maxChartGrade = "A";
                  maxGradeScore = 2;
                } else if (parseFloat(inceptionPriceChange) >= 1.0 && parseFloat(inceptionPriceChange) < 2.0) {
                  maxChartGrade = "B";
                  maxGradeScore = 2;                
                } else if (parseFloat(inceptionPriceChange) < 1.0 && parseFloat(inceptionPriceChange) > 0.15) {
                  maxChartGrade = "C";
                  maxGradeScore = 1;
                } else {
                  maxChartGrade = "D";
                  maxGradeScore = 0;
                }

                let oneYearPercentChange = value.price_change_percentage_1y_in_currency / 100;

                if (oneYearPercentChange === null) {
                  oneYearPercentChange = 0;
                  oneYearPercentScore = 0;
                 
                } else {  
                    if (oneYearPercentChange > .2) {
                      oneYearPercentScore = 2;
                    } else {
                      oneYearPercentScore = 0;
                    }
                }

                let ninetyDaysPercentChange = null;

                if(ninetyDaysAgoPrice !== null){

                  ninetyDaysPercentChange =
                  (value.current_price - ninetyDaysAgoPrice) / ninetyDaysAgoPrice;

                } else {

                  ninetyDaysPercentChange =
                  (value.current_price - startDateCoinData.data.market_data.current_price.usd) / startDateCoinData.data.market_data.current_price.usd;

                }

                if (ninetyDaysPercentChange > 0.14) {
                  threeMonthsPercentScore = 1;
                } else {
                  threeMonthsPercentScore = 0;
                }

                let getCoinData = await api.get(
                  `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                );

                if(getCoinData.data){

                let twitter = getCoinData.data.Data.TWITTER_ACCOUNTS;
                let twitterArray = [];
                let twitterURL = null;
                let twitterFollowers = null;
                let sourceCode = getCoinData.data.Data.CODE_REPOSITORIES;
                let gitRepository = null;
                let website = getCoinData.data.Data.WEBSITE_URL;                

                if (twitter !== null) {

                  twitter = Object.values(twitter);
                  twitterArray = twitter.map((account) => account.FOLLOWERS);
                  
                  twitterURL = twitter.map(
                    (accounts) => accounts.URL            
                  );  

                  if(twitterURL.length > 1){
                    twitterURL = twitterURL[0];
                  }
                  twitterFollowers = twitterArray.reduce((acc, val) => acc + val);            

                  if (twitterFollowers > 25000) {
                    twitterScore = 1;              
                  }

                } else {
                  twitterFollowers = 0;
                  twitterScore = 0;          
                }

                if (sourceCode !== null && sourceCode !== undefined && sourceCode.length !== 0) {
                  gitRepository = sourceCode[0].URL;
                  gitScore = 1;
                  
                } else {
                  gitRepository = "N/A";
                  gitScore = 0;                
                }

                if (website === null) {
                  website = "N/A";
                }              

                if (value.total_volume > 250000) {
                  volumeScore = 1;
                }    

                let total =
                volumeScore +
                oneYearPercentScore +
                btcChangeScore +
                btcPercentScore +
                inceptionPercentScore +
                threeMonthsPercentScore +
                maxGradeScore +
                twitterScore +
                gitScore; 

                let buysellrating = 0;
                let buyHighPercentScore = 0;
                let sellHighPercentScore = 0;
                let buyrating = 0;
                let sellrating = 0;
                let buysell = null;

                if(total > 3 ){

                  buyrating = 1; 
                  sellrating = 0;

                } else {

                  sellrating = 1; 
                  buyrating = 0;

                }            

                if(highestPricePercentage <= -0.75 ){   

                  buyHighPercentScore = 2; 
                  sellHighPercentScore = 0;     

                } else if(highestPricePercentage >= -0.55 ){
                  
                  sellHighPercentScore = 2;  
                  buyHighPercentScore = 0;

                }
                  
                  let totalbuyrating = buyrating + buyHighPercentScore;

                  let totalsellrating = sellrating + sellHighPercentScore;

                  if(totalbuyrating > totalsellrating) {

                      buysellrating = totalbuyrating;             

                      if(buysellrating > 2 && ninetyDaysPercentChange < 0.40){
                        buysell = "BUY";
                      }  else {
                        buysell = "HODL";  
                      } 

                  } else if(totalsellrating > totalbuyrating) {

                      buysellrating = totalsellrating;

                      if(buysellrating > 3 && ninetyDaysPercentChange > 0.50){
                        buysell = "SELL";
                      } else {
                        buysell = "HODL";  
                      }  

                  } 

                setTotalScore(total);

                const response = await api.get('http://localhost:3006/portfolios');
                const portfolios = response.data;          
                let portfolioId = null; 
                let coinPrediction = null;
          
                // Find the portfolio containing the analysis for the specified coinId
                const portfolio = portfolios.find((p) =>      
                  p.analysis.some((analysisItem) => analysisItem.coinId === coinId)      
                );  

                if (portfolio) {

                  portfolioId = portfolio.id;
                
                  // Find the analysis item for the specified coinId within the portfolio
                  const analysisItem = portfolio.analysis.find(
                    (analysis) => analysis.coinId === coinId
                  );
                
                  if (analysisItem && analysisItem.prediction) {
                    // Access the prediction value for the coin
                    coinPrediction = analysisItem.prediction;       

                  } else {
                    console.log(`No prediction found for ${coinId}`);
                  } 

                } else {

                  console.log(`Portfolio not found for ${coinId}`);
                  
                }

                coinData.push({
                  id: value.id,
                  name: value.name,
                  current_price: value.current_price,
                  marketCap: value.market_cap,
                  volume: value.total_volume,
                  oneYearPercentChange: oneYearPercentChange,
                  oneYearBTCPercentChange: oneYearBTCPercentChange,
                  oneYearBTCPriceChange: oneYearBTCPriceChange,
                  inceptionPriceChange: inceptionPriceChange,
                  ninetyDaysPercentChange: ninetyDaysPercentChange,
                  maxChartGrade: maxChartGrade,
                  prediction: coinPrediction,
                  gainPrediction: null,
                  avgGainPrediction: null,
                  highestPricePercentage: highestPricePercentage,
                  twitterFollowers: twitterFollowers,
                  twitterURL: twitterURL,
                  gitRepository: gitRepository,
                  website: website,
                  rating: total,
                  buysellrating: buysellrating,
                  buysell: buysell
                });

                setCoinData(coinData);  
                setIsLoading(false); 

              }
            }

        } else {            
            console.log("Error retrieving coin data"); 
      } 
    }

};

  async function removeAllCoinsHandler() {

    const portfolios = await api.get("http://localhost:3006/portfolios");

    for (let i = 0; i < portfolios.data.length; i++) {

      const portfolio = await api.get(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`
      );

      // Remove each coin's data from browser storage
      for (let j = 0; j < portfolio.data.analysis.length; j++) {
        let coinName = portfolio.data.analysis[j].coinName;
        localStorage.removeItem(coinName);
      }
  
      // set the analysis array to an empty array
      portfolio.data.analysis = [];
  
      // update the portfolio with the new analysis array
      await api.patch(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`,
        { analysis: portfolio.data.analysis }
      );
  
      const updatedPortfolio = await api.get(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`
      );

      // set the analysisCoins state to the empty array
      setAnalysisCoins([]);
    }  
    // call the function to fetch the updated analysis coins
    GetAnalysisCoins();
  }

  async function removeCoinHandler(coinName) {
    // your logic to delete the analysis coin from the API

    const portfolios = await api.get("http://localhost:3006/portfolios");

    for (let i = 0; i < portfolios.data.length; i++) {
      const portfolio = await api.get(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`
      );

      for (let c = 0; c < portfolio.data.analysis.length; c++) {
         if (coinName === "binancecoin") {
          coinName = coinName.replace("binancecoin", "binance-coin");
        }

        if (portfolio.data.analysis[c].coinName === coinName) {
          const coinIndex = portfolio.data.analysis.findIndex(
            (coin) => coin.coinName === coinName
          );

            if (coinIndex === -1) {
            throw new Error(
              `Analysis Coin with id ${coinName} could not found in portfolio with id ${portfolios.data[i].id}`
            );
          }

          // remove the coin from the portfolio's coins array
          portfolio.data.analysis.splice(coinIndex, 1);

          // update the portfolio with the new coins array---
          await api.patch(
            `http://localhost:3006/portfolios/${portfolios.data[i].id}`,
            { analysis: portfolio.data.analysis }
          );

          const updatedPortfolio = await api.get(
            `http://localhost:3006/portfolios/${portfolios.data[i].id}`
          );
            
          // remove the corresponding key-value pair from the browser's storage
          localStorage.removeItem(coinName);
      
          // set the analysisCoins state to the updated analysis array
          setAnalysisCoins(updatedPortfolio.data.analysis);

          GetAnalysisCoins();
        }
      }
    }
  }; 
  
  async function handleInputChange(e, coinId) {    

    console.log("coinId: " + coinId);

    if (e === '') {
      setCoinInputValues((prevInputValues) => ({
        ...prevInputValues,
        [coinId]: ''
      }));
    } else {  

    const newValue = !isNaN(e) ? e : 0;    

    setCoinInputValues((prevInputValues) => ({
      ...prevInputValues,
      [coinId]: newValue,
    }));
    }    

  };

  const handleSort = (attribute) => {
    // Update sort order and attribute    
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
    setSortBy(attribute);
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

  if (isLoading) return <div>Loading...</div>;
  if (noCoins) return <div>Add some coins to analyze!</div>;

  return (
    <div className="analysis-main">
      <div className="app-main">
        <div className="ui coin-analysis">
          <div className="ui relaxed divided list">
          <div className="coin-table-header">
            <div 
                  className={`headerCell ${sortBy === "name" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("name")}
            >
              Coin {" "}
            </div>
            <div 
              className={`headerCell ${sortBy === "marketCap" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("marketCap")}
              >
               Market Cap{" "}                
              </div>
              <div
                className={`headerCell ${sortBy === "volume" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("volume")}
              >
                Volume{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "current_price" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("current_price")}
              >              
                Price{" "}                
              </div>
              <div 
              className={`headerCell ${sortBy === "oneYearPercentChange" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("oneYearPercentChange")}
              >
                USD 1YR % Change{" "}
               </div>
              <div 
              className={`headerCell ${sortBy === "oneYearBTCPercentChange" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("oneYearBTCPercentChange")}
              >
                BTC 1YR % Change{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "oneYearBTCPriceChange" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("oneYearBTCPriceChange")}
              >
                BTC 1YR Change{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "inceptionPriceChange" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("inceptionPriceChange")}
              >
                Inception % Change{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "ninetyDaysPercentChange" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("ninetyDaysPercentChange")}
              >
                3 Months % Change{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "maxChartGrade" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("maxChartGrade")}
              >
                Max Chart Grade{" "}               
              </div>
              <div
                className={`headerCell ${sortBy === "prediction" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("prediction")}
              >
                Price Prediction{" "}               
              </div>
              <div 
              className={`headerCell ${sortBy === "gainPrediction" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("gainPrediction")}
              >
                Future Gain Prediction{" "}
              </div>
              <div 
              className={`headerCell ${sortBy === "avgGainPrediction" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("avgGainPrediction")}
              >
                Avg. Gain Prediction{" "}              
              </div>
              <div 
                 className={`headerCell ${sortBy === "highestPricePercentage" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("highestPricePercentage")}
              >
                % from ATH{" "}
              </div>
              <div  
              className={`headerCell ${sortBy === "twitterFollowers" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("twitterFollowers")}
              >
                Twitter Followers{" "}                
              </div>
              <div  
              className={`headerCell ${sortBy === "gitRepository" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("gitRepository")}
              >
                Git Source{" "}               
              </div>
              <div  
              className={`headerCell ${sortBy === "rating" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("rating")}
              >
                Coin Score{" "}             
              </div>
              <div  
              className={`headerCell ${sortBy === "buysell" ? "active" : ""}`}
                  align="left"
                  onClick={() => handleSort("buysell")}
              >
                Buy/Sell{" "}        
              </div>
    </div>
            {              
            sortedCoins.length === 0 ? (
                <span>Loading...</span>
              ) : (
                sortedCoins.map((coin, index) => (             
                  <CoinTableRow
                  coin={coin}        
                  coinInputValues={coinInputValues} 
                  handleInputChange={handleInputChange}     
                  handleCoinPrediction={handleCoinPrediction}
                  removeCoinHandler={removeCoinHandler}              
                  />
                ))
              )
            }
          </div>
        </div>
        <button
              className="ui red basic button"
              onClick={() => removeAllCoinsHandler()}
          >
              Delete All
        </button>
      </div>
    </div>
  );
}

export default Analysis;