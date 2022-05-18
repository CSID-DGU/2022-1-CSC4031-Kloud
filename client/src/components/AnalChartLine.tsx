import ApexChart from "react-apexcharts";
import { IChartProps } from "../types";

function Chart({
  size,
  resourceId,
  costHistory: { data: costHistory },
}: IChartProps) {
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "price",
            data: costHistory?.map((d) => {
              const hit = d.Groups.filter((g) => g.Keys[0] === resourceId);
              return hit.length === 0 ? 0 : hit[0].Metrics.UnblendedCost.Amount;
            }),
          },
        ]}
        options={{
          theme: {
            mode: "dark",
          },
          chart: {
            toolbar: {
              show: size ? true : false,
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
            categories: costHistory?.map((d) => d.TimePeriod.Start),
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
        width={size ? size : "100%"}
      />
    </>
  );
}

export default Chart;
