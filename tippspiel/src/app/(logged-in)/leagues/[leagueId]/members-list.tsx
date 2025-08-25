import { Button, Input } from "@headlessui/react";
import {
  ChevronDoubleDownIcon as DemoteIcon,
  ArrowRightStartOnRectangleIcon as LeaveIcon,
  ChevronDoubleUpIcon as PromoteIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { addAdminAction, removeAdminAction } from "./admins";
import { leaveLeagueAction } from "./leave-league";
import { addMemberAction, removeMemberAction } from "./members";

export function MembersList({ leagueId, members }: Props) {
  const isLeagueAdmin = members.some((m) => m.isYou && m.isAdmin);
  const adminCount = members.filter((m) => m.isAdmin).length;

  return (
    <div className="flex flex-col gap-1">
      {members.map((m) => {
        const canDemoteOnlyAdmin = !(adminCount === 1 && m.isAdmin);
        const canLeave = !(
          members.length > 1 &&
          adminCount === 1 &&
          m.isYou &&
          m.isAdmin
        );

        return (
          <div key={m.id} className="flex items-center justify-between">
            {m.isAdmin ? (
              <span className="font-semibold">{`${m.name} (Admin)`}</span>
            ) : (
              <span>{m.name}</span>
            )}

            <div className="flex items-center gap-1">
              {m.isYou ? (
                <form action={leaveLeagueAction}>
                  <Input type="hidden" name="leagueId" value={leagueId} />
                  <Button
                    type="submit"
                    disabled={!canLeave}
                    className="inline-flex w-32 items-center gap-2 rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {members.length > 1 ? (
                      <LeaveIcon className="size-5" />
                    ) : (
                      <TrashIcon className="size-5" />
                    )}
                    {members.length > 1 ? "Verlassen" : "Löschen"}
                  </Button>
                </form>
              ) : isLeagueAdmin ? (
                <>
                  {m.isAdmin ? (
                    <form action={removeAdminAction}>
                      <Input type="hidden" name="leagueId" value={leagueId} />
                      <Input type="hidden" name="userId" value={m.id} />
                      <Button
                        type="submit"
                        disabled={!canDemoteOnlyAdmin}
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <DemoteIcon className="size-5" />
                        Admin-Rechte entziehen
                      </Button>
                    </form>
                  ) : (
                    <form action={addAdminAction}>
                      <Input type="hidden" name="leagueId" value={leagueId} />
                      <Input type="hidden" name="userId" value={m.id} />
                      <Button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-amber-600 hover:text-amber-700"
                      >
                        <PromoteIcon className="size-5" />
                        Zum Admin machen
                      </Button>
                    </form>
                  )}

                  <form action={removeMemberAction}>
                    <Input type="hidden" name="leagueId" value={leagueId} />
                    <Input type="hidden" name="userId" value={m.id} />
                    <Button
                      type="submit"
                      className="inline-flex w-32 items-center gap-2 rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700"
                    >
                      <UserMinusIcon className="size-5" />
                      Entfernen
                    </Button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        );
      })}

      {isLeagueAdmin && (
        <form action={addMemberAction} className="flex justify-between gap-2">
          <Input type="hidden" name="leagueId" value={leagueId} />
          <Input
            name="email"
            type="email"
            required
            placeholder="E-Mail hinzufügen"
            className="w-md rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:outline-2 focus:outline-blue-500"
          />
          <Button
            title="Hinzufügen"
            type="submit"
            className="inline-flex w-32 items-center gap-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
          >
            <UserPlusIcon className="size-5" />
            <span>Hinzufügen</span>
          </Button>
        </form>
      )}
    </div>
  );
}

export default MembersList;

interface Props {
  leagueId: string;
  members: {
    id: string;
    name: string;
    isYou: boolean;
    isAdmin: boolean;
  }[];
}
