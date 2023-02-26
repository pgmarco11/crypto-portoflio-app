import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios';
import api from '../api/portfolios';
import coin from "../images/bitcoin.png";
import debounce from 'lodash.debounce';
import Spinner from './Spinner';
import PortfolioCoinList from './PortfolioCoinList';

const PortfolioCoins = (props) => {

    const [coinData, setCoinData] = useState([]);
    const [selectedCoinId, setSelectedCoinId] = useState('');
    const [portfolioCoins, setPortfolioCoins] = useState([]); // add this state variable to store the portfolio's coins data
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    console.log("PortfolioCoins prop 1: "+props.portfolioName);
    console.log("PortfolioCoins prop 2: "+props.portfolioId);

    const portfolioId = props.portfolioId;      

    useEffect(() => {
        setIsLoading(true);
        axios
          .get(
            'https://min-api.cryptocompare.com/data/all/coinlist?api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa'
          )
          .then((response) => {
            setCoinData(Object.values(response.data.Data)); // extract array of coins from the Data property
            setIsLoading(false);
          })
          .catch((error) => {
            console.error(error);
            setIsLoading(false);
          });
      }, []);

    useEffect(() => {
        api.get(`http://localhost:3006/portfolios/${portfolioId}`)
            .then(response => {
                setPortfolioCoins(response.data.coins); // update the portfolioCoins state variable with the portfolio's coins data
            })
            .catch(error => {
                console.error(error);
            });
    }, [portfolioId]); // run this effect only when the portfolioId changes

    console.log("filter coin: "+coinData);

    const filteredCoinData = useMemo(() => coinData.filter(
        coin => (coin.FullName+coin.Symbol.toUpperCase()+coin.Symbol.toLowerCase()+coin.CoinName.toLowerCase()).includes(searchValue)), 
        [coinData, searchValue]);

    const addCoinToPortfolio = async (selectedCoinId, portfolioId) => {
        try {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolioId}`);
            const portfolio = response.data;
            portfolio.coins.push(selectedCoinId);
            await api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins } );
            console.log(response.data);
            setSelectedCoinId(''); // reset selectedCoinId to the disabled option
            CoinRefresh();
         } catch (error) {
            console.error(error);
          }
      };

    const handleSearch = debounce((e) => {
        setSearchValue(e.target.value);
    }, 250);
    
    if(isLoading){
        return <p>Loading...</p>
    };

    const CoinRefresh = async (coinId) => {
        await api.get(`http://localhost:3006/portfolios/${portfolioId}`)
        .then(response => {
            setPortfolioCoins([]);
            const portfolio = response.data;            
            api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins } );
            setPortfolioCoins(response.data.coins); // update the portfolioCoins state variable with the portfolio's coins data
        })
        .catch(error => {
            console.error(error);
        });
    };    


    return (
    
        
    <div className="coin-add-ui">
        

        <div className="search-container">
            <input type="text" placeholder="Search for coins" onChange={handleSearch} />
        </div>
                
       

        <div>
            <select onChange={(e) => setSelectedCoinId(e.target.value)}> 
                
                    <option value="" disabled selected>Coin List</option>
                    {filteredCoinData.map(
                                coin => (
                                    <option value={coin.Symbol} key={coin.Id}>
                                        {coin.FullName}
                                    </option>
                    ))}

            
            </select>

        <button className="ui button blue right"
        onClick={() => addCoinToPortfolio(selectedCoinId, portfolioId)}>
                        Add to Portfolio
        </button>
        
            <PortfolioCoinList id={portfolioId} coingeckoIds={portfolioCoins} coinRefresh={CoinRefresh} />

        </div> 
    
    </div>     
    );

};
export default PortfolioCoins;