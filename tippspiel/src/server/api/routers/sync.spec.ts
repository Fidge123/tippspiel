import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  gameResponseSchema,
  leagueResponseSchema,
  standingsResponseSchema,
  teamResponseSchema,
} from "./sync.schema";

function loadExampleJson(filename: string) {
  const filePath = join(process.cwd(), "examples", filename);
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

describe("Sync API Schema Validation", () => {
  test("leagueResponseSchema validates against leagues example", () => {
    expect(() => {
      leagueResponseSchema.parse(loadExampleJson("GET leagues?id=1.json"));
    }).not.toThrow();
  });

  test("teamResponseSchema validates against teams example", () => {
    expect(() => {
      teamResponseSchema.parse(
        loadExampleJson("GET teams?league=1&season=2025.json"),
      );
    }).not.toThrow();
  });

  test("standingsResponseSchema validates against standings example", () => {
    expect(() => {
      standingsResponseSchema.parse(
        loadExampleJson("GET standings?league=1&season=2025.json"),
      );
    }).not.toThrow();
  });

  test("gameResponseSchema validates against games example", () => {
    expect(() => {
      gameResponseSchema.parse(
        loadExampleJson("GET games?league=1&season=2025.json"),
      );
    }).not.toThrow();
  });
});
