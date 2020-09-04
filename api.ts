export const BASE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

export interface Scoreboard {
  events: NFLEvent[];
  leagues: League[];
  season: {
    type: number;
    year: number;
  };
  week: {
    number: number;
  };
}

export interface League {
  abbreviation: string;
  calendar: Calendar[];
  calendarEndDate: string;
  calendarIsWhiteList: boolean;
  calendarStratDate: string;
  calendarType: string;
  id: string;
  name: string;
  season: {
    endDate: string;
    startDate: string;
    type: {
      id: string;
      type: number;
      name: string;
      abbreviation: string;
    };
    year: number;
  };
  slug: string;
  uid: string;
}

export interface Calendar {
  endDate: string;
  entries: Entries[];
  label: string;
  startDate: string;
  value: string;
}

export interface Entries {
  alternateLabel: string;
  detail: string;
  endDate: string;
  label: string;
  startDate: string;
  value: string;
}

export interface NFLEvent {
  competitions: Competition[];
  date: string;
  id: string;
  links: any;
  name: string;
  season: {
    year: number;
    type: number;
  };
  shortName: string;
  status: Status;
  uid: string;
}

export interface Competition {
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
  type: {
    id: string;
    abbreviation: string;
  };
  uid: string;
  venue: Venue;
}

export interface Venue {
  address: {
    city: string;
    state: string;
  };
  capacity: number;
  fullName: string;
  id: string;
  indoor: boolean;
}

export interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: {
    completed: boolean;
    description: string;
    detail: string;
    id: string;
    name: string;
    shortDetail: string;
    state: string;
  };
}

export interface Competitors {
  homeAway: "home" | "away";
  id: string;
  linescores: Array<{ value: number }>;
  order: number;
  records: Records[];
  score: string;
  statistics: any[];
  team: Team;
  type: string;
  uid: string;
  winner: boolean;
}

export interface Team {
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
  venue: {
    id: string;
  };
}

export interface Records {
  name: "YTD" | "Home" | "Road";
  abbreviation?: string;
  summary: string;
  type: string;
}
