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
  Amount: string;
  Unit: string;
}

export interface Total {
  UnblendedCost: UnblendedCost;
}

export interface UnblendedCost2 {
  Amount: string;
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
  const data = [
    { price: 1, date: "5/1" },
    { price: 2, date: "5/2" },
    { price: 3, date: "5/3" },
    { price: 4, date: "5/4" },
    { price: 5, date: "5/5" },
    { price: 5, date: "5/6" },
    { price: 8, date: "5/7" },
    { price: 13, date: "5/8" },
    { price: 50, date: "5/9" },
    { price: 4, date: "5/10" },
    { price: 4, date: "5/10" },
    { price: 4, date: "5/10" },
    { price: 4, date: "5/10" },
    { price: 4, date: "5/10" },
    { price: 4, date: "5/10" },
  ];
  console.log(costHistory);
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "price",
            data: data?.map((d) => d.price),
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
