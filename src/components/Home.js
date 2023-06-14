import { Link } from "react-router-dom"
import NewsFeed from './NewsFeed';
import CurrencyConverter from './CurrencyConverter';
import Portfolios from './Portfolios';

function Home() {
    return(
        <div> 
            <div className="home-main"> 
                <div className="app-main">  
                    <Portfolios /> 
                    <CurrencyConverter />                          
                </div>   
            </div>
            <div className="app-news">                        
                        <NewsFeed /> 
            </div> 
        </div> 
    )
}

export default Home;