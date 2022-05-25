import ApexChart from "react-apexcharts";

interface ILineChart {
  size: number;
}
function LineChart({ size }: ILineChart) {
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "Cost",
            data: [
              4, 3, 10, 9, 9, 19, 12, 9, 12, 7, 10, 8, 18, 19, 20, 22, 27, 25,
            ],
          },
        ]}
        options={{
          title: {
            text: "[ 전체 비용 차트 ]",
            style: {
              fontSize: "16px",
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
            background: "#040959",
            type: "line",
          },
          stroke: {
            width: 5,
            curve: "smooth",
          },
          xaxis: {
            type: "datetime",
            categories: [
              "1/11/2000",
              "2/11/2000",
              "3/11/2000",
              "4/11/2000",
              "5/11/2000",
              "6/11/2000",
              "7/11/2000",
              "8/11/2000",
              "9/11/2000",
              "10/11/2000",
              "11/11/2000",
              "12/11/2000",
              "1/11/2001",
              "2/11/2001",
              "3/11/2001",
              "4/11/2001",
              "5/11/2001",
              "6/11/2001",
            ],
            tickAmount: 10,
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
          yaxis: {
            min: -10,
            max: 40,
          },
        }}
        width="120%"
      />
    </>
  );
}

export default LineChart;
