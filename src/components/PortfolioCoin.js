import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../api/portfolios';


const PortfolioCoinList = (props) => {

    const [coinData, setCoinData] = useState([]);    

    console.log("PortfolioCoin props coinId: "+props.CoinId);

    console.log("PortfolioCoin props PortfolioId: "+props.PortfolioId);

      useEffect(() => {               
        axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${props.CoinId}&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`)
          .then(res => {
            const data = res.data.DISPLAY[props.CoinId].USD;
            setCoinData(data);              
            })
            .catch(err => {
                console.error(err);
                
            });
    }, [props.CoinId]);

        const removeCoinHandler = async (CoinId) => {
        // your logic to delete the coin from the API
        try { 
            const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
            const portfolio = response.data;
            // find the index of the coin in the portfolio's coins array
            const coinIndex = portfolio.coins.indexOf(CoinId);

            if (coinIndex === -1) {
            throw new Error(`Coin with id ${CoinId} not found in portfolio with id ${props.PortfolioId}`);
            }
            // remove the coin from the portfolio's coins array
            portfolio.coins.splice(coinIndex, 1);

            // update the portfolio with the new coins array
            await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { coins: portfolio.coins });

            // Fetch the updated list of coins from the API
            const updatedCoinsResponse = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);

            const updatedCoins = updatedCoinsResponse.data.coins;
            const updatedCoinData =  updatedCoins.map( async coinId => {
            return axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${CoinId}&tsyms=USD&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`)
                .then(res => {
                  const data = res.data.DISPLAY[CoinId].USD;
                  return data;
                })
                .catch(err => {
                    console.error(err);
                });
            });
            setCoinData([]);
            const resolvedCoinData = await Promise.all(updatedCoinData);
            setCoinData(resolvedCoinData);

            props.CoinRefresh();            

          } catch (error) {
            console.error(error);
          }
    }; 

    const addCoinIdToAnalysis = async (coinId) => {
      try {
        const response = await api.get(`http://localhost:3006/portfolios/${props.PortfolioId}`);
        const portfolio = response.data;            
       
        const coinNameData = await api.get(`https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coinId}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`);
    
        const coinName = coinNameData.data.Data.NAME.toLowerCase();
        portfolio.analysis.push(coinName);
           
        await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { analysis: portfolio.analysis });
    
        console.log(response.data);
        props.CoinRefresh();
      } catch (error) {
        console.error(error);
      }
    };
    
    console.log("coinData: "+coinData);
    const imagePath = "https://www.cryptocompare.com/"+coinData.IMAGEURL;

    return ( 
             
    
        <div className="coin-table-row" key={props.CoinId}>                
            <div className="item rowCell image">
                {coinData.IMAGEURL && <img src={imagePath} alt={props.CoinId} />}
                {coinData.FROMSYMBOL && <span className='coindata'>{coinData.FROMSYMBOL.toUpperCase()}</span> }
            </div>
            <div className="item rowCell price">            
               {coinData.PRICE && coinData.PRICE.toLocaleString(
                'en-US', {style: 'currency', currency: 'USD'}
                )}                 
            </div>
            <div className="item rowCell marketcap">            
               {coinData.MKTCAP && coinData.MKTCAP.toLocaleString(
                'en-US', {style: 'currency', currency: 'USD'}
                )}                 
            </div>
            <div className="item rowCell button grey">
            <div className="item btn-group">
                <button className="ui red basic button"
                onClick={() => removeCoinHandler(props.CoinId)}>
                Delete</button>   
                <button className="ui basic button blue"    
                onClick={() => addCoinIdToAnalysis(props.CoinId)}>
                Add to Analysis</button>           
            </div>                
            </div> 
      </div>
    )

};
export default PortfolioCoinList;