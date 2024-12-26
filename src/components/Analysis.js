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

  async function GetAnalysisCoins() {
      try {
          const portfolios = await api.get("http://localhost:8888/portfolios");
          
            let allAnalysisCoins = [];
            const allCoinNames = [];
            const allCoinIds = [];

            for (let i = 0; i < portfolios.data.length; i++) {
                const response = await api.get(
                  `http://localhost:8888/portfolios/${portfolios.data[i].id}`
                );
                let analysisCoins = response.data.analysis;

                if(analysisCoins && analysisCoins !== undefined){
                  for (let value of analysisCoins) {
                    let coinNameAnalysis = value.coinName.replace(/\s+/g, '-'); // Replace spaces with hyphens
                    let coinIdAnalysis = value.coinId;
        
                    allAnalysisCoins.push({
                        coinName: coinNameAnalysis,
                        coinId: coinIdAnalysis,
                    });
                  }
                } else {
                  setNoCoins(true);
                }
            }
            setAnalysisCoins(allAnalysisCoins);  
      
            let allAnalysisCoinsArray = Object.keys(allAnalysisCoins);

            for (let a = 0; a < allAnalysisCoinsArray.length; a++) {      
              allCoinNames.push(allAnalysisCoins[a].coinName);
              allCoinIds.push(allAnalysisCoins[a].coinId);
            }
            let allCoinIdsjoin = allCoinIds.join(","); 

            //API to get name, symbol, images, market cap, price change in 24hrs, etc, for each coin in the analysis
            if (allCoinIdsjoin.length !== 0) {
            
            const marketChartData = await axios.get(
                `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${allCoinIdsjoin}&tsyms=USD&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
            ); 

            // Function to fetch coin details from CoinPaprika
            async function fetchCoinDetailsFromCoinPaprika(coinSymbol, coinName) {               
                          try {        
            
                            let coinId = coinSymbol;              
                            const coinpaprikaId = coinId+"-"+coinName;
            
                            console.log("not_possible fetchCoinDetailsFromCoinPaprika: https://api.coinpaprika.com/v1/tickers/"+coinpaprikaId);
            
                            const coinUrl = `https://api.coinpaprika.com/v1/tickers/${coinpaprikaId}`;
                            const coinResponse = await axios.get(coinUrl);
                            const coinDetails = coinResponse.data;
            
                            console.log("not_possible fetchCoinDetailsFromCoinPaprika coinResponse.data: ",coinResponse.data);
                            console.log("not_possible fetchCoinDetailsFromCoinPaprika coinDetails: ",coinDetails);
            
                            if (!coinDetails || coinDetails === null) {
                               throw new Error(`coinpaprika: not_possible Coin with symbol ${coinId} not found in CoinPaprika.`);
                            } 
            
                            return {
                              ...coinDetails,
                              price: coinDetails.quotes.USD.price
                            };
                          } catch (error) {
                            console.error(`coinpaprika: not_possible Error fetching coin details from CoinPaprika: ${error}`);
                            return null;
                          }
            }            
            // Function to fetch coin details from Messari
            async function fetchCoinDetailsFromMessari(coinSymbol,coinName) {
            
                              console.log("not_possible fetchCoinDetailsFromMessari: https://data.messari.io/api/v1/assets/"+coinName);
            
                              try {
                                const messariCoinListUrl = `https://data.messari.io/api/v1/assets`;
                                const coinListResponse = await axios.get(messariCoinListUrl);
                                const coinList = coinListResponse.data.data;
                                
                                const coin = coinList.find(c => c.symbol === coinSymbol);
                                if (!coin) {
                                  throw new Error(`allAnalysisCoins not_possible Coin with symbol ${coinSymbol} not found in Messari.`);
                                }
                                
                                let coinId = coinSymbol;    
                      
                                const coinDetailsUrl = `https://data.messari.io/api/v1/assets/${coinName}/profile`;
                                const coinDetailsResponse = await axios.get(coinDetailsUrl);
                                const coinDetails = coinDetailsResponse.data.data;
            
                                // Fetch current price
                                const coinPriceUrl = `https://data.messari.io/api/v1/assets/${coinName}/metrics/market-data`;
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

            // Create a list of entries with coinId as the index and its value (or null)
            const entries = allAnalysisCoins.map((coin) => {
              const index = coin.coinId;    
              const value = marketChartData.data.RAW[index.toUpperCase()] || null;          
              return [index, value];
            });

            for (let [index, value] of entries) {                
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

                if (index !== null) {
                        coinId = index.toLowerCase();                   
                      
                        const matchedCoin = allAnalysisCoins.find(coin => coin.coinId === coinId);
                    
                        if (matchedCoin) {                    
                            coinName = matchedCoin.coinName;
                        } else {
                            console.log("No matching coin found for coin: ", index);
                        }
                }
        
                for (let i = 0; i < allAnalysisCoins.length; i++) { 

                      console.log("coinData allAnalysisCoins: ",allAnalysisCoins[i].coinId.toUpperCase());

                      if( value !== null && (allAnalysisCoins[i].coinId.toUpperCase() === value.USD.FROMSYMBOL) && value.USD.CONVERSIONTYPE !== "not_possible" ) {

                            console.log("coinData value.USD.FROMSYMBOL: ",value.USD.FROMSYMBOL); 
                            
                            console.log("coinData latestPrice for "+index+" 0-0-0: ",value.USD.PRICE); 
                    
                            coinId = allAnalysisCoins[i].coinId;   
                            coinName = allAnalysisCoins[i].coinName; 
                            latestPrice = value.USD.PRICE;
                            latestPrice = latestPrice.toFixed(20);    
                            
                            console.log("coinData latestPrice for "+index+" 0-0: ",latestPrice);    
                            break;  

                      } else if (value === null || value.USD.CONVERSIONTYPE === "not_possible") {  

                            let coinDetails = await fetchCoinDetailsFromCoinPaprika(index,coinName);                          
                            
                            // If CoinPaprika fails, try Messari
                            if (!coinDetails || coinDetails === null) { 
                              coinDetails = await fetchCoinDetailsFromMessari(coinId,coinName);             
                            }
                            
                            if (coinDetails) { 
                                                  
                              coinId = coinDetails.symbol || coinDetails.slug; // Adjust based on API response  

                              latestPrice = coinDetails.price.toFixed(20);             
                              
                              break;

                            } else {
                              latestPrice = 0;
                              console.log("coinData allAnalysisCoins not_possible coinDetails for "+index+" is ",coinDetails); 
                              break;
                            } 
                      } 

                  console.log("coinData latestPrice final "+index+" : ",latestPrice);  
                }
                    
                console.log("getAllTimeHigh latestPrice for "+coinName+" with id "+coinId+": ",latestPrice);
                    
                async function getAllTimeHighPriceFromCryptoCompare(coinId, coinName) {            
                      try {
                        const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`;

                        let response = await axios.get(url); // Move response definition here

                        console.log("coinData athPrice response CryptoCompare for "+coinId+": ",response);
                        let data = response.data.Data ? response.data.Data.Data : null;
                        let athPrice = null;
                  
                        if (!data) {
                          console.log("coinData athPrice highestPricePercentage CryptoCompare Invalid data from CryptoCompare for "+coinId+", ",response.data);
                        } else {
                          athPrice = Math.max(...data.map(day => day.high));
                          athPrice = parseFloat(athPrice).toFixed(10);
                          console.log("coinData athPrice highestPricePercentage CryptoCompare for "+coinId+": ",athPrice);
                        }                   

                        return athPrice;
                      } catch (error) {               
                        throw error;
                      }
                }   

                async function getAllTimeHighPriceFromMessari(coinId,coinName,latestPrice) {
                        try { 
                            // Get all-time highest price for coin data
                            let getHighPrice = await axios.get(`https://data.messari.io/api/v1/assets/${coinName}/metrics`); 

                            const highPriceData = getHighPrice.data.data;
                            const coinSymbol = highPriceData.symbol.toLowerCase();  
                            const coinSlug = highPriceData.slug.toLowerCase(); 
                            const alltimeHighPrice = highPriceData.all_time_high.price;
                            const alltimeHighPriceDecimal = alltimeHighPrice.toFixed(20);
                            const alltimeHighPercentDown = -Math.abs(highPriceData.all_time_high.percent_down);



                            let isNanPrice = isNaN(alltimeHighPrice); //false is a number
                            let athPrice = 0;

                            console.log("coinData athPrice highPriceData: ",highPriceData)
                            console.log("coinData athPrice coinSymbol: ",coinSymbol)
                            console.log("coinData athPrice  coinId.toLowerCase(): ",coinId.toLowerCase());
                            console.log("coinData athPrice  coinSlug: ",coinSlug);
                          

                            // Assuming coinSymbol should be compared with a field in highPriceData
                            if ( highPriceData && (coinSymbol === coinId.toLowerCase() || coinSlug === coinId.toLowerCase()) && isNanPrice === false && alltimeHighPrice !== null && highPriceData) {
                                athPrice = alltimeHighPriceDecimal; 

                                if(alltimeHighPercentDown){

                                  return alltimeHighPercentDown;

                                } else if(isNaN(latestPrice) === false){

                                  highestPricePercentage = ((latestPrice - athPrice) / athPrice) * 100;

                                  console.log("coinData athPrice highestPricePercentage messari for "+coinId+": ",highestPricePercentage);

                                  return highestPricePercentage;
                                }
                            }                        
                            
                        } catch (error) {                  
                                console.error("highestPricePercentage Messari API error for "+ coinId + ", ",error);                   
                        }
                }

                async function getAllTimeHighPriceFromCoinPaprika(coinId, coinName, latestPrice) {
                        try {
                          
                            // Fetch data from CoinPaprika API
                            const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinId.toLowerCase()}-${coinName}`);
                            const data = response.data;
                            
                            if (!data) {
                                console.error("No data returned from CoinPaprika API for " + coinId.toLowerCase());
                                return null;
                            }

                            // Extract necessary fields
                            const athPrice = data.quotes.USD.ath_price;
                            const athPercentDown = data.quotes.USD.percent_from_price_ath;

                            // Validate data
                            if (!athPrice || isNaN(athPrice)) {
                                console.error("Invalid ATH price for " + coinId);
                                return null;
                            }

                            const athPriceDecimal = athPrice.toFixed(20);
                            const athPercentDownValue = -Math.abs(athPercentDown);

                            console.log("coinData highestpricepercentage CoinPaprika data:", data);
                            console.log("coinData highestpricepercentage ATH Price:", athPriceDecimal);
                            console.log("coinData highestpricepercentage Percent Down from ATH:", athPercentDownValue);

                            if (athPrice && !isNaN(latestPrice)) {
                                // Calculate percentage change relative to the latest price
                                const highestPricePercentage = ((latestPrice - athPriceDecimal) / athPriceDecimal) * 100;
                                console.log("coinData highestpricepercentage relative to latest price:", highestPricePercentage);
                                return highestPricePercentage;
                            }

                            return athPercentDownValue;

                        } catch (error) {
                            console.error("highestpricepercentage error fetching data from CoinPaprika API for " + coinId + ": ", error);
                            return null;
                        }
                }                    

                async function getHighestPricePercentage(coinId, coinName, latestPrice) {
                      let athPrice = await getAllTimeHighPriceFromCryptoCompare(coinId, coinName);
                      console.log(`coinData highestPricePercentage athPrice ${coinId}: `, athPrice);
                  
                      let highestPricePercentage = 0;
                  
                      if (!athPrice) {
                          console.log(`coinData highestPricePercentage using Messari ${coinId}: `, athPrice, latestPrice);
                          highestPricePercentage = await getAllTimeHighPriceFromMessari(coinId, coinName, latestPrice);
                      }
                  
                      if (!highestPricePercentage || highestPricePercentage === 0) {
                          console.log(`coinData highestPricePercentage using CoinPaprika ${coinId}: `, athPrice, latestPrice);
                          highestPricePercentage = await getAllTimeHighPriceFromCoinPaprika(coinId, coinName, latestPrice);
                      }
                  
                      if (!highestPricePercentage || highestPricePercentage === 0) {
                          athPrice = athPrice || 0; // Ensure athPrice is a number.
                          console.log(`coinData highestPricePercentage fallback ${coinId}: `, athPrice, latestPrice);
                  
                          if (athPrice > 0) {
                              highestPricePercentage = ((latestPrice - athPrice) / athPrice) * 100;
                          } else {
                              highestPricePercentage = 0;
                          }
                      }
                  
                      console.log(`coinData highestPricePercentage final ${coinId}: `, highestPricePercentage);
                      return highestPricePercentage;
                }
        
                async function yearAgoPriceByBTC(coinId, coinName) {              
                      coinId = coinId.toLowerCase();
                      coinName = coinName != null ? coinName.toLowerCase() : coinName;

                  
                      const now = new Date();
                      now.setDate(now.getDate() - 1);
                      const endDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                      const yearDate = new Date();
                      yearDate.setFullYear(yearDate.getFullYear() - 1);
                      const yearDateFormatted = yearDate.toISOString().split('T')[0];
                  
                      let btcPrice1YearAgo = 0;
                      let yearAgoBtcPrice = 0;
                  
                      try {
                          // Fetch BTC price from Messari API
                          const getYearAgoBtcPrice = await axios.get(
                              `https://data.messari.io/api/v1/assets/btc/metrics/price/time-series`,
                              {
                                  params: {
                                      start: yearDateFormatted,
                                      end: endDate,
                                      format: 'json',
                                      interval: '1d',
                                  },
                              }
                          );
                  
                          btcPrice1YearAgo = getYearAgoBtcPrice?.data?.data?.values?.[0]?.[4] || 0;
                  
                          if (coinId === "btc") {
                              return { btcPrice1YearAgo, yearAgoBtcPrice: btcPrice1YearAgo };
                          }
                  
                          // Fetch coin price in USD from Messari API
                          let coinPriceUSD = 0;
                          try {
                              const getYearAgoUSDPrice = await axios.get(
                                  `https://data.messari.io/api/v1/assets/${coinName}/metrics/price/time-series`,
                                  {
                                      params: {
                                          start: yearDateFormatted,
                                          end: endDate,
                                          format: 'json',
                                          interval: '1d',
                                      },
                                  }
                              );
                              coinPriceUSD = getYearAgoUSDPrice?.data?.data?.values?.[0]?.[4] || 0;
                          } catch (error) {
                              console.warn(`Messari API failed for ${coinId}, trying other APIs.`);
                          }
                  
                          if (coinPriceUSD && btcPrice1YearAgo) {
                              // Convert USD price to BTC
                              yearAgoBtcPrice = coinPriceUSD / btcPrice1YearAgo;
                          } else {
                              // Fallback to CryptoCompare API
                              const getYearAgoBtcPriceFromCC = await axios.get(
                                  `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=BTC&limit=365&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
                              );
                              const ccData = getYearAgoBtcPriceFromCC?.data?.Data?.Data;
                              if (ccData?.length > 0) {
                                  yearAgoBtcPrice = ccData[0]?.close || 0;
                              }
                          }
                  
                          if (yearAgoBtcPrice === 0) {
                              // Fallback to CoinPaprika API
                              const newYearDateFormatted = new Date(yearDateFormatted);
                              newYearDateFormatted.setDate(newYearDateFormatted.getDate() + 2);
                              const formattedStart = newYearDateFormatted.toISOString().split("T")[0];
                              let coinPaprikaCoin = coinId+"-"+coinName;
                  
                              try {
                                  const yearAgoPricePaprika = await axios.get(
                                      `https://api.coinpaprika.com/v1/tickers/${coinPaprikaCoin}/historical`,
                                      {
                                          params: {
                                              start: formattedStart,
                                              interval: "1d",
                                          },
                                      }
                                  );
                  
                                  if (yearAgoPricePaprika?.data?.length > 0) {
                                      const paprikaPriceUSD = yearAgoPricePaprika?.data[0]?.price || 0;
                                      yearAgoBtcPrice = paprikaPriceUSD / btcPrice1YearAgo;
                                  }
                              } catch (error) {
                                  console.warn(`CoinPaprika API failed for ${coinId}, returning fallback value.`);
                              }
                          }
                  
                          return { btcPrice1YearAgo, yearAgoBtcPrice: yearAgoBtcPrice || 0 };
                      } catch (error) {
                          console.error("yearAgoPriceByBTC Error:", error.message);
                          return { btcPrice1YearAgo: 0, yearAgoBtcPrice: 0 };
                      }
                }

                async function coinPaprikaNinetyDays(coinId, coinName) {
                      // Calculate the date 90 days ago
                      let ninetyDaysAgoDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    
                      try {
                          // Ensure coinId and coinName are in lower case
                          if (coinId !== undefined && coinId !== null  ) {
                              coinId = coinId.toLowerCase();
                          }
                          if (coinName !== undefined && coinName !== null) {
                            coinName = (coinName != null ? coinName.toLowerCase() : coinName);                        
                          }

                          let coinPaprikaCoin = coinId+"-"+coinName;                     
                    
                          const apiUrl = "https://api.coinpaprika.com/v1/tickers/"+`${coinPaprikaCoin}`+"/historical?start="+`${ninetyDaysAgoDate}`+"&interval=1d"
        
                          // Fetch data from the API
                          const response = await axios.get(apiUrl);        
                  
                          // Check if response contains data
                          if (response.data && response.data.length > 0) {                        
                            
                              const ninetyDaysAgoPrice = response.data[0].price.toFixed(24);                       
                              return ninetyDaysAgoPrice;
                          } else {
                              console.log(coinId+" 3 month fetching CoinPaprika no data found for the specified date range. ",response.data);
                              return null;
                          }
                      } catch (error) {
                          console.error(coinId+" 3 month fetching CoinPaprika - data error from CoinPaprika API:", error);
                          return null; 
                      }
                }  

                async function cryptoCompareNinetyDays(coinId) {                 
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
                    
                              for (let dayData of priceData) {             
                                  
                                  if (dayData.time === ninetyDaysAgoTimestamp || dayData.close !== 0) {
                                      ninetyDaysAgoPrice = parseFloat(dayData.close).toFixed(10);
                                      break;
                                  }
                              }
                  
                              return ninetyDaysAgoPrice;

                          } else {
                              console.log("3 month fetching No valid price data found for "+coinId+", ",response.data);
                              return null;
                          }

                      } catch (error) {
                          console.error("3 month fetching Error fetching data from CryptoCompare API:", error);
                          return null;
                      }
                }
                  
                async function getNinetyDaysAgoPrice(coinId, coinName) {                        
                      try {
                          const threeMonthsDate = new Date();
                          threeMonthsDate.setDate(threeMonthsDate.getDate() - 90);
                          const threeMonthsDateFormatted = threeMonthsDate.toISOString().split('T')[0];
                          const endDate = new Date().toISOString().split('T')[0]; // Assuming endDate is today
                              
                          let ninetyDaysAgoPrice = null;

                          let response = await axios.get(
                              `https://data.messari.io/api/v1/assets/${coinName}/metrics/price/time-series`,
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

                          let coinSymbolRaw = response.data.data.symbol;
                          let coinSymbol = coinSymbolRaw.toLowerCase();
                          let coinValues = response.data.data.values;            
                  
                          if (coinValues != null) {    
                              const threeMonthPriceData = coinValues[0];
                              ninetyDaysAgoPrice = parseFloat(threeMonthPriceData[4]).toFixed(10);          
                          }
                  
                          if (ninetyDaysAgoPrice === null || isNaN(ninetyDaysAgoPrice)) {
                              console.error("3 month fetching error, fetching data from Messari, CryptoCompare, and coinpaprika");
                              return null;
                          } else {
                            return ninetyDaysAgoPrice;
                          }
                  
                      } catch (error) {
                          console.error("3 month fetching data error from Messari, CryptoCompare, and coinpaprika:", error);              
                      }
                } 

                async function getCurrentBtcPrice(coinId, coinName) {
                    try {
                        const formatPrice = (price, decimals) => price ? price.toFixed(decimals) : null;
                
                        // Step 1: Try Messari API
                        const messariUrl = `https://data.messari.io/api/v1/assets/${coinName}/metrics`;
                        const messariResponse = await axios.get(messariUrl);
                        const marketData = messariResponse?.data?.data?.market_data;
                
                        if (coinId === 'BTC' && marketData?.price_usd) {
                            return formatPrice(marketData.price_usd, 2);
                        } else if (marketData?.price_btc) {
                            return formatPrice(marketData.price_btc, 10);
                        }
                
                        // Step 2: Try CryptoCompare API
                        const cryptoCompareBaseUrl = 'https://min-api.cryptocompare.com/data/price';
                        const cryptoCompareApiKey = process.env.REACT_APP_CRYPTOCOMPARE_API_KEY;
                
                        const [btcPriceResponse, coinPriceResponse] = await Promise.all([
                            axios.get(`${cryptoCompareBaseUrl}?fsym=BTC&tsyms=USD&api_key=${cryptoCompareApiKey}`),
                            axios.get(`${cryptoCompareBaseUrl}?fsym=${coinId}&tsyms=BTC&api_key=${cryptoCompareApiKey}`)
                        ]);
                
                        const btcPriceUsd = btcPriceResponse?.data?.USD;
                        const coinPriceBtc = coinPriceResponse?.data?.BTC;
                
                        if (coinId === 'BTC' && btcPriceUsd) {
                            return formatPrice(btcPriceUsd, 2);
                        } else if (coinPriceBtc) {
                            return formatPrice(coinPriceBtc, 10);
                        }
                
                        // Step 3: Try CoinPaprika API
                        const paprikaUrl = `https://api.coinpaprika.com/v1/tickers/${coinId.toLowerCase()}-${coinName}`;
                        const paprikaResponse = await axios.get(paprikaUrl);
                        const quotes = paprikaResponse?.data?.quotes;
                
                        if (coinId === 'BTC' && quotes?.USD?.price) {
                            return formatPrice(quotes.USD.price, 2);
                        } else if (quotes?.BTC?.price) {
                            return formatPrice(quotes.BTC.price, 10);
                        }
                
                        throw new Error("Unable to fetch price data from all sources.");
                    } catch (error) {
                        console.error(`Error fetching BTC price for ${coinId}:`, error.message);
                        return "0"; // Return 0 as a fallback value.
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
                    let coinDataResponse = await axios.get(
                      `https://data.messari.io/api/v1/assets/${coinName}/profile`
                    );                

                    let coinData = coinDataResponse.data.data;
                
                    // Check if inception date is available
                    if (coinData.profile && coinData.profile.genesis_date) {
                      inceptionDate = new Date(coinData.profile.genesis_date);
                    }
                  } catch (error) {
                    console.error("getInception inceptionPrices Error fetching inception date from Messari API " + coinId + ":", error);
                  }
                
                  // Fallback to previous years if inception date is not available
                  if (inceptionDate === today) {
                    inceptionDate.setFullYear(today.getFullYear() - setYears); // Fallback to set number of years ago 
                    inceptionDate.setDate(inceptionDate.getDate() + 2); // Add one day                     
                  }
                
                  let formattedInceptionDate = inceptionDate.toISOString().split('T')[0];
                  const endDate = new Date().toISOString().split('T')[0]; // Assuming endDate is today
                
                  try {
                    // Step 2: Fetch price data from Messari API
                    let inceptionDataResponse = await axios.get(
                      `https://data.messari.io/api/v1/assets/${coinName}/metrics/price/time-series`,
                      {
                        params: {
                          start: formattedInceptionDate,
                          end: endDate,
                          format: 'json',
                          interval: '1d',
                        },
                      }
                    );

                    let coinSymbolRaw = inceptionDataResponse.data.data.symbol;
                    let coinSymbol = coinSymbolRaw.toLowerCase();
    
                    // Update to check if coinSymbol equals coinId
                    if ( inceptionDataResponse.data.data.values != null && inceptionDataResponse.data.data.values.length > 0 && 
                      coinId.toLowerCase() === coinSymbol) {
                      inceptionPrices = inceptionDataResponse.data.data.values;
                    }
                
                    // Check if inceptionPrices is empty
                    if (inceptionPrices && inceptionPrices.length > 0) {
                      inceptionPrice = inceptionPrices[0][4];
                    } else {
                      throw new Error('getInception inceptionPrices Empty data from Messari API');
                    }
                  } catch (error) {
                    console.error("getInception inceptionPrices Error fetching price data from Messari API. Fallback to CryptoCompare API " + coinId + ":", error);
                
                    let toTs = Math.floor(new Date().getTime() / 1000);
                
                    // Step 3: Fallback to CryptoCompare API
                    try {
                      // Fetch historical price data
                      let cryptoCompareResponse = await axios.get(
                        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&toTs=${toTs}`
                      );
                
                      let firstNonZeroPrice = 0;
                
                      // Loop through the data to find the first non-zero close price
                      for (let dataPoint of cryptoCompareResponse.data.Data.Data) {
                        if (dataPoint.close !== 0) {
                          firstNonZeroPrice = dataPoint.close;
                          inceptionDate = new Date(dataPoint.time * 1000);
                          break;
                        }
                      }
                
                      inceptionPrice = firstNonZeroPrice;
                
                    } catch (error) {
                      console.error("getInception inceptionPrices Error fetching data from CryptoCompare API " + coinId + ": ", error);
                    }
                  }
                
                  // Step 4: Fallback to CoinPaprika API if no inception date or price found
                  if (!inceptionPrice && setYears === 1) {
                    try {
                      coinId = coinId.toLowerCase();
                      coinName = (coinName != null ? coinName.toLowerCase() : coinName);

                      let coinPaprikaCoin = coinId + "-" + coinName;
                
                      const inceptionDataResponse = await axios.get(
                        `https://api.coinpaprika.com/v1/tickers/${coinPaprikaCoin}/historical?start=${formattedInceptionDate}&interval=1d`
                      );
                
                      if (inceptionDataResponse.data && inceptionDataResponse.data.length > 0) {
                        const firstPriceData = inceptionDataResponse.data[0];
                        inceptionPrice = parseFloat(firstPriceData.price).toFixed(8);
                        inceptionDate = new Date(firstPriceData.timestamp);
                      }
                    } catch (error) {
                      console.error("getInception inceptionPrices Error fetching data from CoinPaprika API " + coinId + ":", error);
                    }
                  }
                
                  // Return both inception date and prices
                  return { inceptionDate: inceptionDate, inceptionPrice: inceptionPrice };
                }

                async function getTwitterInfo(twitterAccounts, coinId, coinName) {
                  let twitterURL = null;
                  let twitterFollowers = null;
              
                  try {
                      if (twitterAccounts !== null && twitterAccounts !== undefined) {

                          // Extract followers and URLs from the provided twitterAccounts
                          let twitterArray = Object.values(twitterAccounts).map((account) => account.FOLLOWERS);
              
                          twitterURL = Object.values(twitterAccounts).map((account) => account.URL);
              
                          // If multiple URLs exist, take the first one
                          if (twitterURL.length > 1) {
                              twitterURL = twitterURL[0];
                          }                
          
                          // Calculate total followers
                          twitterFollowers = twitterArray.reduce((acc, val) => acc + val, 0);                
              
                          return { twitterURL, twitterFollowers };

                      } else { 
                          // Try Coinpaprika API
                          try {
                              let coinpaprikaResponse = await api.get(`https://api.coinpaprika.com/v1/coins/${coinId}-${coinName}`);
              
                              if (
                                  coinpaprikaResponse.data &&
                                  coinpaprikaResponse.data.links &&
                                  coinpaprikaResponse.data.links.twitter
                              ) {                              
              
                                  twitterURL = coinpaprikaResponse.data.links.twitter.url;
                                  twitterFollowers = coinpaprikaResponse.data.links.twitter.followers || 0;
              
                                  return { twitterURL, twitterFollowers };
                              }
                          } catch (error) {
                              console.error("twitter " + coinId + " Error fetching from Coinpaprika, trying Messari:", error);
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
                                console.error("twitter coinId " + coinId + " Error fetching from CoinGecko:", error); 
                                console.error("twitter coinName " + coinName + " Error fetching from coingecko:", error);                                 
                            }

                          // Try Messari API
                          try {
                              let messariResponse = await api.get(`https://data.messari.io/api/v1/assets/${coinName}/profile`);

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
                              console.error("twitter " + coinId + " Error fetching from Messari:", error);
                          } 
              
                          // If all external sources fail, return false
                          return false;
                      }

                  } catch (error) {
                      console.error("twitter " + coinId + " Unexpected error:", error);
                      return false;
                  }
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
                    console.error('getInception Error fetching data from CryptoCompare:', error);
                  }
                
                  // If CryptoCompare data is not available or invalid, fetch from Messari
                  if (!oneYearAgoPrice || oneYearAgoPrice === 0) {
                    try { 
                      const response = await axios.get(`https://data.messari.io/api/v1/assets/${coinName}/metrics/market-data`);
                      const data = response.data.data.market_data;
                      oneYearAgoPrice = data.price_usd;
                    } catch (error) {
                      console.error('getInception Error fetching data from Messari:', error);
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
                      coinName = (coinName != null ? coinName.toLowerCase() : coinName);

                      let coinPaprikaCoin = coinId+"-"+coinName;
                
                      const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinPaprikaCoin}/historical?start=${yearAgoDate}&interval=1d`);
                      const data = response.data;
                
                      oneYearAgoPrice = data[0].price;
                    } catch (error) {
                      console.error('getInception Error fetching data from CoinPaprika:', error);
                    }
                  }

                  let change = 0;
                
                  // Calculate the percentage change
                  if (!oneYearAgoPrice || oneYearAgoPrice === 0) { 
                    return change;
                  } else if(isNaN(latestPrice) === false) {
                    change = ((latestPrice - oneYearAgoPrice) / oneYearAgoPrice) * 100;
                    return change.toFixed(4);
                  }
                
                }

                async function fetchMarketCapWhenZero(coinId, coinName) {
                  try {

                      console.log("coinMarketCap messariResponse: ",`https://data.messari.io/api/v1/assets/${coinName}/metrics`);
                    
                      // Step 1: Attempt to fetch coin data from Messari
                      const messariResponse = await axios.get(`https://data.messari.io/api/v1/assets/${coinName}/metrics`);
                      const messariMarketCap = messariResponse.data?.data?.marketcap?.current_marketcap_usd;

                      console.log("coinMarketCap messariResponse: "+coinId+" ",messariResponse);
                      console.log("coinMarketCap messariMarketCap: "+coinId+" ",messariMarketCap);
              
                      if (messariMarketCap && !isNaN(messariMarketCap)) {
                          return messariMarketCap;
                      }
                  } catch (error) {
                      console.error("coinMarketCap whenzero Error fetching from Messari:", error.message || error);
                  }
              
                  try { 
                      let coinPaprikaCoin = coinId.toLowerCase()+"-"+coinName;

                      console.log("coinMarketCap coinDetailsResponse: ",`https://api.coinpaprika.com/v1/tickers/${coinPaprikaCoin}`);

                      const coinDetailsResponse = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinPaprikaCoin}`);
                      const coinPaprikaMarketCap = coinDetailsResponse.data?.quotes?.USD?.market_cap;

                      console.log("coinMarketCap coinDetailsResponse: "+coinId+" ",coinDetailsResponse);
                      console.log("coinMarketCap coinPaprikaMarketCap: "+coinId+" ",coinPaprikaMarketCap);
              
                          if (coinPaprikaMarketCap && !isNaN(coinPaprikaMarketCap)) {                            
                              return coinPaprikaMarketCap;
                          }
                  } catch (error) {
                      if (error.response?.status === 402) {
                          console.warn("coinMarketCap whenzero CoinPaprika 402 Payment Required error encountered");
                      } else {
                          console.error("coinMarketCap whenzero Error fetching from CoinPaprika:", error.message || error);
                      }
                  }
              
                  try {
                      // Step 3: Attempt to fetch coin data from CoinGecko   

                      console.log("coinMarketCap coinGeckoResponse: ",`https://api.coingecko.com/api/v3/coins/${coinId.toLowerCase()}`);

                      const coinGeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId.toLowerCase()}`);
                      const coinGeckoMarketCap = coinGeckoResponse.data?.market_data?.market_cap?.usd;

                      console.log("coinMarketCap coinGeckoResponse: "+coinId+" ",coinGeckoResponse);
                      console.log("coinMarketCap coinGeckoMarketCap: "+coinId+" ",coinGeckoMarketCap);
              
              
                      if (coinGeckoMarketCap && !isNaN(coinGeckoMarketCap)) {
                          return coinGeckoMarketCap;
                      }
                  } catch (error) {
                      console.error("coinMarketCap whenzero  Error fetching from CoinGecko by coinId:", error.message || error);
                  }
              
                  try {
                    console.log("coinMarketCap coinGeckoResponseByName 0:", `https://api.coingecko.com/api/v3/coins/${coinName.toLowerCase()}`);
                
                    let coinGeckoMarketCapByName = null;                  
            
                    // Initial API call
                    let coinGeckoResponseByName = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinName.toLowerCase()}`);
                    coinGeckoMarketCapByName = coinGeckoResponseByName.data?.market_data?.market_cap?.usd;
                
                    console.log("coinMarketCap coinGeckoResponseByName 1:", coinId, coinGeckoResponseByName);
                    console.log("coinMarketCap coinGeckoResponseByName.data :", coinId, coinGeckoResponseByName.data); 
                    console.log("coinMarketCap coinGeckoResponseByName.status :", coinId, coinGeckoResponseByName.status);                
                
                    console.log("coinMarketCap coinGeckoMarketCapByName:", coinId, coinGeckoMarketCapByName);
                
                    if (coinGeckoMarketCapByName !== null && coinGeckoMarketCapByName !== 0 && !isNaN(coinGeckoMarketCapByName)) {
                        return coinGeckoMarketCapByName;
                    }

                } catch (error) {
                    // Check for retry conditions
                    if (
                    (error?.response?.status === 404 ||
                        error?.response?.status === 429 ||
                        error?.response?.data?.error === 'coin not found') &&
                        coinName.includes("-")
                      ) {
                          try {
                                const coinNameWithoutDashes = coinName.replace(/-/g, "");     
                                
                                console.log("coinMarketCap coinGeckoResponseByName 1:", `https://api.coingecko.com/api/v3/coins/${coinNameWithoutDashes.toLowerCase()}`);
                                    
                                const coinGeckoResponseByName = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinNameWithoutDashes.toLowerCase()}`);
                                
                                const coinGeckoMarketCapByName = coinGeckoResponseByName.data?.market_data?.market_cap?.usd;
                                    
                                console.log("coinMarketCap coinGeckoResponseByName (no dashes):", coinId, coinGeckoResponseByName);
                                console.log("coinMarketCap coinGeckoMarketCapByName (no dashes):", coinId, coinGeckoMarketCapByName);
                                    
                                if (coinGeckoMarketCapByName && !isNaN(coinGeckoMarketCapByName)) {
                                return coinGeckoMarketCapByName;
                                }
                              } catch (retryError) {
                                        console.error("coinMarketCap whenzero Error retrying without dashes:", retryError.message || retryError);
                              }
                      }
                    console.error("coinMarketCap whenzero Error fetching from CoinGecko:", error.message || error);
                }        

                  return 0; // Return 0 if all attempts fail
                }  

                async function fetchVolumeWhenZero(coinId, coinName) {
                try {
                    // Step 1: Attempt to fetch 24-hour volume from Messari                        
                    try {
                        const messariResponse = await axios.get(`https://data.messari.io/api/v1/assets/${coinName}/metrics`);
                        const volume24h = messariResponse.data.data.market_data.volume_last_24_hours;

                        if (volume24h !== 0 && volume24h !== null) {
                            return parseInt(volume24h);
                        }
                    } catch (error) {
                        console.error("coinVolume Messari Error: ", error);
                    }
            
                    // Step 2: If Messari fails, attempt to fetch from CoinPaprika                
                    try {                
                            let coinPparikaCoin = coinId.toLowerCase()+"-"+coinName;

                            console.log("coinVolume CoinPaprika Fetching coin details from CoinPaprika for coin: ",coinPparikaCoin);
            
                            try {
                                const coinDetailsResponse = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinPparikaCoin}`);
                                const coinPaprikaVolume = coinDetailsResponse.data.quotes.USD.volume_24h;
                              
                                if (coinPaprikaVolume !== 0 && coinPaprikaVolume !== null) {
                                    return parseInt(coinPaprikaVolume);
                                }
                            } catch (error) {
                                console.error("coinVolume CoinPaprika Ticker Error: ", error);
                            }
                    } catch (error) {
                        console.error("coinVolume CoinPaprika Error: ", error);
                    }
            
                    // Step 3: If CoinPaprika fails, attempt to fetch from CoinGecko
                    try {
                        const coinGeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
                        const coinGeckoData = coinGeckoResponse.data;
                        if (coinGeckoData && coinGeckoData.market_data && coinGeckoData.market_data.total_volume && coinGeckoData.market_data.total_volume.usd !== 0) {
                            const coinGeckoVolume = coinGeckoData.market_data.total_volume.usd;
                            return parseInt(coinGeckoVolume);
                        }
                    } catch (error) {
                        console.error("coinVolume CoinGecko Error: ", error);
                    }
            
                    // Fallback: Try fetching by coinName in CoinGecko if coinId fails
                    try {
                        const coinGeckoResponseByName = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinName.toLowerCase()}`);
                        const coinGeckoDataByName = coinGeckoResponseByName.data;
                        if (coinGeckoDataByName && coinGeckoDataByName.market_data && coinGeckoDataByName.market_data.total_volume && coinGeckoDataByName.market_data.total_volume.usd !== 0) {
                            const coinGeckoVolumeByName = coinGeckoDataByName.market_data.total_volume.usd;
                            return parseInt(coinGeckoVolumeByName);
                        }
                    } catch (error) {
                        console.error("coinVolume CoinGecko Error fetching data for " + coinName + ": ", error);
                    }
            
                } catch (error) {
                    console.error("coinVolume Error fetching volume: ", error);
                }                

                // If all sources fail, return 0
                return 0;
                }
                
                let highestPricePercentage = await getHighestPricePercentage(coinId, coinName, latestPrice);              

                console.log("coinData highestPricePercentage final after fn "+coinId+" : ",highestPricePercentage); 
                  
                let ninetyDaysAgoPrice = null;
                let yearAgoBtcPriceResult = null;
                let oneYearBTCPercentChange = 0;   
                let oneYearBTCPriceChange = 0;

                if (coinId !== null) {
                    let yearAgoBtcPrice = null;
                    let btcPrice1YearAgo = null;
                
                    try {
                          ninetyDaysAgoPrice = await getNinetyDaysAgoPrice(coinId, coinName);

                          if(ninetyDaysAgoPrice === null || ninetyDaysAgoPrice == undefined){

                              ninetyDaysAgoPrice = await cryptoCompareNinetyDays(coinId);  
                
                              if(ninetyDaysAgoPrice === null || ninetyDaysAgoPrice == undefined){                        
                                  ninetyDaysAgoPrice = await coinPaprikaNinetyDays(coinId,coinName);                  
                              }                          
                        }

                    } catch (error) {
                        console.error("3 month percentage error fetching ninety days ago price for "+coinId+".", error);
                        ninetyDaysAgoPrice = null; // Handle the error scenario
                    }
                
                    yearAgoBtcPriceResult = await yearAgoPriceByBTC(coinId, coinName);
                
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

                    let currentBtcPrice = await getCurrentBtcPrice(coinId, coinName);

                    console.log("coinData currentBtcPrice oneYearBTCPercentChange"+coinId+" : ",currentBtcPrice);
                    console.log("coinData "+coinId+" oneYearBTCPercentChange yearAgoBtcPrice: ",yearAgoBtcPrice);                    
                    console.log("coinData "+coinId+" oneYearBTCPercentChange 2: ",oneYearBTCPercentChange); 
                
                    if (yearAgoBtcPrice === null || parseFloat(yearAgoBtcPrice) === 0) {              
                  
                        oneYearBTCPercentChange = 0;

                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice); 

                
                    } else if (yearAgoBtcPrice === 1) {
                
                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(btcPrice1YearAgo);
                        oneYearBTCPercentChange = (oneYearBTCPriceChange / btcPrice1YearAgo) * 100;              
                 
                    } else {
                
                        oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice);
                        oneYearBTCPercentChange = (oneYearBTCPriceChange / yearAgoBtcPrice) * 100;                          
                      
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

                let inceptionPrices = await getInception(coinId, coinName, 5); 

                console.log("coinData "+coinId+" getInception 5: ",inceptionPrices);

                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 3);
                  console.log("coinData "+coinId+" getInception 3: ",inceptionPrices);
                } 

                if(inceptionPrices.inceptionPrice === null){
                  inceptionPrices = await getInception(coinId, coinName, 1);                  
                  console.log("coinData "+coinId+" getInception 1: ",inceptionPrices);
                } 
    
                console.log("coinData "+coinId+" inceptionPriceChange inceptionPrices: ",inceptionPrices);
                console.log("coinData "+coinId+" coinCurrentPrice latestPrice 1: ",latestPrice);
                console.log("coinData "+coinId+" oneYearBTCPercentChange 3: ",oneYearBTCPercentChange);                
                
                let inceptionPriceChange = 0;

                if(isNaN(latestPrice) === false && inceptionPrices.inceptionPrice !== null){
                  inceptionPriceChange =  ((latestPrice - inceptionPrices.inceptionPrice) / inceptionPrices.inceptionPrice) * 100;
                }                 

                console.log("coinData "+coinId+" inceptionPriceChange 3: ",inceptionPriceChange);

                let maxChartGrade = null;

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

                const oneYearPercentChange = await getOneYearPercentChange(coinId, coinName, latestPrice);

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

                  let ninetyDaysPercentChange = 0;

                  if (ninetyDaysAgoPrice !== null && isNaN(ninetyDaysAgoPrice) === false && isNaN(latestPrice) === false){

                    let ninetyDaysPriceChange = parseFloat(latestPrice) - parseFloat(ninetyDaysAgoPrice);
                    ninetyDaysPriceChange = ninetyDaysPriceChange.toFixed(10);
                    ninetyDaysPercentChange = (ninetyDaysPriceChange / ninetyDaysAgoPrice) * 100;

                  }             

                  if (ninetyDaysPercentChange > 0.14 ) {
                    threeMonthsPercentScore = 1;
                  } else {
                    threeMonthsPercentScore = 0;
                  }               

                  let getCoinData = await api.get(
                    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
                  );

                  let website = null;
                  let twitterAccounts = null;
                  let sourceCode = null;
                  let twitterFollowers =  null;
                  let twitterURL = null;
                  let gitRepository = null;

                  if (getCoinData.data) {
                      twitterAccounts = getCoinData.data.Data.TWITTER_ACCOUNTS;                  
                      sourceCode = getCoinData.data.Data.CODE_REPOSITORIES;                 
                      website = getCoinData.data.Data.WEBSITE_URL;
                  }

                  let twitterInfo = await getTwitterInfo(twitterAccounts, coinId, coinName);                                

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

                  if(value != null){
                    if (value.total_volume > 250000) {
                      volumeScore = 1;
                    }
                  }

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

                  if (highestPricePercentage <= -65) {

                    buyHighPercentScore = 3;
                    sellHighPercentScore = 0;

                  } else if (highestPricePercentage <= -40) {
                    
                    buyHighPercentScore = 2;
                    sellHighPercentScore = 0;

                  } else if (highestPricePercentage < -15) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 1;                    
                  }
                   else if (highestPricePercentage >= -15) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 2;       

                  } else if (highestPricePercentage >= -5) {

                    buyHighPercentScore = 0;
                    sellHighPercentScore = 3;     

                  }

                  let totalbuyrating = buyrating + buyHighPercentScore;
                  let totalsellrating = sellrating + sellHighPercentScore;

                    if (totalbuyrating > totalsellrating) {

                      buysellrating = totalbuyrating;  
                     
                      if (buysellrating > 3 && ninetyDaysPercentChange <= 40) {
                        buysell = "BUY";
                      } else {
                        buysell = "HODL";
                      }

                    } else if (totalsellrating > totalbuyrating) {

                      buysellrating = totalsellrating;    
                      
                      if (buysellrating <= 3 && ninetyDaysPercentChange > 55) {
                        buysell = "SELL";
                      } else {
                        buysell = "HODL";
                      }

                    } else {                        

                      if (total > 3 && ninetyDaysPercentChange <= 40) {
                        buysell = "BUY";
                      } else if (total <= 3 && ninetyDaysPercentChange > 55) {
                        buysell = "SELL";
                      } else {
                        buysell = "HODL";
                      }
                     
                    }

                  setTotalScore(total);

                  const response = await api.get('http://localhost:8888/portfolios');
                  const portfolios = response.data;
                  let portfolioId;
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
                      console.error(`No prediction found for ${coinId}`);
                    }
                  } else {
                    console.error(`Portfolio not found for ${coinId}`);
                  }                  
     
                  
                let coinMarketCap = null;

                console.log("coinMarketCap value 0: "+coinId+" ",value);

                if(value !== null && value.USD.CONVERSIONTYPE !== 'not_possible' ){
                  coinMarketCap = value.USD.MKTCAP;
                }
                  
                // Set coinMarketCap to null if it is NaN
                if(coinMarketCap !== null && isNaN(coinMarketCap) === false){
                  coinMarketCap = parseInt(coinMarketCap);
                }                   
                  
                  // Check for null or 0 values correctly
                  if (coinMarketCap === 0 || coinMarketCap === null) {

                       console.log("coinMarketCap fetchMarketCapWhenZero: "+coinId+" ",coinName);
                    
                      coinMarketCap = await fetchMarketCapWhenZero(coinId, coinName);
                      coinMarketCap = parseInt(coinMarketCap);     
                      
                      console.log("coinMarketCap fetchMarketCapWhenZero: "+coinId+" ",coinMarketCap);
                  
                  } else {
                      coinMarketCap = parseInt(coinMarketCap);
                  }   
                  
                               
                  console.log("coinMarketCap: "+coinId+" ",coinMarketCap);

                  console.log("coinData "+coinId+" coinCurrentPrice latestPrice: ",latestPrice);
                  console.log("coinData "+coinId+" oneYearBTCPercentChange 1: ",oneYearBTCPercentChange);
                  console.log("coinData "+coinId+" inceptionPriceChange 1: ",inceptionPriceChange);
                  console.log("coinCurrentVol value 0: "+coinId+" ",value);
                
                  let coinCurrentVol = null; 
                  
                  if(value !== null && value.USD.CONVERSIONTYPE !== 'not_possible'){
                    coinCurrentVol = value.USD.TOTALVOLUME24H;          
                    coinCurrentVol = parseInt(coinCurrentVol); 
                  }     
                  
                  console.log("coinCurrentVol 0: "+coinId+" ",coinCurrentVol);
                  
                  if(coinCurrentVol === 0 || coinCurrentVol === null){ 
                    coinCurrentVol = await fetchVolumeWhenZero(coinId, coinName);
                  }                 
                  
                  console.log("coinCurrentVol value: "+coinId+" ",value);
                  console.log("coinCurrentVol 1: "+coinId+" ",coinCurrentVol);
     
                  //Data formats for decimals
                  if(coinPrediction !== null && coinPrediction !== ''){
                      coinPrediction = parseFloat(coinPrediction);
                      if(coinPrediction >= 0.00000001){
                        coinPrediction = coinPrediction.toFixed(8);
                      } else if(coinPrediction < 0.00000001){
                        coinPrediction = coinPrediction.toFixed(11);
                      } else {
                        coinPrediction = coinPrediction.toFixed(11);
                      }  
                  }

                  let coinCurrentPrice = 0;

                  console.log("coinData "+coinId+" coinCurrentPrice latestPrice: ",latestPrice);

                  if(isNaN(latestPrice) === false){
                    coinCurrentPrice = parseFloat(latestPrice).toFixed(12);  
                    console.log("coinData "+coinId+" coinCurrentPrice 2: ",coinCurrentPrice); 
                  } 

                  console.log("coinData "+coinId+" coinCurrentPrice 3: ",coinCurrentPrice); 
                
                  if (isNaN(oneYearBTCPriceChange) === false) {
                    let strValue = oneYearBTCPriceChange.toString();
                    let numDecimals = (strValue.split('.')[1] || '').length;
                
                    oneYearBTCPriceChange = parseFloat(oneYearBTCPriceChange);
                
                    if (numDecimals > 0 && numDecimals <= 8) {
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(8);
                
                    } else if (numDecimals > 8 ) {  
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(11);
                    } else if (oneYearBTCPriceChange > 0) {
                        oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(4);
                    } else {
                      oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(11);
                    }
                  }
                
                  if (isNaN(oneYearBTCPercentChange) === false) {
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
                
                  inceptionPriceChange = parseFloat(inceptionPriceChange);
                
                  if( isNaN(inceptionPriceChange) === false ){
                
                    if (inceptionPriceChange > 0) {
                      inceptionPriceChange = parseInt(inceptionPriceChange.toFixed(4));
                    } else {
                      inceptionPriceChange = parseInt(inceptionPriceChange.toFixed(8));
                    }
                  }
                
                  if( isNaN(ninetyDaysPercentChange) === false ){
                
                    if (ninetyDaysPercentChange > 0) {
                      ninetyDaysPercentChange = parseFloat(ninetyDaysPercentChange.toFixed(4));
                    } else {
                      ninetyDaysPercentChange = parseFloat(ninetyDaysPercentChange.toFixed(8));
                    }
                  }

                  console.log("coinData highestPricePercentage: ",highestPricePercentage);
                
                  highestPricePercentage = parseFloat(highestPricePercentage);
                
                  if( isNaN(highestPricePercentage) === false){
                
                    if (highestPricePercentage > 0) {
                      highestPricePercentage = parseFloat(highestPricePercentage.toFixed(4));
                    } else {
                      highestPricePercentage = parseFloat(highestPricePercentage.toFixed(8));
                    }                 
                
                  }

                  console.log("coinData "+coinId+" coinCurrentPrice 3: ",coinCurrentPrice);
                  console.log("coinData "+coinId+" oneYearBTCPercentChange: ",oneYearBTCPercentChange);
                  console.log("coinData "+coinId+" inceptionPriceChange: ",inceptionPriceChange);
        
          
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

                  if(coinData.length <= 0){
                    setNoCoins(true)
                  }

                  setCoinData(coinData);          
           
              }

            } else {
              console.error("Error retrieving coin data");              
              setNoCoins(true);
            }

      } catch (error) {
          console.error("Error retrieving coin data",error);
      }
  };

  const updateNoCoins = async (value) => {
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