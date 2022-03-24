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
  return access_key_public
    ? await fetch(`${BASE_URL}/login`, loginData).then((response) =>
        response.json()
      )
    : null;
}
