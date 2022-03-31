import { getInfra } from "../api";
import styled from "styled-components";
import { useQuery } from "react-query";
import Header from "../components/Header";

interface IInfra {
  tmp: null;
}
const Home = () => {
  const { isLoading, data } = useQuery<any>("allInfra", getInfra);
  console.log(data);
  return (
    <>
      <Header></Header>
    </>
  );
};

export default Home;
