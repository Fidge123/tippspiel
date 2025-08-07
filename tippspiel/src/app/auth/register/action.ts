import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function registerUser(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const consent = formData.get("consent") as string;

  try {
    if (!consent) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    await api.user.register({
      email,
      name: name.trim(),
      password,
      consent: new Date(),
    });
  } catch (error: unknown) {
    // TODO Handle errors correctly. This is almost invisible to the user.
    redirect(
      `/auth/register?error=${encodeURIComponent(
        (error as Error).message || "An error occurred",
      )}`,
    );
  }

  redirect("/auth/register/success");
}
