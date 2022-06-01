import ApexChart from "react-apexcharts";

interface IPolarChart {
  size: number;
  modal: boolean;
}
function PolarChart({ size, modal }: IPolarChart) {
  return (
    <>
      <ApexChart
        type="donut"
        series={[14, 23, 21, 17, 10]}
        options={{
          title: modal
            ? {}
            : {
                text: "[ 인프라별 지출 비율 ]",
                style: {
                  fontSize: "20px",
                  fontWeight: "lighter",
                  color: "white",
                },
                align: "left",
                offsetX: -10,
                offsetY: -5,
              },
          theme: {
            mode: "dark",
          },
          chart: {
            background: modal ? "gray" : "#040959",
            type: "polarArea",
          },
          stroke: {
            colors: modal ? ["gray"] : ["#040959"],
          },
          fill: {
            opacity: 0.8,
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "top",
                },
              },
            },
          ],
          labels: ["RDS", "EC2", "IGW", "S3", "ECS"],
        }}
        width={`${size}px`}
      />
    </>
  );
}

export default PolarChart;
