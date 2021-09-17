import { useState } from "react";

export function useToken() {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem("access_token");
      if (item) {
        const payload = JSON.parse(window.atob(item.split(".")[1]));
        if (new Date(payload.exp * 1000) <= new Date()) {
          window.localStorage.setItem("access_token", "");
          return "";
        }
      }
      return item ? item : "";
    } catch (error) {
      console.log(error);
      return;
    }
  });
  const setValue = (value: string) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem("access_token", value);
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}
