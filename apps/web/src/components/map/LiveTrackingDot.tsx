import React, { useEffect } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import mapboxgl from "mapbox-gl";

const SOURCE_ID = "guardian-live-dot-source";
const LAYER_ID = "guardian-live-dot-layer";

function addOrUpdate(map: MapboxMap, lat: number, lng: number): void {
  const data: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: {},
      },
    ],
  };

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
      "circle-radius": 7,
      "circle-color": "rgba(59, 130, 246, 0.95)",
      "circle-stroke-color": "rgba(226, 232, 240, 0.9)",
      "circle-stroke-width": 2,
      "circle-opacity": 0.95,
    },
  });
}

function remove(map: MapboxMap): void {
  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

export function LiveTrackingDot(props: {
  map: MapboxMap;
  lat: number;
  lng: number;
}): React.ReactElement | null {
  useEffect(() => {
    addOrUpdate(props.map, props.lat, props.lng);
    return () => remove(props.map);
  }, [props.map, props.lat, props.lng]);

  return null;
}

