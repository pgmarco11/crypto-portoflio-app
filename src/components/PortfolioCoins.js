
import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import api from '../api/portfolios';
import debounce from 'lodash.debounce';
import Spinner from './Spinner';
import PortfolioCoinList from './PortfolioCoinList';


const PortfolioCoins = (props) => {


    const [coinData, setCoinData] = useState([]);
    const [selectedCoinId, setSelectedCoinId] = useState('');
    const [portfolioCoins, setPortfolioCoins] = useState([]); // add this state variable to store the portfolio's coins data
    const [portfolioStartDate, setPortfolioStartDate] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [chartData, setChartData] = useState(null);
    

    const portfolioId = props.portfolioId;

    useEffect(() => {
      api.get(`http://localhost:3006/portfolios/${portfolioId}`)
        .then(response => {
          setPortfolioCoins(response.data.coins); // Update the portfolioCoins state variable with the portfolio's coins data
          setPortfolioStartDate(response.data.start_date);
        })
        .catch(error => {
          console.log(error.message);
        });
    }, [portfolioId]);


    useEffect(() => {
      setIsLoading(true);
      axios
        .get(
          `https://min-api.cryptocompare.com/data/all/coinlist?api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
        )
        .then((response) => {
          setCoinData(Object.values(response.data.Data)); // extract array of coins from the Data property
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error.message);
          setIsLoading(false);
        });
    }, [portfolioId]);


    useEffect(() => {
      
        if ( parseInt(portfolioValue) > 0) {         
          setChartData(null)
          fetchChartData(portfolioId, portfolioCoins);          
        }

    }, [portfolioCoins,portfolioValue]);    


    async function getCoinAmount(coin, portfolioId) {
        try {

          const response = await api.get(`http://localhost:3006/portfolios/${portfolioId}`);
          const portfolio = response.data; // Assuming response.data is an object with properties

          
          // Check if the 'values' property exists and it is an array
          if (Array.isArray(portfolio.values)) {
            const coinValue = portfolio.values.find((value) => value.coinId === coin);
            return coinValue ? coinValue.amount : 0;
          } else {
            return 0;
          }
          

        } catch (error) {
          console.log(error.message);
          return 0;
        }
      };

      function parseCryptoCompareResponse(apiResponse) {
        try {

          let parsedData = {
            date: 0, //the timestamp
            price: 0 //price for the date
          }; 
              
          
          if(apiResponse.Data.Data !== undefined){

            parsedData = {
              date: apiResponse.Data.Data[0].time, //the timestamp
              price: apiResponse.Data.Data[0].close //price for the date
            };            

            return parsedData;

          } else {            

                    return 0;
          }      
          
        } catch (error) {
          console.error('Error parsing Crypto compare API response:', error);
          return []; // Return an empty array in case of any errors
        }
      }

    function parseMessariResponse(apiResponse) {
        try {

          let parsedData = {
            date: 0, //the timestamp
            price: 0 //price for the date
          }; 
          
          if(apiResponse.data.values !== null){

            parsedData = {
              date: apiResponse.data.values[0][0], //the timestamp
              price: apiResponse.data.values[0][4] //price for the date
            }; 

            return parsedData;

          } else {            

            return 0;
          }      
          
        } catch (error) {
          console.error('Error parsing Messari API response:', error);
          return []; // Return an empty array in case of any errors
        }
      }

      async function fetchChartData(portfolioId, portfolioCoins) {
    
          const today = new Date();
          const twentyOneDaysAgo = new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000); // 21 days ago
          const portfolioStartDateHuman = new Date(portfolioStartDate * 1000);
      
          const startDate =
            portfolioStartDateHuman > twentyOneDaysAgo ? portfolioStartDateHuman : twentyOneDaysAgo;
      
          let totalPortfolioValues = [];
          let dates = [];
      
          for (let i = 0; i < 21; i++) {
            
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateString = date.toISOString().slice(0, 10);
      
            let updatePortfolioValue = 0; // Initialize the value for each day  
      
            for (const coin of portfolioCoins) {
              const assetId = coin;
            
              try {
                const response = await api.get(
                  `https://data.messari.io/api/v1/assets/${assetId}/metrics/price/time-series`,
                  {
                    params: {
                      start: dateString,
                      end: dateString,
                      format: 'json',
                      interval: '1d',
                    },
                  }
                );
            
                let coinValues = null;
            
                if (response.status === 400 || response.status === 404) {
                  const backup_response = await axios.get(
                    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${assetId}&tsym=USD&ts=${dateString}`
                  );
            
                  coinValues = parseCryptoCompareResponse(backup_response.data);
                } else {

                  coinValues = parseMessariResponse(response.data);
            
                  if (coinValues === 0 || coinValues === undefined) {
                    const backup_response = await axios.get(
                      `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${assetId}&tsym=USD&ts=${dateString}`
                    );
                    coinValues = parseCryptoCompareResponse(backup_response.data);
                  }
                  
                }
            
                let coinPrice = 0;
                let coinAmount = 0;
                let coinValue = 0;
            
                console.log("coinValues: ", coinValues);
            
                if (coinValues !== null) {
                  if (coinValues !== 0 && coinValues !== undefined) {
                    coinPrice = coinValues?.price || 0;
                    coinAmount = await getCoinAmount(coin, portfolioId);
                    // Accumulate the coin values for the day             
                  }
            
                  console.log("coinValue: ", coinValue);
                  console.log("coinPrice: ", coinPrice);
                  console.log("coinAmount: ", coinAmount);
            
                  coinValue = coinPrice * coinAmount;
                  updatePortfolioValue += coinValue;
                }
              } catch (error) {
                console.error(`Error fetching data for ${assetId}:`, error);
                // Handle error (maybe continue to the next coin or retry logic)
              }
            }
      
            dates.push(dateString);
            totalPortfolioValues.push(updatePortfolioValue);      
     
          }
      
          // Rest of your code remains the same
          const chartData = {
            labels: dates,
            datasets: [
              {
                label: 'Portfolio Value',
                data: totalPortfolioValues,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
              },
            ],
          };
      
          const chartOptions = {
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                  displayFormats: {
                    day: 'MMM DD',
                  },
                },
              },
            },
          };
      
          setChartData({ data: chartData, options: chartOptions });


      }
      

    // Function to receive data from the child component
    async function handlePortoflioValue(data) {
      // Use the data received from the child component   
      if(data > 0)  {
        setPortfolioValue(data);
      }
      
    };

    const filteredCoinData = useMemo(() => coinData.filter(
        coin => (coin.FullName+coin.Symbol.toUpperCase()+coin.Symbol.toLowerCase()+coin.CoinName.toLowerCase()).includes(searchValue)), 
        [coinData, searchValue]);

    async function addCoinToPortfolio(selectedCoinId, portfolioId) {
        try {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolioId}`);
            const portfolio = response.data;

            console.log("portfolio.coins: ",portfolio.coins)

            if (portfolio.coins) { 

              if (portfolio.coins.includes(selectedCoinId)) {
                toast('Coin exists in portfolio', {
                  position: "top-center",
                    autoClose: 3000, // close after 3 seconds
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });                
              } else {  
                portfolio.coins.push(selectedCoinId);
                
                await api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins });             
                CoinRefresh();

              }
            
            } else {

              portfolio.coins = [selectedCoinId]; // If it doesn't exist, create a new array with the selected coin id            
              await api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins });             
              CoinRefresh();

            }
            setSelectedCoinId(''); // reset selectedCoinId to the disabled option

         } catch (error) {
            console.log(error.message);
        }
      };

    const handleSearch = debounce((e) => {
        setSearchValue(e.target.value);
    }, 250);
    
    if(isLoading){
        return <p>Loading...</p>
    };

    async function CoinRefresh () {
        await api.get(`http://localhost:3006/portfolios/${portfolioId}`)
        .then(response => {
            setPortfolioCoins([]);
            const portfolio = response.data;            
            api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins } );
            setPortfolioCoins(response.data.coins); 
        })
        .catch(error => {
            console.log(error.message);
        });
    };  
    
    let chartDataObject = null;

    if(chartData){
      chartDataObject = Object.values(chartData);
    } 

    return (
      
    <div>
        <div className="portfolioValue">
        <span className="left">Total:&nbsp;</span><div className="left">{portfolioValue?.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}</div>
          <br/>
          <br/>
          {chartDataObject != null ? (
            <ResponsiveContainer width="80%" height={300}>
              <LineChart data={chartDataObject[0].labels.map((label, index) => ({ date: label, value: chartDataObject[0].datasets[0].data[index] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Past 21 Day Portfolio Values" stroke="rgba(75,192,192,1)" tension={0.1} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Loading chart data...</p>
          )}          

        </div>



            <div className="ui coin-table">
                
                    <div className="coin-add-ui">
                            

                        <div className="search-container">
                            <input type="text" placeholder="Search for coins" onChange={handleSearch} />
                        </div>                            
                        

                        <div>
                                <select onChange={(e) => setSelectedCoinId(e.target.value)}> 
                                    
                                        <option value="" disabled selected>Coin List</option>
                                        {filteredCoinData.map(
                                                    coin => (
                                                        <option value={coin.Symbol} key={coin.Id}>
                                                            {coin.FullName}
                                                        </option>
                                        ))}

                                
                                </select>

                            <button className="ui button blue right"
                            onClick={() => addCoinToPortfolio(selectedCoinId, portfolioId)}>
                                            Add to Portfolio
                            </button>
                            <ToastContainer className="custom-toast-container" />
                            
                            <PortfolioCoinList 
                            id={portfolioId} 
                            portfolioCoins={portfolioCoins} 
                            coinRefresh={CoinRefresh} 
                            sendValueToCoin={handlePortoflioValue}                                                                                
                            />

                        </div> 
                        
                    </div>

            </div> 
    </div>    
    );

};
export default PortfolioCoins;