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

  const endDate = new Date().toISOString().split('T')[0]; //today
  const yearDate = new Date();
  yearDate.setDate(yearDate.getDate() - 365);
  let yearDateFormatted = yearDate.toISOString().split('T')[0]; // Formatted start date

  async function updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell) {
    try {
      const updatedCoinData = coinData.map((coin) => {
        if (coin.id === coinId) {
          const newGainPredictionFormatted = newGainPrediction ? newGainPrediction : null;
          const newAvgGainPredictionFormatted = newAvgGainPrediction ? newAvgGainPrediction : null;
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
    } catch (error) {
      console.error("Error updating coin data for prediction:", error);
    }
  }

  async function updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell) {
    console.log("updateCoinPrediction coinId: ", coinId);
    console.log("updateCoinPrediction predictionPrice: ", predictionPrice);
    console.log("updateCoinPrediction totalrating: ", totalrating);
    console.log("updateCoinPrediction newGainPrediction: ", newGainPrediction);
    console.log("updateCoinPrediction newAvgGainPrediction: ", newAvgGainPrediction);
    console.log("updateCoinPrediction buysell: ", buysell);
    try {
      const coinToUpdate = coinData.find(coin => coin.id === coinId);
      if (!coinToUpdate) {
        console.error(`Coin with id ${coinId} not found.`);
        return;
      }
  
      const apiUrl = `http://localhost:3006/portfolios`;
      const response = await axios.get(apiUrl);
      const portfolios = response.data;
      console.log("Portfolios Data:", portfolios);
  
      const portfolio = portfolios.find(
        (p) => p.analysis.some((analysisItem) => analysisItem.coinId.toLowerCase() === coinId.toLowerCase())
      );
      console.log("Matched Portfolio:", portfolio);
  
      if (!portfolio) {
        console.error(`No portfolio found for coinId: ${coinId}`);
        return;
      }
  
      const portfolioId = portfolio.id;
      const portfolioUrl = `http://localhost:3006/portfolios/${portfolioId}`;
      const responsePortfolio = await axios.get(portfolioUrl);
      const portfolioAnalysis = responsePortfolio.data;
  
      const updatedAnalysis = portfolioAnalysis.analysis.map((analysisItem) => {
        if (analysisItem.coinName.toLowerCase() === coinId.toLowerCase()) {
          return {
            ...analysisItem,
            prediction: predictionPrice
          };
        }
        return analysisItem;
      });
  
      const updatedPortfolio = {
        ...portfolio,
        analysis: updatedAnalysis,
      };
  
      await axios.put(apiUrl + `/${portfolioId}`, updatedPortfolio);
      updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell);
    } catch (error) {
      console.error("Error updating coin prediction:", error);
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
    try {
      console.log("handleCoinPrediction input value : ", predictionPrice);
      let newGainPredictionScore = 0;
      let newAvgGainPredictionScore = 0;
      let newGainPrediction = null;
      let newAvgGainPrediction = null;
      let totalrating = null;
  
      // Find the coin object in coinData with the matching coinId    
      let coin = coinData.find((coin) => coin.id === coinId);
      console.log("Coin Data:", coinData);
      console.log("Matched Coin:", coin);
      
      if (!coin) {
        console.error(`Coin with id ${coinId} not found in coinData.`);
        return;
      }
  
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
        if (newGainPrediction > 0.0300) {
          newGainPredictionScore = 2;
        }
        if (newAvgGainPrediction > 0.0300) {
          newAvgGainPredictionScore = 1;
        }
        totalrating = buysellrating + newGainPredictionScore + newAvgGainPredictionScore;
        if (buysell === 'BUY' && totalrating > 2 && parseInt(ninetyDaysPercentChange) < 40) {
          buysell = "BUY";
        } else if (buysell === null && totalrating > 3 && parseInt(ninetyDaysPercentChange) < 40) {
          buysell = "BUY";
        } else if (buysell === 'SELL' && totalrating < 4 && parseInt(ninetyDaysPercentChange) > 50) {
          buysell = "SELL";
        } else if (buysell === 'HODL' && totalrating > 2 && parseInt(ninetyDaysPercentChange) < 40) {
          buysell = "BUY";
        } else if (buysell === 'HODL' && totalrating > 4 && parseInt(ninetyDaysPercentChange) > 50) {
          buysell = "BUY";
        } else {
          buysell = "HODL";
        }
  
        console.log("updateCoinPrediction coinId: ", coinId);
        console.log("updateCoinPrediction predictionPrice: ", predictionPrice);
        console.log("updateCoinPrediction totalrating: ", totalrating);
        console.log("updateCoinPrediction newGainPrediction: ", newGainPrediction);
        console.log("updateCoinPrediction newAvgGainPrediction: ", newAvgGainPrediction);
        console.log("updateCoinPrediction buysell: ", buysell);
  
        updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    GetAnalysisCoins();
  }, []);



  async function GetAnalysisCoins() {
      try {
          const portfolios = await api.get("http://localhost:3006/portfolios");
          let allAnalysisCoins = [];

          for (let i = 0; i < portfolios.data.length; i++) {
            const response = await api.get(
              `http://localhost:3006/portfolios/${portfolios.data[i].id}`
            );
            let analysisCoins = response.data.analysis;

            console.log("analysisCoins: ",analysisCoins);

            for (let [index, value] of Object.entries(analysisCoins)) {
                let coinNameAnalysis = value.coinName.replace(/\s+/g, '-');                
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
            let allCoinIdsjoin = allCoinIds.join(",");              
            
              // ** Test ** Function to fetch coin details from CoinPaprika
              async function fetchCoinDetailsFromCoinPaprika(coinSymbol) {

                console.log("fetchCoinDetailsFromCoinPaprika: https://api.coinpaprika.com/v1/coins/");
                console.log("fetchCoinDetailsFromCoinPaprika 0: https://api.coinpaprika.com/v1/coins/"+coinSymbol);
                console.log("fetchCoinDetailsFromCoinPaprika 0: https://api.coinpaprika.com/v1/tickers/"+coinSymbol);

                try {
                  const coinPaprikaCoinListUrl = `https://api.coinpaprika.com/v1/coins`;
                  const coinListResponse = await axios.get(coinPaprikaCoinListUrl);
                  const coinList = coinListResponse.data;
                  
                  const coin = coinList.find(c => c.symbol === coinSymbol);

                  if (!coin) {
                    throw new Error(`Coin with symbol ${coinSymbol} not found in CoinPaprika.`);
                  }
                  
                  const coinId = coin.id;

                  console.log("fetchCoinDetailsFromCoinPaprika 1: https://api.coinpaprika.com/v1/coins/"+coin.id);
                  console.log("fetchCoinDetailsFromCoinPaprika 1: https://api.coinpaprika.com/v1/tickers/"+coin.id);

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
                  console.error(`Error fetching coin details from CoinPaprika: ${error}`);
                  return null;
                }
              }

              // Function to fetch coin details from Messari
              async function fetchCoinDetailsFromMessari(coinSymbol) {
                try {
                  const messariCoinListUrl = `https://data.messari.io/api/v1/assets`;
                  const coinListResponse = await axios.get(messariCoinListUrl);
                  const coinList = coinListResponse.data.data;
                  
                  const coin = coinList.find(c => c.symbol === coinSymbol);
                  if (!coin) {
                    throw new Error(`Coin with symbol ${coinSymbol} not found in Messari.`);
                  }
                  
                  const coinId = coin.id;

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

            //API to get name, symbol, images, market cap, price change in 24hrs, etc, for each coin in the analysis
            if (allCoinIdsjoin.length !== 0) {

              const marketChartData = await axios.get(
                `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${allCoinIdsjoin}&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
              );
           
              console.log("marketChartData.data: ", marketChartData.data); //RAW DISPLAY
              console.log("marketChartData.data RAW: ", marketChartData.data.RAW); //NAKA

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

                console.log("index: ",index); 
                console.log("value: ",value);

                let coinId = null; 
                let coinName = null;

                console.log("allAnalysisCoins coinId 0: ",coinId);
                console.log("allAnalysisCoins coinName 0: ",coinName);

                for (let i = 0; i < allAnalysisCoins.length; i++) {  

                  if(allAnalysisCoins[i].coinId === value.USD.FROMSYMBOL){
             
                    coinId = allAnalysisCoins[i].coinId;   
                    coinName = allAnalysisCoins[i].coinName; 
                    latestPrice = value.USD.PRICE;                    
                    break;  

                  } else if (value.USD.CONVERSIONTYPE === "not_possible") {

                    console.log("allAnalysisCoins not_possible for "+index+" is ",value);   

                    const coinSymbol = index; // Assuming 'index' is the coin symbol here
      
                    // First, try CoinPaprika
                    let coinDetails = await fetchCoinDetailsFromCoinPaprika(coinSymbol);

                    console.log("fetchCoinDetailsFromCoinPaprika: "+coinDetails);
                    
                    // If CoinPaprika fails, try Messari
                    if (!coinDetails) {
                      coinDetails = await fetchCoinDetailsFromMessari(coinSymbol);
                    }

                    console.log("allAnalysisCoins coinDetails for "+index+" is ",coinDetails); 
                     
                    if (coinDetails) {
                      coinId = coinDetails.symbol || coinDetails.slug; // Adjust based on API response
                      coinName = coinDetails.name;
                      latestPrice = coinDetails.price;
                      break;
                    }
                } 
                

                }

                console.log("allAnalysisCoins coinId 1: ", coinId);
                console.log("allAnalysisCoins coinName 1: ", coinName);

                async function getAllTimeHighPriceFromMessari(coinId,coinName) {
                  try {
                      console.log("getHighPrice for " + coinId + " API: " + `https://data.messari.io/api/v1/assets/${coinId}/metrics`);
                      
                      // Get all-time highest price for coin data
                      let getHighPrice = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`); 
                      const highPriceData = getHighPrice.data.data;
                      console.log("getHighPrice highPriceData: ", highPriceData);
                      
                      const alltimeHighPrice = highPriceData.all_time_high.price;
                      let isNanPrice = isNaN(alltimeHighPrice); //true if not number
                      let athPrice = 0;
                      
                      const coinSymbol = highPriceData.symbol.toUpperCase();  
                      const coinSlug = highPriceData.slug.toUpperCase();                 
                      console.log("getHighPrice id: ", highPriceData.id );
                      console.log("getHighPrice slug: ",  highPriceData.slug);
                      console.log("getHighPrice coinSymbol: ", highPriceData.symbol);
                      console.log("getHighPrice athPrice alltimeHighPrice "+coinId+": ", alltimeHighPrice);
                      console.log("getHighPrice athPrice isNanPrice "+coinId+": ", isNanPrice);
                      
                      // Assuming coinSymbol should be compared with a field in highPriceData
                      if ((coinSymbol === coinId || coinSlug === coinId) && isNanPrice === false && alltimeHighPrice !== null) {
                          athPrice = alltimeHighPrice;
                          console.log("getHighPrice athPrice 1: ", athPrice);
                      } else {
                          athPrice = await getAllTimeHighPriceFromCryptoCompare(coinId,coinName);
                          console.log("getHighPrice athPrice 2: ", athPrice);
                      }                     
                      
                      return athPrice;
                      
                  } catch (error) {
                      if (error.response && error.response.status === 404) {
                          console.log("getHighPrice Messari API returned 404 for " + coinId + ", using CryptoCompare as fallback");
                          return await getAllTimeHighPriceFromCryptoCompare(coinId,coinName);
                      } else {
                          throw error;
                      }
                  }
              }
              
              async function getAllTimeHighPriceFromCryptoCompare(coinId,coinName) {
                  // Replace this with your actual CryptoCompare API key
                  const cryptoCompareApiKey = 'de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa';
                  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=2000&api_key=${cryptoCompareApiKey}`;
                  
                  try {
                      let response = await axios.get(url);
                      let data = response.data.Data ? response.data.Data.Data : null;
                      let athPrice = null;

                      console.log("getHighPrice CryptoCompare response.data " + coinId + ": ", response.data);
              
                      if (response.data.Response === "Error" ) {
                          console.log(`getHighPrice Invalid data received from CryptoCompare for ${coinId}, falling back to CoinPaprika`);  
                      } else {
                          athPrice = Math.max(...data.map(day => day.high));
                      }              
                      
                      console.log("getHighPrice CryptoCompare athPrice for " + coinId + ": ", athPrice);
                      
                      return athPrice;
                  } catch (error) {
                      console.error("getHighPrice Error fetching data from CryptoCompare: ", error);
                      throw error;
                  }
              }              
              
        
                const athPrice = await getAllTimeHighPriceFromMessari(coinId, coinName);  

                console.log("getHighPrice athPrice " + coinId + ": ", athPrice);
                //let coinPriceValue = value.USD.PRICE;
                
                console.log("coinPriceValue athPrice latestPrice "+coinId+": ",latestPrice);
                console.log("coinPriceValue athPrice "+coinId+": ",athPrice);
          
                let highestPricePercentage = ((latestPrice - athPrice) / athPrice) * 100;

                console.log("getHighPrice athPrice highestPricePercentage: ", highestPricePercentage);
          
               let currentBtcPrice = null;

                try {
                    let getCurrentBtcPrice = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);

                    if (getCurrentBtcPrice.data === undefined || getCurrentBtcPrice.data.data.market_data === undefined) {
                        throw new Error("Data undefined");
                    }

                    if (coinId === 'BTC') {
                        currentBtcPrice = (getCurrentBtcPrice.data.data.market_data.price_usd).toFixed(2);
                    } else if (getCurrentBtcPrice.data.data.market_data.price_btc !== null) {
                        currentBtcPrice = (getCurrentBtcPrice.data.data.market_data.price_btc).toFixed(10);
                    } else {
                        let getCurrentBtcPriceData = await axios.get(
                            `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                        );

                        console.log("value.USD.PRICE latestPrice: ", latestPrice);
                        console.log("cryptocompare getCurrentBtcPriceData: ", getCurrentBtcPriceData.data.USD);
                        let currentBtc = getCurrentBtcPriceData.data.USD;
                        currentBtcPrice = latestPrice / currentBtc;
                        console.log("cryptocompare currentBtcPrice: ", currentBtcPrice);
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404 || error.message === "Data undefined") {
                        let getCurrentBtcPriceData = await axios.get(
                            `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                        );

                        let getCurrentBtcPrice = await axios.get(
                            `https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=BTC&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                        );

                        if (coinId === 'BTC') {
                            currentBtcPrice = (getCurrentBtcPriceData.data.USD).toFixed(2);
                        } else if (getCurrentBtcPrice.data.BTC !== null) {
                            currentBtcPrice = (getCurrentBtcPrice.data.BTC).toFixed(10);
                        } else {
                          console.log("value.USD.PRICE latestPrice: ", latestPrice);
                            console.log("cryptocompare getCurrentBtcPriceData: ", getCurrentBtcPriceData.data.USD);

                            let currentBtc = getCurrentBtcPriceData.data.USD;

                            currentBtcPrice = latestPrice / currentBtc;
                            console.log("cryptocompare currentBtcPrice: ", currentBtcPrice);
                        }
                    } else {
                        console.error("An error occurred:", error);
                    }
                }


                async function yearAgoPriceByBTC(coinId, coinName) {
                  coinId = coinId.toLowerCase();
                  coinName = coinName.toLowerCase();
              
                  let endDate = new Date().toISOString().split('T')[0];
                  let yearDate = new Date();
                  yearDate.setFullYear(yearDate.getFullYear() - 1);
                  let yearDateFormatted = yearDate.toISOString().split('T')[0]; // Formatted start date
              
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
              
                      if (coinId === 'BTC') {
                          return { btcPrice1YearAgo, yearAgoBtcPrice: btcPrice1YearAgo };
                      }
              
                      let getYearAgoUSDPrice = await axios.get(
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
              
                      let btcPrice = getYearAgoBtcPrice.data.data.values[0];
                      let coinSlugRaw = getYearAgoUSDPrice.data.data.slug;
                      let coinSlug = coinSlugRaw.replace(/-/g, '');
                      let coinSymbolRaw = getYearAgoUSDPrice.data.data.symbol;
                      let coinSymbol = coinSymbolRaw.toLowerCase();
              
                      let coinPrice = 0;
                      let yearAgoBtcPrice = 0;
              
                      console.log("yearAgoPriceByBTC getYearAgoUSDPrice data " + coinId + ": ", getYearAgoUSDPrice.data);
                      console.log("yearAgoPriceByBTC getYearAgoUSDPrice coinName coinSlugRaw " + coinName + ": ", coinSlugRaw);
                      console.log("yearAgoPriceByBTC getYearAgoUSDPrice coinName coinSlug " + coinName + ": ", coinSlug);
                      console.log("yearAgoPriceByBTC getYearAgoUSDPrice coinId coinSymbol " + coinId + ": ", coinSymbol);
              
                      if (getYearAgoUSDPrice.data.data.values !== null &&
                          (coinName === coinSlugRaw || coinName.includes(coinSlug)) && coinId === coinSymbol) {
              
                          console.log("yearAgoPriceByBTC getYearAgoUSDPrice data.data " + coinId + ": ", getYearAgoUSDPrice.data.data);
              
                          coinPrice = getYearAgoUSDPrice.data.data.values[0][4];
              
                          console.log("yearAgoPriceByBTC getYearAgoUSDPrice.data coinPrice " + coinId + ": ", coinPrice);
                      }
              
                      if (coinPrice !== 0) {
                          // Calculate price in BTC
                          yearAgoBtcPrice = coinPrice / btcPrice[4];
              
                      } else {
                          // Fallback to CryptoCompare API
                          let getYearAgoBtcPriceFromCC = await axios.get(
                              `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=BTC&limit=365&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                          ); 
                          
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
                      console.error('yearAgoPriceByBTC An error occurred:', error);
                      throw error;
                  }
              }             

                async function getNinetyDaysAgoPrice(coinId, coinName) {
                  try {

                      const threeMonthsDate = new Date();
                      threeMonthsDate.setDate(threeMonthsDate.getDate() - 90);
                      const threeMonthsDateFormatted = threeMonthsDate.toISOString().split('T')[0];
                      const endDate = new Date().toISOString().split('T')[0]; // Assuming endDate is today
              
                      console.log("3 month Attempting to fetch data from Messari API for coin:", coinId);
              
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
              
                      let ninetyDaysAgoPrice = null;
              
                      let coinSlugRaw = response.data.data.slug;
                      let coinSlug = coinSlugRaw.replace(/-/g, '');
                      let coinSymbolRaw = response.data.data.symbol;
                      let coinSymbol = coinSymbolRaw.toLowerCase();

                      console.log("3 month coin "+coinId+" response: ",response);

                      console.log("3 month coin coinName "+coinName+" coinSlugRaw: ",coinSlugRaw);

                      console.log("3 month coin coinName "+coinName+" coinSlug: ",coinSlug);

                      console.log("3 month coin coinId "+coinId+" coinSymbolRaw: ",coinSymbolRaw);

                      console.log("3 month coin coinId "+coinId+" coinSymbol: ",coinSymbol);

              
                      if (response.data.data.values.length > 0 &&
                          (coinName === coinSlugRaw || coinName.includes(coinSlug)) &&
                          coinId.toLowerCase() === coinSymbol) {
                          console.log("3 month coin coinId "+coinId+" values: ",response.data.data.values);
                          const threeMonthPriceData = response.data.data.values[0];
                          ninetyDaysAgoPrice = parseFloat(threeMonthPriceData[4]).toFixed(10); 
                      } else {
                          console.log("3 month No data found in the response from Messari for the specified coin ID:", coinId);
                          console.log("3 month Attempting to fetch data from CryptoCompare API for coin:", coinId);
              
                          response = await axios.get(
                              `https://min-api.cryptocompare.com/data/v2/histoday`,
                              {
                                  params: {
                                      fsym: coinId,
                                      tsym: 'USD',
                                      limit: 90,
                                      api_key: 'de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa'
                                  }
                              }
                          );
              
                          const ninetyDaysAgoTimestamp = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
                          const priceData = response.data.Data.Data;
              
                          for (let dayData of priceData) {
                            
                            console.log("3 month ninetyDaysAgoPrice ninetyDaysAgoTimestamp " + coinId + ": ", ninetyDaysAgoTimestamp);
                            console.log("3 month ninetyDaysAgoPrice time " + coinId + ": ", dayData.time);
                              if (dayData.time === ninetyDaysAgoTimestamp || dayData.close !== 0) {
                                  ninetyDaysAgoPrice = parseFloat(dayData.close).toFixed(10);
                                  break;
                              }
                          }                                                    

                      } 

                      console.log("3 month ninetyDaysAgoPrice " + coinId + ": ", ninetyDaysAgoPrice);
              
                      if (ninetyDaysAgoPrice === null || isNaN(ninetyDaysAgoPrice) === true) {
                          throw new Error("Error fetching data from Messari and CryptoCompare");
                      } else {
                        return ninetyDaysAgoPrice;
                      }
              
                  } catch (error) {
                      console.log("3 month Error fetching data from Messari and CryptoCompare, falling back to CoinPaprika API:", error.message);
              
                      const ninetyDaysAgoDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      console.log("3 month Attempting to fetch data from CoinPaprika API for coin:", coinId);                
              
                      try {
                          coinId = coinId.toLowerCase();
                          coinName = coinName.toLowerCase();
                          let ninetyDaysAgoPrice = null;

                          let response = await axios.get(
                              `https://api.coinpaprika.com/v1/tickers/${coinId}-${coinName}/historical?start=${ninetyDaysAgoDate}&interval=1d`
                          );
              
                          if (response.data && response.data.length > 0) {
                              ninetyDaysAgoPrice = parseFloat(response.data[0].price).toFixed(10);                              
                          } 

                        return ninetyDaysAgoPrice; 
                          
                      } catch (coinPaprikaError) {
                          console.log("3 month Error fetching data from CoinPaprika API:", coinPaprikaError.message);
                          throw coinPaprikaError;
                      }                 
                  }
              }
              

                const ninetyDaysAgoPrice = await getNinetyDaysAgoPrice(coinId, coinName);

                console.log("3 month ninetyDaysAgoPrice Return "+coinId+": ",ninetyDaysAgoPrice);
                
                let oneYearBTCPercentChange = null;
                let oneYearBTCPriceChange = null;
                let yearAgoBtcPrice = null;
                let btcPrice1YearAgo = null;
 
                let yearAgoBtcPriceResult = await yearAgoPriceByBTC(coinId, coinName);

                yearAgoBtcPrice = parseFloat(yearAgoBtcPriceResult.yearAgoBtcPrice);
                btcPrice1YearAgo = parseFloat(yearAgoBtcPriceResult.btcPrice1YearAgo); 

                if(yearAgoBtcPrice > 0.00000001 ){
                  yearAgoBtcPrice = yearAgoBtcPrice.toFixed(8);
                } else if(yearAgoBtcPrice > 0 ){
                  yearAgoBtcPrice = yearAgoBtcPrice.toFixed(16);
                } else {
                  yearAgoBtcPrice = yearAgoBtcPrice.toFixed(18);
                }

                if(btcPrice1YearAgo > 0.00000001 ){
                  btcPrice1YearAgo = btcPrice1YearAgo.toFixed(8);
                } else if(btcPrice1YearAgo > 0 ){
                  btcPrice1YearAgo = btcPrice1YearAgo.toFixed(16);
                } else {
                  btcPrice1YearAgo = btcPrice1YearAgo.toFixed(18);
                }

                console.log("yearAgoBtcPrice Return yearAgoBtcPrice "+coinId+": ",yearAgoBtcPrice);
                console.log("yearAgoBtcPrice Return btcPrice1YearAgo "+coinId+": ",btcPrice1YearAgo);
    
                if (yearAgoBtcPrice === null || yearAgoBtcPrice === 0) { 
            
                  btcChangeScore = 0;               
                  btcPercentScore = 0;

                  oneYearBTCPercentChange = "N/A";   
                  oneYearBTCPriceChange = "N/A";

                  console.log("yearAgoBtcPrice PercentChange yearAgoBtcPrice "+coinId+": ",yearAgoBtcPrice);
                  console.log("yearAgoBtcPrice PercentChange oneYearBTCPriceChange"+coinId+": ",oneYearBTCPriceChange);
                  console.log("yearAgoBtcPrice PercentChange "+coinId+": ",oneYearBTCPercentChange);

                } else if (yearAgoBtcPrice === 1) { 
   
                  oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(btcPrice1YearAgo);
                  oneYearBTCPercentChange = (oneYearBTCPriceChange / btcPrice1YearAgo) * 100; 

                  if (oneYearBTCPriceChange > 0.0000001) {
                    btcChangeScore = 1;
                  } else {
                    btcChangeScore = 0;
                  }
                  if (oneYearBTCPercentChange > 0.2) {
                    btcPercentScore = 2;
                  } else {
                    btcPercentScore = 0;
                  }

                  console.log("yearAgoBtcPrice PercentChange yearAgoBtcPrice "+coinId+": ",yearAgoBtcPrice);
                  console.log("yearAgoBtcPrice PercentChange currentBtcPrice "+coinId+": ",currentBtcPrice);
                  console.log("yearAgoBtcPrice PercentChange oneYearBTCPriceChange"+coinId+": ",oneYearBTCPriceChange);
                  console.log("yearAgoBtcPrice PercentChange "+coinId+": ",oneYearBTCPercentChange);

                }  else {

                  oneYearBTCPriceChange = parseFloat(currentBtcPrice) - parseFloat(yearAgoBtcPrice); 
                  oneYearBTCPercentChange = (oneYearBTCPriceChange / yearAgoBtcPrice) * 100;  
        
                  if (oneYearBTCPriceChange > 0.000001) {
                    btcChangeScore = 1;
                  } else {
                    btcChangeScore = 0;
                  }
                  if (oneYearBTCPercentChange > 0.2) {
                    btcPercentScore = 2;
                  } else {
                   btcPercentScore = 0;
                   }
                   console.log("yearAgoBtcPrice PercentChange yearAgoBtcPrice "+coinId+": ",yearAgoBtcPrice);
                   console.log("yearAgoBtcPrice PercentChange currentBtcPrice "+coinId+": ",currentBtcPrice);
                   console.log("yearAgoBtcPrice PercentChange oneYearBTCPriceChange"+coinId+": ",oneYearBTCPriceChange);
                   console.log("yearAgoBtcPrice PercentChange "+coinId+": ",oneYearBTCPercentChange);
              } 
                
              if (oneYearBTCPriceChange !== "N/A") {

                  if (parseFloat(oneYearBTCPriceChange) > 0.00000001) {
                    oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(8);
                  } else if (parseFloat(oneYearBTCPriceChange) > 0) {
                    oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(14);
                  } else {
                    oneYearBTCPriceChange = oneYearBTCPriceChange.toFixed(4);
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
                            
                    let coinSlugRaw = inceptionDataResponse.data.data.slug;
                    let coinSlug = coinSlugRaw.replace(/-/g, '');

                    let coinSymbolRaw = inceptionDataResponse.data.data.symbol;
                    let coinSymbol = coinSymbolRaw.toLowerCase();

                    console.log("inceptionPrices using messari coinName coinSlug " + coinName + ": ", coinSlug); 
                    console.log("inceptionPrices using messari coinId coinSymbol " + coinId.toLowerCase() + ": ", coinSymbol);  
                    console.log("inceptionPrices using messari coinName coinSymbol " + coinName + ": ", coinSymbol);               
                
                    // Update to check if coinSymbol equals coinName or is a part of coinName
                    if ( (coinName === coinSlugRaw || coinName.includes(coinSlug) ) && coinId.toLowerCase() === coinSymbol) {
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

              console.log("inceptionPrices oustside function for length "+coinId+": ",inceptionPrices.inceptionPrice);
              console.log("inceptionPrices oustside function for 10 year "+coinId);

              if(inceptionPrices.inceptionPrice === null){
                inceptionPrices = await getInception(coinId, coinName, 5); 
                console.log("inceptionPrices oustside function for 5 year "+coinId+": ",inceptionPrices.inceptionPrice);
              }
              if(inceptionPrices.inceptionPrice === null){
                inceptionPrices = await getInception(coinId, coinName, 3);
                console.log("inceptionPrices oustside function for 3 year "+coinId+": ",inceptionPrices.inceptionPrice);
              }
              if(inceptionPrices.inceptionPrice === null){
                inceptionPrices = await getInception(coinId, coinName, 2);
                console.log("inceptionPrices oustside function for 2 year "+coinId+": ",inceptionPrices.inceptionPrice);
              }
              if(inceptionPrices.inceptionPrice === null){
                inceptionPrices = await getInception(coinId, coinName, 1);  
                console.log("inceptionPrices oustside function for 1 year "+coinId+": ",inceptionPrices.inceptionPrice);  
              } else {
                console.log("inceptionPrices oustside function for "+coinId+": ",inceptionPrices.inceptionPrice);
              }
  
              console.log("value.USD.PRICE inceptionPriceChange latestPrice: ", latestPrice);
              
              let inceptionPriceChange =  ((latestPrice - inceptionPrices.inceptionPrice) / inceptionPrices.inceptionPrice) * 100;

              let maxChartGrade = null;

              if (parseFloat(inceptionPriceChange) >= 800) {
                maxChartGrade = 'A';
              } else if (parseFloat(inceptionPriceChange) >= 500){
                maxChartGrade = 'B';
              } else if (parseFloat(inceptionPriceChange) >= 100){
                maxChartGrade = 'C';
              } else if (parseFloat(inceptionPriceChange) >= 50){
                maxChartGrade = 'D';
              } else if (parseFloat(inceptionPriceChange) < 50){
                maxChartGrade = 'F';
              }

              if (parseFloat(inceptionPriceChange) >= 500) {
                maxGradeScore = 2;
              } else if (parseFloat(inceptionPriceChange) < 500){
                maxGradeScore = 1;
              } else if (parseFloat(inceptionPriceChange) < 100){
                maxGradeScore = 0;
              }        
              
              async function getOneYearPercentChange(coinId, coinName, latestPrice) {
                let oneYearAgoPrice = null;
              
                // Attempt to fetch data from CryptoCompare
                try {
                  const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=365&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
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

                let ninetyDaysPercentChange = null;

                console.log("value.USD.PRICE ninetyDaysPriceChange latestPrice "+coinId+": ", latestPrice);

                console.log("3 month percentage ninetyDaysAgoPrice "+coinId+": ", ninetyDaysAgoPrice);            

                if (ninetyDaysAgoPrice !== null && isNaN(ninetyDaysAgoPrice) === false){

                  let ninetyDaysPriceChange = parseFloat(latestPrice) - parseFloat(ninetyDaysAgoPrice);
                  ninetyDaysPriceChange = ninetyDaysPriceChange.toFixed(10);

                  ninetyDaysPercentChange = (ninetyDaysPriceChange / ninetyDaysAgoPrice) * 100;

                  console.log("3 month percentage ninetyDaysPercentChange "+coinId+": ", ninetyDaysPercentChange);

                }             

                if (ninetyDaysPercentChange > 0.14 && ninetyDaysPercentChange !== null ) {
                  threeMonthsPercentScore = 1;
                } else {
                  threeMonthsPercentScore = 0;
                }

                let getCoinData = await api.get(
                  `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
                );

                if (getCoinData.data) {
                  

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

                    if (twitterURL.length > 1) {
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

                  if (total > 3) {

                    buyrating = 1;
                    sellrating = 0;

                  } else {

                    sellrating = 1;
                    buyrating = 0;

                  }

                  if (highestPricePercentage <= -0.75) {

                    buyHighPercentScore = 2;
                    sellHighPercentScore = 0;

                  } else if (highestPricePercentage >= -0.55) {

                    sellHighPercentScore = 2;
                    buyHighPercentScore = 0;

                  }

                  let totalbuyrating = buyrating + buyHighPercentScore;
                  let totalsellrating = sellrating + sellHighPercentScore;

                    if (totalbuyrating > totalsellrating) {

                      buysellrating = totalbuyrating;

                      if (buysellrating > 2 && ninetyDaysPercentChange < 0.40) {
                        buysell = "BUY";
                      } else {
                        buysell = "HODL";
                      }

                    } else if (totalsellrating > totalbuyrating) {

                      buysellrating = totalsellrating;

                      if (buysellrating > 3 && ninetyDaysPercentChange > 0.50) {
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

                  console.log("coinMarketCap cryptocompare before: "+coinId+": ",value.USD.MKTCAP); 

                  let coinMarketCap = parseInt(value.USD.MKTCAP);
                  
                  async function fetchMarketCapWhenZero(coinId, coinName) {
                    try {
                        // Step 1: Attempt to fetch coin data from Messari
                        try {
                            console.log("Messari market cap Fetching market cap from Messari for coin: " + coinId);
                            const messariResponse = await axios.get(`https://data.messari.io/api/v1/assets/${coinId}/metrics`);
                            const messariMarketCap = messariResponse.data.data.marketcap.current_marketcap_usd;
                            console.log("Messari market cap for " + coinId + ": ", messariMarketCap);
                            
                            if (messariMarketCap !== 0 && messariMarketCap !== null) {
                                return messariMarketCap;
                            }
                        } catch (error) {
                            console.error('Messari market cap Error fetching data from Messari', error);
                        }
                
                        // Step 2: If Messari data is unavailable or market cap is zero, attempt to fetch coin data from CoinLore
                        try {
                            console.log("CoinLore market cap from CoinLore for coin: " + coinId);
                            const coinLoreResponse = await axios.get('https://api.coinlore.net/api/tickers/');
                            const coinLoreData = coinLoreResponse.data.data;
                            const coin = coinLoreData.find(coin => coin.symbol === coinId || coin.name === coinName);
                            console.log("CoinLore coin: " + coinId + ": ", coin);
                
                            if (coin) {
                                const coinLoreMarketCap = coin.market_cap_usd;
                                console.log("CoinLore market cap for " + coinId + ": ", coinLoreMarketCap);
                                
                                if (coinLoreMarketCap !== 0) {
                                    return coinLoreMarketCap;
                                }
                            }
                        } catch (error) {
                            console.error('CoinLore market cap Error fetching data from CoinLore', error);
                        }
                
                        //Step 3: If both Messari and CoinLore data are unavailable or market cap is zero, fallback to CoinPaprika
                        try {

                            console.log("CoinPaprika market cap Fetching coin details from coinlore for coin: " + coinId + " or " + coinName);         

                            const allCoinsResponse = await axios.get('https://api.coinpaprika.com/v1/coins');
                            const allCoins = allCoinsResponse.data;
                            const coin = allCoins.find(coin => coin.symbol === coinId || coin.name === coinName);

                            console.log("CoinPaprika market cap coin: " + coinId + ": ", coin);
                
                            if (coin) {
                                const coinPaprikaId = coin.id;
                                try {
                                    const coinDetailsResponse = await axios.get(`https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`);
                                    const coinDetails = coinDetailsResponse.data;
                                    const coinPaprikaMarketCap = coinDetails.quotes.USD.market_cap;
                                    console.log("CoinPaprika market cap for " + coinId + ": ", coinPaprikaMarketCap);
                                    
                                    return coinPaprikaMarketCap;
                                } catch (error) {
                                    if (error.response && error.response.status === 402) {
                                        console.error('CoinPaprika market cap 402 Payment Required error encountered', error);
                                    } else {
                                        throw error; // Re-throw if it's not a 402 error
                                    }
                                }
                            } else {
                                console.warn("CoinPaprika market cap Coin not found in CoinPaprika for coinId: " + coinId + " or coinName: " + coinName);
                                return null;
                            }
                        } catch (error) {
                            console.error('Error fetching data from CoinLore', error);
                        }
                    } catch (error) {
                        console.error('Error fetching market cap', error);
                        return null;
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

                  if (coinCurrentPrice > 0.00000001) {
                    coinCurrentPrice = coinCurrentPrice.toFixed(8);
                  } else {
                    coinCurrentPrice = coinCurrentPrice.toFixed(12);
                  }

                  if (oneYearBTCPercentChange !== "N/A") {

                    if (parseFloat(oneYearBTCPercentChange) > 0) {
                      oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(4);
                    } else {
                      oneYearBTCPercentChange = oneYearBTCPercentChange.toFixed(8);
                    }    
                   
                  }   
                  
                  console.log("ninetyDaysPercentChange 0: ",ninetyDaysPercentChange);

                  if( isNaN(ninetyDaysPercentChange) === false && ninetyDaysPercentChange !== null){

                    if (parseFloat(ninetyDaysPercentChange) > 0) {
                      ninetyDaysPercentChange = ninetyDaysPercentChange.toFixed(4);
                    } else {
                      ninetyDaysPercentChange = ninetyDaysPercentChange.toFixed(8);
                    }

                    console.log("ninetyDaysPercentChange 1: ",ninetyDaysPercentChange);

                  }

                  if( isNaN(highestPricePercentage) === false && highestPricePercentage !== null){

                    if (parseFloat(highestPricePercentage) > 0) {
                      highestPricePercentage = highestPricePercentage.toFixed(4);
                    } else {
                      highestPricePercentage = highestPricePercentage.toFixed(8);
                    }                 

                  }

                  console.log("inceptionPriceChange 0: ",inceptionPriceChange);
                  if( isNaN(inceptionPriceChange) === false && inceptionPriceChange !== null){

                    if (parseFloat(inceptionPriceChange) > 0) {
                      inceptionPriceChange = inceptionPriceChange.toFixed(4);
                    } else {
                      inceptionPriceChange = inceptionPriceChange.toFixed(8);
                    }
                    console.log("inceptionPriceChange 1: ",inceptionPriceChange);

                  }


                  let coinCurrentVol = value.USD.TOTALVOLUME24HTO;         
                  coinCurrentVol = parseInt(coinCurrentVol);           
          
                  coinData.push({
                    id: coinId,
                    name: coinName.toUpperCase(),
                    current_price: coinCurrentPrice,
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

                  console.log("coinData: ",coinData);

                  setCoinData(coinData);
                  setIsLoading(false);

                }
              }

            } else {
              console.log("Error retrieving coin data");
            }
          }
      } catch (error) {
          console.log(error);
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
      try {
        const portfolios = await api.get("http://localhost:3006/portfolios");
        for (const portfolio of portfolios.data) {
          const updatedAnalysis = portfolio.analysis.filter(item => item.coinName !== coinName);
          const updatedPortfolio = { ...portfolio, analysis: updatedAnalysis };
          await api.put(`http://localhost:3006/portfolios/${portfolio.id}`, updatedPortfolio);
        }
        setAnalysisCoins(prevCoins => prevCoins.filter(coin => coin.coinName !== coinName));
        GetAnalysisCoins();
      } catch (error) {
        console.error("Error removing coin:", error);
      }
    }

// Asynchronous function to handle changes in input fields related to a specific coin
async function handleInputChange(e, coinId) {
  try {
      // Log the coinId to the console for debugging purposes
      console.log("coinId: " + coinId);
      
      // Check if the input value is an empty string
      if (e === '') {
          // Update the state to set the value of the specified coin input field to an empty string
          setCoinInputValues((prevInputValues) => ({
              ...prevInputValues,  // Spread the previous input values
              [coinId]: ''         // Set the current coinId value to an empty string
          }));
      } else {
          // Determine the new value; if 'e' is not a number, set it to 0
          const newValue = !isNaN(e) ? e : 0;
          
          // Update the state with the new value for the specified coin input field
          setCoinInputValues((prevInputValues) => ({
              ...prevInputValues,  // Spread the previous input values
              [coinId]: newValue,  // Set the current coinId value to the new value
          }));
      }
  } catch (error) {
      // Log any errors that occur during the execution of the try block
      console.log(error);
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

  console.log("sortedCoins: ", sortedCoins.length);

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
                className={`headerCell ${sortBy === "ninetyDaysPercentChange" ? "active" : ""}`}
                align="left"
                onClick={() => handleSort("ninetyDaysPercentChange")}
              >
                3 Months % Change{" "}
              </div>
              <div
                className={`headerCell ${sortBy === "inceptionPriceChange" ? "active" : ""}`}
                align="left"
                onClick={() => handleSort("inceptionPriceChange")}
              >
                Inception Est. % Change{" "}
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