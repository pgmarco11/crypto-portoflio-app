import React from 'react'
import axios from 'axios';
import Select from 'react-virtualized-select'
import createFilterOptions from "react-select-fast-filter-options";
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import Layout from './App/components/Layout';
import CoinList from './App/components/CoinList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class App extends React.Component {
  
  constructor(props)
	{    
		super(props)
    this.state = {
      coins: []
    };
	}

  componentDidMount() {
    axios.get(`https://api.coingecko.com/api/v3/coins/list?include_platform=true`)
    .then(response => response.data)
    .then((data) => {
      this.setState({ coins: data })
     })
  }



render(){

    const numberOfCoins = this.state.coins.length;
    const { selectedCoin } = this.state;
    const options = [];   

    let c = 0;
    
    for(c; c < numberOfCoins; c++){
      let name = this.state.coins[c].name;
      let id = this.state.coins[c].id;
      options.push({label: name, value: id});
    }       

    console.log(options)
    const filterOptions = createFilterOptions({options});

  return(
    <Layout>
    <div className="coin_app container-fluid">
      <div className="col-sm-12 text-center">
        <h1>Add Coin</h1>              
        <Select  
        labelKey='label'
        valueKey='id'  
        options={options}
        filterOptions={filterOptions}
        onChange={(selectedCoin) => this.setState({selectedCoin})}
        value={selectedCoin}        
      />
        <CoinList /* coinId={coinId} */ />
        </div>            
        </div>                     
    <footer>
    </footer>
  </Layout>
  );

  }
}
export default App;
