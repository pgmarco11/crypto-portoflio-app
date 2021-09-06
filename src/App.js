import React from 'react';
import axios from 'axios';
import Layout from './App/components/Layout';
import Select from "react-virtualized-select";
import createFilterOptions from "react-select-fast-filter-options";
import CoinList from './App/components/CoinList';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";
import './App.css';

class App extends React.Component {
  
constructor(props)
	{    
		super(props)
    this.state = {
      selectCoins: [],
      selectedCoin: [],
      toggleCoins: [],
    };

  }

getCoin(){
   
    axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
    .then( res => { 
      const options = res.data;

      this.setState({ 
        selectCoins: options, 
        isLoaded: true
      }); 

      })

      
}

/*
componentDidUpdate(props) {
  const shouldUpdateCarsData = 
    prevProps.selectedManufacturer !== this.props.selectedManufacturer
    || prevProps.selectedModels!== this.props.selectedModels

  if (shouldUpdateCarsData ) {
    // fetch API and update state
    fetchCars(this.props.selectedManufacturer, this.props.selectedModels)
  }
}*/
 

render(){ 

  let coinId = 'BTC';

  console.log("getcoin:"+ this.state.selectCoins);

  const { selectedCoin } = this.state;

  //let timeframe2M = '2M';  
  let c = 0;

  const options = []; 

for(c=0;c < this.state.selectCoins.length;c++){
      let name = this.state.selectCoins[c].name;
      let id = this.state.selectCoins[c].id;
      options.push({label: name, value: id});
      let len = this.state.selectCoins.length;
  }  
   
  const filterOptions = createFilterOptions({options});    

  console.log(this.state.selectedCoin.value)

  if(this.state.selectedCoin.value !== undefined ){   
        
      coinId = this.state.selectedCoin.value; 
    
  } 

  return(
    <Layout>
    <div className="coin_app container-fluid">
      <div className="col-sm-12 text-center">
        <h1>Add Coin</h1>              
       <Select
        labelKey='label'
        filterOptions={filterOptions}
        options={options}
        onChange={(selectedCoin) => this.setState({selectedCoin})}
        value={this.state.selectedCoin}
        onValueClick={this.getCoin()}
        valueKey='id'              
        />
        <CoinList coinId={coinId} />
        </div>            
        </div>                     
    <footer>
    </footer>
  </Layout>
  );

  }
}
export default App;
