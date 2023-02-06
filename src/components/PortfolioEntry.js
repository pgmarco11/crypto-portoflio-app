import React from "react"
import { Link } from "react-router-dom"

const PortfolioEntry = (props) => {
    
    const name = props.portfolio.name;
    const id = props.portfolio.id;

    const data = {
        id: id,
        name: name
    }

    
    return ( 
    <div className="item" >
        <div className="content">
        <Link to={{ pathname: `/portfolio/${id}`}} state={data} >
            <div className="header" >{name}</div>
        </Link>                    
        </div> 

        <i className="trash alternate outline icon"
        style={{color: "red", marginBottom: "7px", marginLeft: "10px"}}
        onClick={(portfolio) => props.clickHandler(id)}
        ></i>

        <Link to={{ pathname: `/portfolio/edit/${id}` }} state={data}>
        <i className="edit alternate outline icon"
        style={{color: "blue", marginBottom: "7px"}}   
        ></i> 
        </Link> 
                
    </div>
    );

};
export default PortfolioEntry;