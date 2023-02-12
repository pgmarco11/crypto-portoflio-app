import { Link } from "react-router-dom"
import NewsFeed from './NewsFeed';
import CurrencyConverter from './CurrencyConverter';
import ShowPortfolios from './showPortfolios';

function Home() {
    return(
        <div> 
            <div className="home-main"> 
                <div className="app-main">  
                    <ShowPortfolios /> 
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