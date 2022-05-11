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
            name: "Real",
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
              show: true,
            },
            background: "gray",
            height: 350,
          },
          stroke: {
            width: 2,
          },
          yaxis: {
            show: true,
          },
          xaxis: {
            labels: { show: true },
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
          forecastDataPoints: {
            count: 5,
            dashArray: 5,
          },
        }}
        width={"280%"}
      />
    </>
  );
}

export default PredictChart;
