import React, { useState, useEffect, useMemo } from 'react';
import PortfolioCoin from './PortfolioCoin';
import api from '../api/portfolios';


const PortfolioCoinList = (props) => {

    console.log("PortfolioCoins props coingeckoId: "+props.coingeckoIds);

    const PortfolioCoins = props.coingeckoIds;

    console.log("props.isLoading: "+props.isLoading) 

    const addAllCoinsToAnalysis = async () => {
        try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;
          portfolio.analysis = portfolio.analysis.concat(portfolio.coins);
          await api.patch(`http://localhost:3006/portfolios/${props.id}`, { analysis: portfolio.analysis } );
          console.log(response.data);
          props.CoinRefresh();
        } catch (error) {
          console.error(error);
        }
      };


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