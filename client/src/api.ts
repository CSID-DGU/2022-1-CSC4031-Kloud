import axios from "axios";

const BASE_URL = "http://localhost:8000";

export async function login(
  access_key_public: String,
  access_key_secret: String,
  region: String
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

export function getInfra() {
  const data = axios({
    method: "POST",
    url: `${BASE_URL}/infra/info`,
    data: {
      access_token: localStorage.getItem("access_token"),
    },
  });
  return data;
}
export function getNestedInfra() {
  const data = axios({
    method: "POST",
    url: `${BASE_URL}/infra/tree`,
    data: {
      access_token: localStorage.getItem("access_token"),
    },
  });
  return data;
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
