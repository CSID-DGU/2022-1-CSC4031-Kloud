import ApexChart from "react-apexcharts";
import { IChartProps } from "../types";

interface IPredictChart {
  size?: string;
  similarity: any;
  prophet: any;
}
function PredictChart({ size, similarity, prophet }: IPredictChart) {
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "Real Data",
            data: prophet.map((d: any) => {
              return d[1].real_data;
            }),
          },
          {
            name: "Expected",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat;
            }),
          },
        ]}
        options={{
          theme: {
            mode: "dark",
          },
          chart: {
            toolbar: {
              show: false,
            },
            background: "gray",
          },
          stroke: {
            curve: "smooth",
            width: 3,
          },
          yaxis: {
            show: size ? true : false,
          },
          xaxis: {
            labels: { show: size ? true : false },
            categories: prophet.map((d: any) => d[0]),
            type: "datetime",
          },
          fill: {
            type: "gradient",
          },
          tooltip: {
            y: {
              formatter: (value) => `$${value.toFixed(2)}`,
            },
          },
        }}
        width={"300%"}
      />
    </>
  );
}

export default PredictChart;
