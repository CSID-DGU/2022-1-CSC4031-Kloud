import ApexChart from "react-apexcharts";

interface IPolarChart {
  size: number;
}
function PolarChart({ size }: IPolarChart) {
  return (
    <>
      <ApexChart
        type="polarArea"
        series={[14, 23, 21, 17, 15, 10]}
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
