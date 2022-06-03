import ApexChart from "react-apexcharts";

interface ILineChart {
  size: number;
  modal: boolean;
  data: any;
}
function LineChart({ size, modal, data }: ILineChart) {
  console.log(data);
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "Cost",
            data: data.map((d: any) => d[1].real_data),
          },
        ]}
        options={{
          title: modal
            ? {}
            : {
                text: "[ 전체 비용 차트 ]",
                style: {
                  fontSize: "20px",
                  fontWeight: "lighter",
                  color: "white",
                },
                align: "left",
                offsetX: 15,
                offsetY: -5,
              },
          theme: {
            mode: "dark",
          },
          chart: {
            background: modal ? "gray" : "#040959",
            type: "line",
          },
          stroke: {
            width: 2,
            curve: "smooth",
          },
          xaxis: {
            type: "datetime",
            categories: data.map((d: any) => d[0]),
          },
          yaxis: {
            decimalsInFloat: 2,
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              gradientToColors: ["#FDD835"],
              shadeIntensity: 1,
              type: "horizontal",
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100, 100, 100],
            },
          },
          tooltip: {
            y: {
              formatter: (value) => `$${value.toFixed(2)}`,
            },
            shared: true,
            intersect: false,
          },
        }}
        width={`${size}px`}
      />
    </>
  );
}

export default LineChart;
