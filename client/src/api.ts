const BASE_URL = "http://localhost:8000";

export async function login(
  access_key_public: String,
  access_key_secret: String
) {
  let loginData = {
    method: "POST",
    body: JSON.stringify({ access_key_public, access_key_secret }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  console.log(access_key_public + "999999");
  return access_key_public
    ? await fetch(`${BASE_URL}/login`, loginData).then((response) =>
        response.json()
      )
    : null;
}
