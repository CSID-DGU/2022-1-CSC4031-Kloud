import ApexChart from "react-apexcharts";

interface IChartProps {
  size?: string;
  resourceId: string;
  costHistory: ICostHistory;
}

export interface ICostHistory {
  data: IDayCost[];
}

export interface TimePeriod {
  Start: Date;
  End: Date;
}

export interface UnblendedCost {
  Amount: number;
  Unit: string;
}

export interface Total {
  UnblendedCost: UnblendedCost;
}

export interface UnblendedCost2 {
  Amount: number;
  Unit: string;
}

export interface Metrics {
  UnblendedCost: UnblendedCost2;
}

export interface Group {
  Keys: string[];
  Metrics: Metrics;
}

export interface IDayCost {
  Estimated: boolean;
  Groups: Group[];
  Total: Total;
  TimePeriod: TimePeriod;
}

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
