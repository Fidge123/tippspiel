import { createTRPCRouter } from "~/server/api/trpc";
import { addAdmin, removeAdmin } from "./league/admin";
import {
  createLeague,
  getLeagues,
  leaveLeague,
  renameLeague,
} from "./league/league";
import { addMember, removeMember } from "./league/member";

export const leagueRouter = createTRPCRouter({
  getLeagues: getLeagues,
  createLeague: createLeague,
  leaveLeague: leaveLeague,
  renameLeague: renameLeague,
  addMember: addMember,
  removeMember: removeMember,
  addAdmin: addAdmin,
  removeAdmin: removeAdmin,
});
