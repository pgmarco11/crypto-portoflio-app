import React, { useState, useEffect } from 'react';
import { Link, Route, useParams } from 'react-router-dom'
import EditPortfolio from "./EditPortfolio"

const EditPortfolioMain = (props) => { 

    const params = useParams();

    console.log("EDIT ID 0:"+params.id);

    const [selectedId, setselectedId] = useState(null) 
   
   
        const renderPortfolioList = props.portfolios.map((portfolio) => {

            console.log("portfolio ID:"+portfolio.id)
            
            console.log("EDIT ID:"+params.id)


            if(portfolio.id === params.id){
                return(
             
                        <EditPortfolio
                          portfolio={portfolio}    
                          editPortfolioHandler={props.updatePortfolioHandler} 
                          id={selectedId} 
                          key={selectedId}        
                        />   
                    
          
            )}

        });

        
    return (

        <div className="ui portfolio-edit">
        
        <div className="portfolio-editing">

            <h2>Edit</h2>  
            {renderPortfolioList}
            
            <Link to="/">
            <button className="btn-portfolio ui button grey">
                Cancel</button>
            </Link>
    
        </div>
    
    </div> 
   
    );

}

export default EditPortfolioMain;