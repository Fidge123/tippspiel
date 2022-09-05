export const BASE_URL = process.env.REACT_APP_API_URL;

export async function fetchFromAPI<T = any>(
  url: string,
  method = "GET",
  body: any = undefined,
  onlyReturnOk = false
): Promise<T> {
  const storedToken = window.localStorage.getItem("access_token") ?? "";
  const token = validateToken(storedToken, false)
    ? storedToken
    : await refresh();
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: !body || typeof body === "string" ? body : JSON.stringify(body),
  });
  if (res.status === 401) {
    throw new Error("Not authorized");
  }
  return onlyReturnOk ? res.ok : await res.json();
}

let lastRefresh: Date = new Date();
let cache: Promise<string>;
export async function refresh(invalidateCache = false) {
  const now = new Date();
  if (
    invalidateCache ||
    !cache ||
    lastRefresh < new Date(now.getTime() - 5 * 1000)
  ) {
    lastRefresh = now;
    cache = fetch(`${BASE_URL}user/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((token) => {
        if (validateToken(token, false)) {
          setToken(token);
        } else {
          resetToken();
        }
        return token;
      });
  }
  return cache;
}

export function isLoggedIn() {
  return (
    window.localStorage.getItem("access_token") &&
    window.localStorage.getItem("access_token") !== ""
  );
}

export function setToken(token: string) {
  window.localStorage.setItem("access_token", token);
}

export function resetToken() {
  window.localStorage.removeItem("access_token");
}

export function getDecodedToken() {
  try {
    const token = window.localStorage.getItem("access_token") as string;
    return JSON.parse(window.atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export function validateToken(
  token: string,
  accept_empty: boolean = true
): boolean {
  try {
    const payload = JSON.parse(window.atob(token.split(".")[1]));
    return new Date((payload.exp - 5) * 1000) >= new Date();
  } catch {
    return accept_empty && token === "";
  }
}
