import {useState, useEffect} from "react"
import {useNavigate, useParams, Routes, Route } from "react-router-dom"
import api from '../api/portfolios';
import axios from 'axios';

const CoinAnalysis = (props) => {

    const [coinData, setCoinData] = useState([]);     
    const [marketCap, setMarketCap] = useState(null);
    const [volume, setVolume] = useState(null);

    console.log("PortfolioCoin props coinId: "+props.id);

    useEffect(() => {
        
        axios.get(`https://api.coingecko.com/api/v3/coins/${props.id}`)
          .then(res => {
               console.log("res.data: "+res.data); 
               setCoinData(res.data); 
            })
            .catch(err => {
                console.error(err);                
            });
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${props.id}`);
            console.log("response.data.market_cap: "+response.data.market_data.market_cap.usd);             

            // const formattedMarketCap = coinData.market_data ? new Intl.NumberFormat('en-US', {
            //     style: 'currency',
            //     currency: 'USD'
            //   }).format(coinData.market_data.market_cap.usd) : "";

              setMarketCap(response.data.market_data.market_cap.usd);

        };
        fetchData();
    }, [props.id]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${props.id}`);
            console.log("response.data.total_volume: "+response.data.market_data.total_volume.usd);             

            // const formattedVolume = coinData.market_data ? new Intl.NumberFormat('en-US', {
            //     style: 'currency',
            //     currency: 'USD'
            //   }).format(coinData.market_data.total_volume.usd) : "";

              setVolume(response.data.market_data.total_volume.usd);
              
        };
        fetchData();
    }, [props.id]);

    
    console.log("coinData.market_data: "+coinData.market_data);       
    

    return (          
        <div>
            <div className="item rowCell" align="left">
            {coinData.name} 
            </div>
            <div className="item rowCell" align="left">
            {marketCap}
            </div>
            <div className="item rowCell" align="left">
            {volume}
            </div>
            <div className="item rowCell" align="left">
            <button className="ui red basic button"
                onClick={() => props.removeCoin(props.id) }>
                Delete</button>
            </div>  
        </div> 
    )

}

export default CoinAnalysis; 