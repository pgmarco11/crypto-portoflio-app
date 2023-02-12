import {useState, useEffect, useId} from "react"
import { Link } from "react-router-dom"
import axios from 'axios';
import api from '../api/portfolios';
import CoinAnalysis from './CoinAnalysis';

function Analysis() {

    const [analysisCoins, setAnalysisCoins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const GetAnalysisCoins = async () => {
        setIsLoading(true);
        const portfolios = await api.get("http://localhost:3006/portfolios"); 
        let allAnalysisCoins = [];
        for (let i = 0; i < portfolios.data.length; i++) {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolios.data[i].id}`);
            allAnalysisCoins = allAnalysisCoins.concat(response.data.analysis);
        }
        setAnalysisCoins(allAnalysisCoins);
        setIsLoading(false);
    };

    useEffect(() => { 
        GetAnalysisCoins();
    }, [])

    const removeCoinHandler = async (CoinId) => {
        // your logic to delete the analysis coin from the API
        try { 
            setIsLoading(true);
            const portfolios = await api.get("http://localhost:3006/portfolios"); 
            
                  
            for (let i = 0; i < portfolios.data.length; i++) {

            const portfolio = await api.get(`http://localhost:3006/portfolios/${portfolios.data[i].id}`);
            
            console.log("CoinId: "+CoinId)
            console.log("portfolios.data.analysis: "+portfolio.data.analysis)            
           
            for (let c = 0; c < portfolio.data.analysis.length; c++) {
                if(portfolio.data.analysis[c] === CoinId){

                    console.log("portfolio.data.analysis: eqauls delete: "+portfolio.data.analysis[c])

                    const coinIndex = portfolio.data.analysis.indexOf(CoinId);

                    console.log("portfolio.data.analysis: eqauls delete 2: "+coinIndex)

                    if (coinIndex === -1) {
                    throw new Error(`Analysis Coin with id ${CoinId} not found in Coin Analysis with id ${portfolio.data.analysis[c]}`);
                    }

                    // remove the coin from the portfolio's coins array
                    portfolio.data.analysis.splice(coinIndex, 1);

                    // update the portfolio with the new coins array---
                    await api.patch(`http://localhost:3006/portfolios/${portfolios.data[i].id}`, { analysis: portfolio.data.analysis });

                }
            }
            }             

            // call GetAnalysisCoins after the portfolio has been updated in the backend
            GetAnalysisCoins();
            setIsLoading(false);            
            
        } catch (error) {
            console.error(error);
        }
        
    }; 

    console.log("Portfolios analysis: "+analysisCoins)

    if (isLoading) return <div>Loading...</div>;

return(
    <div className="analysis-main"> 
        <div className="app-main"> 
            <div  className="ui container coin-analysis">
               <div className="ui relaxed divided list"> 
                    <div className="coin-table-header">                        
                        <div className="headerCell" align="left">Coin</div>
                        <div className="headerCell" align="left">Market Cap</div>
                        <div className="headerCell" align="left">Volume</div>
                    </div>                   
                    {analysisCoins.map(coin => (
                            <CoinAnalysis coinId={coin} key={coin} removeCoin={removeCoinHandler}/>
                    ))}                   
                </div>
            </div>
        </div> 
    </div>
    )

}

export default Analysis;