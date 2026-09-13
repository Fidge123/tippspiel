export interface Entries {
  alternateLabel: string;
  detail: string;
  endDate: string;
  label: string;
  startDate: string;
  value: string;
}

export interface Calendar {
  endDate: string;
  entries: Entries[];
  label: string;
  startDate: string;
  value: string;
}

export interface VenueAddress {
  city: string;
  state: string;
}

export interface Venue {
  address: VenueAddress;
  capacity: number;
  fullName: string;
  id: string;
  indoor: boolean;
}

export interface StatusType {
  completed: boolean;
  description: string;
  detail: string;
  id: string;
  name: string;
  shortDetail: string;
  state: string;
}

export interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

export interface TeamVenue {
  id: string;
}

export interface Team {
  abbreviation: string;
  alternateColor?: string;
  color?: string;
  displayName: string;
  id: string;
  isActive: boolean;

  links: any[];
  location: string;
  logo?: string;
  logos?: {
    href: string;
    width: number;
    height: number;
  }[];
  record?: {
    items: {
      summary: string;
      stats: {
        name: string;
        value: number;
      }[];
    }[];
  };
  name: string;
  shortDisplayName: string;
  uid: string;
  venue?: TeamVenue;
}

export interface LineScore {
  value: number;
}

export interface Competitors {
  homeAway: 'home' | 'away';
  id: string;
  linescores?: LineScore[];
  order: number;
  records?: Records[];
  score: string;

  statistics: any[];
  team: Team;
  type: string;
  uid: string;
  winner: boolean;
}

export interface CompetitionType {
  id: string;
  abbreviation: string;
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
  type: CompetitionType;
  uid: string;
  venue: Venue;
}

export interface CurrentSeason {
  year: number;
  type: number;
}

export interface NFLEvent {
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
export interface Records {
  name: 'YTD' | 'Home' | 'Road';
  abbreviation?: string;
  summary: string;
  type: string;
}

export interface SeasonType {
  id: string;
  type: number;
  name: string;
  abbreviation: string;
}

export interface Season {
  endDate: string;
  startDate: string;
  type: SeasonType;
  year: number;
}

export interface League {
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

export interface Week {
  number: number;
  teamsOnBye: Team[];
}

export interface Scoreboard {
  events: NFLEvent[];
  leagues: League[];
  season: CurrentSeason;
  week: Week;
}
