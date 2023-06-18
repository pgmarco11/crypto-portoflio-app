import React, { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import api from '../api/portfolios';
import PortfolioEntry from "./PortfolioEntry"

const PortfolioPage = (props) => {    

        const [portfolios, setPortfolios] = useState([]); 
        const [grandTotal, setGrandTotal] = useState(0); 

        
            // Function to fetch data from the API
async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  
  // Function to calculate the total USD amount for a specific coin
  async function calculateCoinValue(coinId, amount) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${coinId}&tsyms=USD`;
    const data = await fetchData(url);
    const price = data.USD;
    return price * amount;
  }
  
  // Function to calculate the total USD amount for a portfolio
  async function calculatePortfolioValue(portfolio) {
    let totalValue = 0;
    for (const value of portfolio.values) {
      const coinValue = await calculateCoinValue(value.coinId, value.amount);
      totalValue += coinValue;
    }
    console.log(portfolio.name+" totalValue: "+totalValue)
    return totalValue;
  }
  
  // Function to calculate the grand total for all portfolios
  async function calculateTotalValues() {
    let grandTotal = 0;
    for (const portfolio of portfolios) {
      const portfolioValue = await calculatePortfolioValue(portfolio);
      grandTotal += portfolioValue;
    } 

    setGrandTotal(grandTotal)
   
  }
  
  // Call the calculateTotalValues function to calculate the grand total
  useEffect(() => {
    setPortfolios(props.portfolios); // Update the portfolios state when the prop changes   
}, [props.portfolios]);


useEffect(() => {
    calculateTotalValues();    
  }, [portfolios]); // Trigger the calculation when the portfolios state changes

  console.log("grandTotal: "+grandTotal)  



        const idPortfolioHandler = async (id) => {
            const response = await api.delete(`http://localhost:3006/portfolios/${id}`);

            if (response.status === 200) {
                const newPortfolioList = portfolios.filter((portfolio) => {
                    return portfolio.id !== id;
                });                

                setPortfolios(newPortfolioList);
            }  
        }   

    return (
        <>
        <div><span className="sub-header">Total Portfolio Value:&nbsp;&nbsp;</span>${grandTotal.toFixed(2)}</div>
        <div className="ui relaxed divided list">
            
            {portfolios.map((portfolio) => (
                <div className="item" key={portfolio.id}>
                    <div className="ui celled list portfolio-list">                         
                        <PortfolioEntry 
                            portfolio={portfolio}                     
                            clickHandler={idPortfolioHandler}
                            key={portfolio.id}
                        />
                    </div>
                </div>
            ))}
            <Link to="/add">
                <button className="btn-portfolio ui button blue right">
                    Add Portfolio
                </button>
            </Link>   
        </div>
        </>
    );

};
export default PortfolioPage;