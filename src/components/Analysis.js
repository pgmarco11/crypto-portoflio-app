import {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import axios from 'axios';
import api from '../api/portfolios';

function Analysis() {

    const [analysisCoins, setAnalysisCoins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [noCoins, setNoCoins] = useState(false);
    const [coinData, setCoinData] = useState([]);
    const [marketCapSortOrder, setMarketCapSortOrder] = useState(null);
    const [volumeSortOrder, setVolumeSortOrder] = useState(null);  
    const [predictValue, setPredictValue] = useState(null);  

    const handleSortByMarketCap = () => {
        setMarketCapSortOrder(marketCapSortOrder === "asc" ? "desc" : "asc");
        setVolumeSortOrder(null);
    };

    const handleSortByVolume = () => {
        setVolumeSortOrder(volumeSortOrder === "asc" ? "desc" : "asc");
        setMarketCapSortOrder(null)
      };

    const handleCoinPrediction = (event) => {        

        // setPredictValue(event.target.value);
    };

    useEffect(() => { 
        GetAnalysisCoins();   
    }, [])  

    const GetAnalysisCoins = async () => {
        
        const portfolios = await api.get("http://localhost:3006/portfolios"); 

        let allAnalysisCoins = [];
        for (let i = 0; i < portfolios.data.length; i++) {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolios.data[i].id}`);
            allAnalysisCoins = allAnalysisCoins.concat(response.data.analysis);
        }
        setAnalysisCoins(allAnalysisCoins);  
        
        let allCoins = null;
        if(allAnalysisCoins != []) {
            allCoins = allAnalysisCoins.join(','); 
        }

        console.log("allCoins: "+allCoins);  

        if(allCoins != null && allCoins != "" ){
            setNoCoins(false);
            setIsLoading(true);

            const marketChartData = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${allCoins}&price_change_percentage=30d%2C200d%2C1y`);
          
            const historicalDataPromises = marketChartData.data.map((coinData) => {
              return axios.get(`https://api.coingecko.com/api/v3/coins/${coinData.id}/market_chart?vs_currency=usd&days=max`);
            });
            const historicalData = await Promise.all(historicalDataPromises);
          
            let now = new Date();
            const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
            const ninetyDaysAgoTimestamp = Math.floor(ninetyDaysAgo - 1 / 1000);
            const ninetyDaysAgoDate = new Date(ninetyDaysAgoTimestamp);
            const ninetyDaysAgoDay = ninetyDaysAgoDate.getDate().toString();
            const ninetyDaysAgoMonth = ninetyDaysAgoDate.getMonth() + 1;
            const ninetyDaysAgoYear = ninetyDaysAgoDate.getFullYear();
          
            const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
            const oneYearAgoTimestamp = Math.floor(oneYearAgo - 1 / 1000);
            const oneYearAgoDate = new Date(oneYearAgoTimestamp);
            const oneYearAgoDay = oneYearAgoDate.getDate().toString();
            const oneYearAgoMonth = oneYearAgoDate.getMonth() + 1;
            const oneYearAgoYear = oneYearAgoDate.getFullYear(); 
                      
            let coinData = [];
            for (let [index, value] of Object.entries(marketChartData.data)) {
              console.log("coin values: "+value)
          
              const market_chart_prices = historicalData[index].data.prices;
          
              const earliestTimestamp = market_chart_prices[0][0]; // timestamp of the first recorded price
              const earliestDate = new Date(earliestTimestamp); // convert timestamp to Date object          
              let startyear = earliestDate.getFullYear();
              let startday = earliestDate.getDate().toString();
              startday = startday.length < 2 ? "0" + startday : startday;
                         
              let startmonth = earliestDate.getMonth() + 2;
          
              console.log("before year: "+startyear);   
          
              if(startmonth > 12){
                startmonth = startmonth - 12;
                startyear = earliestDate.getFullYear() + 1;
              } else if(startmonth > 12 && startday > 28) {
                startmonth = startmonth - 12;
                startday = "01";
                startyear = earliestDate.getFullYear() + 1;
              }
          
              console.log("after + 2 month: "+startmonth);        
               
              startmonth = startmonth.toString().length < 2 ? "0" + startmonth : startmonth;
                          
              let inceptionDate = startday+"-"+startmonth+"-"+startyear;    
                          
              console.log("inceptionDate: "+inceptionDate);
                            
                let ninetyDaysAgoPrice = null;
                for (let i = 0; i < market_chart_prices.length; i++) {
                        const ninetyDayArrayTimestamp = market_chart_prices[i][0];
                        const ninetyDayArrayPrice = market_chart_prices[i][1];
                        const ninetyDaysAgoArrayDate = new Date(ninetyDayArrayTimestamp);
                        const ninetyDaysAgoArrayDay = ninetyDaysAgoArrayDate.getDate().toString();
                        const ninetyDaysAgoArrayMonth = ninetyDaysAgoArrayDate.getMonth() + 1;
                        const ninetyDaysAgoArrayYear = ninetyDaysAgoArrayDate.getFullYear();
                        
                        if(ninetyDaysAgoArrayDay === ninetyDaysAgoDay && ninetyDaysAgoArrayMonth === ninetyDaysAgoMonth && ninetyDaysAgoArrayYear === ninetyDaysAgoYear ){
                            ninetyDaysAgoPrice = ninetyDayArrayPrice;
                            break;                     
                        } 
                }     

                const current_market_chart_btc = await axios.get(`https://api.coingecko.com/api/v3/coins/${value.id}/market_chart?vs_currency=btc&days=max`);

                const market_chart_btc_prices = current_market_chart_btc.data.prices;
                const currentBtcPrice = market_chart_btc_prices.slice(-1)[0][1];  

                let yearAgoBtcPrice = null;
                for (let i = 0; i < market_chart_btc_prices.length; i++) {
                    const yearAgoBtcPriceTimestamp = market_chart_btc_prices[i][0];
                    const yearAgoBtcPriceArray = market_chart_btc_prices[i][1];
                    const yearAgoBtcPriceArrayDate = new Date(yearAgoBtcPriceTimestamp);
                    const yearAgoBtcPriceArrayDay = yearAgoBtcPriceArrayDate.getDate().toString();
                    const yearAgoBtcPriceArrayMonth = yearAgoBtcPriceArrayDate.getMonth() + 1;
                    const yearAgoBtcPriceArrayYear = yearAgoBtcPriceArrayDate.getFullYear();

                    
                    
                    if(yearAgoBtcPriceArrayDay === oneYearAgoDay && yearAgoBtcPriceArrayMonth === oneYearAgoMonth && yearAgoBtcPriceArrayYear === oneYearAgoYear ){
                        yearAgoBtcPrice = yearAgoBtcPriceArray;
                        break;                     
                    } 
                } 
                
                const startDateCoinData = await axios.get(`https://api.coingecko.com/api/v3/coins/${value.id}/history?date=${inceptionDate}`);
                
                let inceptionPriceChange = (
                    (value.current_price - startDateCoinData.data.market_data.current_price.usd) /
                    (startDateCoinData.data.market_data.current_price.usd)
                );

                let maxChartGrade = null;
                if( parseInt(inceptionPriceChange) >= 2.0 ){                          
                    maxChartGrade = "A";
                } else if( parseInt(inceptionPriceChange) >= 1.0 && parseInt(inceptionPriceChange) < 2.0 ){                    
                    maxChartGrade = "B";
                } else if( parseInt(inceptionPriceChange) < 1.0 && parseInt(inceptionPriceChange) > 0){                
                    maxChartGrade = "C";
                } else {                
                    maxChartGrade = "D";
                }

                let oneYearPercentChange = value.price_change_percentage_1y_in_currency;
                if (oneYearPercentChange === null) {
                    oneYearPercentChange = "N/A"
                } else {
                oneYearPercentChange = value.price_change_percentage_1y_in_currency.toLocaleString('en-US', {minimumFractionDigits: 4}) + "%";
                }
                console.log(value.id+" yearAgoBtcPrice: "+yearAgoBtcPrice);

                let oneYearBTCPercentChange = null;
                if(yearAgoBtcPrice === null){
                    oneYearBTCPercentChange = 'N/A'
                } else {
                    oneYearBTCPercentChange = (currentBtcPrice - yearAgoBtcPrice) / yearAgoBtcPrice;
                }
                let oneYearBTCPriceChange = (currentBtcPrice - yearAgoBtcPrice); 

                console.log(value.id+" oneYearBTCPercentChange: "+oneYearBTCPercentChange);
                let ninetyDaysPercentChange = (value.current_price - ninetyDaysAgoPrice) / ninetyDaysAgoPrice;   
                    
                coinData.push({
                    id: value.id,
                    name: value.name,
                    current_price: value.current_price,
                    marketCap: value.market_cap.toLocaleString('en-US'),
                    volume: value.total_volume.toLocaleString('en-US'),
                    oneYearPercentChange: oneYearPercentChange,
                    oneYearBTCPercentChange: oneYearBTCPercentChange.toLocaleString(undefined, { style: 'percent' }),
                    oneYearBTCPriceChange: oneYearBTCPriceChange.toLocaleString('en-US', {minimumFractionDigits: 10}),
                    inceptionPriceChange: inceptionPriceChange.toLocaleString(undefined, { style: 'percent' }),
                    ninetyDaysPercentChange: ninetyDaysPercentChange.toLocaleString(undefined, { style: 'percent' }),
                    maxChartGrade: maxChartGrade,
                });  


                setCoinData(coinData); 
                 

            };

            setIsLoading(false);           

        } else {
            setNoCoins(true);
        }            
            
        };
        
        const sortedCoins = coinData ? coinData.slice().sort((a, b) => {
            if (marketCapSortOrder === "asc") {
                return a.marketCap - b.marketCap;
            } else if (marketCapSortOrder === "desc") {
                return b.marketCap - a.marketCap;
            } else if (volumeSortOrder === "asc") {
                return a.volume - b.volume;
            } else if (volumeSortOrder === "desc") {
                return b.volume - a.volume;
            }
        }) : [];

        const removeCoinHandler = async (CoinId) => {
            // your logic to delete the analysis coin from the API
            try { 
                setIsLoading(true);
                const portfolios = await api.get("http://localhost:3006/portfolios");             
                    
                for (let i = 0; i < portfolios.data.length; i++) {

                const portfolio = await api.get(`http://localhost:3006/portfolios/${portfolios.data[i].id}`);            
            
                    for (let c = 0; c < portfolio.data.analysis.length; c++) {
                        if(portfolio.data.analysis[c] === CoinId){

                            const coinIndex = portfolio.data.analysis.indexOf(CoinId);
                            
                            if (coinIndex === -1) {
                            throw new Error(`Analysis Coin with id ${CoinId} could not found in portfolio with id ${portfolios.data[i].id}`);
                            }

                            // remove the coin from the portfolio's coins array
                            portfolio.data.analysis.splice(coinIndex, 1);

                            // update the portfolio with the new coins array---
                            await api.patch(`http://localhost:3006/portfolios/${portfolios.data[i].id}`, { analysis: portfolio.data.analysis });                        

                        }
                    }

                    let analysisCoins = [];
                    setAnalysisCoins(portfolio.data.analysis)

                }     
                
            

            setIsLoading(false);            
            
        } catch (error) {
            console.error(error);
        }
        
    }; 




    if (isLoading) return <div>Loading...</div>;
    if (noCoins) return <div>Add some coins to analyze!</div>;

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
                        <div 
                            className="headerCell" 
                            align="left"
                            onClick={handleSortByVolume}
                            >
                            Price{" "}
                            {/* {volumeSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : volumeSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            USD 1YR % Change{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            BTC 1YR % Change{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            BTC 1YR Change{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            Inception % Change{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            3 Months % Change{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            Max Chart Grade{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                        <div 
                            className="headerCell" 
                            align="left"                            
                            >
                            Price Prediction{" "}
                            {/* {yearAgoSortOrder === "asc" ? (
                                    <i className="arrow up icon"></i>
                                ) : yearAgoSortOrder === "desc" ? (
                                    <i className="arrow down icon"></i>
                                ) : (
                                    <i className="arrow icon"></i>
                                )} */}
                        </div>
                    </div>
                    {sortedCoins.map(coin => ( 
                    <div key={coin.id}>
                        <div className="item rowCell" align="left">
                        <Link to={`/coin/${coin.id}`}>{coin.name}</Link>
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.marketCap}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.volume}
                        </div>
                        <div className="item rowCell" align="left">
                        ${coin.current_price}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.oneYearPercentChange}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.oneYearBTCPercentChange}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.oneYearBTCPriceChange}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.inceptionPriceChange}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.ninetyDaysPercentChange}
                        </div>
                        <div className="item rowCell" align="left">
                        {coin.maxChartGrade}
                        </div>
                        <div className="item rowCell" align="left">
                        <input type="text" onChange={(e) => handleCoinPrediction(e.target.value) } />
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