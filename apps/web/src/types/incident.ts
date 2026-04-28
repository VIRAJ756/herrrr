export type IncidentType =
  | "HARASSMENT"
  | "STALKING"
  | "ASSAULT"
  | "THEFT"
  | "POOR_LIGHTING"
  | "ISOLATED_AREA"
  | "SUSPICIOUS_ACTIVITY"
  | "OTHER";

export type Incident = {
  id: string;
  userId?: string | null;
  latitude: number;
  longitude: number;
  type: IncidentType;
  description?: string | null;
  mediaUrls: string[];
  severity: number; // 1..5
  isAnonymous: boolean;
  verifiedCount: number;
  flaggedCount: number;
  createdAt: string;
};

