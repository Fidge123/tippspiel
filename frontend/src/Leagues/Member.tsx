import { FormEvent } from "react";
import { fetchFromAPI } from "../api";
import { League } from "../State/response-types";

function Member({ member, showControls, league, setLeague }: Props) {
  const isAdmin = league.admins.some((a) => a.id === member.id);

  async function handlePromote(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI(
      "leagues/promote",
      "POST",
      {
        leagueId: league.id,
        userId: member.id,
      },
      true
    );
    setLeague({ ...league, admins: [...league.admins, member] });
    return res;
  }

  async function handleDemote(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI(
      "leagues/demote",
      "POST",
      {
        leagueId: league.id,
        userId: member.id,
      },
      true
    );
    setLeague({
      ...league,
      admins: [...league.admins.filter((a) => a.id !== member.id)],
    });
    return res;
  }

  async function handleKick(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI(
      "leagues/kick",
      "POST",
      {
        leagueId: league.id,
        userId: member.id,
      },
      true
    );
    setLeague({
      ...league,
      members: [...league.members.filter((m) => m.id !== member.id)],
      admins: [...league.admins.filter((a) => a.id !== member.id)],
    });
    return res;
  }

  if (!showControls) {
    return <div>{`${member.name}${isAdmin ? " (Admin)" : ""}`}</div>;
  }

  return (
    <div className="flex flex-row items-center justify-between w-full">
      <div>{`${member.name}${isAdmin ? " (Admin)" : ""}`}</div>
      <div>
        {isAdmin ? (
          <button onClick={handleDemote}>Demote</button>
        ) : (
          <button onClick={handlePromote}>Promote</button>
        )}
        <button onClick={handleKick}>Kick</button>
      </div>
    </div>
  );
}

interface Props {
  member: {
    name: string;
    id: string;
  };
  league: League;
  setLeague: (league: League) => void;
  showControls: boolean;
}

export default Member;
