export type RiskZone = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  riskScore: number; // 0..1
  incidentCount: number;
  lastUpdated?: string;
};

export type HeatmapFeatureProperties = {
  zoneId: string;
  riskScore: number;
  incidentCount: number;
  radius: number;
};

export type HeatmapFeature = GeoJSON.Feature<
  GeoJSON.Point,
  HeatmapFeatureProperties
>;

export type HeatmapFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  HeatmapFeatureProperties
>;

export type ZoneAlertPayload = {
  zoneData: {
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
    incidentCount: number;
  };
  riskScore: number;
};

