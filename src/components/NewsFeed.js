import { useEffect, useState } from "react";
import axios from 'axios';

const NewsFeed = () => {

    const [articles,setArticles] = useState(null);

    useEffect(() => {

        // var options = {
        //     method: 'GET',
        //     url: 'https://crypto-news16.p.rapidapi.com/news/top/8',
        //     headers: {
        //       'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
        //       'X-RapidAPI-Host': 'crypto-news16.p.rapidapi.com'
        //     }
        //   };
          
          // axios.request(options).then((response) => {

          //   setArticles(response.data);

          // }).catch((error) => {
          //     console.error(error);
          // });

    }, [])

    if(articles !== null) {

    // const first8Articles = articles?.slice(0,8);
    // console.log("list articles");
    // console.log(articles);

    // return(
    //     <div className="news-feed">
    //     {
            
    //      first8Articles?.map( (article, _index) => (
    //         <div key={_index}>
    //            <a href={article.url}><p>{article.title}</p></a>
    //         </div>) )
    //     }
    //     </div>
    // );

    } else {

        return(
            <div className="news-feed"> 
                <h2>News Feed</h2>        
            </div>
        );


    }

  }
  
  export default NewsFeed;