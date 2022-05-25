import ApexChart from "react-apexcharts";

interface IDonutChart {
  size: number;
  modal: boolean;
}
function DonutChart({ size, modal }: IDonutChart) {
  return (
    <>
      <ApexChart
        type="radialBar"
        series={[20, 55, 67, 83]}
        options={{
          title: {
            text: "[ 인프라 사용률 ]",
            style: {
              fontSize: "16px",
              fontWeight: "lighter",
              color: "white",
            },
            align: "left",
            offsetX: 15,
            offsetY: 10,
          },
          theme: {
            mode: "dark",
          },
          chart: {
            background: modal ? "gray" : "#040959",
            type: "radialBar",
            offsetY: -30,
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
