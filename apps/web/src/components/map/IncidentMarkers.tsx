import React, { useEffect } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import type { Incident } from "../../types/incident";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";

const SOURCE_ID = "streeastra-incidents-source";
const LAYER_ID = "streeastra-incidents-layer";

async function fetchIncidents(): Promise<Incident[]> {
  const res = await api.get<Incident[]>("/incidents");
  return res.data;
}

function toGeoJson(incidents: Incident[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: incidents.map((i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [i.longitude, i.latitude] },
      properties: {
        id: i.id,
        type: i.type,
        severity: i.severity,
      },
    })),
  };
}

function addOrUpdate(map: MapboxMap, incidents: Incident[]): void {
  const data = toGeoJson(incidents);
  const existing = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
    return;
  }

  map.addSource(SOURCE_ID, { type: "geojson", data });
  map.addLayer({
    id: LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "severity"], 1, 8, 3, 10, 5, 12],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "severity"],
        1,
        "#22C55E",
        3,
        "#F59E0B",
        5,
        "#FF3B5C",
      ],
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 2,
      "circle-opacity": 0.9,
    },
  });

  map.on("mouseenter", LAYER_ID, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", LAYER_ID, () => {
    map.getCanvas().style.cursor = "";
  });
}

function remove(map: MapboxMap): void {
  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

export function IncidentMarkers(props: {
  map: MapboxMap;
  demoIncidents: Incident[];
}): React.ReactElement | null {
  const query = useQuery({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
    enabled: props.demoIncidents.length === 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const incidents = props.demoIncidents.length > 0 ? props.demoIncidents : query.data;
    if (!incidents) return;
    addOrUpdate(props.map, incidents);
    return () => remove(props.map);
  }, [props.map, props.demoIncidents, query.data]);

  return null;
}

