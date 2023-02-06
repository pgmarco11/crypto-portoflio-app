import {useState, useEffect, useId} from "react"
import {useNavigate, useParams, Routes, Route } from "react-router-dom"
import api from '../api/portfolios';
import PortfolioPage from './PortfolioPage';
import AddPortfolio from './AddPortfolio';
import Portfolio from './Portfolio'
import { v4 as uuid } from 'uuid';
import EditPortfolioMain from "./EditPortfolioMain";


const Portfolios = (props) => {

    const [portfolios, setPortfolios] = useState([]) 
  
    const history = useNavigate();

    //Retrieve Portfolios
    const retrievePortfolios = async () => {

        const response = await api.get(
        "http://localhost:3006/portfolios");

        return response.data;

    };

    const updatePortfolioHandler = async (portfolio) => { 
        
        const response = await api.put(`http://localhost:3006/portfolios/${portfolio.id}`, portfolio);      

        console.log("EDIT ID update:"+portfolio.id)

        const updatedPortfolio = response.data;

        setPortfolios(prevPortfolios => prevPortfolios.map(p => p.id === portfolio.id ? updatedPortfolio : p));
        
        return history("/");

    };

    const addPortfolioHandler = async (portfolio) => {

        const request = {
            id: uuid(),
            ...portfolio
        }       

        const response = await api.post(
            "http://localhost:3006/portfolios", request)


        setPortfolios([ ...portfolios, response.data]);
   
        return history("/");

    };
    
    const removePortfolioHandler = async (id) => {

            const updatePortfolioList = portfolios.filter((portfolio) => {
                return portfolio.id !== id;
            });

            setPortfolios(updatePortfolioList);

    };   

    useEffect(() => {
        
        const getAllPortfolios = async () => {

                const allPortfolios = await retrievePortfolios();

                if(allPortfolios) setPortfolios(allPortfolios);
        }; 

        getAllPortfolios();

    }, [])
  

    return (
           
            <div  className="ui container portfolios">
            <h2>Portfolios</h2>
            <div className="ui relaxed divided list">
                <div className="item">
                <Routes>
            
                
                
                    <Route 

                        path="/"
                        exact
                        element={                                         
                            <PortfolioPage
                            portfolios={portfolios}
                            getPortfolioId={removePortfolioHandler}
                            />
                        }

                    />
                
                    <Route 
                            path="/add"
                            element={
                                <AddPortfolio                                            
                                addPortfolioHandler={addPortfolioHandler}         
                                />}                       
                    />

                    <Route 
                        path="/portfolio/edit/:id"
                        element={
                            <EditPortfolioMain
                                portfolios={portfolios}
                                updatePortfolioHandler={updatePortfolioHandler}  
                               
                            />
                        }   
                    />                   

                    <Route path="/portfolio/:id" element={<Portfolio />} />

                    </Routes>

                </div>                
                </div>


            </div>      
    )

}

export default Portfolios; 