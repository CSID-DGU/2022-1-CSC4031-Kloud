import ApexChart from "react-apexcharts";

interface ISolutionCompareChart {}

function SolutionCompareChart() {
  const test = [8, 9, 3, 6, 5, 4, 3, 8, 9, 3, 6, 5, 5, 3, 8, 9, 3, 6, 2, 2, 3];
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "Real",
            type: "line",
            data: test,
          },
          {
            name: "Solution",
            type: "line",
            data: test.map((d) => d - Math.random() * 2),
            color: "yellow",
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
            background: "transparent",
            stacked: true,
          },
          stroke: {
            width: 3,
            colors: ["#0091ff", "yellow"],
          },
          yaxis: {
            show: true,
            decimalsInFloat: 2,
            min: 0,
          },
          xaxis: {
            labels: { show: true },
            type: "datetime",
            categories: test.map((d, idx) => idx),
          },
          fill: {
            opacity: 0.9,
            type: "solid",
          },
          colors: ["#0091ff", "yellow", "yellow"],
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
        width={"300%"}
      />
    </>
  );
}

export default SolutionCompareChart;
