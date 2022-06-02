import ApexChart from "react-apexcharts";

function SolutionChart() {
  return (
    <>
      <ApexChart
        type="radialBar"
        series={[75]}
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
          labels: ["RDS1"],
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
                },
                value: {
                  fontSize: "20px",
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

export default SolutionChart;