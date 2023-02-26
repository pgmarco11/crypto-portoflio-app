import React, { useState, useEffect, useMemo } from 'react';
import PortfolioCoin from './PortfolioCoin';
import api from '../api/portfolios';


const PortfolioCoinList = (props) => {

    const PortfolioCoins = props.coingeckoIds;

      const addAllCoinsToAnalysis = async () => {
        try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;
      
          const promises = portfolio.coins.map((coin) =>
            api.get(
              `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coin}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
            )
          );
          const responses = await Promise.all(promises);
          const coinNames = responses.map((
            response) => response.data.Data.NAME.toLowerCase()
            );
          portfolio.analysis = portfolio.analysis.concat(coinNames);

          console.log("portfolio.analysis: "+ coinNames)
      
          await api.patch(`http://localhost:3006/portfolios/${props.id}`, { analysis: portfolio.analysis });
          console.log(response.data);
          props.coinRefresh();
        } catch (error) {
          console.error(error);
        }
      };



      console.log("PortfolioCoins: "+PortfolioCoins);
      console.log("props.id: "+props.id);



    return ( 
        <div  className="ui container coin-portfolio">
            <div className="ui relaxed divided list"> 
                <div className="coin-table-header">                 
                    <div className="headerCell" align="left">Coin</div>
                    <div className="headerCell" align="left">Price</div>
                    <div className="headerCell" align="left">Market Cap</div>
                </div> 
                   
                {PortfolioCoins.map((coin, index) => (
                    
                    <PortfolioCoin CoinId={coin} key={coin} PortfolioId={props.id} CoinRefresh={props.coinRefresh} />
                    
                ))}              
            
                <button className="ui button blue right" onClick={addAllCoinsToAnalysis}>Add All Coins to Analysis</button>

            </div>
        </div>
    );

};
export default PortfolioCoinList;