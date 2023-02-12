import React, { useState, useEffect, useMemo } from 'react';
import PortfolioCoin from './PortfolioCoin';


const PortfolioCoinList = (props) => {

    console.log("PortfolioCoins props coingeckoId: "+props.coingeckoIds);

    const PortfolioCoins = props.coingeckoIds;

    console.log("props.isLoading: "+props.isLoading) 



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

            </div>
        </div>
    );

};
export default PortfolioCoinList;