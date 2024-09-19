import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import api from '../api/portfolios';
import PortfolioEntry from "./PortfolioEntry";

const PortfolioPage = (props) => {
  const [portfolios, setPortfolios] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalValue24HoursAgo, setTotalValue24HoursAgo] = useState(0);
  const [totalValue21DaysAgo, setTotalValue21DaysAgo] = useState(0);
  const [cachedCoinValues, setCachedCoinValues] = useState({});

  // Function to fetch data from the API
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Handle the error (e.g., display an error message or log the error)
      console.error(error);
      // Optionally, you can throw the error again to stop the execution
      throw error;
    }
  }

  // Function to fetch and cache the coin value for a specific coin
  async function fetchAndCacheCoinValue(coinId, amount) {

    try {

      console.log("help cachedCoinValues: ",cachedCoinValues)

    const cachedValue = cachedCoinValues[coinId];

    if (cachedValue !== undefined) {

      console.log("help cachedValue: ",cachedValue)

      return cachedValue * amount;      

    } else {   

      console.log("help coinId: ",coinId)

      const url = `https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=USD`;

        const data = await fetchData(url);

        if (data.Response === 'Error') {
          console.error("Error fetching coin value:", data.Message);
          return 0;
        }
    
        const price = data.USD;

        setCachedCoinValues((prevCache) => ({ ...prevCache, [coinId]: price }));

        return price * amount;   
      }

    }  catch (error) {
      console.error("Error fetching coin value:", error);
      return 0;
    }
  }

  // Function to calculate the total USD amount for a portfolio
  async function calculatePortfolioValue(portfolio) {

    let totalValue = 0;

    for (const value of portfolio.values) {

      const coinValue = await fetchAndCacheCoinValue(value.coinId, value.amount);

     if(isNaN(coinValue) === false){

      totalValue += coinValue;

     } 

    }
    return totalValue;
  }

  // Function to calculate the portfolio value from historical data
  async function calculatePortfolioValueHistorical(portfolio, historicalUrl) {
    if (!portfolio || !portfolio.values) {
      return 0; // Return 0 if the portfolio or its values are undefined
    }

    let totalValue = 0;
    for (const value of portfolio.values) {
      const coinValue = await fetchAndCacheCoinValueHistorical(value.coinId, value.amount, historicalUrl);
      totalValue += coinValue;
    }
    return totalValue;
  }

  // Function to calculate the total USD amount for a specific coin from historical data
  async function fetchAndCacheCoinValueHistorical(coinId, amount, historicalUrl) {

    try {

    const cachedValue = cachedCoinValues[coinId];

    if (cachedValue !== undefined) {

      return cachedValue * amount;

    }  else {

      const url = `${historicalUrl}${coinId}&tsym=USD`;
    
      const data = await fetchData(url);

      if (data.Response === 'Error') {
        console.error("Error fetching coin value:", data.Message);
        return 0;
      }
  
      if (data.Data.Data !== undefined) {
        const prices = data.Data.Data;
        const priceHistorical = prices[0].close;
        setCachedCoinValues((prevCache) => ({ ...prevCache, [coinId]: priceHistorical }));
        return priceHistorical * amount;
      } else {
        return 0;
      }

    }  

    } catch (error) {
      console.error("Error fetching coin value:", error);
      return 0;
    }
  }

  async function calculateTotals() {
    let grandTotal = 0;
    let totalValue24HoursAgo = 0;
    let totalValue21DaysAgo = 0;

    for (const portfolio of portfolios) {      

        const portfolioValues = portfolio.values;

        if(portfolioValues !== undefined ){  

            if(portfolioValues.length > 0){
         
                const portfolioValue = await calculatePortfolioValue(portfolio);      

                const portfolioValue24HoursAgo = await calculatePortfolioValueHistorical(
                  portfolio,
                  'https://min-api.cryptocompare.com/data/v2/histohour?fsym='
                );
                const portfolioValue21DaysAgo = await calculatePortfolioValueHistorical(
                  portfolio,
                  'https://min-api.cryptocompare.com/data/v2/histoday?fsym='
                );
           
                grandTotal += portfolioValue;
                totalValue24HoursAgo += portfolioValue24HoursAgo;
                totalValue21DaysAgo += portfolioValue21DaysAgo;                
            }  
        }      
    }



    setGrandTotal(grandTotal);
    setTotalValue24HoursAgo(percent24Hours(grandTotal, totalValue24HoursAgo));
    setTotalValue21DaysAgo(percent21Days(grandTotal, totalValue21DaysAgo));
  };


  useEffect(() => {   
    setPortfolios(props.portfolios); // Update the portfolios state when the prop changes
  }, [props.portfolios]);


  useEffect(() => {
    calculateTotals();
  }, [portfolios]);

  async function idPortfolioHandler(id) {
    const response = await api.delete(`http://localhost:8888/portfolios/${id}`);

    if (response.status === 200) {
      const newPortfolioList = portfolios.filter((portfolio) => portfolio.id !== id);
      setPortfolios(newPortfolioList);
    }
  };

  function percent24Hours(grandTotal, totalValue24HoursAgo){

      const totalPercent = parseFloat( (grandTotal - totalValue24HoursAgo) / totalValue24HoursAgo )

      return totalPercent;

  }

  function percent21Days(grandTotal, totalValue21DaysAgo){

      const totalPercent = parseFloat( (grandTotal - totalValue21DaysAgo) / totalValue21DaysAgo )

      return totalPercent;

  }
    
  const finalGrandTotal = grandTotal ? '$'+grandTotal.toFixed(2) : 'Loading....';
  const finalValue24HoursAgo = totalValue24HoursAgo ? totalValue24HoursAgo : 'Loading...';
  const finalValue21DaysAgo = totalValue21DaysAgo ? totalValue21DaysAgo : 'Loading...'; 


  return (
    <>
      <div>
        <ul>
          <li>
            <span className="sub-header">Total Portfolio Value:&nbsp;&nbsp;</span>
           {finalGrandTotal}
          </li>
          <li>
            <span className="sub-header">24 Hours Portfolio Change:&nbsp;&nbsp;</span>
            {finalValue24HoursAgo.toLocaleString(undefined, { style: "percent" } ) }
          </li>
          <li>
            <span className="sub-header">21 Days Portfolio Change:&nbsp;&nbsp;</span>
            {finalValue21DaysAgo.toLocaleString(undefined, { style: "percent" } )}
          </li>
        </ul>
      </div>
      <div className="ui relaxed divided list">
        {portfolios.map((portfolio) => (
          <div className="item" key={portfolio.id}>
            <div className="ui celled list portfolio-list">
              <PortfolioEntry portfolio={portfolio} clickHandler={idPortfolioHandler} key={portfolio.id} />
            </div>
          </div>
        ))}
        <Link to="/add">
          <button className="btn-portfolio ui button blue right">Add Portfolio</button>
        </Link>
      </div>
    </>
  );
};

export default PortfolioPage;
