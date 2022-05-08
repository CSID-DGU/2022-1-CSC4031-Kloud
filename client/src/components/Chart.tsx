import ApexChart from "react-apexcharts";

interface IChartProps {
  size: number;
  resourceId: string;
  costHistory: ICostHistory;
}
interface ICostHistory {}

function Chart({ size, resourceId, costHistory }: IChartProps) {
  const data = [
    { price: 1, date: "5/1" },
    { price: 2, date: "5/2" },
    { price: 3, date: "5/3" },
    { price: 4, date: "5/4" },
    { price: 5, date: "5/5" },
  ];
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
            height: `${size}vw`,
            width: `${size}vw`,
            toolbar: {
              show: false,
            },
          },
          stroke: {
            curve: "smooth",
            width: 3,
          },
          yaxis: {
            show: false,
          },
          xaxis: {
            labels: { show: false },
            categories: data?.map((d) => d.date),
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
      />
    </>
  );
}

export default Chart;
