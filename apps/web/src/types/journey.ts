export type JourneyStatus = "ACTIVE" | "COMPLETED" | "OVERDUE" | "SOS_TRIGGERED";

export type Waypoint = {
  id: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type Journey = {
  id: string;
  userId?: string;
  startLat: number;
  startLng: number;
  destLat?: number | null;
  destLng?: number | null;
  destination?: string | null;
  shareToken: string;
  status: JourneyStatus;
  expectedETA?: string | null;
  startedAt: string;
  completedAt?: string | null;
  waypoints?: Waypoint[];
};

