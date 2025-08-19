"use client";
import { Field, Input, Label } from "@headlessui/react";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function SyncButton() {
  const [season, setSeason] = useState(2025);
  const sync = api.sync.syncWithESPN.useMutation();
  return (
    <form className="mt-12 flex w-fit items-center justify-evenly gap-2 rounded-lg bg-gray-100 p-4">
      <Field className="contents">
        <Label className="pr-4 font-semibold">Saison</Label>
        <Input
          value={season}
          onChange={(ev) => setSeason(parseInt(ev.target.value))}
          className="rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-2 focus:outline-blue-500"
        />
      </Field>
      <button
        type="button"
        disabled={sync.isPending}
        onClick={() => sync.mutate({ season })}
        className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:animate-pulse disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Aktualisieren
      </button>
    </form>
  );
}
