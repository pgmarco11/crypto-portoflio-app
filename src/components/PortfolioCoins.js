
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

          console.log("date response.data : ",response.data)

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
    }, [portfolioId]);


    useEffect(() => {
        console.log("portfolioValue portfolioCoins chart: "+portfolioCoins);
        console.log("portfolioValue portfolioCoins :"+parseInt(portfolioValue));      
     

        if ( parseInt(portfolioValue) > 0) {
          console.log("portfolioValue portfolioCoins fetching chart: "+portfolioCoins);
          setChartData(null)
          fetchChartData(portfolioId, portfolioCoins);
          console.log('chartData:', chartData);
        }

    }, [portfolioCoins,portfolioValue]);
    
    // Use another useEffect to handle chartData changes
    useEffect(() => {
      
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
          } else {
            return 0;
          }
          

        } catch (error) {
          console.error(error);
          return 0;
        }
      };

    function parseMessariResponse(apiResponse) {
        try {

          console.log("apiResponse: ",apiResponse);
          console.log("data apiResponse: ",apiResponse.data);
          console.log("value apiResponse date: ",apiResponse.data.values[0][0])  
          console.log("value apiResponse price: ",apiResponse.data.values[0][4]) 
          
          console.log("value apiResponse length: ",apiResponse.data.values.length)  

          let parsedData = {
            date: 0, //the timestamp
            price: 0 //price for the date
          };          
          
          if(apiResponse.data.values.length !== 0){

            parsedData = {
              date: apiResponse.data.values[0][0], //the timestamp
              price: apiResponse.data.values[0][4] //price for the date
            };            

            console.log("chartData parsedData values: ",parsedData)

            console.log("chartData parsedData date values: ",parsedData.date)
  
            console.log("chartData parsedData price values: ",parsedData.price)

            return parsedData;

          } else {            

            console.log("chartData parsedData : ",parsedData)

            console.log("chartData parsedData date: ",parsedData.date)
  
            console.log("chartData parsedData price: ",parsedData.price)

            return 0;
          }      
          
        } catch (error) {
          console.error('Error parsing Messari API response:', error);
          return []; // Return an empty array in case of any errors
        }
      }

    async function fetchChartData(portfolioId,portfolioCoins) {

      try {
    
        const today = new Date();
        const twentyOneDaysAgo = new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000); // 21 days ago
        const portfolioStartDateHuman = new Date(portfolioStartDate * 1000);


        console.log("chart portfolio json chart 1: "+portfolioStartDateHuman)
        console.log("chart portfolio json chart 2: "+twentyOneDaysAgo)

        const startDate =
        portfolioStartDateHuman > twentyOneDaysAgo ? portfolioStartDateHuman : twentyOneDaysAgo;
        
        
        console.log("chart portfolio date calc : "+twentyOneDaysAgo)
        console.log("chart portfolio final date : "+startDate)
        
      
        let totalPortfolioValues = [];
        let dates = [];           
        
        
        console.log("coinValues portfolioCoins twentyOneDaysAgo : ",twentyOneDaysAgo); 

           
          let updatePortfolioValue = 0;

          console.log("chart portfolio startDate : ",startDate);   

          // Loop for each day (21 days)
            for (let i = 0; i < 21; i++) {   
      
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

                console.log("coinValues coin date 1 : ",date);   

                const dateString = date.toISOString().slice(0, 10);    
                
                //reset price for day
                updatePortfolioValue = 0;

                for (const coin of portfolioCoins) {

                  const assetId = coin;

                  console.log("coinValues coin: " + assetId);
                  console.log("coinValues coin date 2 : " + dateString);

                  try {
                    const response = await axios.get(
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
              
                    const coinValues = parseMessariResponse(response.data);
        
                    let coinPrice = 0;
                    let coinAmount = 0; 
                    let coinValue = 0;                 

                    if (coinValues) {

                      console.log("coinValues messariResponse.data 2 : ", coinValues);
                      console.log("coinValues messariResponse.data 3 : ", response.data);

                      coinPrice = coinValues?.price || 0;
                      coinAmount = await getCoinAmount(coin, portfolioId);                  
                      coinValue = coinPrice * coinAmount;                              
                      
                      console.log("Total Portfolio Value ",updatePortfolioValue);      
                      
                      updatePortfolioValue = updatePortfolioValue + coinValue;                        
                    
                    }                    
                  

                  } catch (coinError) {
                    console.error("Error fetching coin data:", coinError);
                  }

                } 

                dates.push(dateString);
                totalPortfolioValues.push(updatePortfolioValue);

                console.log('Total Portfolio Value on ' + dateString + ' was ' + updatePortfolioValue);
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

    console.log('chartData:', chartData);

    setChartData({ data: chartData, options: chartOptions }); 

    console.log('chartData:', chartData);
    
    } catch (error) {

      console.error(error);
    }

  }


    // Function to receive data from the child component
    async function handlePortoflioValue(data) {
      // Use the data received from the child component
      console.log("Update button setting setPortfolioValue:",data)    
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
      chartDataObject = Object.values(chartData);
      console.log('chartData chartDataObject:', chartDataObject);

    } 

    return (
      
    <div>
        <div className="portfolioValue">
        <span className="left">Total:&nbsp;</span><div className="left">{portfolioValue.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}</div>
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