import ApexChart from "react-apexcharts";

interface IPredictChart {
  size?: string;
  prophet: any;
  selected: string;
}
function PredictChart({ size, prophet, selected }: IPredictChart) {
  let predictDuration = 0;
  switch (selected) {
    case "일":
      predictDuration = 5;
      break;
    case "주":
      predictDuration = 14;
      break;
    case "월":
      predictDuration = 30;
      break;
  }
  return (
    <>
      <ApexChart
        type="line"
        series={[
          {
            name: "Real",
            type: "line",
            data:
              selected === "일"
                ? prophet.slice(0, -5).map((d: any, idx: number) => {
                    return d[1].real_data;
                  })
                : selected === "주"
                ? prophet.slice(0, -14).map((d: any, idx: number) => {
                    return d[1].real_data;
                  })
                : prophet.slice(0, -30).map((d: any, idx: number) => {
                    return d[1].real_data;
                  }),
          },
          {
            name: "Expected",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat;
            }),
          },
          {
            name: "Min Error",
            type: "area",
            color: "gray",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat_lower;
            }),
          },
          {
            name: "Max Error",
            type: "area",
            color: "#246c3849",
            data: prophet.map((d: any) => {
              return d[1].expected_data.yhat_upper;
            }),
          },
        ]}
        options={{
          theme: {
            mode: "dark",
          },
          dataLabels: {
            enabled: false,
          },
          chart: {
            toolbar: {
              show: true,
            },
            background: "gray",
            stacked: true,
          },
          stroke: {
            width: 2,
          },
          yaxis: {
            show: true,
            decimalsInFloat: 2,
            min: 0,
          },
          xaxis: {
            labels: { show: true },
            categories: prophet.map((d: any) => d[0]),
            type: "datetime",
          },
          fill: {
            opacity: 0.9,
            type: "solid",
          },
          title: {
            text: "Cost Trends",
            align: "left",
            style: {
              fontSize: "25px",
              color: "#040959",
              fontWeight: "lighter",
            },
          },
          colors: ["#0091ff", "#00E396", "#d2d2d2"],
          tooltip: {
            y: {
              formatter: (value) => `$${value.toFixed(2)}`,
            },
            shared: true,
            intersect: false,
          },
          forecastDataPoints: {
            count: predictDuration,
            dashArray: 5,
          },
        }}
        width={"280%"}
      />
    </>
  );
}

export default PredictChart;
