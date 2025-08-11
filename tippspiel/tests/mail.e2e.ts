import { env } from "node:process";
import { expect, test } from "@playwright/test";
import { cleanupUser } from "./helpers/database";

interface Mailbox {
  id: string;
  emailAddress: string;
  expiresAt: string;
}

test.describe("Verify email integration", () => {
  test("should login with valid credentials", async ({ page }) => {
    const mailRes = await fetch(env.GETTESTMAIL_URL ?? "", {
      headers: { "X-API-Key": env.GETTESTMAIL_KEY ?? "" },
      method: "POST",
    }); // TODO cache this and find out how to reuse the mailbox
    const mailbox = (await mailRes.json()) as Mailbox;

    expect(mailbox.id).toBeDefined();
    expect(mailbox.emailAddress).toBeDefined();

    await page.goto("/auth/register");

    await page.getByLabel("E-Mail-Adresse").fill(mailbox.emailAddress);
    await page.getByLabel("Nutzername").fill("Test User");
    await page.getByLabel("Passwort", { exact: true }).fill("testpassword123");
    await page.getByLabel("Passwort bestätigen").fill("testpassword123");
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page).toHaveURL("/auth/register/success");

    const res = await fetch(`${env.GETTESTMAIL_URL}/${mailbox.id}`, {
      headers: { "X-API-Key": env.GETTESTMAIL_KEY ?? "" },
      method: "GET",
    });
    expect(await res.json()).toHaveProperty(
      "message.from",
      "admin@nfl-tippspiel.de",
    );
    await cleanupUser(mailbox.emailAddress);
  });
});
