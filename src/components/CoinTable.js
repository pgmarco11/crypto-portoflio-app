import { React } from "react";
import { useState } from "react";
import CoinTableRow from './CoinTableRow';
import axios from "axios";
import api from "../api/portfolios";

function CoinTable({ coinData, updateNoCoins }) {

    const [analysisCoins, setAnalysisCoins] = useState([]);
    const [coinInputValues, setCoinInputValues] = useState({});
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortBy, setSortBy] = useState("MKTCAP");  
    const [coinDataState, setCoinDataState] = useState(coinData);

    const handleSort = (attribute) => {
        // Update sort order and attribute    
        setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
        setSortBy(attribute);
    };

    const sortedCoins = coinDataState.slice().sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        const parsePercent = (value) => {
            if (typeof value === 'string' && value.includes('%')) {
                return parseFloat(value.replace('%', '')); // Return as a float
            }
            return value;
        };
    
        // Convert to numbers while handling percentages
        const aNumericValue = parsePercent(aValue);
        const bNumericValue = parsePercent(bValue);
    
        // If both values are numbers, sort numerically
        if (!isNaN(aNumericValue) && !isNaN(bNumericValue)) {
            return sortOrder === 'asc' ? aNumericValue - bNumericValue : bNumericValue - aNumericValue;
        }
    
        // If both values are strings, sort alphabetically
        if (typeof aNumericValue === 'string' && typeof bNumericValue === 'string') {
            return sortOrder === 'asc' ? aNumericValue.localeCompare(bNumericValue) : bNumericValue.localeCompare(aNumericValue);
        }
    
        // Default fallback for mixed types (string and number)
        return sortOrder === 'asc' ? aNumericValue - bNumericValue : bNumericValue - aNumericValue;
    });    
    

    async function handleInputChange(e, coinId) {
        try {
            console.log("coinId: " + coinId);
            if (e === '') {
                setCoinInputValues((prevInputValues) => ({
                    ...prevInputValues,
                    [coinId]: ''
                }));
            } else {
                const newValue = !isNaN(e) ? e : 0;
                setCoinInputValues((prevInputValues) => ({
                    ...prevInputValues,
                    [coinId]: newValue,
                }));
            }
        } catch (error) {
            console.log(error);
        }
    };    

    async function removeCoinHandler(coinId) {
        try {
            console.log("removeCoinHandler coinId: " + coinId);
    
            const portfolios = await api.get("http://localhost:8888/portfolios");
            console.log("removeCoinHandler portfolios: ", portfolios.data);
    
            // Iterate over portfolios to find and update analysis
            for (const portfolio of portfolios.data) {
                const updatedAnalysis = portfolio.analysis.filter(item => item.coinId !== coinId);
    
                if (updatedAnalysis.length === portfolio.analysis.length) {
                    console.log(`No matching coin found in portfolio ${portfolio.id} for coin ${coinId}`);
                    continue;
                }   

                const updatedPortfolio = { ...portfolio, analysis: updatedAnalysis };
    
                console.log("removeCoinHandler updatedPortfolio: ", updatedPortfolio);
    
                // Update the portfolio with the updated analysis
                await api.patch(`http://localhost:8888/portfolios/${portfolio.id}`, updatedPortfolio);
            }
    
            // Remove the coin from coinDataState to reflect the change in UI
            setCoinDataState(prevCoins => prevCoins.filter(coin => coin.id !== coinId));             
    
        } catch (error) {
            console.error("Error removing coin:", error);
        }
    }
    
    

    async function removeAllCoinsHandler() {
        try {
            const portfolios = await api.get("http://localhost:8888/portfolios");
    
            for (let i = 0; i < portfolios.data.length; i++) {
                const portfolioId = portfolios.data[i].id;
    
                // Update the portfolio data to remove all analysis
                await api.patch(`http://localhost:8888/portfolios/${portfolioId}`, { analysis: [] });
            }
    
            // After removing all coins, fetch updated portfolios data
            const updatedPortfolios = await api.get(`http://localhost:8888/portfolios`);
    
            // Update state to reflect the updated portfolios
            setAnalysisCoins(updatedPortfolios.data);
    
            // Clear coinDataState to reflect the changes in UI
            setCoinDataState([]);
    
            // Update noCoins state in the parent component
            updateNoCoins(true);

        } catch (error) {
            console.error("Error removing all coins:", error);
        }
    } 

    async function updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell) {
        try {
            const updatedCoinData = coinDataState.map((coin) => {
                if (coin.id === coinId) {
                    const newGainPredictionFormatted = newGainPrediction ? newGainPrediction.toFixed(4) : null;
                    const newAvgGainPredictionFormatted = newAvgGainPrediction ? newAvgGainPrediction.toFixed(4) : null;
                    return {
                        ...coin,
                        prediction: predictionPrice,
                        gainPrediction: newGainPredictionFormatted,
                        avgGainPrediction: newAvgGainPredictionFormatted,
                        buysell: buysell,
                        buysellrating: totalrating
                    };
                }
                return coin;
            });
            setCoinDataState(updatedCoinData);
        } catch (error) {
            console.error("Error updating coin data for prediction:", error);
        }
    }
    
    async function updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell) {
        try {
            const coinToUpdate = coinDataState.find(coin => coin.id === coinId);
            if (!coinToUpdate) {
                console.error(`Coin with id ${coinId} not found.`);
                return;
            }
    
            const apiUrl = `http://localhost:8888/portfolios`;
            const response = await axios.get(apiUrl);
            const portfolios = response.data;
    
            const portfolio = portfolios.find((p) => p.analysis.some((analysisItem) => analysisItem.coinId.toLowerCase() === coinId.toLowerCase()));
            if (!portfolio) {
                console.error(`No portfolio found for coinId: ${coinId}`);
                return;
            }
    
            const portfolioId = portfolio.id;
            const portfolioUrl = `http://localhost:8888/portfolios/${portfolioId}`;
            const responsePortfolio = await axios.get(portfolioUrl);
            const portfolioAnalysis = responsePortfolio.data;
    
            const updatedAnalysis = portfolioAnalysis.analysis.map((analysisItem) => {
                if (analysisItem.coinId.toLowerCase() === coinId.toLowerCase()) {
                    return {
                        ...analysisItem,
                        prediction: predictionPrice.toString()
                    };
                }
                return analysisItem;
            });
    
            const updatedPortfolio = {
                ...portfolio,
                analysis: updatedAnalysis,
            };
    
            await axios.put(apiUrl + `/${portfolioId}`, updatedPortfolio);
            updateCoinDataForPrediction(coinId, totalrating, predictionPrice, newGainPrediction, newAvgGainPrediction, buysell);
            
        } catch (error) {
        console.error("Error updating coin prediction:", error);
        }

    }
    

    async function handleCoinPrediction(
        predictionPrice,
        coinCurrentPrice,
        coinId,
        oneYearPercentChange,
        buysellrating,
        buysell,
        ninetyDaysPercentChange
    ) {
        try {
            console.log("handleCoinPrediction input value : ", predictionPrice);
            let newGainPredictionScore = 0;
            let newAvgGainPredictionScore = 0;
            let newGainPrediction = null;
            let newAvgGainPrediction = null;
            let totalrating = null;

            let coin = coinData.find((coin) => coin.id === coinId);
            console.log("handleCoinPrediction Coin Data:", coinData);
            console.log("handleCoinPrediction Matched Coin:", coin);

            if (!coin) {
                console.error(`handleCoinPrediction Coin with id ${coinId} not found in coinData.`);
                return;
            }

            if (!predictionPrice) {
                predictionPrice = parseFloat(coin.prediction);
                newGainPrediction = parseFloat(
                    (predictionPrice - coinCurrentPrice) / coinCurrentPrice
                );
            } else {
                newGainPrediction = parseFloat(
                    (parseFloat(predictionPrice) - coinCurrentPrice) / coinCurrentPrice
                );
            }

            if (oneYearPercentChange === 0) {
                newAvgGainPrediction = parseFloat((newGainPrediction + 0) / 2);
            } else {
                newAvgGainPrediction = parseFloat(
                    (newGainPrediction + parseFloat(oneYearPercentChange) / 100) / 2
                );
            }

            if (!predictionPrice) {
                newGainPredictionScore = 0;
                newAvgGainPredictionScore = 0;
            } else {
                if (newGainPrediction > 0.0300) {
                    newGainPredictionScore = 2;
                }
                if (newAvgGainPrediction > 0.0300) {
                    newAvgGainPredictionScore = 1;
                }
                totalrating = buysellrating + newGainPredictionScore + newAvgGainPredictionScore;

                console.log("BUYSELL ninetyDaysPercentChange: ",parseInt(ninetyDaysPercentChange));

                if (buysell === 'BUY' && totalrating > 3 && parseInt(ninetyDaysPercentChange) < 40) {
                    buysell = "BUY";
                } else if (buysell === 'HODL' && totalrating > 3 && parseInt(ninetyDaysPercentChange) < 40) {
                    buysell = "BUY";
                } else if (buysell === 'SELL' && totalrating < 4 && parseInt(ninetyDaysPercentChange) > 50) {
                    buysell = "SELL";
                } else if (buysell === 'SELL' && totalrating > 3 && parseInt(ninetyDaysPercentChange) < 50) {
                    buysell = "HODL";
                } else {
                    buysell = "HODL";
                }
            }

            updateCoinPrediction(coinId, predictionPrice, totalrating, newGainPrediction, newAvgGainPrediction, buysell);

        } catch (error) {
            console.error("Error handling coin prediction:", error);
        }
    }


    return (
        <div className="analysis-main">
        <div className="app-main">
          <div className="ui coin-analysis">            
            {(
                <>      
                    <div className="ui relaxed divided list">
                        <div className="coin-table-header">
                            <div
                                className={`headerCell ${sortBy === "name" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("name")}
                            >
                            Coin {" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "marketCap" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("marketCap")}
                            >
                            Market Cap{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "volume" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("volume")}
                            >
                            Volume{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "coinCurrentPrice" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("coinCurrentPrice")}
                            >
                            Price{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "oneYearPercentChange" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("oneYearPercentChange")}
                            >
                            USD 1YR % Change{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "oneYearBTCPercentChange" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("oneYearBTCPercentChange")}
                            >
                            BTC 1YR % Change{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "oneYearBTCPriceChange" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("oneYearBTCPriceChange")}
                            >
                            BTC 1YR Change{" "}
                            </div>  
                            <div
                                className={`headerCell ${sortBy === "ninetyDaysPercentChange" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("ninetyDaysPercentChange")}
                            >
                            3 Months % Change{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "inceptionPriceChange" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("inceptionPriceChange")}
                            >
                            Inception Est. % Change{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "maxChartGrade" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("maxChartGrade")}
                            >
                            Max Chart Grade{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "prediction" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("prediction")}
                            >
                            Price Prediction{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "gainPrediction" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("gainPrediction")}
                            >
                            Future Gain Prediction{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "avgGainPrediction" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("avgGainPrediction")}
                            >
                            Avg. Gain Prediction{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "highestPricePercentage" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("highestPricePercentage")}
                            >
                            % from ATH{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "twitterFollowers" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("twitterFollowers")}
                            >
                            Twitter Followers{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "gitRepository" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("gitRepository")}
                            >
                            Git Source{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "rating" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("rating")}
                            >
                            Coin Score{" "}
                            </div>
                            <div
                                className={`headerCell ${sortBy === "buysell" ? "active" : ""}`}
                                align="left"
                                onClick={() => handleSort("buysell")}
                            >
                            Buy/Sell/Hodl{" "}                
                        </div>
                        </div>                           
                        {sortedCoins.map((coin) => (
                                <div className="coin-table-row" key={coin.id}>
                                    <CoinTableRow
                                        key={coin.id}
                                        coin={coin}
                                        handleInputChange={handleInputChange}
                                        coinInputValues={coinInputValues}
                                        handleCoinPrediction={handleCoinPrediction}
                                        removeCoinHandler={removeCoinHandler}
                                    />
                                </div>
                        ))}                                                   
                    </div>
                    <button className="ui red basic button" onClick={() => removeAllCoinsHandler()}>
                    Delete All
                    </button>
                </>
            )}
        </div>
        </div>
    </div>
    );
}

export default CoinTable;
