import ApexChart from "react-apexcharts";

interface ISolutionChart {
  infra: string;
  percent: number;
  selected: boolean;
}

function SolutionChart({ infra, percent, selected }: ISolutionChart) {
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
                  color: selected ? "yellow" : "white",
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

export default SolutionChart;
