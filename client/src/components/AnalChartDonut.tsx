import ApexChart from "react-apexcharts";

interface IDonutChart {
  size: number;
  modal: boolean;
  data: any;
}
function DonutChart({ size, modal, data }: IDonutChart) {
  return (
    <>
      <ApexChart
        type="radialBar"
        series={Object.values(data).map((d: any) =>
          parseInt((d * 100).toFixed(2))
        )}
        options={{
          title: modal
            ? {}
            : {
                text: "[ 인프라 사용률 ]",
                style: {
                  fontSize: "20px",
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
            offsetY: modal ? 0 : -30,
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
          labels: Object.keys(data),
        }}
        width={`${size}px`}
      />
    </>
  );
}

export default DonutChart;
