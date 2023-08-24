
import React, { useState, useEffect, useMemo } from 'react';
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

    console.log("PortfolioCoins prop 1: "+props.portfolioName);
    console.log("PortfolioCoins prop 2: "+props.portfolioId);
    console.log("props.portfolioId Portfolio ID: "+props.portfolioId)

    const portfolioId = props.portfolioId;

    useEffect(() => {
      api.get(`http://localhost:3006/portfolios/${portfolioId}`)
        .then(response => {
          setPortfolioCoins(response.data.coins); // Update the portfolioCoins state variable with the portfolio's coins data
          setPortfolioStartDate(response.data.start_date);
        })
        .catch(error => {
          console.error(error);
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
          console.error(error);
          setIsLoading(false);
        });
    }, []);


    useEffect(() => {
      if (portfolioCoins.length > 0 && portfolioStartDate) {
        fetchChartData(portfolioId, portfolioCoins);
      }
    }, [portfolioCoins, portfolioStartDate]);
    
    // Use another useEffect to handle chartData changes
    useEffect(() => {
      console.log("chartData: ", chartData);
      if (chartData) {
        console.log("chartData.data: ", chartData.data);
      }
    }, [chartData]);

    async function getCoinAmount(coin, portfolioId) {
        try {
          console.log("amount coin: ",coin)
          console.log("amount portfolioId: ",portfolioId)
          const response = await api.get(`http://localhost:3006/portfolios/${portfolioId}`);
          const portfolio = response.data; // Assuming response.data is an object with properties

          console.log("amount portfolio: ",portfolio)
          console.log("amount portfolio.values: ",portfolio.values)
          
          // Check if the 'values' property exists and it is an array
          if (Array.isArray(portfolio.values)) {
            const coinValue = portfolio.values.find((value) => value.coinId === coin);
            return coinValue ? coinValue.amount : 0;
          }
          return 0;

        } catch (error) {
          console.error(error);
          return 0;
        }
      };

    function parseMessariResponse(apiResponse) {
        try {

          console.log("apiResponse: ",apiResponse);
          console.log("data apiResponse: ",apiResponse.data);
          console.log("value apiResponse: "+apiResponse.data.values[0][4])       
      
          // Assuming each data point has a 'timestamp' and 'price' property
          const parsedData = {
            date: apiResponse.data.values[0][0], // Assuming the timestamp represents the date of the data point
            price: apiResponse.data.values[0][4] // Assuming 'price' is the property containing the cryptocurrency's price for the date
          };
      
          return parsedData;
        } catch (error) {
          console.error('Error parsing Messari API response:', error);
          return []; // Return an empty array in case of any errors
        }
      }

    async function fetchChartData(portfolioId,portfolioCoins) {

      try {
    
        const today = new Date();
        const twentyOneDaysAgo = new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000); // 21 days ago        
      
        const startDate = portfolioStartDate > twentyOneDaysAgo ? portfolioStartDate : twentyOneDaysAgo;

        console.log("chart portfolioStartDate: "+portfolioStartDate)
        console.log("chart startDate: "+startDate)
      
        const totalPortfolioValues = [];
        const dates = [];
   
        console.log("coins for for loop, portfolioCoins: ",portfolioCoins.length);
      
        for (let i = 0; i < 21; i++) {   
        
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateString = date.toISOString().slice(0, 10);
              
                // Fetch coin prices for the specific date           

                  let updatePortfolioValue = 0;

                  for (const coin of portfolioCoins) {
                    const assetId = coin;
                    const messariResponse = await axios.get(
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
            
                    const coinValues = parseMessariResponse(messariResponse.data);
                    const coinPrice = coinValues?.price || 0;
                    const coinAmount = await getCoinAmount(coin, portfolioId);
            
                    updatePortfolioValue += coinPrice * coinAmount;
                  }
            
                  dates.push(dateString);
                  totalPortfolioValues.push(updatePortfolioValue);  
   
          
          console.log('Total Portfolio Value on'+dateString+' was '+ updatePortfolioValue);

          

    }  

    
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
    
  } catch (error) {
    console.error(error);
    // Handle the error, maybe set a default value or skip the date
  }

  }

    // Function to receive data from the child component
    async function handlePortoflioValue(data) {
      // Use the data received from the child component
      setPortfolioValue(data);
    };

    const filteredCoinData = useMemo(() => coinData.filter(
        coin => (coin.FullName+coin.Symbol.toUpperCase()+coin.Symbol.toLowerCase()+coin.CoinName.toLowerCase()).includes(searchValue)), 
        [coinData, searchValue]);

    async function addCoinToPortfolio(selectedCoinId, portfolioId) {
        try {
            const response = await api.get(`http://localhost:3006/portfolios/${portfolioId}`);
            const portfolio = response.data;
            if (portfolio.coins) { // Check if portfolio.coins exists
                portfolio.coins.push(selectedCoinId);
            } else {
                portfolio.coins = [selectedCoinId]; // If it doesn't exist, create a new array with the selected coin id
            }
            await api.patch(`http://localhost:3006/portfolios/${portfolioId}`, { coins: portfolio.coins } );
            console.log(response.data);
            setSelectedCoinId(''); // reset selectedCoinId to the disabled option
            CoinRefresh();
         } catch (error) {
            console.error(error);
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
            setPortfolioCoins(response.data.coins); // update the portfolioCoins state variable with the portfolio's coins data
        })
        .catch(error => {
            console.error(error);
        });
    };  
    
    let chartDataObject = null;

    if(chartData){
      console.log("chartData.data chartData: ",Object.values(chartData));
      chartDataObject = Object.values(chartData);
      console.log("chartDataObject chartData: ",chartDataObject);
      console.log("chartDataObject chartData labels: ",chartDataObject[0].labels);
      console.log("chartDataObject chartData data: ",chartDataObject[0].datasets[0].data);
    } 

    return (
      
    <div>
        <div className="portfolioValue">
        <span className="left">Total:&nbsp;</span><div className="left">{portfolioValue.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}</div>
          <br/>
          <br/>
          {chartDataObject != null ? (
            <ResponsiveContainer width="50%" height={300}>
              <LineChart data={chartDataObject[0].labels.map((label, index) => ({ date: label, value: chartDataObject[0].datasets[0].data[index] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="rgba(75,192,192,1)" tension={0.1} />
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
                            
                            <PortfolioCoinList id={portfolioId} portfolioCoins={portfolioCoins} coinRefresh={CoinRefresh} sendValueToCoin={handlePortoflioValue}/>

                        </div> 
                        
                    </div>

            </div> 
    </div>    
    );

};
export default PortfolioCoins;