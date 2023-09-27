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
                                       
                </div>   
            </div>
            <div className="app-news">                        
                        <NewsFeed /> 
                        <CurrencyConverter />       
            </div> 
        </div> 
    )
}

export default Home;