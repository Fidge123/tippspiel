export const BASE_URL = process.env.REACT_APP_API_URL;

export async function fetchFromAPI<T = any>(
  url: string,
  token: string | Promise<string>,
  method = "GET",
  body: any = undefined,
  onlyReturnOk = false
): Promise<T> {
  if (token) {
    const request = async (t: string | Promise<string>) =>
      fetch(`${BASE_URL}${url}`, {
        method,
        headers: {
          Authorization: `Bearer ${await t}`,
          "Content-Type": "application/json",
        },
        body: !body || typeof body === "string" ? body : JSON.stringify(body),
      });
    let res = await request(token);
    if (res.status === 401) {
      throw new Error("Not authorized");
    }
    return onlyReturnOk ? res.ok : await res.json();
  } else {
    throw new Error("No token provided!");
  }
}

let lastRefresh: Date = new Date();
let cache: Promise<string>;
export async function refresh() {
  const now = new Date();
  if (!cache || lastRefresh < new Date(now.getTime() - 5 * 1000)) {
    lastRefresh = now;
    cache = fetch(`${BASE_URL}user/refresh`, {
      method: "POST",
      credentials: "include",
    }).then((res) => res.json());
  }
  return cache;
}

export function validateToken(token: string): boolean {
  try {
    const payload = JSON.parse(window.atob(token.split(".")[1]));
    return new Date(payload.exp * 1000) >= new Date();
  } catch {
    return token === "";
  }
}
