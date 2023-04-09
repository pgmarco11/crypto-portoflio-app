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
  const [gainPrediction, setGainPrediction] = useState(0);
  const [avgGainPrediction, setAvgGainPrediction] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSortByMarketCap = () => {
    setMarketCapSortOrder(marketCapSortOrder === "asc" ? "desc" : "asc");
    setVolumeSortOrder(null);
  };

  const handleSortByVolume = () => {
    setVolumeSortOrder(volumeSortOrder === "asc" ? "desc" : "asc");
    setMarketCapSortOrder(null);
  };
  
  const handleInputChange = (event, coinId, totalScore, newGainPrediction, newAvgGainPrediction) => {
    
    setInputValue(event);

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

    const newGainPrediction = parseFloat(
        (inputValue - current_price) / current_price
      );
      let newAvgGainPrediction = null;

      
    console.log("newGainPrediction: " + newGainPrediction);

    if (oneYearPercentChange === "N/A") {
      newAvgGainPrediction = parseFloat((newGainPrediction + 0) / 2);
    } else {
      newAvgGainPrediction = parseFloat(
        (newGainPrediction + parseFloat(oneYearPercentChange) / 100) / 2
      );
    }
    
    if (newGainPrediction > 0.02) {
        newGainPredictionScore = 2;
      } 
      if (newAvgGainPrediction > 0.02 && newAvgGainPrediction !== null) {
        newAvgGainPredictionScore = 1;
      } 


    if (!inputValue) { // check if input is empty

      console.log("input is empty");

      console.log("newGainPrediction: " + newGainPrediction);
      console.log("newAvgGainPrediction: " + newAvgGainPrediction);   
      
      if (newGainPrediction <= 0.02) {
        newGainPredictionScore = -2;
      }
      if (newAvgGainPrediction <= 0.02) {
        newAvgGainPredictionScore = -1;
      }  

      console.log("old total: " + totalScore);
      console.log("newGainPrediction: " + newGainPredictionScore);
      console.log("newAvgGainPrediction: " + newAvgGainPredictionScore);  
     

      let total = totalScore + newGainPredictionScore + newAvgGainPredictionScore;

    console.log("inputValue new total: " + total);
    
    setTotalScore(total);
    setGainPrediction(0); // reset the gain prediction
    setAvgGainPrediction(0); // reset the average gain prediction


    const updatedCoinData = Object.values(coinData).map((coin) => {
        console.log("coin: " + coin.id);

        if (Object.values(coin)[0] === coinId) {
            return {
            ...coin,
            gainPrediction: gainPrediction,
              avgGainPrediction: avgGainPrediction,              
              prediction: inputValue,
              rating: total
            };
        }
        return coin;
        });  
        
        setCoinData(updatedCoinData);

        return;        

    } else {


      console.log("input is not empty");


      let total = totalScore + newGainPredictionScore + newAvgGainPredictionScore;

    console.log("new total: " + total);

    setTotalScore(total);

    console.log("newGainPredictionScore: " + newGainPredictionScore);
    console.log("newAvgGainPredictionScore: " + newAvgGainPredictionScore);    

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

    }

    
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

        if (coinNameAnalysis.includes(" ")) {
          coinNameAnalysis = coinNameAnalysis.replace(/ /g, "-"); // replace all spaces with dashes
        }
        if (coinNameAnalysis.includes("travala")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "travala",
            "concierge-io"
          );
        }
        if (coinNameAnalysis.includes("vectorspace-ai")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "vectorspace-ai",
            "vectorspace"
          );
        }
        if (coinNameAnalysis.includes("solve")) {
          coinNameAnalysis = coinNameAnalysis.replace("solve", "solve-care");
        }
        if (coinNameAnalysis.includes("retreeb")) {
          coinNameAnalysis = coinNameAnalysis.replace("retreeb", "treeb");
        }
        if (coinNameAnalysis.includes("floki-inu")) {
          coinNameAnalysis = coinNameAnalysis.replace("floki-inu", "floki");
        }
        if (coinNameAnalysis.includes("rich-quack")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "rich-quack",
            "richquack"
          );
        }
        if (coinNameAnalysis.includes("xrp")) {
          coinNameAnalysis = coinNameAnalysis.replace("xrp", "ripple");
        }
        if (coinNameAnalysis.includes("quant")) {
          coinNameAnalysis = coinNameAnalysis.replace("quant", "quant-network");
        }
        if (coinNameAnalysis.includes("polygon")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "polygon",
            "matic-network"
          );
        }
        if (coinNameAnalysis.includes("binance-coin")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "binance-coin",
            "binancecoin"
          );
        }
        if (coinNameAnalysis.includes("avalanche")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "avalanche",
            "avalanche-2"
          );
        }
        if (coinNameAnalysis.includes("cronos")) {
          coinNameAnalysis = coinNameAnalysis.replace(
            "cronos",
            "crypto-com-chain"
          );
        }
        if (coinNameAnalysis.includes("egold")) {
          coinNameAnalysis = coinNameAnalysis.replace("egold", "elrond-erd-2");
        }
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

          const market_chart_prices = historicalData[index].prices;

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
          } else {
            inceptionPercentScore = 0;
          }

          let maxChartGrade = null;

          console.log(value.id+" inceptionPriceChange: " + inceptionPriceChange);

          if (parseFloat(inceptionPriceChange) >= 2.0) {
            console.log(value.id+" A : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "A";
            maxGradeScore = 2;
          } else if (parseFloat(inceptionPriceChange) >= 1.0 && parseFloat(inceptionPriceChange) < 2.0) {
            console.log(value.id+" B : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "B";
            maxGradeScore = 2;
          } else if (parseFloat(inceptionPriceChange) < 1.0 && parseFloat(inceptionPriceChange) > 0) {
            console.log(value.id+" C : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "C";
            maxGradeScore = 1;
          } else {
            console.log(value.id+" D : "+parseFloat(inceptionPriceChange))
            maxChartGrade = "D";
            maxGradeScore = 0;
          }

          let oneYearPercentChange =
            value.price_change_percentage_1y_in_currency;

          if (oneYearPercentChange === null) {
            oneYearPercentChange = "N/A";
            oneYearPercentScore = 0;
          } else {
            oneYearPercentChange =
              value.price_change_percentage_1y_in_currency.toLocaleString(
                "en-US",
                { minimumFractionDigits: 4 }
              ) + "%";
            if (oneYearPercentChange > 2.0) {
              oneYearPercentScore = 2;
            }
          }

          let ninetyDaysPercentChange =
            (value.current_price - ninetyDaysAgoPrice) / ninetyDaysAgoPrice;

          if (ninetyDaysPercentChange > 18.0) {
            threeMonthsPercentScore = 1;
          } else {
            threeMonthsPercentScore = 0;
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
            }
          } else {
            twitterFollowers = "N/A";
            twitterScore = 0;
          }

          if (sourceCode !== null) {
            gitRepository = sourceCode[0].URL;
            gitScore = 1;
          } else {
            gitRepository = "N/A";
            gitScore = 0;
          }

          if (website === null) {
            website = "N/A";
          }

          console.log("value.total_volume: " + value.total_volume);

          if (value.total_volume > 250000) {
            volumeScore = 1;
          }         


          console.log("value.id: " + value.id);
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

  const sortedCoins = coinData
    ? coinData.slice().sort((a, b) => {
        if (marketCapSortOrder === "asc") {
          return a.marketCap - b.marketCap;
        } else if (marketCapSortOrder === "desc") {
          return b.marketCap - a.marketCap;
        } else if (volumeSortOrder === "asc") {
          return a.volume - b.volume;
        } else if (volumeSortOrder === "desc") {
          return b.volume - a.volume;
        }
      })
    : [];

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

  console.log("noCoins: "+noCoins)
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
              <div
                className="headerCell"
                align="left"
                onClick={handleSortByVolume}
              >
                Price{" "}
                {/* {volumeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : volumeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                USD 1YR % Change{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                BTC 1YR % Change{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                BTC 1YR Change{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Inception % Change{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                3 Months % Change{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Max Chart Grade{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Price Prediction{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Future Gain Prediction{" "}
                {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
              </div>
              <div className="headerCell" align="left">
                Avg. Gain Prediction{" "}
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
                    "N/A"
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
      </div>
    </div>
  );
}

export default Analysis;