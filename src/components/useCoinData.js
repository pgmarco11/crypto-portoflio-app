import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/portfolios';

const useCoinData = (coinId) => {
 
  const [coinData, setCoinData] = useState([]);
  const [change24Hours, setChange24Hours] = useState([]);  
  const [change7Days, setchange7Days] = useState([]);
  const [change30Days, setChange30Days] = useState([]);   

  const fetchData = async (coinId) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinId}&tsyms=USD&extraParams=cryptocompare&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
      );
      const data = response.data.RAW[coinId].USD;
      setCoinData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateCoinData = async (coinId) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinId}&tsyms=USD&extraParams=cryptocompare&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
      );
      const data = response.data.RAW[coinId].USD;
      setCoinData(data);
      coinChanges(coinId, data);
    } catch (error) {
      console.error(error);
    }
  };

  const coinChanges = async (coinId, coinData) => {
    let coinChange24HrPercent = coinData.CHANGEPCT24HOUR / 100;
    let coinPrice = coinData.PRICE;
  
    setChange24Hours(coinChange24HrPercent);
  
    let coinChange7DaysData = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=7&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
  
    let coinChange30DaysData = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinId}&tsym=USD&limit=30&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
  
    let coinChange7DaysDataValues = coinChange7DaysData?.data?.Data?.Data || [];
    let coinChange30DaysDataValues = coinChange30DaysData?.data?.Data?.Data || [];
  
    if (coinChange7DaysDataValues && coinChange7DaysDataValues.length > 0) {
      const coinChange7Days = coinChange7DaysDataValues[0].close;
      let coinChange7DayPercent = (coinPrice - coinChange7Days) / coinChange7Days;
      setchange7Days(coinChange7DayPercent);
    } else {
      let change = "N/A";
      setchange7Days(change);
    }
    
    if (coinChange30DaysDataValues && coinChange30DaysDataValues.length > 0) {
      const coinChange30Days = coinChange30DaysDataValues[0].close;
      let coinChange30DayPercent = (coinPrice - coinChange30Days) / coinChange30Days;
      setChange30Days(coinChange30DayPercent);
    } else {
      let change = "N/A";
      setChange30Days(change);
    }

  };

  
  const resetCoinData = () => {
    setCoinData([]);
  };

  useEffect(() => {
    fetchData(coinId);
    updateCoinData(coinId);
    
  }, [coinId]);


  return { coinData, resetCoinData, updateCoinData, change7Days, change24Hours, change30Days};

};

export default useCoinData;