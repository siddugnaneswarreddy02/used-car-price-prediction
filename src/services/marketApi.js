import axios from "axios";
import { API_URL } from "./apiUrl";

export const getMarketData=async()=>{

try{

const response=await axios.get(
`${API_URL}/market-trends`
);

return response.data;

}
catch{

return{

average_price:"6.2",

highest_price:"9.5",

lowest_price:"4.1",

demand_score:"85"

};

}

}