import ApexChart from "react-apexcharts";

interface ISolutionCompareChart {}

function SolutionCompareChart() {
  return (
    <>
      <ApexChart
        type="radialBar"
        series={[]}
        options={{
          chart: {
            height: 350,
            type: "radialBar",
            toolbar: {
              show: false,
            },
            background: "transparent",
          },
          theme: {
            mode: "dark",
          },
          stroke: {
            lineCap: "round",
          },
          labels: [],
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100],
            },
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                name: {
                  fontSize: "30px",
                  fontWeight: "lighter",
                },
                value: {
                  fontSize: "20px",
                  fontWeight: "lighter",
                },
              },
            },
          },
        }}
        width={`500px`}
      />
    </>
  );
}

export default SolutionCompareChart;
