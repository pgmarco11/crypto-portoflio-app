import {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import axios from 'axios';
import api from '../api/portfolios';
import CoinAnalysis from './CoinAnalysis';

function Analysis() {

    const [analysisCoins, setAnalysisCoins] = useState([]);
    const [CoinData, setCoinData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [marketCapSortOrder, setMarketCapSortOrder] = useState(null);
    const [volumeSortOrder, setVolumeSortOrder] = useState(null);
    

    const handleSortByMarketCap = () => {
        setMarketCapSortOrder(marketCapSortOrder === "asc" ? "desc" : "asc");
        setVolumeSortOrder(null);
    };

    const handleSortByVolume = () => {
        setVolumeSortOrder(volumeSortOrder === "asc" ? "desc" : "asc");
        setMarketCapSortOrder(null)
      };

    const sortedCoins = CoinData.slice().sort((a, b) => {
        if (marketCapSortOrder === "asc") {
            return a.marketCap - b.marketCap;
        } else if (marketCapSortOrder === "desc") {
            return b.marketCap - a.marketCap;
        } else if (volumeSortOrder === "asc") {
            return a.volume - b.volume;
        } else if (volumeSortOrder === "desc") {
            return b.volume - a.volume;
        } else {
            return 0;
        }
      });
   


    const GetAnalysisCoins = async () => {
        setIsLoading(true);
        const portfolios = await api.get("http://localhost:3006/portfolios"); 

        let allAnalysisCoins = [];
        for (let i = 0; i < portfolios.data.length; i++) {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolios.data[i].id}`);
            allAnalysisCoins = allAnalysisCoins.concat(response.data.analysis);
        }
        setAnalysisCoins(allAnalysisCoins);

        const coinData = await Promise.all(
            allAnalysisCoins.map(async (coin) => {
                const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`);
                return {
                    id: coin,
                    name: response.data.name,
                    marketCap: response.data.market_data.market_cap.usd,
                    volume: response.data.market_data.total_volume.usd,
                };
            })
        );
    
        setCoinData(coinData); 
          
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
                    throw new Error(`Analysis Coin with id ${CoinId} could not found in portfolio with id ${portfolios.data[i].id}`);
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
                        <div
                            className="headerCell"
                            align="left"
                            onClick={handleSortByMarketCap}
                            >
                            Market Cap{" "}
                            {marketCapSortOrder === "asc" ? (
                                <i className="arrow up icon"></i>
                            ) : marketCapSortOrder === "desc" ? (
                                <i className="arrow down icon"></i>
                            ) : <i className="arrow icon"></i>}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"
                            onClick={handleSortByVolume}
                            >
                            Volume{" "}
                            {volumeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : volumeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )}
                        </div>
                    </div>
                    {sortedCoins.map(coin => (
                    <div key={coin.id}>
                        <div className="item rowCell" align="left">
                        {coin.name}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.marketCap}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.volume}
                        </div>
                        <div className="item rowCell" align="left">
                        <button className="ui red basic button"
                            onClick={() => removeCoinHandler(coin.id)}>
                            Delete</button>
                        </div>  
                    </div>                         
                    ))}
                </div>
            </div>
        </div> 
    </div>
    )

}

export default Analysis;