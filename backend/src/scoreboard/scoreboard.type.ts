export const BASE_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

export class Entries {
  alternateLabel: string;
  detail: string;
  endDate: string;
  label: string;
  startDate: string;
  value: string;
}

export class Calendar {
  endDate: string;
  entries: Entries[];
  label: string;
  startDate: string;
  value: string;
}

export class VenueAddress {
  city: string;
  state: string;
}

export class Venue {
  address: VenueAddress;
  capacity: number;
  fullName: string;
  id: string;
  indoor: boolean;
}

export class StatusType {
  completed: boolean;
  description: string;
  detail: string;
  id: string;
  name: string;
  shortDetail: string;
  state: string;
}

export class Status {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

export class TeamVenue {
  id: string;
}

export class Team {
  abbreviation: string;
  alternateColor: string;
  color: string;
  displayName: string;
  id: string;
  isActive: boolean;

  links: any[];
  location: string;
  logo: string;
  name: string;
  shortDisplayName: string;
  uid: string;
  venue: TeamVenue;
}

export class LineScore {
  value: number;
}

export class Competitors {
  homeAway: 'home' | 'away';
  id: string;
  linescores: LineScore[];
  order: number;
  records: Records[];
  score: string;

  statistics: any[];
  team: Team;
  type: string;
  uid: string;
  winner: boolean;
}

export class CompetitionType {
  id: string;
  abbreviation: string;
}

export class Competition {
  attendance: number;

  broadcasts: any[];
  competitors: Competitors[];
  conferenceCompetition?: boolean;
  date: string;

  geoBroadcasts: any[];

  headlines: any[];
  id: string;

  leaders?: any[];
  neutralSite: boolean;

  notes: any[];
  recent: boolean;
  startDate: string;
  status: Status;

  tickets?: any[];
  timeValid: boolean;
  type: CompetitionType;
  uid: string;
  venue: Venue;
}

export class CurrentSeason {
  year: number;
  type: number;
}

export class NFLEvent {
  competitions: Competition[];
  date: string;
  id: string;

  links: any;
  name: string;
  season: CurrentSeason;
  shortName: string;
  status: Status;
  uid: string;
}
export class Records {
  name: 'YTD' | 'Home' | 'Road';
  abbreviation?: string;
  summary: string;
  type: string;
}

export class SeasonType {
  id: string;
  type: number;
  name: string;
  abbreviation: string;
}

export class Season {
  endDate: string;
  startDate: string;
  type: SeasonType;
  year: number;
}

export class League {
  abbreviation: string;
  calendar: Calendar[];
  calendarEndDate: string;
  calendarIsWhiteList: boolean;
  calendarStartDate: string;
  calendarType: string;
  id: string;
  name: string;
  season: Season;
  slug: string;
  uid: string;
}

export class Week {
  number: number;
  teamsOnBye: Team[];
}

export class Scoreboard {
  events: NFLEvent[];
  leagues: League[];
  season: CurrentSeason;
  week: Week;
}
