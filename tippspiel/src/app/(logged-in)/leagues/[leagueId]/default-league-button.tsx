"use client";
import { Button } from "@headlessui/react";
import { useActionState } from "react";
import { setDefaultLeagueAction } from "./set-default-action";

export function DefaultLeagueButton({
  leagueId,
  isDefault,
  leagueName,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    setDefaultLeagueAction,
    {
      leagueId,
    },
  );

  if (isDefault) {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-3">
        <p className="text-green-800 text-sm">
          <span className="font-medium">{leagueName}</span> ist deine
          Standard-Liga.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="leagueId" value={leagueId} />
        <Button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Wird gesetzt...
            </span>
          ) : (
            "Als Standard-Liga festlegen"
          )}
        </Button>
      </form>
      {state.message && (
        <p
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

interface Props {
  leagueId: string;
  isDefault: boolean;
  leagueName: string;
}
