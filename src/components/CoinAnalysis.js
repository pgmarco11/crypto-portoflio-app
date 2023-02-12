import {useState, useEffect, useId} from "react"
import {useNavigate, useParams, Routes, Route } from "react-router-dom"
import api from '../api/portfolios';
import axios from 'axios';

const CoinAnalysis = (props) => {

    const [coinData, setCoinData] = useState([]);    

    console.log("PortfolioCoin props coinId: "+props.coinId);


      useEffect(() => {
        
        axios.get(`https://api.coingecko.com/api/v3/coins/${props.coinId}`)
          .then(res => {
                setCoinData(res.data); 
            })
            .catch(err => {
                console.error(err);
                
            });
    }, [props.coinId]);

  
  
    

    return (          
        <div>
            <div className="item rowCell" align="left">
            {props.coinId} 
            </div>
            <div className="item rowCell" align="left">
            market cap
            </div>
            <div className="item rowCell" align="left">
            volume
            </div>
            <div className="item rowCell" align="left">
            <button 
                onClick={() => props.removeCoin(props.coinId) }>
                Delete</button>
            </div>  
        </div>
        


   
    )

}

export default CoinAnalysis; 