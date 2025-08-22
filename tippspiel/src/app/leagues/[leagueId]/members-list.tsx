import { Button, Input } from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon as LeaveIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
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
                    title={members.length > 1 ? "Verlassen" : "Löschen"}
                    type="submit"
                    disabled={!canLeave}
                    className="w-32 inline-flex items-center gap-2 rounded px-2 py-0.5 text-white bg-red-600 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LeaveIcon className="size-5" />
                    <span>{members.length > 1 ? "Verlassen" : "Löschen"}</span>
                  </Button>
                </form>
              ) : isLeagueAdmin ? (
                <>
                  {m.isAdmin ? (
                    <form action={removeAdminAction}>
                      <Input type="hidden" name="leagueId" value={leagueId} />
                      <Input type="hidden" name="userId" value={m.id} />
                      <Button
                        title="Admin entziehen"
                        type="submit"
                        disabled={!canDemoteOnlyAdmin}
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Admin-Rechte entziehen
                      </Button>
                    </form>
                  ) : (
                    <form action={addAdminAction}>
                      <Input type="hidden" name="leagueId" value={leagueId} />
                      <Input type="hidden" name="userId" value={m.id} />
                      <Button
                        title="Zum Admin machen"
                        type="submit"
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-amber-600 hover:text-amber-700"
                      >
                        Zum Admin machen
                      </Button>
                    </form>
                  )}

                  <form action={removeMemberAction}>
                    <Input type="hidden" name="leagueId" value={leagueId} />
                    <Input type="hidden" name="userId" value={m.id} />
                    <Button
                      title="Entfernen"
                      type="submit"
                      className="w-32 inline-flex items-center gap-2 rounded px-2 py-0.5 text-white bg-red-600 hover:bg-red-700"
                    >
                      <UserMinusIcon className="size-5" />
                      <span>Entfernen</span>
                    </Button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        );
      })}

      {isLeagueAdmin && (
        <form action={addMemberAction} className="flex gap-2 justify-between">
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
            className="w-32 inline-flex items-center rounded gap-2 px-2 py-1 text-white bg-green-600 hover:bg-green-700"
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
