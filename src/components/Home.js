import { Link } from "react-router-dom"
import CurrencyConverter from './CurrencyConverter';
import ShowPortfolios from './showPortfolios';

function Home() {
    return(
        <div className="home-main"> 
            <div className="app-main">  
            <ShowPortfolios /> 
            <CurrencyConverter />       
            </div>
        </div> 
    )
}

export default Home;