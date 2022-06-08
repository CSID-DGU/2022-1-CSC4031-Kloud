import ApexChart from "react-apexcharts";

interface IBarChart {
  size: number;
  modal: boolean;
  data: any;
}
function BarChart({ size, modal, data }: IBarChart) {
  return (
    <>
      <ApexChart
        type="bar"
        series={[
          {
            name: "EC2",
            data: Object.values(data).map((d: any) => d.EC2),
          },
          {
            name: "ECS",
            data: Object.values(data).map((d: any) => d.ECS),
          },
          {
            name: "RDS",
            data: Object.values(data).map((d: any) => d.RDS),
          },
          {
            name: "ElastiCache",
            data: Object.values(data).map((d: any) => d.ElastiCache),
          },
        ]}
        options={{
          title: modal
            ? {}
            : {
                text: "[ 인프라별 지출 내역 ]",
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
            type: "polarArea",
          },
          stroke: {
            colors: ["#fff"],
          },
          fill: {
            opacity: 0.8,
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "60%",
            },
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            labels: { show: true },
            categories: Object.keys(data),
            type: "datetime",
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

export default BarChart;
