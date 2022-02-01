export const BASE_URL = process.env.REACT_APP_API_URL;

export async function fetchFromAPI<T = any>(
  url: string,
  token: string | Promise<string>,
  method = "GET",
  body: any = undefined,
  onlyReturnOk = false
): Promise<T> {
  if (token) {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${await token}`,
        "Content-Type": "application/json",
      },
      body: !body || typeof body === "string" ? body : JSON.stringify(body),
    });
    return onlyReturnOk ? res.ok : await res.json();
  } else {
    throw new Error("No token provided!");
  }
}
