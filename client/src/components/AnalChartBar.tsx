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
            name: "EC2",
            data: [4.4, 5.5, 5.7, 5.6, 6.1, 5.8, 6.3, 6.0, 6.6],
          },
          {
            name: "ECS",
            data: [7.6, 8.5, 10.1, 9.8, 8.7, 10.5, 9.1, 11.4, 9.4],
          },
          {
            name: "RDS",
            data: [3.5, 4.1, 3.6, 2.6, 4.5, 4.8, 5.2, 5.3, 4.1],
          },
          {
            name: "S3",
            data: [0, 0, 1, 0, 1.3, 1.3, 0.5, 1, 1],
          },
        ]}
        options={{
          title: {
            text: "[ 인프라별 지출 내역 ]",
            style: {
              fontSize: "16px",
              fontWeight: "lighter",
              color: "white",
            },
            align: "left",
            offsetX: 15,
            offsetY: -5,
          },
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
