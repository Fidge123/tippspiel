"use client";
import { api } from "~/trpc/react";

export default function SyncButton() {
  const { mutate } = api.sync.syncAll.useMutation();
  return (
    <button
      type="button"
      onClick={() => mutate({ season: 2025 })}
      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Daten aktualisieren
    </button>
  );
}
