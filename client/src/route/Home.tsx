import { getInfra } from "../api";
import styled from "styled-components";
import { useQuery } from "react-query";

interface IInfra {
  tmp: null;
}
const Home = () => {
  const { isLoading, data } = useQuery<any>("allInfra", getInfra);
  console.log(data);
  return <div>Home</div>;
};

export default Home;
