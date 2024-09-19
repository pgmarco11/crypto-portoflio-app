import { useState, useEffect } from "react";
import CoinTable from './CoinTable';
import axios from "axios";
import api from "../api/portfolios";

function Analysis() {

  const [analysisCoins, setAnalysisCoins] = useState([]);
  const [coinData, setCoinData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [noCoins, setNoCoins] = useState(false);

  const endDate = new Date().toISOString().split('T')[0]; //today
  const yearDate = new Date();
  yearDate.setDate(yearDate.getDate() - 365);
  let yearDateFormatted = yearDate.toISOString().split('T')[0]; // Formatted start date

  useEffect(() => {
    GetAnalysisCoins();
  }, []);

  console.log("GetAnalysisCoins analysisCoins: ",analysisCoins);

  async function GetAnalysisCoins() {
      try {
          const portfolios = await api.get("http://localhost:8888/portfolios");
          let allAnalysisCoins = [];

          for (let i = 0; i < portfolios.data.length; i++) {
              const response = await api.get(
                `http://localhost:8888/portfolios/${portfolios.data[i].id}`
              );
              let analysisCoins = response.data.analysis;

              console.log("analysisCoins 0: ",analysisCoins);

              for (let value of analysisCoins) {
                let coinNameAnalysis = value.coinName.replace(/\s+/g, '-'); // Replace spaces with hyphens
                let coinIdAnalysis = value.coinId;
                allAnalysisCoins.push({
                    coinName: coinNameAnalysis,
                    coinId: coinIdAnalysis,
                });
              }
          }

          setAnalysisCoins(allAnalysisCoins);

          console.log("analysisCoins 1: ",allAnalysisCoins);

          let allAnalysisCoinsArray = Object.keys(allAnalysisCoins);

          console.log("analysisCoins 2: ",allAnalysisCoinsArray);     

            const allCoinNames = [];
            const allCoinIds = [];

            for (let a = 0; a < allAnalysisCoinsArray.length; a++) {
              allCoinNames.push(allAnalysisCoins[a].coinName);
              allCoinIds.push(allAnalysisCoins[a].coinId);
            }
            let allCoinIdsjoin = allCoinIds.join(",");   
            
            console.log("allCoinIdsjoin 3: ",allCoinIdsjoin);
            
              // ** Test ** Function to fetch coin details from CoinPaprika
              async function fetchCoinDetailsFromCoinPaprika(coinSymbol) {

                console.log("allAnalysisCoins not_possible fetchCoinDetailsFromCoinPaprika: https://api.coinpaprika.com/v1/coins/");
                console.log("allAnalysisCoins not_possible fetchCoinDetailsFromCoinPaprika 0: https://api.coinpaprika.com/v1/coins/"+coinSymbol);
                console.log("allAnalysisCoins not_possible fetchCoinDetailsFromCoinPaprika 0: https://api.coinpaprika.com/v1/tickers/"+coinSymbol);

                try {
                  const coinPaprikaCoinListUrl = `https://api.coinpaprika.com/v1/coins`;
                  const coinListResponse = await axios.get(coinPaprikaCoinListUrl);
                  const coinList = coinListResponse.data;
                  
                  const coin = coinList.find(c => c.symbol === coinSymbol);

                  if (!coin) {
                    throw new Error(`allAnalysisCoins not_possible Coin with symbol ${coinSymbol} not found in CoinPaprika.`);
                  }
                  
                  let coinId = coinSymbol;

                  console.log("allAnalysisCoins not_possible coinId: ", coinId);

                  const coinDetailsUrl = `https://api.coinpaprika.com/v1/coins/${coinId}`;
                  const coinDetailsResponse = await axios.get(coinDetailsUrl);
                  const coinDetails = coinDetailsResponse.data;

                  // Fetch current price
                  const coinPriceUrl = `https://api.coinpaprika.com/v1/tickers/${coinId}`;
                  const coinPriceResponse = await axios.get(coinPriceUrl);
                  const coinPrice = coinPriceResponse.data;

                  return {
                    ...coinDetails,
                    price: coinPrice.quotes.USD.price
                  };
                } catch (error) {
                  console.error(`allAnalysisCoins not_possible Error fetching coin details from CoinPaprika: ${error}`);
                  return null;
                }
              }

              // Function to fetch coin details from Messari
              async function fetchCoinDetailsFromMessari(coinSymbol) {

                console.log("allAnalysisCoins not_possible fetchCoinDetailsFromMessari 0: https://data.messari.io/api/v1/assets/"+coinSymbol);

                console.log("allAnalysisCoins not_possible fetchCoinDetailsFromMessari 0: "+`https://data.messari.io/api/v1/assets/${coinSymbol}/profile`);

                try {
                  const messariCoinListUrl = `https://data.messari.io/api/v1/assets`;
                  const coinListResponse = await axios.get(messariCoinListUrl);
                  const coinList = coinListResponse.data.data;
                  
                  const coin = coinList.find(c => c.symbol === coinSymbol);
                  if (!coin) {
                    throw new Error(`allAnalysisCoins not_possible Coin with symbol ${coinSymbol} not found in Messari.`);
                  }
                  
                  let coinId = coinSymbol;

                  console.log("allAnalysisCoins not_possible coinId: ", coinId);
         
                  const coinDetailsUrl = `https://data.messari.io/api/v1/assets/${coinId}/profile`;
                  const coinDetailsResponse = await axios.get(coinDetailsUrl);
                  const coinDetails = coinDetailsResponse.data.data;

                  // Fetch current price
                  const coinPriceUrl = `https://data.messari.io/api/v1/assets/${coinId}/metrics/market-data`;
                  const coinPriceResponse = await axios.get(coinPriceUrl);
                  const coinPrice = coinPriceResponse.data.data.market_data.price_usd;

                  return {
                    ...coinDetails,
                    price: coinPrice
                  };
                } catch (error) {
                  console.error(`Error fetching coin details from Messari: ${error}`);
                  return null;
                }
              }

              console.log("allCoinIdsjoin 4: ",allCoinIdsjoin);

            //API to get name, symbol, images, market cap, price change in 24hrs, etc, for each coin in the analysis
            if (allCoinIdsjoin.length !== 0) {

              const marketChartData = await axios.get(
                `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${allCoinIdsjoin}&tsyms=USD&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
              );
           
              console.log("analysisCoins 4 marketChartData.data: ", marketChartData.data); //RAW DISPLAY
              console.log("analysisCoins 4 marketChartData.data RAW: ", marketChartData.data.RAW); //NAKA

              console.log("analysisCoins 4: ",marketChartData.data.RAW);

              for (let [index, value] of Object.entries(marketChartData.data.RAW)) {
                
                let volumeScore = 0;
                let oneYearPercentScore = 0;
                let btcChangeScore = 0;
                let btcPercentScore = 0;
                let threeMonthsPercentScore = 0;
                let maxGradeScore = 0;
                let twitterScore = 0;
                let gitScore = 0;
                let highPercentScore = 0;       
                let latestPrice = null;

                console.log("allAnalysisCoins index: ",index); 
                console.log("allAnalysisCoins value: ",value);

                let coinName = null;
                let coinId = null;

                if(index !== null){
                  coinId = index.toLowerCase();
                  console.log("allAnalysisCoins coinId 0: ",coinId);
                }
                
                console.log("allAnalysisCoins coinName 0: ",coinName);
                console.log("allAnalysisCoins 5",allAnalysisCoins);

                for (let i = 0; i < allAnalysisCoins.length; i++) {  
                
                      console.log("allAnalysisCoins toUppercase allAnalysisCoins[i].coinId "+i+": ",allAnalysisCoins[i].coinId); 
                      console.log("allAnalysisCoins toUppercase value.USD "+i+": ",value.USD);           

                    if( (allAnalysisCoins[i].coinId.toUpperCase() === value.USD.FROMSYMBOL) && value.USD.CONVERSIONTYPE !== "not_possible" ) {

                        console.log("allAnalysisCoins 6-1: ",allAnalysisCoins[i].coinId.toUpperCase());
                        console.log("allAnalysisCoins 6-2: ",value.USD.FROMSYMBOL);
                        console.log("allAnalysisCoins 6-3: ",value.USD.CONVERSIONTYPE); 
                        
                        console.log("3 month percentage value.USD.PRICE "+coinId+": ", value.USD.PRICE);  
                
                        coinId = allAnalysisCoins[i].coinId;   
                        coinName = allAnalysisCoins[i].coinName; 
                        latestPrice = value.USD.PRICE;                    
                        break;  

                    } else if (value.USD.CONVERSIONTYPE === "not_possible" || coinId === null) {

                        console.log("allAnalysisCoins not_possible for "+index+" value is ",value);                       

                        const coinSymbol = index; // Assuming 'index' is the coin symbol here

                        console.log("allAnalysisCoins not_possible for "+index+" coinSymbol is ",coinSymbol);
          
                        // First, try CoinPaprika
                        let coinDetails = await fetchCoinDetailsFromCoinPaprika(coinSymbol);

                        console.log("allAnalysisCoins not_possible fetchCoinDetailsFromCoinPaprika for "+index+" : "+coinDetails);
                        
                        // If CoinPaprika fails, try Messari
                        if (!coinDetails) {
                          coinDetails = await fetchCoinDetailsFromMessari(coinSymbol);
                        }

                        console.log("allAnalysisCoins not_possible coinDetails for "+index+" is ",coinDetails); 
                        
                        if (coinDetails) {

                          console.log("3 month coinDetails for "+index+" is ",coinDetails.price); 
                          
                          coinId = coinDetails.symbol || coinDetails.slug; // Adjust based on API response
                          coinName = coinDetails.name;
                          latestPrice = coinDetails.price;
                          break;
                        } else {
                          break;
                        }
                    } 
                }          

                async function getAllTimeHighPriceFromMessari(coinId,coinName) {
                    console.log("highestPricePercentage coinId 2: ", coinId);
                    console.log("highestPricePercentage coinName 2: ", coinName);

                    try {
                        console.log("highestPricePercentage messari for " + coinId + " API: " + `https://data.messari.io/api/v1/assets/${coinId}/metrics`);
                        
                        // Get all-time highest price for coin data
                        let getHighPrice = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`); 

                        const highPriceData = getHighPrice.data.data;    
                        
                        console.log("highestPricePercentage for " + coinId + " getHighPrice.data: ", getHighPrice.data);
                        
                        const alltimeHighPrice = highPriceData.all_time_high.price;
                        let isNanPrice = isNaN(alltimeHighPrice); //true if not number
                        let athPrice = 0;
                        
                        const coinSymbol = highPriceData.symbol.toLowerCase();  
                        const coinSlug = highPriceData.slug.toLowerCase();                      
                        
                        // Assuming coinSymbol should be compared with a field in highPriceData
                        if ((coinSymbol === coinId.toLowerCase() || coinSlug === coinId.toLowerCase()) && isNanPrice === false && alltimeHighPrice !== null && highPriceData) {
                            athPrice = alltimeHighPrice;
                            athPrice = parseFloat(athPrice).toFixed(10);
                            console.log("highestPricePercentage athPrice 1: ", athPrice);
                        }                  
                        
                        return athPrice;
                        
                    } catch (error) {                  
                            console.log("highestPricePercentage Messari API error for " + coinId + ", use CryptoCompare as fallback");                   
                    }
                }
              
     
                async function getAllTimeHighPriceFromCryptoCompare(coinId, coinName) {
                  console.log("highestPricePercentage coinId 3: ", coinId);
                  console.log("highestPricePercentage coinName 3: ", coinName);

                  console.log("highestPricePercentage cc for " + coinId + " API: " + `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);

                  // Replace this with your actual CryptoCompare API key                  
                  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`;

            
                  try {
                    let response = await axios.get(url); // Move response definition here
                    let data = response.data.Data ? response.data.Data.Data : null;
                    let athPrice = null;

                    console.log("highestPricePercentage CryptoCompare response.data " + coinId + ": ", response.data);
               
                    if (!data) {
                      console.log("highestPricePercentage CryptoCompare Invalid data from CryptoCompare for " + coinId);
                    } else {
                      athPrice = Math.max(...data.map(day => day.high));
                      athPrice = parseFloat(athPrice).toFixed(10);
                      console.log("highestPricePercentage CryptoCompare athPrice for " + coinId + ": ", athPrice);
                    }
                    

                    return athPrice;
                  } catch (error) {
                    console.error("highestPricePercentage CryptoCompare error for " + coinId + ": ", error);
                    throw error;
                  }
                }
        
                let athPrice = await getAllTimeHighPriceFromCryptoCompare(coinId, coinName);  

                console.log("highestPricePercentage athPrice final 1 " + coinId + ": ", athPrice);

                if(athPrice === null || athPrice === 0){
                  athPrice = await getAllTimeHighPriceFromMessari(coinId, coinName);                  
                }

                console.log("highestPricePercentage athPrice final 2 " + coinId + ": ", athPrice);

                //let coinPriceValue = value.USD.PRICE;
                
                console.log("highestPricePercentage value.USD.PRICE "+coinId+": ",value.USD.PRICE);
                console.log("highestPricePercentage latestPrice "+coinId+": ",latestPrice);
                console.log("highestPricePercentage athPrice "+coinId+": ",athPrice);

                console.log("3 month latestPrice "+coinId+": ",latestPrice);
          
                let highestPricePercentage = ((latestPrice - athPrice) / athPrice) * 100;

                console.log("highestPricePercentage: ", highestPricePercentage);

                //sent btc price of a coin to null   
                let getCurrentBtcPrice = null;
                let currentBtcPrice = null;
                
                try {
                      getCurrentBtcPrice = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);
                  
                      if (!getCurrentBtcPrice.data || !getCurrentBtcPrice.data.data || !getCurrentBtcPrice.data.data.market_data) {
                          throw new Error("Invalid data from Messari");
                      }
                  
                      if (coinId === 'BTC' && getCurrentBtcPrice.data.data.market_data.price_usd) {
                          currentBtcPrice = (getCurrentBtcPrice.data.data.market_data.price_usd).toFixed(2);
                      } else if (getCurrentBtcPrice.data.data.market_data.price_btc) {
                          currentBtcPrice = (getCurrentBtcPrice.data.data.market_data.price_btc).toFixed(10);
                      } else {
                          // Using CryptoCompare API
                          const getCurrentBtcPriceData = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
                          const getCurrentCoinPrice = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=BTC&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
                  
                          if (coinId === 'BTC' && getCurrentBtcPriceData.data && getCurrentBtcPriceData.data.USD) {
                              currentBtcPrice = (getCurrentBtcPriceData.data.USD).toFixed(2);
                          } else if (getCurrentCoinPrice.data && getCurrentCoinPrice.data.BTC) {
                              currentBtcPrice = (getCurrentCoinPrice.data.BTC).toFixed(10);
                          } else {
                              throw new Error("Unable to fetch price data from CryptoCompare");
                          }
                      }
                  } catch (error) {
                      console.log("Error fetching data:", error.message);
                  
                      // Fallback logic to calculate BTC value of the coin
                      try {
                          const getCurrentBtcPriceData = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
                          const getCurrentCoinPrice = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=BTC&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
                  
                          let currentBtc = getCurrentBtcPriceData.data.USD;
                          let latestPrice = getCurrentCoinPrice.data.BTC;

                          console.log("3 month latestPrice "+coinId+": ",latestPrice);
                  
                          console.log("Current BTC Price currentBtc 0: ", currentBtc);
                          console.log("Current BTC Price latestPrice 0: ", latestPrice);
                  
                          if (latestPrice && currentBtc) {
                              currentBtcPrice = (latestPrice / currentBtc).toFixed(10);
                          } else {
                              throw new Error("Unable to fetch price data from CryptoCompare and calculate BTC value");
                          }
                      } catch (fallbackError) {
                          console.log("Fallback error calculating BTC value:", fallbackError.message);
                      }
                  }
                
                console.log("Current BTC Price "+coinId+": ", currentBtcPrice);

                async function yearAgoPriceByBTC(coinId, coinName) {
                    coinId = coinId.toLowerCase();   
                    coinName = coinName.toLowerCase();
                
                    let now = new Date();
                    now.setDate(now.getDate() - 1);
                    let endDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];    
                    let yearDate = new Date();
                
                    yearDate.setFullYear(yearDate.getFullYear() - 1);
                    let yearDateFormatted = yearDate.toISOString().split('T')[0];
                
                    try {
                        // Get BTC price from a year ago
                        let getYearAgoBtcPrice = await axios.get(
                            `https://data.messari.io/api/v1/assets/btc/metrics/price/time-series`,
                            {
                                params: {
                                    start: yearDateFormatted,
                                    end: endDate,
                                    format: 'json',
                                    interval: '1d'
                                },
                            }
                        );
                
                        let btcPrice1YearAgo = getYearAgoBtcPrice.data.data.values[0][4];
                
                        if (coinId === 'btc') {
                            return { btcPrice1YearAgo, yearAgoBtcPrice: btcPrice1YearAgo };
                        }
                
                        console.log('getYearAgoUSDPrice URL: https://data.messari.io/api/v1/assets/' + coinId + '/metrics/price/time-series');
                
                        console.log('allAnalysisCoins coinId 4: ' + coinId);
                        console.log('allAnalysisCoins coinName 4: ' + coinName);
                        console.log('allAnalysisCoins yearDateFormatted: ' + yearDateFormatted);
                        console.log('allAnalysisCoins endDate 1: ' + endDate);
                
                        let getYearAgoUSDPrice;
                        try {
                            getYearAgoUSDPrice = await axios.get(
                                `https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`,
                                {
                                    params: {
                                        start: yearDateFormatted,
                                        end: endDate,
                                        format: 'json',
                                        interval: '1d'
                                    },
                                }
                            );
                        } catch (error) {
                            if (error.response && error.response.status === 400) {
                                console.error(`Request failed for ${coinId} with status 400. Ignoring and continuing.`);
                                getYearAgoUSDPrice = null;
                            } else {
                                throw error;
                            }
                        }
                
                        let btcPrice = getYearAgoBtcPrice.data.data.values[0];
                        let coinPrice = 0;
                        let yearAgoBtcPrice = 0;
                
                        if (getYearAgoUSDPrice) {
                          
                            let coinSymbolRaw = getYearAgoUSDPrice.data.data.symbol;
                            let coinSymbol = coinSymbolRaw.toLowerCase();
                
                            console.log("getYearAgoUSDPrice data " + coinId + ": ", getYearAgoUSDPrice);                        
                
                            console.log("getYearAgoUSDPrice coinId coinSymbol & URL: " + coinId + ": ", coinSymbol);
                
                            if (getYearAgoUSDPrice.data.data.values !== null && getYearAgoUSDPrice.data.data.values.length > 0 &&
                                coinId.toLowerCase() === coinSymbol) {
                
                                console.log("yearAgoPriceByBTC getYearAgoUSDPrice data.data " + coinId + ": ", getYearAgoUSDPrice.data.data);
                
                                coinPrice = getYearAgoUSDPrice.data.data.values[0][4];
                
                                console.log("yearAgoPriceByBTC getYearAgoUSDPrice.data coinPrice " + coinId + ": ", coinPrice);
                            }
                        }
                
                        if (coinPrice !== 0) {
                            // Calculate price in BTC
                            yearAgoBtcPrice = coinPrice / btcPrice[4];
                
                        } else {
                            // Fallback to CryptoCompare API
                            let getYearAgoBtcPriceFromCC = await axios.get(
                                `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=BTC&limit=365&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
                            ); 
                
                            console.log("getYearAgoBtcPriceFromCC.data: ", getYearAgoBtcPriceFromCC.data);
                
                            console.log("getYearAgoBtcPriceFromCC.data.Data.Data: ", getYearAgoBtcPriceFromCC.data.Data.Data);
                            
                            if(getYearAgoBtcPriceFromCC.data.Data.Data){
                                yearAgoBtcPrice = getYearAgoBtcPriceFromCC.data.Data.Data[0].close;
                            }                   
                
                            if (yearAgoBtcPrice === 0 && getYearAgoBtcPriceFromCC.data.Data.Data ) {
                
                                let getYearAgoBtcPriceValues = getYearAgoBtcPriceFromCC.data.Data.Data;  
                
                                console.log("yearAgoPriceByBTC cryptocompare getYearAgoBtcPriceValues" + coinId + ": ", getYearAgoBtcPriceValues);
                
                                for (let i = 0; i < getYearAgoBtcPriceValues.length; i++) {                                
                                    if (getYearAgoBtcPriceValues[i].close !== 0) {
                                        yearAgoBtcPrice = getYearAgoBtcPriceValues[i].close;
                                        break;
                                    }
                                }
                
                                if (yearAgoBtcPrice === 0 || !getYearAgoBtcPriceFromCC.data.Data.Data) {
                                    const dateObject = new Date(yearDateFormatted);
                                    dateObject.setDate(dateObject.getDate() + 2);
                                    const newYearDateFormatted = dateObject.toISOString().split('T')[0];  
                
                                    try {
                                        const yearAgoPricePaprika = await axios.get(
                                            `https://api.coinpaprika.com/v1/tickers/${coinId}-${coinName}/historical?start=${newYearDateFormatted}&interval=1d`
                                        );
                
                                        console.log("yearAgoPriceByBTC yearAgoPricePaprika " + coinId + ": ", yearAgoPricePaprika);
                
                                        if (yearAgoPricePaprika.data && yearAgoPricePaprika.data.length > 0) {
                
                                            console.log("yearAgoPriceByBTC yearAgoPricePaprika.data" + coinId + ": ", yearAgoPricePaprika.data);
                
                                            yearAgoBtcPrice = yearAgoPricePaprika.data[0].price.toFixed(16);
                
                                            console.log("yearAgoPriceByBTC yearAgoPricePaprika yearAgoBtcPrice " + coinId + ": ", yearAgoBtcPrice);
                
                                        } else {
                                            yearAgoBtcPrice = 0;
                                        }
                                    } catch (error) {
                                        if (error.response && error.response.status === 404) {
                                            yearAgoBtcPrice = 0;
                                        } 
                                    }
                                }
                            } else {
                                console.log("yearAgoBtcPrice cryptocompare yearAgoBtcPrice " + coinId + ": ", yearAgoBtcPrice);
                            }
                        }
                
                        return { btcPrice1YearAgo, yearAgoBtcPrice };
                    } catch (error) {
                        if (error.response) {
                            console.error('yearAgoPriceByBTC An error occurred:', error.response.data);
                        } else {
                            console.error('yearAgoPriceByBTC An error occurred:', error.message);
                        }
                        throw error;
                    }
                }

                async function coinPaprikaNinetyDays(coinId) {

                let ninetyDaysAgoDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                console.log("3 month fetching data from CoinPaprika API for coin:", coinId);
        
                try {
                    if (coinId !== null) {
                        coinId = coinId.toLowerCase();
                    }
                    if (coinName !== null) {
                        coinName = coinName.toLowerCase();
                    }
        
                    let ninetyDaysAgoPrice = null;
                    let response = null;

                    console.log("3 month fetching data from CoinPaprika coinId:", coinId);
                    console.log("3 month fetching data from CoinPaprika coinName:", coinName);
                    console.log("3 month fetching data from CoinPaprika ninetyDaysAgoDate:", ninetyDaysAgoDate);

                  console.log("3 month fetching coinpaprika API for "+coinId+": "+'https://api.coinpaprika.com/v1/tickers/'+coinId+'-'+coinName+'/historical?start='+ninetyDaysAgoDate+'&interval=1d');
        
                    if (coinName !== null && coinId !== null) {
                        let response = await axios.get(
                            `https://api.coinpaprika.com/v1/tickers/${coinId}-${coinName}/historical?start=${ninetyDaysAgoDate}&interval=1d`
                        );
                    }                    

                    if (response !== null && response.data && response.data.length > 0) {

                      ninetyDaysAgoPrice = parseFloat(response.data[0].price).toFixed(10);

                      console.log("3 month fetching data from CoinPaprika ninetyDaysAgoPrice:", ninetyDaysAgoPrice);                      
                      
                    }

                    return ninetyDaysAgoPrice;

                } catch (error) {
                    console.log("3 month data error from CoinPaprika API:", error.message);                   
                    return null; 
                }

              }




                async function cryptoCompareNinetyDays(coinId) {
                  console.log("3 month fetching No data found in the response from Messari for the specified coin ID:", coinId);
                  console.log("3 month fetching Attempting to fetch data from CryptoCompare API for coin:", coinId);

              console.log("3 month fetching cryptocompare API for "+coinId+": "+'https://min-api.cryptocompare.com/data/v2/histoday?fsym='+coinId+'&tsym=USD&limit=365&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa');
              
                  try {
                      let response = await axios.get(
                          `https://min-api.cryptocompare.com/data/v2/histoday`,
                          {
                              params: {
                                  fsym: coinId,
                                  tsym: 'USD',
                                  limit: 90,
                                  api_key: process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
                              }
                          }
                      );
              
                      const ninetyDaysAgoTimestamp = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
                      const priceData = response.data?.Data?.Data;
              
                      // Check if priceData is an array and has data
                      if (Array.isArray(priceData) && priceData.length > 0) {
                          let ninetyDaysAgoPrice = null;
              
                          console.log("3 month fetching ninetyDaysAgoPrice " + coinId + " response.data: ", response.data);
                          console.log("3 month fetching ninetyDaysAgoPrice " + coinId + " priceData: ", priceData);
              
                          for (let dayData of priceData) {
                              console.log("3 month fetching ninetyDaysAgoPrice ninetyDaysAgoTimestamp " + coinId + ": ", ninetyDaysAgoTimestamp);
                              console.log("3 month fetching ninetyDaysAgoPrice time " + coinId + ": ", dayData.time);
                              
                              if (dayData.time === ninetyDaysAgoTimestamp || dayData.close !== 0) {
                                  ninetyDaysAgoPrice = parseFloat(dayData.close).toFixed(10);
                                  break;
                              }
                          }
              
                          return ninetyDaysAgoPrice;

                      } else {
                          console.error("3 month fetching No valid price data found for the specified coin ID:", coinId);
                          return null;
                      }

                  } catch (error) {
                      console.error("3 month fetching Error fetching data from CryptoCompare API:", error);
                      return null;
                  }
                }
            
              
              
                async function getNinetyDaysAgoPrice(coinId, coinName) {
                  console.log("3 month fetching Attempting to fetch data from Messari API for coinId:", coinId);
                  console.log("3 month fetching Attempting to fetch data from Messari API for coinName:", coinName);  
              
                  try {
                      const threeMonthsDate = new Date();
                      threeMonthsDate.setDate(threeMonthsDate.getDate() - 90);
                      const threeMonthsDateFormatted = threeMonthsDate.toISOString().split('T')[0];
                      const endDate = new Date().toISOString().split('T')[0]; // Assuming endDate is today

                      console.log("3 month fetching Attempting to fetch data from Messari coinId: ", coinId);
                      console.log("3 month fetching Attempting to fetch data from Messari API threeMonthsDateFormatted: ", threeMonthsDateFormatted);                
                      console.log("3 month fetching Attempting to fetch data from Messari API endDate: ", endDate);

                      console.log("3 month fetching messari API for "+coinId+": "+'https://data.messari.io/api/v1/assets/'+coinId+'/metrics/price/time-series');
                      
                      let ninetyDaysAgoPrice = null;

                      let response = await axios.get(
                          `https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`,
                          {
                              params: {
                                  start: threeMonthsDateFormatted,
                                  end: endDate,
                                  format: 'json',
                                  interval: '1d',
                                  market: 'usd',
                              },
                          }
                      ); 

                      console.log("3 month fetching response: ", response);
                      console.log("3 month fetching response.data: ", response.data);
                      console.log("3 month fetching coinName: ", coinName);                  

                      let coinSymbolRaw = response.data.data.symbol;
                      let coinSymbol = coinSymbolRaw.toLowerCase();
                      let coinValues = response.data.data.values;

                      console.log("3 month fetching coinSymbolRaw: ", coinSymbolRaw);
                      console.log("3 month fetching coinId.toLowerCase: ", coinId.toLowerCase());
                      console.log("3 month fetching coinSymbol: ", coinSymbol);
                      console.log("3 month fetching "+coinId+" coinValues: ", coinValues);                
              
                      if (coinValues != null) {

                          console.log("3 month fetching coin coinId " + coinId + " values: ", coinValues);
                          console.log("3 month fetching " + coinId + " threeMonthPriceData: ", coinValues[0]);

                          const threeMonthPriceData = coinValues[0];
                          ninetyDaysAgoPrice = parseFloat(threeMonthPriceData[4]).toFixed(10);
                          console.log("3 month fetching messari 0 for " + coinId + " ninetyDaysAgoPrice: ", ninetyDaysAgoPrice);

                      } 
              
                      console.log("3 month fetching ninetyDaysAgoPrice " + coinId + ": ", ninetyDaysAgoPrice);
              
                      if (ninetyDaysAgoPrice === null || isNaN(ninetyDaysAgoPrice)) {
                          console.log("3 month fetching error, fetching data from Messari, CryptoCompare, and coinpaprika");
                          return null;
                      } else {
                        return ninetyDaysAgoPrice;
                      }
              
                  } catch (error) {
                      console.log("3 month fetching data error from Messari, CryptoCompare, and coinpaprika:", error.message);              
                  }
                } 
            
              
                let ninetyDaysAgoPrice = null;
                let yearAgoBtcPriceResult = null;
                let oneYearBTCPercentChange = "N/A";   
                let oneYearBTCPriceChange = "N/A";

                console.log("Current BTC Price 2 "+coinId+": ", currentBtcPrice);

                console.log("yearAgoPriceByBTC and getNinetyDaysAgoPrice coinId "+coinId+": ",ninetyDaysAgoPrice);    
                console.log("yearAgoPriceByBTC and getNinetyDaysAgoPrice coinName "+coinName+": ",ninetyDaysAgoPrice);   

                console.log("oneYearBTCPriceChange and yearAgoBtcPriceResult coinId 0 "+coinId+": ",yearAgoBtcPriceResult);    
                console.log("oneYearBTCPriceChange and yearAgoBtcPriceResult coinName 0 "+coinName+": ",yearAgoBtcPriceResult);   

                if (coinId !== null) {
                    let yearAgoBtcPrice = null;
                    let btcPrice1YearAgo = null;
                
                    try {
                          ninetyDaysAgoPrice = await getNinetyDaysAgoPrice(coinId, coinName);
                          console.log("3 month fetching messari ninety days ago price for "+coinId+": ", ninetyDaysAgoPrice);

                          if(ninetyDaysAgoPrice === null || ninetyDaysAgoPrice == undefined){

                              ninetyDaysAgoPrice = await cryptoCompareNinetyDays(coinId);  
                              console.log("3 month fetching cryptoCompareNinetyDays 1 for " + coinId + " ninetyDaysAgoPrice: ", ninetyDaysAgoPrice);
  
                              if(ninetyDaysAgoPrice === null || ninetyDaysAgoPrice == undefined){                        
                                  ninetyDaysAgoPrice = await coinPaprikaNinetyDays(coinId);  
                                  console.log("3 month fetching coinPaprikaNinetyDays 2 for " + coinId + " ninetyDaysAgoPrice: ", ninetyDaysAgoPrice);
                              }                          
                        }

                    } catch (error) {
                        console.log("3 month percentage error fetching ninety days ago price for "+coinId+".", error.message);
                        ninetyDaysAgoPrice = null; // Handle the error scenario
                    }
                
                    yearAgoBtcPriceResult = await yearAgoPriceByBTC(coinId, coinName);

                    console.log("oneYearBTCPriceChange and yearAgoBtcPriceResult coinId 1 "+coinId+": ",yearAgoBtcPriceResult);    
                    console.log("oneYearBTCPriceChange and yearAgoBtcPriceResult coinName 1 "+coinName+": ",yearAgoBtcPriceResult);   
                
                    if (yearAgoBtcPriceResult !== null) {

                        yearAgoBtcPrice = parseFloat(yearAgoBtcPriceResult.yearAgoBtcPrice).toFixed(16);
                        btcPrice1YearAgo = parseFloat(yearAgoBtcPriceResult.btcPrice1YearAgo);
                        
                        if (btcPrice1YearAgo > 0.00000001) {
                            btcPrice1YearAgo = btcPrice1YearAgo.toFixed(8);
                        } else if (btcPrice1YearAgo > 0) {
                            btcPrice1YearAgo = btcPrice1YearAgo.toFixed(12);
                        } else {
                            btcPrice1YearAgo = btcPrice1YearAgo.toFixed(16);
                        }
                
                    }
                
                    console.log("oneYearBTCPriceChange Return yearAgoBtcPrice 0 " + coinId + ": ", yearAgoBtcPrice);
                    console.log("oneYearBTCPriceChange Return yearAgoBtcPrice parseFloat " + coinId + ": ", parseFloat(yearAgoBtcPrice));
                    console.log("oneYearBTCPriceChange Return currentBtcPrice parseFloat " + coinId + ": ", currentBtcPrice);

                    console.log("oneYearBTCPriceChange Return btcPrice1YearAgo 0 " + coinId + ": ", btcPrice1YearAgo);
                
                    if (yearAgoBtcPrice === null || parseFloat(yearAgoBtcPrice) === 0) {              
                  
                        oneYearBTCPercentChange = 0;

                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice);                     
                
                        console.log("oneYearBTCPriceChange PercentChange yearAgoBtcPrice 0 OR NULL " + coinId + ": ", yearAgoBtcPrice);
                        console.log("oneYearBTCPriceChange PercentChange currentBtcPrice " + coinId + ": ", currentBtcPrice);
                        console.log("oneYearBTCPriceChange " + coinId + ": ", oneYearBTCPriceChange);
                        console.log("oneYearBTCPriceChange PercentChange 0 " + coinId + ": ", oneYearBTCPercentChange);
                
                    } else if (yearAgoBtcPrice === 1) {
                
                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(btcPrice1YearAgo);
                        oneYearBTCPercentChange = (oneYearBTCPriceChange / btcPrice1YearAgo) * 100;              
                      
                        console.log("oneYearBTCPriceChange PercentChange yearAgoBtcPrice not 0 " + coinId + ": ", yearAgoBtcPrice);
                        console.log("oneYearBTCPriceChange PercentChange currentBtcPrice " + coinId + ": ", currentBtcPrice);
                        console.log("oneYearBTCPriceChange " + coinId + ": ", oneYearBTCPriceChange);

                
                    } else {
                
                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice);
                        oneYearBTCPercentChange = (oneYearBTCPriceChange / yearAgoBtcPrice) * 100;              
      
                        console.log("oneYearBTCPriceChange " + coinId + ": ", oneYearBTCPriceChange);                 
                      
                    }

                    if ( parseFloat(oneYearBTCPriceChange) > 0.000001) {
                      btcChangeScore = 1;                                                          
                    } else {
                        btcChangeScore = 0;
                    }

                    if ( parseFloat(oneYearBTCPercentChange) > 0.2) {
                        btcPercentScore = 2;
                    } else {
                        btcPercentScore = 0;
                    }

                }

                async function getInception(coinId, coinName, setYears) {
                  let today = new Date();
                  let inceptionDate = today;
                  let inceptionPrices = null;
                  let inceptionPrice = null;
                
                  // Step 1: Get Inception Date
                  try {
                    // Attempt to get inception date from coin's data

                    console.log("allAnalysisCoins coinId 6: ", coinId);
                    console.log("allAnalysisCoins coinName 6: ", coinName);

                    let coinDataResponse = await axios.get(
                      `https://data.messari.io/api/v1/assets/${coinId}/profile`
                    );
                
                    console.log("inceptionPrices using messari " + coinId + ": ", coinDataResponse);
                    console.log("inceptionPrices using messari data " + coinId + ": ", coinDataResponse.data);
                    let coinData = coinDataResponse.data.data;
                
                    console.log("inceptionPrices using messari coinData " + coinId + ": ", coinData);
                
                    // Check if inception date is available
                    if (coinData.profile && coinData.profile.genesis_date) {
                      inceptionDate = new Date(coinData.profile.genesis_date);
                      console.log("inceptionPrices using messari genesis date " + coinId + ": ", inceptionDate);
                    }
                  } catch (error) {
                    console.error("Error fetching inception date from Messari API " + coinId + ":", error);
                  }
                
                  // Fallback to previous years if inception date is not available
                  if (inceptionDate === today) {
                    inceptionDate.setFullYear(today.getFullYear() - setYears); // Fallback to set number of years ago 
                    inceptionDate.setDate(inceptionDate.getDate() + 2); // Add one day                     
                    console.log("inceptionPrices using new inception date " + coinId + ": ", inceptionDate);
                  }
                
                  let formattedInceptionDate = inceptionDate.toISOString().split('T')[0];
                  const endDate = new Date().toISOString().split('T')[0]; // Assuming endDate is today
                
                  try {
                    // Step 2: Fetch price data from Messari API
                    console.log("allAnalysisCoins coinId 7: ", coinId);
                    console.log("allAnalysisCoins coinName 7: ", coinName);

                    let inceptionDataResponse = await axios.get(
                      `https://data.messari.io/api/v1/assets/${coinId}/metrics/price/time-series`,
                      {
                        params: {
                          start: formattedInceptionDate,
                          end: endDate,
                          format: 'json',
                          interval: '1d',
                        },
                      }
                    );
                
                    console.log("inceptionPrices using messari formattedInceptionDate " + coinId + ": ", formattedInceptionDate);  
                

                    let coinSymbolRaw = inceptionDataResponse.data.data.symbol;
                    let coinSymbol = coinSymbolRaw.toLowerCase();
            
                    console.log("inceptionPrices using messari coinId coinSymbol " + coinId.toLowerCase() + ": ", coinSymbol);  
                    console.log("inceptionPrices using messari coinName coinSymbol " + coinName + ": ", coinSymbol);               
                
                    // Update to check if coinSymbol equals coinId
                    if ( inceptionDataResponse.data.data.values != null && inceptionDataResponse.data.data.values.length > 0 && 
                       coinId.toLowerCase() === coinSymbol) {
                      inceptionPrices = inceptionDataResponse.data.data.values;
                    }
                
                    console.log("inceptionPrices using messari data for inceptionPrices " + coinId + ": ", inceptionPrices);
                
                    // Check if inceptionPrices is empty
                    if (inceptionPrices && inceptionPrices.length > 0) {
                      inceptionPrice = inceptionPrices[0][4];
                      console.log("inceptionPrices using messari data for " + coinId + ": ", inceptionPrice);
                    } else {
                      throw new Error('Empty data from Messari API');
                    }
                  } catch (error) {
                    console.error("Error fetching price data from Messari API. Fallback to CryptoCompare API " + coinId + ":", error);
                
                    let toTs = Math.floor(new Date().getTime() / 1000);
                
                    // Step 3: Fallback to CryptoCompare API
                    try {
                      // Fetch historical price data
                      let cryptoCompareResponse = await axios.get(
                        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&toTs=${toTs}`
                      );
                
                      let firstNonZeroPrice = 0;
                
                      console.log("inceptionPrices cryptocompare data " + coinId + ": ", cryptoCompareResponse.data);
                
                      // Loop through the data to find the first non-zero close price
                      for (let dataPoint of cryptoCompareResponse.data.Data.Data) {
                        if (dataPoint.close !== 0) {
                          firstNonZeroPrice = dataPoint.close;
                          console.log("inceptionPrices using cryptocompare " + coinId + ": ", firstNonZeroPrice);
                          inceptionDate = new Date(dataPoint.time * 1000);
                          console.log("inceptionPrices using cryptocompare " + coinId + ": ", inceptionDate);
                          break;
                        }
                      }
                
                      inceptionPrice = firstNonZeroPrice;
                
                    } catch (error) {
                      console.error("Error fetching data from CryptoCompare API " + coinId + ": ", error.message);
                    }
                  }
                
                  // Step 4: Fallback to CoinPaprika API if no inception date or price found
                  if (!inceptionPrice && setYears === 1) {
                    try {
                      coinId = coinId.toLowerCase();
                      coinName = coinName.toLowerCase();
                
                      const inceptionDataResponse = await axios.get(
                        `https://api.coinpaprika.com/v1/tickers/${coinId}-${coinName}/historical?start=${formattedInceptionDate}&interval=1d`
                      );
                
                      console.log("inceptionPrices using coinpaprika formattedInceptionDate " + coinId + ": ", formattedInceptionDate);
                      console.log("inceptionPrices using coinpaprika " + coinId + ": ", inceptionDataResponse);
                
                      if (inceptionDataResponse.data && inceptionDataResponse.data.length > 0) {
                        const firstPriceData = inceptionDataResponse.data[0];
                        inceptionPrice = parseFloat(firstPriceData.price).toFixed(8);
                        inceptionDate = new Date(firstPriceData.timestamp);
                        console.log("inceptionPrices using coinpaprika " + coinId + ": ", inceptionPrice, inceptionDate);
                      }
                    } catch (error) {
                      console.error("Error fetching data from CoinPaprika API " + coinId + ":", error.message);
                    }
                  }
                
                  // Return both inception date and prices
                  return { inceptionDate: inceptionDate, inceptionPrice: inceptionPrice };
                }
                

                let inceptionPrices = await getInception(coinId, coinName, 10); 

                console.log("inceptionPriceChange inceptionPrices oustside function for length "+coinId+": ",inceptionPrices.inceptionPrice);
                console.log("inceptionPriceChange inceptionPrices oustside function for 10 year "+coinId);

                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 5); 
                  console.log("inceptionPriceChange inceptionPrices oustside function for 5 year "+coinId+": ",inceptionPrices.inceptionPrice);
                }
                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 3);
                  console.log("inceptionPriceChange inceptionPrices oustside function for 3 year "+coinId+": ",inceptionPrices.inceptionPrice);
                }
                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 2);
                  console.log("inceptionPriceChange inceptionPrices oustside function for 2 year "+coinId+": ",inceptionPrices.inceptionPrice);
                }
                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 1);  
                  console.log("inceptionPriceChange inceptionPrices oustside function for 1 year "+coinId+": ",inceptionPrices.inceptionPrice);  
                } else {
                  console.log("inceptionPriceChange inceptionPrices oustside function for "+coinId+": ",inceptionPrices.inceptionPrice);
                }
    
                console.log("inceptionPriceChange latestPrice for "+coinId+": ", latestPrice);
                
                let inceptionPriceChange =  ((latestPrice - inceptionPrices.inceptionPrice) / inceptionPrices.inceptionPrice) * 100;

                let maxChartGrade = null;

                console.log("inceptionPriceChange for "+coinId+": ", parseFloat(inceptionPriceChange));

                if (parseFloat(inceptionPriceChange) >= 500) {
                  maxChartGrade = 'A';
                } else if (parseFloat(inceptionPriceChange) >= 200){
                  maxChartGrade = 'B';
                } else if (parseFloat(inceptionPriceChange) >= 100){
                  maxChartGrade = 'C';
                } else if (parseFloat(inceptionPriceChange) >= -5){
                  maxChartGrade = 'D';
                } else if (parseFloat(inceptionPriceChange) < -5){
                  maxChartGrade = 'F';
                }

                if (parseFloat(inceptionPriceChange) >= 200) {
                  maxGradeScore = 2;
                } else if (parseFloat(inceptionPriceChange) >= 100){
                  maxGradeScore = 1;
                } else if (parseFloat(inceptionPriceChange) < 100){
                  maxGradeScore = 0;
                }        
              
                async function getOneYearPercentChange(coinId, coinName, latestPrice) {
                  let oneYearAgoPrice = null;
                
                  // Attempt to fetch data from CryptoCompare
                  try {
                    const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=365&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`);
                    const data = response.data.Data.Data;
                
                    oneYearAgoPrice = data[0].close;
                
                    if (parseInt(oneYearAgoPrice) === 0) {
                      for (let yearIndex = 0; yearIndex < data.length; yearIndex++) {
                        let getYearAgoPrice = data[yearIndex].close;
                        if (getYearAgoPrice !== 0) {
                          oneYearAgoPrice = getYearAgoPrice;
                          break;
                        }
                      }
                    }
                  } catch (error) {
                    console.log('Error fetching data from CryptoCompare:', error.message);
                  }
                
                  // If CryptoCompare data is not available or invalid, fetch from Messari
                  if (!oneYearAgoPrice || oneYearAgoPrice === 0) {
                    try {
                      console.log("allAnalysisCoins coinId 8: ", coinId);
                      console.log("allAnalysisCoins coinName 8: ", coinName);

                      const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics/market-data`);
                      const data = response.data.data.market_data;
                      oneYearAgoPrice = data.price_usd;
                    } catch (error) {
                      console.log('Error fetching data from Messari:', error.message);
                    }
                  }
                
                  // If Messari data is not available, fetch from CoinPaprika
                  if (!oneYearAgoPrice || oneYearAgoPrice === 0) {
                    try {
                      const now = Math.floor(Date.now() / 1000);
                      const oneYearAgo = now - 363 * 24 * 60 * 60;
                      const date = new Date(oneYearAgo * 1000);

                      // Extract year, month, and day from the Date object
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0');
                      const yearAgoDate = year+"-"+month+"-"+day; 
                      
                      coinId = coinId.toLowerCase();
                      coinName = coinName.toLowerCase();
                
                      const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinId}-${coinName}/historical?start=${yearAgoDate}&interval=1d`);
                      const data = response.data;
                
                      oneYearAgoPrice = data[0].price;
                    } catch (error) {
                      console.log('Error fetching data from CoinPaprika:', error.message);
                    }
                  }
                
                  // Calculate the percentage change
                  if (!oneYearAgoPrice || oneYearAgoPrice === 0) {
                    throw new Error('Unable to fetch valid one year ago price from all sources.');
                  }
                
                  const change = ((latestPrice - oneYearAgoPrice) / oneYearAgoPrice) * 100;
                
                  return change.toFixed(4);
                }     
              
                            
                //const latestPrice = value.USD.PRICE;

                console.log("value.USD.PRICE getOneYearPercentChange latestPrice: ", latestPrice);

                const oneYearPercentChange = await getOneYearPercentChange(coinId, coinName, latestPrice);

                console.log('coinPaprika oneYearPercentChange:'+coinId+': ', oneYearPercentChange);

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

                  let ninetyDaysPercentChange = "N/A";

                  console.log("3 month percentage latestPrice "+coinId+": ", latestPrice);  

                  console.log("3 month percentage ninetyDaysAgoPrice "+coinId+": ", ninetyDaysAgoPrice);            

                  if (ninetyDaysAgoPrice !== null && isNaN(ninetyDaysAgoPrice) === false){

                    let ninetyDaysPriceChange = parseFloat(latestPrice) - parseFloat(ninetyDaysAgoPrice);
                    ninetyDaysPriceChange = ninetyDaysPriceChange.toFixed(10);

                    ninetyDaysPercentChange = (ninetyDaysPriceChange / ninetyDaysAgoPrice) * 100;

                    console.log("3 month percentage ninetyDaysPriceChange "+coinId+": ", ninetyDaysPriceChange);

                    console.log("3 month percentage ninetyDaysPercentChange "+coinId+": ", ninetyDaysPercentChange);

                  }             

                  if (ninetyDaysPercentChange > 0.14 && ninetyDaysPercentChange !== "N/A" ) {
                    threeMonthsPercentScore = 1;
                  } else {
                    threeMonthsPercentScore = 0;
                  }

                  async function getTwitterInfo(twitterAccounts, coinId, coinName) {
                    let twitterURL = null;
                    let twitterFollowers = null;
                
                    try {
                        if (twitterAccounts !== null) {

                            // Extract followers and URLs from the provided twitterAccounts
                            let twitterArray = Object.values(twitterAccounts).map((account) => account.FOLLOWERS);
                
                            twitterURL = Object.values(twitterAccounts).map((account) => account.URL);
                
                            // If multiple URLs exist, take the first one
                            if (twitterURL.length > 1) {
                                twitterURL = twitterURL[0];
                            }
                
                            console.log("twitter twitterArray: ", twitterArray);
                            // Calculate total followers
                            twitterFollowers = twitterArray.reduce((acc, val) => acc + val, 0);
                
                            console.log("twitter " + coinId + " twitterFollowers: ", twitterFollowers);
                
                            return { twitterURL, twitterFollowers };

                        } else {

                            // Handle twitterAccounts === null by fetching from other sources
                            console.log("twitter " + coinId + " twitterAccounts is null, trying other APIs...");
                
                            // Try Coinpaprika API
                            try {
                                let coinpaprikaResponse = await api.get(`https://api.coinpaprika.com/v1/coins/${coinId}`);
                
                                if (
                                    coinpaprikaResponse.data &&
                                    coinpaprikaResponse.data.links &&
                                    coinpaprikaResponse.data.links.twitter
                                ) {
                                    console.log("twitter " + coinId + " Coinpaprika links: ", coinpaprikaResponse.data.links);
                
                                    twitterURL = coinpaprikaResponse.data.links.twitter.url;
                                    twitterFollowers = coinpaprikaResponse.data.links.twitter.followers || 0;
                
                                    return { twitterURL, twitterFollowers };
                                }
                            } catch (error) {
                                console.log("twitter " + coinId + " Error fetching from Coinpaprika, trying Messari:", error);
                            } 
                          
                            try {
                                  let coinGeckoResponse = await api.get(`https://api.coingecko.com/api/v3/coins/${coinName}`);
                          
                                  if (coinGeckoResponse.data && coinGeckoResponse.data.links && coinGeckoResponse.data.links.twitter_screen_name) {
                                   

                                      twitterURL = `https://x.com/${coinGeckoResponse.data.links.twitter_screen_name}`;                                      
                                      
                                      twitterFollowers = coinGeckoResponse.data.community_data.twitter_followers;

                                      if(twitterFollowers === 0){
                                        return { twitterURL };
                                      } else {
                                        return { twitterURL, twitterFollowers };
                                      }
                                      
                                  } else {
                                      return false;
                                  }
                              } catch (error) {                                 
                                  console.log("twitter coinId " + coinId + " Error fetching from CoinGecko:", error); 
                                  console.log("twitter coinName " + coinName + " Error fetching from coingecko:", error);                                 
                              }

                            // Try Messari API
                            try {
                                let messariResponse = await api.get(`https://data.messari.io/api/v1/assets/${coinId}/profile`);

                                if (
                                    messariResponse.data &&
                                    messariResponse.data.profile &&
                                    messariResponse.data.profile.general &&
                                    messariResponse.data.profile.general.overview &&
                                    messariResponse.data.profile.general.overview.twitter
                                ) {
                                    twitterURL = messariResponse.data.profile.general.overview.twitter;
                
                                    // Messari API might not have followers data, so we return only the URL here
                                    return { twitterURL, twitterFollowers: 0 }; // Default followers to 0 if not available
                                }
                            } catch (error) {
                                console.log("twitter " + coinId + " Error fetching from Messari:", error);
                            } 
                
                            // If all external sources fail, return false
                            return false;
                        }

                    } catch (error) {
                        console.log("twitter " + coinId + " Unexpected error:", error);
                        return false;
                    }
                }
                

                let getCoinData = await api.get(
                  `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
                );

                if (getCoinData.data) {      
                  
                  console.log("twitter "+coinId+" getCoinData.data.Data: ",getCoinData.data.Data);   

                  let twitterAccounts = getCoinData.data.Data.TWITTER_ACCOUNTS;
                  let twitterFollowers =  null;
                  let twitterURL = null;
                  let sourceCode = getCoinData.data.Data.CODE_REPOSITORIES;
                  let gitRepository = null;
                  let website = getCoinData.data.Data.WEBSITE_URL;

                  let twitterInfo = await getTwitterInfo(twitterAccounts, coinId, coinName);

                  // Process twitterInfo here, handle conditions like twitterInfo.twitterFollowers > 25000 if needed
                  console.log("twitter "+coinId+" getTwitterInfo: ",twitterInfo);      
                             

                  if(twitterInfo !== false){
                    twitterFollowers = parseInt(twitterInfo.twitterFollowers);
                    twitterURL = twitterInfo.twitterURL;                  
                  }

                  if (twitterFollowers !== null && twitterFollowers > 25000) {
                    twitterScore = 1;                  
                  } else {              
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

                  console.log("inceptionPriceChange for score "+coinId+": ",inceptionPriceChange);

                  if (parseFloat(inceptionPriceChange) >= 500) {
                    maxGradeScore = 2;
                  } else if (parseFloat(inceptionPriceChange) < 500){
                    maxGradeScore = 1;
                  } else if (parseFloat(inceptionPriceChange) < 250){
                    maxGradeScore = 0;
                  }

                  let total =
                    volumeScore +
                    oneYearPercentScore +
                    btcChangeScore +
                    btcPercentScore +                 
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

                  console.log(coinId+" BUYSELL total: ", total);

                  if (total > 5) {

                    buyrating = 3;
                    sellrating = 0;

                  } else if(total > 3) {

                    buyrating = 2;
                    sellrating = 0;

                  } else {
                    
                    sellrating = 2;
                    buyrating = 0;

                  }

                  console.log(coinId+" BUYSELL highestPricePercentage: ", highestPricePercentage);

                  if (highestPricePercentage <= -65) {

                    buyHighPercentScore = 3;
                    sellHighPercentScore = 0;

                    console.log(coinId+" BUYSELL buyHighPercentScore 3: ", buyHighPercentScore);

                  } else if (highestPricePercentage <= -40) {
                    
                    buyHighPercentScore = 2;
                    sellHighPercentScore = 0;

                    console.log(coinId+" BUYSELL buyHighPercentScore 2: ", buyHighPercentScore);

                  } else if (highestPricePercentage < -15) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 1;                    
           
                    console.log(coinId+" BUYSELL sellHighPercentScore 1: ", sellHighPercentScore);
                  }
                   else if (highestPricePercentage >= -15) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 2;       
                    
                    console.log(coinId+" BUYSELL sellHighPercentScore 2: ", sellHighPercentScore);

                  } else if (highestPricePercentage >= -5) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 3;     
                    
                    console.log(coinId+" BUYSELL sellHighPercentScore 3: ", sellHighPercentScore);

                  }


                  let totalbuyrating = buyrating + buyHighPercentScore;
                  let totalsellrating = sellrating + sellHighPercentScore;

                  console.log(coinId+" BUYSELL totalbuyrating: ",totalbuyrating); 
                  console.log(coinId+" BUYSELL buyHighPercentScore: ",buyHighPercentScore);

                  console.log(coinId+" BUYSELL totalsellrating: ",totalsellrating);
                  console.log(coinId+" BUYSELL sellHighPercentScore: ",sellHighPercentScore);

                  console.log(coinId+" BUYSELL ninetyDaysPercentChange: ",ninetyDaysPercentChange);

                  console.log(coinId+" BUYSELL buysellrating before: ",buysellrating);

                    if (totalbuyrating > totalsellrating) {

                      buysellrating = totalbuyrating;  

                      console.log(coinId+" BUYSELL totalbuyrating: ",totalbuyrating);
                      console.log(coinId+" BUYSELL totalsellrating: ",totalsellrating);
                      console.log(coinId+" BUYSELL totalbuyrating > totalsellrating buysellrating: ",buysellrating); 
                      
                      if (buysellrating > 3 && ninetyDaysPercentChange <= 40) {
                        buysell = "BUY";
                      } else {
                        buysell = "HODL";
                      }

                    } else if (totalsellrating > totalbuyrating) {

                      buysellrating = totalsellrating;    

                      console.log(coinId+" BUYSELL totalbuyrating: ",totalbuyrating);
                      console.log(coinId+" BUYSELL totalsellrating: ",totalsellrating);
                      console.log(coinId+" BUYSELL totalsellrating > totalbuyrating buysellrating: ",buysellrating); 
                      
                      if (buysellrating <= 3 && ninetyDaysPercentChange > 55) {
                        buysell = "SELL";
                      } else {
                        buysell = "HODL";
                      }

                    } else {
                        
                      console.log(coinId+" BUYSELL equal totalbuyrating: ",totalbuyrating);
                      console.log(coinId+" BUYSELL equal totalsellrating: ",totalsellrating);
                      console.log(coinId+" BUYSELL equal buysellrating: ",buysellrating);                         
                      console.log(coinId+" BUYSELL equal ninetyDaysPercentChange: ",ninetyDaysPercentChange);   
                      console.log(coinId+" BUYSELL equal total score: ",total);  

                      if (total > 3 && ninetyDaysPercentChange <= 40) {
                        buysell = "BUY";
                      } else if (total <= 3 && ninetyDaysPercentChange > 55) {
                        buysell = "SELL";
                      } else {
                        buysell = "HODL";
                      }
                     
                    }

                  console.log(coinId+" BUYSELL buysellrating after: ",buysellrating);

                  setTotalScore(total);

                  const response = await api.get('http://localhost:8888/portfolios');
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

                  console.log("coinMarketCap cryptocompare before: "+coinId+": ",value.USD.MKTCAP); 

                  let coinMarketCap = parseInt(value.USD.MKTCAP);
                  
                  async function fetchMarketCapWhenZero(coinId, coinName) {
                    try {
                        // Step 1: Attempt to fetch coin data from Messari
                        try {
                            console.log("coinMarketCap Messari market cap Fetching market cap from Messari for coin: " + coinId);
                  
                            const messariResponse = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);
                            const messariMarketCap = messariResponse.data.data.marketcap.current_marketcap_usd;
                            console.log("coinMarketCap Messari market cap for " + coinId + ": ", messariMarketCap);
                            
                            if (messariMarketCap !== 0 && messariMarketCap !== null) {
                                return messariMarketCap;
                            }

                        } catch (error) {
                            console.log('coinMarketCap messari market cap Error fetching data from Messari', error);
                        }
                
                        // Step 2: If Messari data is unavailable or market cap is zero, attempt to fetch coin data from coinpaprika
                        try {
                          console.log("coinMarketCap Fetching coin details from CoinPaprika for coin: " + coinId + " or " + coinName);
                      
                          const allCoinsResponse = await axios.get('https://api.coinpaprika.com/v1/coins');
                          const allCoins = allCoinsResponse.data;
                      
                          // Find the coin using either the symbol or name
                          const coin = allCoins.find(coin => coin.symbol === coinId || coin.name === coinName);                      
                          console.log("coinMarketCap CoinPaprika coin details for " + coinId + ": ", coin);
                      
                          if (coin) {
                            const coinPaprikaId = coin.id; // Correctly use the CoinPaprika ID
                        
                            try {
                                    // Fetch the coin's market cap using its CoinPaprika ID
                                    const coinDetailsResponse = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`);
                                    const coinDetails = coinDetailsResponse.data;
                                    const coinPaprikaMarketCap = coinDetails.quotes.USD.market_cap;
                        
                                    console.log("coinMarketCap Market cap for " + coinId + ": ", coinPaprikaMarketCap);
                                    return coinPaprikaMarketCap;
                        
                            } catch (error) {
                                  if (error.response && error.response.status === 402) {
                                      console.log('coinMarketCap CoinPaprika 402 Payment Required error encountered', error);
                                  } else {
                                      throw error; // Re-throw if it's not a 402 error
                                  }
                                  return null;
                            }   

                          }  

                        } catch (error) {
                          console.log('coinMarketCap Error fetching data from CoinPaprika', error);
                        } 
                      
                        // Step 3: If coinpaprika data is unavailable or market cap is zero, attempt to fetch coin data from CoinLore
                        try {
                            console.log("coinMarketCap Fetching market cap from CoinLore for coin: " + coinId);
                            
                            const coinLoreResponse = await axios.get('https://api.coinlore.net/api/tickers/');
                            const coinLoreData = coinLoreResponse.data.data;
                            
                            // Find the coin by symbol or name
                            const coin = coinLoreData.find(coin => coin.symbol === coinId || coin.name === coinName);
                            
                            if (coin) {
                                const coinLoreMarketCap = coin.market_cap_usd;
                                console.log("coinMarketCap CoinLore market cap for " + coinId + ": ", coinLoreMarketCap);
                                
                                // Return market cap if it's not zero
                                if (coinLoreMarketCap && coinLoreMarketCap !== 0) {
                                    return coinLoreMarketCap;
                                }
                            } 

                        } catch (error) {
                          console.log('coinMarketCap Error fetching data from CoinLore', error);
                        }
                        
                        // Step 4: If CoinLore data is unavailable or market cap is zero, attempt to fetch coin data from coingecko
                        try {
                          console.log("coinMarketCap Fetching market cap from CoinGecko for coin: " + coinId);
                      
                          // Directly fetch data using the coinId, assuming it's correct
                          const coinGeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
                          const coinGeckoData = coinGeckoResponse.data;
                      
                          // Ensure that market cap exists in the response
                          if (coinGeckoData && coinGeckoData.market_data && coinGeckoData.market_data.market_cap && coinGeckoData.market_data.market_cap.usd !== 0) {
                              const coinGeckoMarketCap = coinGeckoData.market_data.market_cap.usd;
                              console.log("coinMarketCap CoinGecko market cap for " + coinId + ": ", coinGeckoMarketCap);
                              return coinGeckoMarketCap;
                          } else {
                              console.log("coinMarketCap Market cap is 0 or missing for " + coinId + ", trying coinName if available.");
                          }
                      
                      } catch (error) {
                          console.log(`coinMarketCap Error fetching data from CoinGecko for ${coinId}, trying coinName if available:`, error);
                      }
                      
                      // Fallback: Try fetching by coinName, if coinId fails
                      try {
                              console.log("coinMarketCap Fetching market cap from CoinGecko for coinName: " + coinName);
                      
                              const coinGeckoResponseByName = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinName.toLowerCase()}`);
                              const coinGeckoDataByName = coinGeckoResponseByName.data;
                      
                              if (coinGeckoDataByName && coinGeckoDataByName.market_data && coinGeckoDataByName.market_data.market_cap && coinGeckoDataByName.market_data.market_cap.usd !== 0) {
                                  const coinGeckoMarketCapByName = coinGeckoDataByName.market_data.market_cap.usd;
                                  console.log("coinMarketCap CoinGecko market cap for " + coinName + ": ", coinGeckoMarketCapByName);
                                  return coinGeckoMarketCapByName;
                              }
                      
                      } catch (error) {
                              console.log(`coinMarketCap Error fetching data from CoinGecko for ${coinName}:`, error);
                      }
                        
                    } catch (error) {
                        console.log('coinMarketCap error fetching market cap', error);
                    }  

                    // If all sources fail, return null or a default value
                    return null;
                }                                
                  
                  if(parseInt(coinMarketCap) === 0){

                    coinMarketCap = await fetchMarketCapWhenZero(coinId, coinName);
                    coinMarketCap = parseInt(coinMarketCap);

                    console.log("coinMarketCap after results: "+coinId+": ",coinMarketCap); 

                  } else {
                    coinMarketCap = parseInt(coinMarketCap);
                  }

                  let coinCurrentPrice = parseFloat(latestPrice);

                  console.log("value.USD.PRICE coinCurrentPrice latestPrice "+coinId+": ", latestPrice);
                  console.log("coinCurrentPrice "+coinId+": ",coinCurrentPrice);

                  let coinCurrentVol = value.USD.TOTALVOLUME24HTO;         
                  coinCurrentVol = parseInt(coinCurrentVol);   
                  
     
                  //Data formats for decimals
                  console.log("coinPrediction 0"+coinId+": ",coinPrediction);
                  if(coinPrediction !== null && coinPrediction !== ''){
                      coinPrediction = parseFloat(coinPrediction);
                      if(coinPrediction >= 0.00000001){
                        coinPrediction = coinPrediction.toFixed(8);
                      } else if(coinPrediction < 0.00000001){
                        coinPrediction = coinPrediction.toFixed(11);
                      } else {
                        coinPrediction = coinPrediction.toFixed(11);
                      }  
                      console.log("coinPrediction 1"+coinId+": ",coinPrediction);  
                  }
                
                  console.log("oneYearBTCPriceChange 4 row "+coinId+" : ",oneYearBTCPriceChange);
                
                  if (oneYearBTCPriceChange !== "N/A") {
                    let strValue = oneYearBTCPriceChange.toString();
                    let numDecimals = (strValue.split('.')[1] || '').length;
                
                    oneYearBTCPriceChange = parseFloat(oneYearBTCPriceChange);
                
                    console.log("oneYearBTCPriceChange 0 "+coinId+": ",oneYearBTCPriceChange);  
                
                    if (numDecimals > 0 && numDecimals <= 8) {
                      console.log("oneYearBTCPriceChange 1 "+coinId+": ",oneYearBTCPriceChange);  
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(8);
                
                    } else if (numDecimals > 8 ) {
                        console.log("oneYearBTCPriceChange 2 "+coinId+": ",oneYearBTCPriceChange);        
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(11);
                    } else if (oneYearBTCPriceChange > 0) {
                      console.log("oneYearBTCPriceChange 3 "+coinId+": ",oneYearBTCPriceChange);
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(4);
                    } else {
                      console.log("oneYearBTCPriceChange 4 "+coinId+": ",oneYearBTCPriceChange);
                      oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(11);
                    }
                  }
                
                  if (oneYearBTCPercentChange !== "N/A") {
                      let percentBTCValue = oneYearBTCPercentChange.toString();
                      let numDecimalsBtc = (percentBTCValue.split('.')[1] || '').length; 
                
                      oneYearBTCPercentChange = parseFloat(oneYearBTCPercentChange);
                
                      if (numDecimalsBtc > 0 && numDecimalsBtc <= 8) {
                        oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(6);
                      } else if (numDecimalsBtc > 8 ) {
                        oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(8);
                      } else if (oneYearBTCPercentChange > 0) {
                        oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(4);
                      } else {
                        oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(8);
                      }
                  
                  } 
                
                  coinCurrentPrice = parseFloat(coinCurrentPrice);
                
                  if (coinCurrentPrice > 0.00000001) {
                    coinCurrentPrice = coinCurrentPrice.toFixed(8);
                  } else {
                    coinCurrentPrice = coinCurrentPrice.toFixed(12);
                  }
                
                  inceptionPriceChange = parseFloat(inceptionPriceChange);
                
                  if( isNaN(inceptionPriceChange) === false && inceptionPriceChange !== null){
                
                    if (inceptionPriceChange > 0) {
                      inceptionPriceChange = inceptionPriceChange.toFixed(4);
                    } else {
                      inceptionPriceChange = inceptionPriceChange.toFixed(8);
                    }
                    console.log("inceptionPriceChange 1: ",inceptionPriceChange);
                
                  }
                
                  console.log("3 month percentage ninetyDaysPercentChange 0: ",ninetyDaysPercentChange);
                
                  if( isNaN(ninetyDaysPercentChange) === false && ninetyDaysPercentChange !== "N/A"){
                
                    if (ninetyDaysPercentChange > 0) {
                      ninetyDaysPercentChange = ninetyDaysPercentChange.toFixed(4);
                    } else {
                      ninetyDaysPercentChange = ninetyDaysPercentChange.toFixed(8);
                    }
                
                    console.log("3 month percentage ninetyDaysPercentChange 1: ",ninetyDaysPercentChange);
                
                  }
                
                  highestPricePercentage = parseFloat(highestPricePercentage);
                
                  if( isNaN(highestPricePercentage) === false && highestPricePercentage !== null){
                
                    if (highestPricePercentage > 0) {
                      highestPricePercentage = highestPricePercentage.toFixed(4);
                    } else {
                      highestPricePercentage = highestPricePercentage.toFixed(8);
                    }                 
                
                  }
          
                  coinData.push({
                    id: coinId,
                    name: coinName,
                    coinCurrentPrice: coinCurrentPrice,
                    marketCap: coinMarketCap,
                    volume: coinCurrentVol,
                    oneYearPercentChange: oneYearPercentChange,
                    oneYearBTCPercentChange: oneYearBTCPercentChange,
                    actualYearDate: yearDateFormatted,
                    oneYearBTCPriceChange: oneYearBTCPriceChange,          
                    ninetyDaysPercentChange: ninetyDaysPercentChange,
                    inceptionPriceChange: inceptionPriceChange,
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

                  console.log("coinData coinData.length: ",coinData.length);

                  if(coinData.length <= 0){
                    setNoCoins(true)
                  }

                  setCoinData(coinData);
            
                }
              }

            } else {
              console.log("Error retrieving coin data");              
              setNoCoins(true);
            }

      } catch (error) {
          console.log(error);
      }
  };

  const updateNoCoins = (value) => {
    setNoCoins(value);
  };

  return (
    noCoins === true ? <p>Add some coins to analyze!</p> :
    coinData.length <= 0 ? <p>Loading...</p> : (
      <CoinTable
        coinData={coinData}
        analysisCoins={analysisCoins}   
        updateNoCoins={updateNoCoins}
      />
    )
  );

}
export default Analysis;