const BASE_URL = "localhost:8000";

export function login(access_key_public: String, access_key_secret: String) {
  let loginData = {
    method: "POST",
    body: JSON.stringify({ access_key_public, access_key_secret }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(`${BASE_URL}/login`, loginData).then((response) =>
    response.json()
  );
}
