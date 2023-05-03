import React, { useState, useEffect, useMemo } from 'react';
import PortfolioCoin from './PortfolioCoin';
import api from '../api/portfolios';


const PortfolioCoinList = (props) => {

    const PortfolioCoins = props.coingeckoIds;

    console.log("props.coingeckoIds: "+props.coingeckoIds);

    console.log("props.id: "+props.id);

      const addAllCoinsToAnalysis = async () => {

      
        try {
          const response = await api.get(`http://localhost:3006/portfolios/${props.id}`);
          const portfolio = response.data;
          if (!portfolio.analysis) {
            portfolio.analysis = [];
          }          
      
          const promises = portfolio.coins.map((coin) =>
            api.get(
              `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${coin}&api_key=de528b65cdbb62a301a3bbd68201919b928595d750ce18281f45ad59ee77bdfa`
            )
          );

          const responses = await Promise.all(promises);

          console.log("responses: "+responses);

          const analysisItems = responses.map((response) => {

           
            let coinName = response.data.Data.NAME.toLowerCase();
            let coinSymbol = response.data.Data.SYMBOL;
            let coinId = null;

            // Find the coinId from the props array using the coinName
             
              const matchingCoin = PortfolioCoins.find((coin) => coin === coinSymbol);

              console.log("matchingCoin: "+matchingCoin);

              if (matchingCoin) {
                coinId = matchingCoin;
              }
              if (coinName.includes(" ")) {
                coinName = coinName.replace(/ /g, "-"); // replace all spaces with dashes
              }
              if (coinName.includes(" ")) {
                coinName = coinName.replace(/ /g, "-"); // replace all spaces with dashes
              }
              if (coinName.charAt(0) === '-') {
                coinName = coinName.substring(1); // remove first character if it is a dash
              }
              if (coinName.includes("travala")) {
                coinName = coinName.replace("travala", "concierge-io");
              }
              if (coinName.includes("vectorspace-ai")) {
                coinName = coinName.replace("vectorspace-ai", "vectorspace");
              }
              if (coinName.includes("solve")) {
                coinName = coinName.replace("solve", "solve-care");
              }
              if (coinName.includes("retreeb")) {
                coinName = coinName.replace("retreeb", "treeb");
              }
              if (coinName.includes("floki-inu")) {
                coinName = coinName.replace("floki-inu", "floki");
              }
              if (coinName.includes("rich-quack")) {
              coinName = coinName.replace("rich-quack", "richquack");
              }
              if (coinName.includes("xrp")) {
                coinName = coinName.replace("xrp", "ripple");
              }
              if (coinName.includes("quant")) {
                coinName = coinName.replace("quant", "quant-network");
              }
              if (coinName.includes("polygon")) {
                coinName = coinName.replace("polygon", "matic-network");
              }
              if (coinName.includes("avalanche")) {
                coinName = coinName.replace("avalanche", "avalanche-2");
              }
              if (coinName.includes("cronos")) {
                coinName = coinName.replace("cronos", "crypto-com-chain");
              }
              if (coinName.includes("egold")) {
                coinName = coinName.replace("egold", "elrond-erd-2");
              }
              if (coinName.includes("haven-protocol")) {
                coinName = coinName.replace("haven-protocol", "haven");
              }
              if (coinName.includes("firo")) {
                coinName = coinName.replace("firo", "zcoin");
              }
              if (coinName.includes("stacks")) {
                coinName = coinName.replace("stacks", "blockstack");
              }
              if (coinName.includes("conflux-network")) {
                coinName = coinName.replace("conflux-network", "conflux-token");  
              }

              
              return { coinName: coinName, coinId: coinId };

          });

          portfolio.analysis.push(...analysisItems);
      
          await api.patch(`http://localhost:3006/portfolios/${props.id}`, { analysis: portfolio.analysis });
          console.log(response.data);

          
          props.coinRefresh();

        } catch (error) {
          console.error(error);
        }
      };


      console.log("PortfolioCoins: "+PortfolioCoins);
      console.log("props.id: "+props.id);


     console.log("PORTFOLIO coin: "+props.id)
     
  if(PortfolioCoins !== undefined){

    return ( 
        <div  className="ui container coin-portfolio">
            <div className="ui relaxed divided list"> 
                <div className="coin-table-header">                 
                    <div className="headerCell" align="left">Coin</div>
                    <div className="headerCell" align="left">Market Cap</div>
                    <div className="headerCell" align="left">Price</div>
                    <div className="headerCell" align="left">24-Hour Change</div>
                    <div className="headerCell" align="left">7-Day Change</div>
                    <div className="headerCell" align="left">30-Day Change</div>
                    

                </div> 
                   
                {
                  PortfolioCoins.map((coin, index) => (
                    
                    <PortfolioCoin CoinId={coin} key={coin} PortfolioId={props.id} CoinRefresh={props.coinRefresh} />
                    
                ))}              
            
                <button className="ui button blue right" onClick={addAllCoinsToAnalysis}>Add All Coins to Analysis</button>

            </div>
        </div>
    );

  } else {

    return(<div  className="ui container coin-portfolio">
            <div className="ui relaxed divided list"> 
                <div className="coin-table-header">                 
                    <div className="headerCell" align="left">Coin</div>
                    <div className="headerCell" align="left">Market Cap</div>
                    <div className="headerCell" align="left">Price</div>
                    <div className="headerCell" align="left">24-Hour Change</div>
                    <div className="headerCell" align="left">7-Day Change</div>
                    <div className="headerCell" align="left">30-Day Change</div>               

                </div>              

                <button className="ui button blue right" onClick={addAllCoinsToAnalysis}>Add All Coins to Analysis</button>

            </div>
        </div>);

  }

};
export default PortfolioCoinList;