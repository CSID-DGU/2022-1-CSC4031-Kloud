import ApexChart from "react-apexcharts";

interface IPolarChart {
  size: number;
  modal: boolean;
}
function PolarChart({ size, modal }: IPolarChart) {
  return (
    <>
      <ApexChart
        type="polarArea"
        series={[14, 23, 21, 17, 15, 10]}
        options={{
          title: {
            text: "[ 인프라별 지출 비율 ]",
            style: {
              fontSize: "16px",
              fontWeight: "lighter",
              color: "white",
            },
            align: "left",
            offsetX: 50,
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
            colors: ["#fff"],
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
                  position: "bottom",
                },
              },
            },
          ],
          xaxis: {
            categories: ["a", "b", "c", "d", "e", "f"],
          },
          labels: ["RDS", "EC2", "IGW", "S3", "LightSail", "ECS"],
          plotOptions: {
            polarArea: {
              rings: {
                strokeWidth: 0,
              },
              spokes: {
                strokeWidth: 0,
              },
            },
          },
        }}
        width={`${size}px`}
      />
    </>
  );
}

export default PolarChart;
