"use client";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function SyncButton() {
  const [season, setSeason] = useState(2025);
  const { mutate } = api.sync.syncAll.useMutation();
  return (
    <>
      <input
        value={season}
        onChange={(ev) => setSeason(parseInt(ev.target.value))}
      />
      <button
        type="button"
        onClick={() => mutate({ season })}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Daten aktualisieren
      </button>
    </>
  );
}
