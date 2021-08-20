import { useState } from "react";

export function useToken() {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem("access_token");
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
