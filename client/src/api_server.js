let BASE_URL = process.env.REACT_APP_API_SERVER;
if (!process.env.REACT_APP_API_SERVER) {
    console.log("no react app api server env");
    BASE_URL = "http://localhost:8000";
}
export default BASE_URL;