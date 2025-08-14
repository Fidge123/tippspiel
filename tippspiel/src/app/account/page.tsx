import { auth } from "~/server/auth";

export default async function Account() {
  const session = await auth();

  return (
    session && (
      <main className="grid flex-grow place-content-center gap-4 p-8">
        <h1 className="text-xl">Current User: {session.user?.email}</h1>
      </main>
    )
  );
}
