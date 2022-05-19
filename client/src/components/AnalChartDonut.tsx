import ApexChart from "react-apexcharts";

interface IDonutChart {
  size: number;
}
function DonutChart({ size }: IDonutChart) {
  return (
    <>
      <ApexChart
        type="radialBar"
        series={[44, 55, 67, 83]}
        options={{
          theme: {
            mode: "dark",
          },
          chart: {
            background: "#040959",
            type: "radialBar",
          },
          stroke: {
            colors: ["#fff"],
          },
          fill: {
            opacity: 0.8,
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                name: {
                  fontSize: "22px",
                },
                value: {
                  fontSize: "16px",
                },
              },
            },
          },
          labels: ["RDS", "EC2", "ECS", "S3"],
        }}
        width="110%"
      />
    </>
  );
}

export default DonutChart;
