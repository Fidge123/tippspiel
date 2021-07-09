import { env } from "process";

export const BASE_URL =
  env.REACT_APP_API_URL || "https://nfl-tippspiel.herokuapp.com/";
