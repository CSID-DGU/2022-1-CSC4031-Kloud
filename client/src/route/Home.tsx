import { getInfra } from "../api";
import styled from "styled-components";
import { useQuery } from "react-query";

interface IInfra {
  tmp: null;
}
const Home = () => {
  const { isLoading, data } = useQuery<IInfra>("allInfra", getInfra);
  (async () => {
    console.log(await getInfra());
  })();
  return <div>Home</div>;
};

export default Home;
