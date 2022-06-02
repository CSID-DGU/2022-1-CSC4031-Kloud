import ApexChart from "react-apexcharts";

interface ISolutionChart {
  infra: string;
  percent: number;
}

function SolutionChart({ infra, percent }: ISolutionChart) {
  const COLOR_1 = `#${Math.round(Math.random() * 0xffffff).toString(16)}`;
  const COLOR_2 = `#${Math.round(Math.random() * 0xffffff).toString(16)}`;
  return (
    <>
      <ApexChart
        type="radialBar"
        series={[percent]}
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
          labels: [infra],
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: [COLOR_1, COLOR_2],
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
                  color: "white",
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
