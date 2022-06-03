import ApexChart from "react-apexcharts";

interface IPolarChart {
  size: number;
  modal: boolean;
  data: [string, number];
}
function PolarChart({ size, modal, data }: IPolarChart) {
  return (
    <>
      <ApexChart
        type="donut"
        series={data.slice(0, -1).map((d: any) => d[1])}
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
          subtitle: {
            text: `$${data.at(-1)}`,
            align: "center",
            offsetX: -65,
            offsetY: 135,
            floating: true,
            style: {
              fontSize: modal ? "40px" : "30px",
              fontWeight: "lighter",
              color: modal ? "yellow" : "gainsboro",
            },
          },
          chart: {
            background: modal ? "gray" : "#040959",
            type: "polarArea",
          },
          stroke: {
            colors: modal ? ["gray"] : ["#040959"],
          },
          tooltip: {
            y: {
              formatter: (value) => `$${value.toFixed(2)}`,
            },
            shared: true,
            intersect: false,
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
          labels: data.slice(0, -1).map((d: any) => d[0]),
        }}
        width={`${size}px`}
      />
    </>
  );
}

export default PolarChart;
