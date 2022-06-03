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

export function getCostHistory() {
  const data = axios({
    method: "GET",
    url: `${BASE_URL}/cost/history/param`,
    data: {},
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return data;
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
export async function getProphetTrend() {
  const response = await axios({
    method: "GET",
    url: `${BASE_URL}/cost/trend/prophet`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  const result = [];
  for (const date in response.data) {
    result.push([date, response.data[`${date}`]]);
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
    const cost = response.data[`${service}`].toFixed(2);
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
      case "EC2 - Other":
        key = "EC2";
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
  result.push(total);
  return result;
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
