import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import api from '../api/portfolios';
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { doc, setDoc, Timestamp } from "firebase/firestore"; 

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyA6ITy5JCbhGhLJRGfjbb1QiARFVBF2SKM",
//     authDomain: "digitalcryptozone.firebaseapp.com",
//     projectId: "digitalcryptozone",
//     storageBucket: "digitalcryptozone.appspot.com",
//     messagingSenderId: "420211325690",
//     appId: "1:420211325690:web:4e2ccf5ba8b336f277e743",
//     measurementId: "G-RXVHNQG210"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const PortfolioCoinList = (props) => {

    const [coinData, setCoinData] = useState([]);    

    console.log("PortfolioCoin props coinId: "+props.CoinId);

    console.log("PortfolioCoin props PortfolioId: "+props.PortfolioId);

      useEffect(() => {
        
        axios.get(`https://api.coingecko.com/api/v3/coins/${props.CoinId}`)
          .then(res => {
                setCoinData(res.data); 
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
            return axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`)
                .then(res => res.data)
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
                portfolio.analysis.push(coinId);
                await api.patch(`http://localhost:3006/portfolios/${props.PortfolioId}`, { analysis: portfolio.analysis } );
                console.log(response.data);
                props.CoinRefresh();
             } catch (error) {
                console.error(error);
              } 

    };


    return (        
    
        <div className="coin-table-row" key={props.CoinId}>                
            <div className="item rowCell image">
                {coinData.image && <img src={coinData.image.thumb} alt={props.CoinId} />}
                {coinData.name && <span className='coindata'>{coinData.name}</span> }
                {coinData.symbol && <span className='coindata'>{coinData.symbol.toUpperCase()}</span> }
            </div>
            <div className="item rowCell price">            
               {coinData.market_data && coinData.market_data.current_price.usd.toLocaleString(
                'en-US', {style: 'currency', currency: 'USD'}
                )}                 
            </div>
            <div className="item rowCell marketcap">            
               {coinData.market_data && coinData.market_data.market_cap.usd.toLocaleString(
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