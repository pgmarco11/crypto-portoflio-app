import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../api/portfolios";

function Analysis() {

  const [analysisCoins, setAnalysisCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noCoins, setNoCoins] = useState(false);
  const [coinData, setCoinData] = useState([]);
  const [marketCapSortOrder, setMarketCapSortOrder] = useState(null);
  const [volumeSortOrder, setVolumeSortOrder] = useState(null);
  const [USD1YRSortOrder, setUSD1YRSortOrder] = useState(null);
  const [BTC1YRSortOrder, setBTC1YRSortOrder] = useState(null);
  const [BTC1YrPriceSortOrder, setBTC1YrPriceSortOrder] = useState(null);
  const [inPriceChangeSortOrder, setInPriceChangeSortOrder] = useState(null);
  const [threeMonthsChangeSortOrder, setThreeMonthsChangeSortOrder] = useState(null);
  const [maxGradeSortOrder, setMaxGradeSortOrder] = useState(null);
  const [futurePredSortOrder, setFuturePredSortOrder] = useState(null);
  const [avgGainPredSortOrder, setAvgGainPredSortOrder] = useState(null);
  const [gainPrediction, setGainPrediction] = useState(0);
  const [avgGainPrediction, setAvgGainPrediction] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [highestPrice, setHighestPrice] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSortByMarketCap = () => {
    setMarketCapSortOrder(marketCapSortOrder === "asc" ? "desc" : "asc");
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null);
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };

  const handleSortByVolume = () => {
    setVolumeSortOrder(volumeSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };  
  
  const handleSortByUSD1YR = () => {
    setUSD1YRSortOrder(USD1YRSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  }

  const handleSortByBTC1YR = () => {
    setBTC1YRSortOrder(BTC1YRSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };  

  const handleSortByBTC1YrPrice = () => {
     setBTC1YrPriceSortOrder(BTC1YrPriceSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setInPriceChangeSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };  
  const handleSortByInPriceChange = () => {
    setInPriceChangeSortOrder(inPriceChangeSortOrder === "asc" ? "desc" : "asc");
   setMarketCapSortOrder(null);
   setVolumeSortOrder(null);
   setUSD1YRSortOrder(null)
   setBTC1YRSortOrder(null);
   setBTC1YrPriceSortOrder(null);
   setInPriceChangeSortOrder(null);
   setMaxGradeSortOrder(null);
   setFuturePredSortOrder(null);
   setAvgGainPredSortOrder(null);
  };  
  const handleSortByThreeMonthChange = () => {
    setThreeMonthsChangeSortOrder(threeMonthsChangeSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setMaxGradeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };  
  const handleSortByMaxGrade = () => {
    setMaxGradeSortOrder(maxGradeSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setThreeMonthsChangeSortOrder(null);
    setFuturePredSortOrder(null);
    setAvgGainPredSortOrder(null);
  };  
  const handleSortFutureGain = () => {
    setFuturePredSortOrder(futurePredSortOrder === "asc" ? "desc" : "asc");
    setMaxGradeSortOrder(null);
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setThreeMonthsChangeSortOrder(null);
    setAvgGainPredSortOrder(null);
  };
  
  const handleAvgFutureGain = () => {
    setAvgGainPredSortOrder(avgGainPredSortOrder === "asc" ? "desc" : "asc");
    setFuturePredSortOrder(null);
    setMaxGradeSortOrder(null);
    setMarketCapSortOrder(null);
    setVolumeSortOrder(null);
    setUSD1YRSortOrder(null)
    setBTC1YRSortOrder(null);
    setBTC1YrPriceSortOrder(null);
    setInPriceChangeSortOrder(null);
    setThreeMonthsChangeSortOrder(null);
  };

    const sortedCoins = coinData
    ? coinData.slice().sort((a, b) => {
      const marketCapA = parseInt(a.marketCap.replace(/,/g, ''));
      const marketCapB = parseInt(b.marketCap.replace(/,/g, ''));
      const volumeA = parseInt(a.volume.replace(/,/g, ''));
      const volumeB = parseInt(b.volume.replace(/,/g, ''));
      const oneYearA = parseFloat(a.oneYearPercentChange.replace(/,/g, ''));
      const oneYearB = parseFloat(b.oneYearPercentChange.replace(/,/g, '')); 
      const btcOneYearA = parseFloat(a.oneYearBTCPercentChange.replace(/,/g, ''));
      const btcOneYearB = parseFloat(b.oneYearBTCPercentChange.replace(/,/g, ''));   
      const btcOneYearPriceA = parseFloat(a.oneYearBTCPriceChange.replace(/,/g, ''));
      const btcOneYearPriceB = parseFloat(b.oneYearBTCPriceChange.replace(/,/g, ''));   
      const inceptionPriceChangeA = parseFloat(a.inceptionPriceChange.replace(/,/g, ''));
      const inceptionPriceChangeB = parseFloat(b.inceptionPriceChange.replace(/,/g, '')); 
      const ninetyDaysPercentChangeA = parseFloat(a.ninetyDaysPercentChange.replace(/,/g, ''));
      const ninetyDaysPercentChangeB = parseFloat(b.ninetyDaysPercentChange.replace(/,/g, ''));     
      const maxGradeA = a.maxChartGrade;
      const maxGradeB = b.maxChartGrade;
      let gainPredictionA = 0;
      let gainPredictionB = 0;
      let avgGainPredictionA = 0;
      let avgGainPredictionB = 0;

      console.log("A gainPrediction: "+a.prediction);
      console.log("B gainPrediction: "+b.prediction);

      if( parseFloat(a.prediction) > 0 && parseFloat(b.prediction) > 0  ){
         gainPredictionA = parseFloat(a.gainPrediction.replace(/,/g, ''));
         gainPredictionB = parseFloat(b.gainPrediction.replace(/,/g, ''));
         avgGainPredictionA = parseFloat(a.avgGainPrediction.replace(/,/g, ''));
         avgGainPredictionB = parseFloat(b.avgGainPrediction.replace(/,/g, ''));
      }    
      
      if (marketCapSortOrder === "asc") {
        return marketCapA - marketCapB;
      } else if (marketCapSortOrder === "desc") {
        return marketCapB - marketCapA;
      } else if (volumeSortOrder === "asc") {
        return volumeA - volumeB;
      } else if (volumeSortOrder === "desc") {
        return volumeB - volumeA;
      } else if (USD1YRSortOrder === "asc") {
          return oneYearA - oneYearB;
      } else if (USD1YRSortOrder === "desc") {
          return oneYearB - oneYearA;
      } else if (BTC1YRSortOrder === "asc") {
            return btcOneYearA - btcOneYearB;
      } else if (BTC1YRSortOrder === "desc") {
            return btcOneYearB - btcOneYearA;
      } else if (BTC1YrPriceSortOrder === "asc") {
            return btcOneYearPriceA - btcOneYearPriceB;
      } else if (BTC1YrPriceSortOrder === "desc") {
            return btcOneYearPriceB - btcOneYearPriceA;
      } else if (inPriceChangeSortOrder === "asc") {
            return inceptionPriceChangeA - inceptionPriceChangeB;
      } else if (inPriceChangeSortOrder === "desc") {
            return inceptionPriceChangeB - inceptionPriceChangeA;
      } else if (threeMonthsChangeSortOrder === "asc") {
            return ninetyDaysPercentChangeA - ninetyDaysPercentChangeB;
      } else if (threeMonthsChangeSortOrder === "desc") {
            return ninetyDaysPercentChangeB - ninetyDaysPercentChangeA;
      } else if (maxGradeSortOrder === "asc") {
            return maxGradeA.localeCompare(maxGradeB);
      } else if (maxGradeSortOrder === "desc") {
            return maxGradeB.localeCompare(maxGradeA);
      } else if (futurePredSortOrder === "asc") {
            return gainPredictionA - gainPredictionB;
      } else if (futurePredSortOrder === "desc") {
            return gainPredictionB - gainPredictionA;
      } else if (avgGainPredSortOrder === "asc") {
            return avgGainPredictionA - avgGainPredictionB;
      } else if (avgGainPredSortOrder === "desc") {
            return avgGainPredictionB - avgGainPredictionA;
      } else {
            return 0;
      }
    }) : [];
  
  const handleInputChange = (event, coinId, totalScore, newGainPrediction, newAvgGainPrediction) => {
    
    setInputValue(event);

    console.log("newGainPrediction: "+parseFloat(newGainPrediction));
    console.log("newAvgGainPrediction: "+parseFloat(newAvgGainPrediction));

    console.log("Object.values in input change"+Object.values(coinData.find(coin => coin.id === coinId))[3])


        // Check if the new input value is the opposite of the previous input value
        if (inputValue !== !Object.values(coinData.find(coin => coin.id === coinId))[3]) {
          let newGainPredictionScore = 0;
          let newAvgGainPredictionScore = 0;
    
          // Calculate new rating with updated scores
          if (parseFloat(newGainPrediction) > 0.02) {
            newGainPredictionScore = 2;
          } 
          if (parseFloat(newAvgGainPrediction) > 0.02 && parseFloat(newAvgGainPrediction) !== null) {
            newAvgGainPredictionScore = 1;
          } 
          
          const rating = totalScore - newGainPredictionScore - newAvgGainPredictionScore;


          console.log("totalScore: "+totalScore);
          console.log("newGainPredictionScore: "+newGainPredictionScore);
          console.log("newAvgGainPredictionScore: "+newAvgGainPredictionScore);
          console.log("rating: "+rating);
    
          const updatedCoinData = Object.values(coinData).map((coin) => {
            if (Object.values(coin)[0] === coinId) {
              return {
                ...coin,
                rating: rating,
                gainPrediction: 0,
                avgGainPrediction: 0,
              };
            }
            return coin;
          });
    
          setCoinData(updatedCoinData);

        } else {

          console.log("inputValue: " + Object.values(inputValue));


          console.log("coinData inputValue: " + coinData);
          const updatedCoinData = Object.values(coinData).map((coin) => {
            console.log("coin input: " + coin.id);
            console.log("inputValue: " + inputValue);
      
            if (Object.values(coin)[0] === coinId) {
              return {
                ...coin,
                prediction: inputValue,
              };
            }
            return coin;
          });
      
          setCoinData(updatedCoinData);

        }
        
  };

//   console.log("oneYearPercentChange: " + oneYearPercentChange);
//   console.log(" current_price: " +  current_price);
//   console.log("coinId: " + coinId);

  console.log("inputValue: " + inputValue);  
  console.log("before pred totalScore: " + totalScore);

  const handleCoinPrediction = (
    inputValue,
    current_price,
    coinId,
    oneYearPercentChange,
    totalScore
  ) => {

     let newGainPredictionScore = 0;
    let newAvgGainPredictionScore = 0;
    let newGainPrediction  = null
    let newAvgGainPrediction = null;
    let total = null;

    if (inputValue === !inputValue) {
       inputValue = 0;
       newGainPrediction = parseFloat(
        (inputValue - current_price) / current_price
      );   
    } else {
      newGainPrediction = parseFloat(
        (inputValue - current_price) / current_price
      );

    }
      
    console.log("newGainPrediction: " + newGainPrediction);

    if (oneYearPercentChange === "N/A") {
      newAvgGainPrediction = parseFloat((newGainPrediction + 0) / 2);
    } else {
      newAvgGainPrediction = parseFloat(
        (newGainPrediction + parseFloat(oneYearPercentChange) / 100) / 2
      );
    }  
      
    if (inputValue === !inputValue) {
      newGainPredictionScore = 0;
      newAvgGainPredictionScore = 0;

      console.log("input is empty");

      console.log("gainPrediction: " + gainPrediction);
      console.log("avgGainPrediction: " + avgGainPrediction);    

    } else {

      console.log("input is not empty");

      if (newGainPrediction > 0.02) {
        newGainPredictionScore = 2;
      } 
      if (newAvgGainPrediction > 0.02 && newAvgGainPrediction !== null) {
        newAvgGainPredictionScore = 1;
      } 

     total = totalScore + newGainPredictionScore + newAvgGainPredictionScore;

    console.log("new total: " + total);

    console.log("newGainPredictionScore: " + newGainPredictionScore);
    console.log("newAvgGainPredictionScore: " + newAvgGainPredictionScore);  

    }

    const updatedCoinData = Object.values(coinData).map((coin) => {
      console.log("coin: " + coin.id);

      if (Object.values(coin)[0] === coinId) {
        return {
          ...coin,
          gainPrediction: newGainPrediction.toLocaleString(undefined, {
            style: "percent",
          }),
          avgGainPrediction: newAvgGainPrediction.toLocaleString(undefined, {
            style: "percent",
          }),
          prediction: inputValue,
          rating: total,

        };
      }
      return coin;
    });

    setCoinData(updatedCoinData);

    
  };

  useEffect(() => {
    GetAnalysisCoins();
  }, []);


  const GetAnalysisCoins = async () => {
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

        console.log("coinNameAnalysis: " + coinNameAnalysis);   
        
        allAnalysisCoins.push({
          coinName: coinNameAnalysis,
          coinId: coinIdAnalysis,
        });
        console.log("analysisCoins.length: " + analysisCoins.length);
      }
    }

    console.log("allAnalysisCoins after loop: " + allAnalysisCoins);
    setAnalysisCoins(allAnalysisCoins);

    let allAnalysisCoinsArray = Object.keys(allAnalysisCoins);
    console.log("allAnalysisCoinsArray length: " + allAnalysisCoinsArray);


    if (allAnalysisCoinsArray.length === 0) {      
      setIsLoading(false);
      setNoCoins(true);
    } else {

      setNoCoins(false);
      setIsLoading(true);

      const allCoinNames = [];
      const allCoinIds = [];

      for (let a = 0; a < allAnalysisCoinsArray.length; a++) {
        console.log(
          "analysisCoins[a].coinName " + allAnalysisCoins[a].coinName
        );
        console.log("allAnalysisCoins[a].coinId " + allAnalysisCoins[a].coinId);
        allCoinNames.push(allAnalysisCoins[a].coinName);
        allCoinIds.push(allAnalysisCoins[a].coinId);
      }
      let allCoinNamesjoin = allCoinNames.join(",");
      let allCoinIdsjoin = allCoinIds.join(",");

      console.log("allCoinNamesjoin: " + allCoinNamesjoin);
      console.log("allCoinIdsjoin: " + allCoinIdsjoin);

      let allCoinNamesArray = Object.keys(allCoinNames);
      console.log("allCoinNamesArray length: " + allCoinNamesArray);

      if (allCoinNamesArray.length !== 0) {
        const marketChartData = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${allCoinNamesjoin}&price_change_percentage=30d%2C200d%2C1y`
        );

        const cache = {}; // initialize an empty cache object

        
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
          console.log("coinData.id: " + coinData.id);

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
  
          console.log(value.id+" highest price: "+highestPrice[1])         

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
          const getCurrentBtcPrice = await axios.get(
            `https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=BTC&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
          );
          const currentBtcPrice = getCurrentBtcPrice.data.BTC;

          let getYearAgoBtcPrice = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=BTC&limit=365&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
          );
          // const yearAgoBtcPrice = getYearAgoBtcPrice.data.Data.Data[0].close;

 

          let getYearAgoBtcPriceValues = getYearAgoBtcPrice.data.Data.Data;

          let yearAgoBtcPrice = null;

          if (getYearAgoBtcPriceValues !== undefined) {
            yearAgoBtcPrice = getYearAgoBtcPrice.data.Data.Data[0].close;
          } else {
            yearAgoBtcPrice = null;
          }


          console.log("yearAgoBtcPrice: "+yearAgoBtcPrice);

          let oneYearBTCPercentChange = null;
          let oneYearBTCPriceChange = null;

          if (yearAgoBtcPrice === null || yearAgoBtcPrice === 0) {
            oneYearBTCPercentChange = "N/A";
            oneYearBTCPriceChange = currentBtcPrice - 0;
            if (oneYearBTCPriceChange > 0.000000101) {
              btcChangeScore = 1;
            } else {
              btcChangeScore = 0;
            }
            btcPercentScore = 0;
          } else {
            oneYearBTCPercentChange =
              (currentBtcPrice - yearAgoBtcPrice) / yearAgoBtcPrice;
            oneYearBTCPriceChange = currentBtcPrice - yearAgoBtcPrice;
            if (oneYearBTCPriceChange > 0.000000101) {
              btcChangeScore = 1;
            }
            if (oneYearBTCPercentChange > 2.0) {
              btcPercentScore = 2;
            }
          }

          console.log("currentBtcPrice: "+currentBtcPrice);
          console.log("yearAgoBtcPrice: "+yearAgoBtcPrice);
          console.log("oneYearBTCPercentChange: "+oneYearBTCPercentChange);



          console.log("prices: " + market_chart_prices);
          console.log("earliestTimestamp: " + market_chart_prices[0][0]);

          const earliestTimestamp = market_chart_prices[2][0]; // timestamp of the first recorded price
          const earliestDate = new Date(earliestTimestamp); // convert timestamp to Date object
          let startyear = earliestDate.getFullYear();
          let startday = earliestDate.getDate();
          let startmonth = earliestDate.getMonth() + 2;

          console.log("startmonth: " + startmonth);

          if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
            console.log("startmonth 1: " + startmonth);
            if (startday >= 30) {
              startday = 28;
            }
          } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
            console.log("startmonth 2: " + startmonth);
            if (startday > 28) {
              startday = 1;
            }
          } else if (startmonth > 12) {
            startmonth = startmonth - 12;
            startyear = earliestDate.getFullYear() + 1;
            console.log("startmonth 3: " + startmonth);
          }

          startday = startday.length < 2 ? "0" + startday : startday;
          startmonth =
            startmonth.toString().length < 2 ? "0" + startmonth : startmonth;

          console.log("final startmonth: " + startmonth);

          let inceptionDate = startday + "-" + startmonth + "-" + startyear;

          console.log(
            value.id +
              " is stopping here for: " +
              "https://api.coingecko.com/api/v3/coins/" +
              value.id +
              "/history?date=" +
              inceptionDate
          );

          let startDateCoinData = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
          );

          let coinDataPass = startDateCoinData.data.market_data;

          console.log(
            value.id + " coinDataPass is stopping here for: " + coinDataPass
          );

          if (coinDataPass === undefined) {
            startmonth = earliestDate.getMonth() + 6;

            console.log("startmonth: " + startmonth);

            if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
              console.log("startmonth 1: " + startmonth);
              if (startday >= 30) {
                startday = 28;
              }
            } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
              console.log("startmonth 2: " + startmonth);
              if (startday > 28) {
                startday = 1;
              }
            } else if (startmonth > 12) {
              startmonth = startmonth - 12;
              startyear = earliestDate.getFullYear() + 1;
              console.log("startmonth 3: " + startmonth);
            }

            startday = startday.length < 2 ? "0" + startday : startday;
            startmonth =
              startmonth.toString().length < 2 ? "0" + startmonth : startmonth;

            console.log("final startmonth: " + startmonth);

            let inceptionDate = startday + "-" + startmonth + "-" + startyear;

            startDateCoinData = await axios.get(
              `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
            );

            coinDataPass = startDateCoinData.data.market_data;

            if (coinDataPass === undefined) {
              startmonth = earliestDate.getMonth() + 12;

              console.log("startmonth: " + startmonth);

              if ([2, 4, 6, 9, 10, 11].includes(startmonth)) {
                console.log("startmonth 1: " + startmonth);
                if (startday >= 30) {
                  startday = 28;
                }
              } else if ([1, 3, 5, 7, 8, 10, 12].includes(startmonth)) {
                console.log("startmonth 2: " + startmonth);
                if (startday > 28) {
                  startday = 1;
                }
              } else if (startmonth > 12) {
                startmonth = startmonth - 12;
                startyear = earliestDate.getFullYear() + 1;
                console.log("startmonth 3: " + startmonth);
              }

              startday = startday.length < 2 ? "0" + startday : startday;
              startmonth =
                startmonth.toString().length < 2
                  ? "0" + startmonth
                  : startmonth;

              console.log("final startmonth: " + startmonth);

              let inceptionDate = startday + "-" + startmonth + "-" + startyear;

              startDateCoinData = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`
              );
            }
          }

          let inceptionPriceChange =
            (value.current_price -
              startDateCoinData.data.market_data.current_price.usd) /
            startDateCoinData.data.market_data.current_price.usd;          

          if (inceptionPriceChange > 0.3) {
            inceptionPercentScore = 2;
            console.log("inceptionPercentScore: " + inceptionPercentScore);
          } else {
            inceptionPercentScore = 0;
            console.log("inceptionPercentScore: " + inceptionPercentScore);
          }

          let maxChartGrade = null;

          console.log(value.id+" inceptionPriceChange: " + inceptionPriceChange);

          if (parseFloat(inceptionPriceChange) >= 2.0) {
            console.log(value.id+" A : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "A";
            maxGradeScore = 2;
            console.log("maxGradeScore: " + maxGradeScore);
          } else if (parseFloat(inceptionPriceChange) >= 1.0 && parseFloat(inceptionPriceChange) < 2.0) {
            console.log(value.id+" B : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "B";
            maxGradeScore = 2;
            console.log("maxGradeScore: " + maxGradeScore);
          } else if (parseFloat(inceptionPriceChange) < 1.0 && parseFloat(inceptionPriceChange) > 0.24) {
            console.log(value.id+" C : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "C";
            maxGradeScore = 1;
            console.log("maxGradeScore: " + maxGradeScore);
          } else {
            console.log(value.id+" D : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "D";
            maxGradeScore = 0;
            console.log("maxGradeScore: " + maxGradeScore);
          }

          let oneYearPercentChange = value.price_change_percentage_1y_in_currency;

          if (oneYearPercentChange === null) {
            oneYearPercentChange = "N/A";
            oneYearPercentScore = 0;
            console.log("oneYearPercentScore: " + oneYearPercentScore);
          } else {
            oneYearPercentChange =
              value.price_change_percentage_1y_in_currency.toLocaleString(
                "en-US",
                { minimumFractionDigits: 4 }
              ) + "%";
            if (oneYearPercentChange > 2.0) {
              oneYearPercentScore = 2;
              console.log("oneYearPercentScore: " + oneYearPercentScore);
            }
          }

          let ninetyDaysPercentChange =
            (value.current_price - ninetyDaysAgoPrice) / ninetyDaysAgoPrice;

          if (ninetyDaysPercentChange > 0.14) {
            threeMonthsPercentScore = 1;
            console.log("threeMonthsPercentScore: " + threeMonthsPercentScore);
          } else {
            threeMonthsPercentScore = 0;
            console.log("threeMonthsPercentScore: " + threeMonthsPercentScore);
          }

          let getCoinData = await api.get(
            `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
          );

          let twitter = getCoinData.data.Data.TWITTER_ACCOUNTS;
          let twitterArray = [];
          let twitterFollowers = null;
          let sourceCode = getCoinData.data.Data.CODE_REPOSITORIES;
          let gitRepository = null;
          let website = getCoinData.data.Data.WEBSITE_URL;

          if (twitter !== null) {
            twitter = Object.values(twitter);
            twitterArray = twitter.map((account) => account.FOLLOWERS);
            twitterFollowers = twitterArray.reduce((acc, val) => acc + val);

            if (twitterFollowers > 25000) {
              twitterScore = 1;
              console.log("twitterScore: " + twitterScore);
            }
          } else {
            twitterFollowers = "N/A";
            twitterScore = 0;
            console.log("twitterScore: " + twitterScore);
          }

          if (sourceCode !== null && sourceCode.length !== 0) {
            gitRepository = sourceCode[0].URL;
            gitScore = 1;
            console.log("gitScore: " + gitScore);
          } else {
            gitRepository = "N/A";
            gitScore = 0;
            console.log("gitScore: " + gitScore);
          }

          if (website === null) {
            website = "N/A";
          }

          

          if (value.total_volume > 250000) {
            volumeScore = 1;
            console.log("value.total_volume: " + value.total_volume);
            console.log("volumeScore: " + volumeScore);
          }    
          
          console.log(value.id+" highestPricePercentage: "+highestPricePercentage)

          if(highestPricePercentage <= -0.95 ){          
            highPercentScore = 2;
              console.log(value.id+" highest price score: "+highPercentScore)
          } else if(highestPricePercentage >= -0.80 && highestPricePercentage > -0.95){
            highPercentScore = 1;
            console.log(value.id+" highest price score: "+highPercentScore)
          }

          console.log(value.id+" highest price score: "+highPercentScore)
          


          console.log("value.id: " + value.id);
          let total =
          volumeScore +
          oneYearPercentScore +
          btcChangeScore +
          btcPercentScore +
          highPercentScore +
          inceptionPercentScore +
          threeMonthsPercentScore +
          maxGradeScore +
          twitterScore +
          gitScore; 
          
          setTotalScore(total);

          console.log("total: " + total);

          coinData.push({
            id: value.id,
            name: value.name,
            current_price: value.current_price,
            marketCap: value.market_cap.toLocaleString("en-US"),
            volume: value.total_volume.toLocaleString("en-US"),
            oneYearPercentChange: oneYearPercentChange,
            oneYearBTCPercentChange: oneYearBTCPercentChange.toLocaleString(
              undefined,
              { style: "percent" }
            ),
            oneYearBTCPriceChange: oneYearBTCPriceChange.toLocaleString(
              "en-US",
              { minimumFractionDigits: 10 }
            ),
            inceptionPriceChange: inceptionPriceChange.toLocaleString(
              undefined,
              { style: "percent" }
            ),
            ninetyDaysPercentChange: ninetyDaysPercentChange.toLocaleString(
              undefined,
              { style: "percent" }
            ),
            maxChartGrade: maxChartGrade,
            gainPrediction: null,
            avgGainPrediction: null,
            highestPricePercentage: highestPricePercentage.toLocaleString(
              undefined,
              { style: "percent" }
            ),
            twitterFollowers: twitterFollowers.toLocaleString("en-US"),
            gitRepository: gitRepository,
            website: website,
            prediction: inputValue,
            rating: total,
          });

          setCoinData(coinData);           


        }


      } else {
        setIsLoading(false);
        console.log("Error retrieving coin data");
      }

      setIsLoading(false);
    } 
  };


  const removeAllCoinsHandler = async () => {

    const portfolios = await api.get("http://localhost:3006/portfolios");

    for (let i = 0; i < portfolios.data.length; i++) {

      const portfolio = await api.get(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`
      );
  
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
  
      // set the analysisCoins state to the updated analysis array
      setAnalysisCoins(updatedPortfolio.data.analysis);
    }
  
    // call the function to fetch the updated analysis coins
    GetAnalysisCoins();

  }

  const removeCoinHandler = async (coinName) => {
    // your logic to delete the analysis coin from the API

    const portfolios = await api.get("http://localhost:3006/portfolios");

    for (let i = 0; i < portfolios.data.length; i++) {
      const portfolio = await api.get(
        `http://localhost:3006/portfolios/${portfolios.data[i].id}`
      );

      console.log(portfolios.data[i].id);

      for (let c = 0; c < portfolio.data.analysis.length; c++) {
        console.log(coinName);
        if (coinName === "binancecoin") {
          coinName = coinName.replace("binancecoin", "binance-coin");
        }

        if (portfolio.data.analysis[c].coinName === coinName) {
          console.log("remove coinName: " + coinName);
          console.log(portfolio.data.analysis[c].coinName);

          const coinIndex = portfolio.data.analysis.findIndex(
            (coin) => coin.coinName === coinName
          );

          console.log(coinIndex);
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
          // set the analysisCoins state to the updated analysis array
          setAnalysisCoins(updatedPortfolio.data.analysis);

          GetAnalysisCoins();
        }
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (noCoins) return <div>Add some coins to analyze!</div>;

  return (
    <div className="analysis-main">
      <div className="app-main">
        <div className="ui coin-analysis">
          <div className="ui relaxed divided list">
            <div className="coin-table-header">
              <div className="headerCell" align="left">
                Coin
              </div>
              <div
                className="headerCell"
                align="left"
                onClick={handleSortByMarketCap}
              >
                Market Cap{" "}
                {marketCapSortOrder === "asc" ? (
                  <i className="arrow up icon"></i>
                ) : marketCapSortOrder === "desc" ? (
                  <i className="arrow down icon"></i>
                ) : (
                  <i className="arrow icon"></i>
                )}
              </div>
              <div
                className="headerCell"
                align="left"
                onClick={handleSortByVolume}
              >
                Volume{" "}
                {volumeSortOrder === "asc" ? (
                  <i className="arrow up icon"></i>
                ) : volumeSortOrder === "desc" ? (
                  <i className="arrow down icon"></i>
                ) : (
                  <i className="arrow icon"></i>
                )}
              </div>
              <div className="headerCell" align="left">
                Price{" "}
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByUSD1YR}
              >
                USD 1YR % Change{" "}
                {USD1YRSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : USD1YRSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )}
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByBTC1YR}
              >
                BTC 1YR % Change{" "}
                {BTC1YRSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : BTC1YRSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByBTC1YrPrice}
              >
                BTC 1YR Change{" "}
                {BTC1YrPriceSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : BTC1YrPriceSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortByInPriceChange}
              >
                Inception % Change{" "}
                {inPriceChangeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : inPriceChangeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell"
              align="left"
              onClick={handleSortByThreeMonthChange}
              >
                3 Months % Change{" "}
                {threeMonthsChangeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : threeMonthsChangeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell"
              align="left"
              onClick={handleSortByMaxGrade}
              >
                Max Chart Grade{" "}
                 {maxGradeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : maxGradeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div className="headerCell" align="left">
                Price Prediction{" "}
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleSortFutureGain}
              >
                Future Gain Prediction{" "}
                { futurePredSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) :  futurePredSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div 
              className="headerCell" 
              align="left"
              onClick={handleAvgFutureGain}
              >
                Avg. Gain Prediction{" "}
                {avgGainPredSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : avgGainPredSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} 
              </div>
              <div className="headerCell" align="left">
                % from ATH{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Twitter Followers{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Git Source{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>

              <div className="headerCell" align="left">
                Final Rating{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              
            </div>
            {sortedCoins.map((coin) => (
              <div key={coin.id}>
                <div className="item rowCell" align="left">
                  {coin.website !== "N/A" ? (
                    <a href={coin.website}>{coin.name}</a>
                  ) : (
                    <div>{coin.name}</div>
                  )}
                </div>
                <div className="item rowCell" align="left">
                  {coin.marketCap}
                </div>
                <div className="item rowCell" align="left">
                  {coin.volume}
                </div>
                <div className="item rowCell" align="left">
                  ${coin.current_price}
                </div>
                <div className="item rowCell" align="left">
                  {coin.oneYearPercentChange}
                </div>
                <div className="item rowCell" align="left">
                  {coin.oneYearBTCPercentChange}
                </div>
                <div className="item rowCell" align="left">
                  {coin.oneYearBTCPriceChange}
                </div>
                <div className="item rowCell" align="left">
                  {coin.inceptionPriceChange}
                </div>
                <div className="item rowCell" align="left">
                  {coin.ninetyDaysPercentChange}
                </div>
                <div className="item rowCell" align="left">
                  {coin.maxChartGrade}
                </div>
                <div className="item rowCell" align="left">
                  <input
                    type="text"
                    onChange={
                        (e) => handleInputChange(e.target.value, coin.id, coin.rating, coin.gainPrediction, coin.avgGainPrediction)
                    }
                  />
                </div>
                <div className="item rowCell" align="left">
                  {coin.gainPrediction || "-"}
                </div>
                <div className="item rowCell" align="left">
                  {coin.avgGainPrediction || "-"}
                </div>
                <div className="item rowCell" align="left">
                  {coin.highestPricePercentage || "-"}
                </div>
                <div className="item rowCell" align="left">
                  {coin.twitterFollowers}
                </div>
                <div className="item rowCell" align="left">
                  {coin.gitRepository !== "N/A" ? (
                    <a href={coin.gitRepository}>Git</a>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div className="item rowCell" align="left">
                  {coin.rating}
                </div>
                <div className="item rowCell" align="left">
                  <button
                    className="ui red basic button"
                    onClick={() =>
                      handleCoinPrediction(
                        inputValue,
                        coin.current_price,
                        coin.id,
                        coin.oneYearPercentChange,
                        coin.rating
                      )
                    }
                    
                    disabled={coin.prediction === inputValue ? false : !inputValue}
                  >
                    Update Rating
                  </button>
                  <button
                    className="ui red basic button"
                    onClick={() => removeCoinHandler(coin.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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