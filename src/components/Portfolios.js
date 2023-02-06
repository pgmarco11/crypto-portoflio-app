import { Link } from "react-router-dom"
import ShowPortfolios from './showPortfolios';

function Portfolios() {
    return(
        <div className="portfolios-main"> 
            <div className="app-main">  
            <ShowPortfolios /> 
            </div>
        </div> 
    )
}

export default Portfolios;