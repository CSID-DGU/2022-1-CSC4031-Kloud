import axios from "axios";
import { isInterfaceDeclaration } from "typescript";
const BASE_URL = "http://localhost:8000";

export async function login(
  access_key_public: String,
  access_key_secret: String,
  region: String
) {
  // let loginData = {
  //   method: "POST",
  //   body: JSON.stringify({ access_key_public, access_key_secret, region }),
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // };

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
    // .then((res) => {
    //   console.log(res);
    // })
    // .catch((error) => {
    //   console.log(error);
    //   throw new Error(error);
    // });
  }
  // return access_key_public
  //   ? await fetch(`${BASE_URL}/login`, loginData).then((response) =>
  //       response.json()
  //     )
  //   : null;
}

export function getInfra() {
  const data = axios({
    method: "POST",
    url: `${BASE_URL}/infra_info`,
    data: {
      access_token: localStorage.getItem("access_token"),
    },
  });
  return data;
}
