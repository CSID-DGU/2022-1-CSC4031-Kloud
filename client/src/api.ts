import axios from "axios";
const BASE_URL = "http://localhost:8000";

export async function login(
  access_key_public: String,
  access_key_secret: String,
  region: String
) {
  // console.log(JSON.stringify({ access_key_public, access_key_secret }));
  let loginData = {
    method: "POST",
    body: JSON.stringify({ access_key_public, access_key_secret, region }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  const tmp = JSON.stringify({ access_key_public, access_key_secret, region });

  if (access_key_public) {
    const response = axios({
      method: "POST",
      url: `${BASE_URL}/login`,
      data: {
        access_key_public: access_key_public,
        access_key_secret: access_key_secret,
        region: region,
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
        throw new Error(error);
      });
  }
  // return access_key_public
  //   ? await fetch(`${BASE_URL}/login`, loginData).then((response) =>
  //       response.json()
  //     )
  //   : null;
  return null;
}
