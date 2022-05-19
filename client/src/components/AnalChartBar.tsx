import ApexChart from "react-apexcharts";

interface IBarChart {
  size: number;
}
function BarChart({ size }: IBarChart) {
  return (
    <>
      <ApexChart
        type="bar"
        series={[
          {
            name: "Cost History",
            data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
          },
          {
            name: "Usage",
            data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
          },
          {
            name: "Server rate ",
            data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
          },
        ]}
        options={{
          theme: {
            mode: "dark",
          },
          chart: {
            background: "#040959",
            type: "polarArea",
          },
          stroke: {
            colors: ["#fff"],
          },
          fill: {
            opacity: 0.8,
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%",
            },
          },
          dataLabels: {
            enabled: false,
          },
        }}
        width="120%"
      />
    </>
  );
}

export default BarChart;
