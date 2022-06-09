import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { INestedInfra } from "./types";

const BASE_URL = "http://localhost:8000";

export async function login(
  access_key_public: string,
  access_key_secret: string,
  region: string
) {
  if (access_key_public) {
    return await axios({
      method: "POST",
      url: `${BASE_URL}/login`,
      data: {
        access_key_public: access_key_public,
        access_key_secret: access_key_secret,
        region: region,
      },
    });
  }
}
export async function stopInstance(instance_id: string) {
  return await axios({
    method: "POST",
    url: `${BASE_URL}/mod/instance/stop`,
    data: {
      instance_id: instance_id,
      hibernate: false,
      force: false,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}
export async function startInstance(instance_id: string) {
  return await axios({
    method: "POST",
    url: `${BASE_URL}/mod/instance/start`,
    data: {
      instance_id: instance_id,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

export function getInfra() {
  const data = axios({
    method: "GET",
    url: `${BASE_URL}/infra/info`,
    data: {},
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
}
export async function getNestedInfra() {
  const r = localStorage.getItem("region");
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${BASE_URL}/infra/tree`,
    data: {},
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  };
  const { data: response }: AxiosResponse = await axios(config);
  const data = {
    orphan: <INestedInfra[]>[],
    infra: <INestedInfra>{
      resource_id: r,
      resource_type: "region",
      children: [],
    },
  };
  // orphan 집어넣기
  for (const orphan in response.orphan) {
    var orphanObj = {
      resource_id: orphan,
      resource_type: response.orphan[`${orphan}`].resource_type,
    };
    if (orphanObj.resource_type !== "network_interface") {
      data.orphan.push(orphanObj);
    }
  }

  for (const vpc in response) {
    if (vpc === "orphan") continue;
    var vpcObj = {
      resource_id: vpc,
      resource_type: response[`${vpc}`].resource_type,
      children: <INestedInfra[]>[],
    };
    for (const subnet in response[`${vpc}`].children) {
      var subnetObj = {
        resource_id: subnet,
        resource_type: response[`${vpc}`].children[`${subnet}`].resource_type,
        children: <INestedInfra[]>[],
      };
      for (const instance in response[`${vpc}`].children[`${subnet}`]
        .children) {
        var instanceObj = {
          resource_id: instance,
          resource_type:
            response[`${vpc}`].children[`${subnet}`].children[`${instance}`]
              .resource_type,
          state:
            response[`${vpc}`].children[`${subnet}`].children[`${instance}`]
              .State.Name,
        };
        subnetObj.children.push(instanceObj);
      }
      vpcObj.children.push(subnetObj);
    }
    data.infra.children?.push(vpcObj);
  }
  return data;
}

export async function getCostHistory() {
  const {
    data: { ResultsByTime: data },
  } = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/history/param?granularity=DAILY&days=14`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  const result: any = {};
  for (const index in data) {
    const dayData = data[index];
    const date = dayData.TimePeriod.Start;
    let ECS = 0;
    let EC2 = 0;
    let ElastiCache = 0;
    let RDS = 0;
    let key;
    for (const idx in dayData.Groups) {
      const dayCostData = dayData.Groups[idx];
      const service = dayCostData.Keys[0];
      const cost = dayCostData.Metrics.UnblendedCost.Amount;
      switch (service) {
        case "EC2 - Other":
        case "Amazon Elastic Compute Cloud - Compute":
          EC2 += parseFloat(cost);
          break;
        case "Amazon Elastic Container Service":
        case "Amazon Elastic Registry Public":
        case "Amazon EC2 Container Registry (ECR)":
          ECS += parseFloat(cost);
          break;
        case "Amazon Simple Storage Service":
        case "Amazon Relational Database Service":
          RDS += parseFloat(cost);
          break;
        case "Amazon ElastiCache":
          ElastiCache += parseFloat(cost);
          break;
      }
      result[date] = {
        ECS: ECS.toFixed(2),
        EC2: EC2.toFixed(2),
        RDS: RDS.toFixed(2),
        ElastiCache: ElastiCache.toFixed(2),
      };
    }
  }

  return result;
}

export async function getCostHistoryByResource() {
  const data = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/history/by-resource?granularity=DAILY`,
    data: {},
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  return data;
}

export function getSimilarityTrend() {
  const data = axios({
    method: "GET",
    url: `${BASE_URL}/cost/trend/similarity`,
    data: {},
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
}
interface IResult {
  performance: number;
  day: any;
  week: any;
  month: any;
}

export async function getProphetTrend() {
  const { data } = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/trend/prophet`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  const result: IResult = {
    performance: 0,
    day: [],
    week: [],
    month: [],
  };
  for (const unit in data) {
    if (unit === "Performance") {
      result.performance = data["Performance"];
      continue;
    }
    for (const date in data[`${unit}`]) {
      switch (unit) {
        case "day":
          result.day.push([date, data[`${unit}`][`${date}`]]);
          break;
        case "week":
          result.week.push([date, data[`${unit}`][`${date}`]]);
          break;
        case "month":
          result.month.push([date, data[`${unit}`][`${date}`]]);
          break;
      }
    }
  }
  return result;
}
export async function getCostRatio() {
  const response = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/history/by-service?days=30`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  const result = [];
  let total = 0;
  let key;
  for (const service in response.data) {
    const cost = parseFloat(response.data[`${service}`].toFixed(2));
    if (cost < 1) continue;
    total += cost;
    switch (service) {
      case "AWS Cost Explorer":
        key = "Cost Explorer";
        break;
      case "Amazon ElastiCache":
        key = "ElastiCache";
        break;
      case "Amazon Elastic Compute Cloud - Compute":
        key = "EC2";
        break;
      case "EC2":
      case "EC2 - Other":
        key = "EC2 - Compute";
        break;
      case "Amazon Elastic Container Service":
        key = "ECS";
        break;
      case "Amazon Elastic Load Balancing":
        key = "Load Balancing";
        break;
      case "Amazon Lightsail":
        key = "Lightsail";
        break;
      case "Amazon Relational Database Service":
        key = "RDS";
        break;
      case "Amazon Route 53":
        key = "Route 53";
        break;
      default:
        key = service;
    }
    result.push([key, response.data[`${service}`]]);
  }
  result.push(total.toFixed(2));
  return result;
}
export async function getTop3UsedAmount() {
  const { data } = await axios({
    method: "GET",
    url: `${BASE_URL}/infra/top3`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
}
export async function getRightSizingRecommendation() {
  const {
    data: { RightsizingRecommendations: data },
  } = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/recommendation/rightsizing?within_same_instance_family=true&benefits_considered=true`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
}
export async function getReservationRecommendation() {
  const {
    data: { Recommendations: data },
  } = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/recommendation/reservation?service=Amazon%20Elastic%20Compute%20Cloud%20-%20Compute&look_back_period=SEVEN_DAYS&years=ONE_YEAR&payment_option=NO_UPFRONT`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data[0];
}

export function logOut() {
  const data = axios({
    method: "POST",
    url: `${BASE_URL}/logout`,
    data: {
      access_token: localStorage.getItem("access_token"),
    },
  });
}
