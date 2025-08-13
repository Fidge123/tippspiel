import { env } from "node:process";
import { expect, test } from "@playwright/test";
import { fillLoginForm, fillRegisterForm } from "../helpers/auth";
import { cleanupUser } from "../helpers/database";

interface Mailbox {
  id: string;
  emailAddress: string;
  expiresAt: string;
}

test.describe("Actual email triggered", () => {
  test("verification mail, resend and verify", async ({ page }) => {
    test.slow();

    const mailRes = await fetch(env.GETTESTMAIL_URL ?? "", {
      headers: { "X-API-Key": env.GETTESTMAIL_KEY ?? "" },
      method: "POST",
    }); // TODO cache this and find out how to reuse the mailbox
    const mailbox = (await mailRes.json()) as Mailbox;

    expect(mailbox.id).toBeDefined();
    expect(mailbox.emailAddress).toBeDefined();

    const testUser = {
      email: mailbox.emailAddress,
      name: "Test User",
      password: "testpassword123",
    };

    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success", { timeout: 10000 });

    const res = await fetch(`${env.GETTESTMAIL_URL}/${mailbox.id}`, {
      headers: { "X-API-Key": env.GETTESTMAIL_KEY ?? "" },
      method: "GET",
    });
    const mail = await res.json();
    expect(mail).toHaveProperty("message.from", env.SMTP2GO_SENDER_EMAIL);

    await fillLoginForm(page, testUser);
    page.getByText(/Neue Bestätigungsmail anfordern/).click();
    await expect(page).toHaveURL(/.*resend-verification.*/);
    await page
      .getByRole("button", { name: "Bestätigungs-E-Mail senden" })
      .click();
    await expect(page.getByText(/warte 5 Minuten/)).toBeVisible();

    await page.getByLabel("E-Mail-Adresse").fill("nonexistant@example.com");
    await page
      .getByRole("button", { name: "Bestätigungs-E-Mail senden" })
      .click();
    await expect(page.getByText(/Kein Benutzer/)).toBeVisible();

    const link = mail.message.text.match(/https?:\/\/[^ )]+/)?.[0] ?? "";
    await page.goto(link);
    await expect(page.getByText(/erfolgreich bestätigt/)).toBeVisible({
      timeout: 10000,
    });
    await page.goto(link);
    await expect(page.getByText(/ungültig/)).toBeVisible();

    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/");
    await expect(page.getByText(testUser.email)).toBeVisible();

    await cleanupUser(testUser.email);
  });
});

// TODO add tests for:
// - Password reset flow
