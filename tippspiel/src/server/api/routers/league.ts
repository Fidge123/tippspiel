import { createTRPCRouter } from "~/server/api/trpc";
import { addAdmin, removeAdmin } from "./league/admin";
import {
  createLeague,
  getLeagues,
  getLeaguesForDropdown,
  leaveLeague,
  renameLeague,
} from "./league/league";
import { addMember, removeMember } from "./league/member";

export const leagueRouter = createTRPCRouter({
  getLeagues: getLeagues,
  getLeaguesForDropdown: getLeaguesForDropdown,
  createLeague: createLeague,
  leaveLeague: leaveLeague,
  renameLeague: renameLeague,
  addMember: addMember,
  removeMember: removeMember,
  addAdmin: addAdmin,
  removeAdmin: removeAdmin,
});
