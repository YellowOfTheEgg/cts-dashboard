import axios from "axios";

export const gatewayApi = axios.create({
  baseURL: "http://localhost:8000/api/v1/",   
});
