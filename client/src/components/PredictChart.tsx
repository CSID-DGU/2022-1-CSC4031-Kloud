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
            type: "line",
            data: prophet.slice(0, -5).map((d: any, idx: number) => {
              return d[1].real_data;
            }),
          },
          {
            name: "Expected",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat;
            }),
          },
          {
            name: "Min Error",
            type: "area",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat_lower;
            }),
          },
          {
            name: "Max Error",
            type: "area",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat_upper;
            }),
          },
        ]}
        options={{
          theme: {
            mode: "dark",
          },
          dataLabels: {
            enabled: false,
          },
          chart: {
            toolbar: {
              show: true,
            },
            background: "gray",
          },
          stroke: {
            width: 2,
          },
          yaxis: {
            show: true,
            decimalsInFloat: 2,
            min: 0,
          },
          xaxis: {
            labels: { show: true },
            categories: prophet.map((d: any) => d[0]),
            type: "datetime",
          },
          fill: {
            opacity: 0.9,
            type: "solid",
          },
          title: {
            text: "Cost Trends",
            align: "left",
            style: {
              fontSize: "25px",
              color: "#040959",
              fontWeight: "lighter",
            },
          },
          tooltip: {
            y: {
              formatter: (value) => `$${value.toFixed(2)}`,
            },
            shared: true,
            intersect: false,
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
