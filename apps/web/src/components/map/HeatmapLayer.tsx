import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import type { HeatmapFeatureCollection } from "../../types/zone";
import L, { type Circle, type Map as LeafletMap } from "leaflet";

const circlesById = new WeakMap<LeafletMap, Map<string, Circle>>();

async function fetchHeatmap(): Promise<HeatmapFeatureCollection> {
  const res = await api.get<HeatmapFeatureCollection>("/zones/heatmap");
  return res.data;
}

function getZoneColor(riskScore: number): string {
  if (riskScore < 0.3) return "#22C55E";
  if (riskScore < 0.6) return "#F59E0B";
  return "#FF3B5C";
}

function addOrUpdate(map: LeafletMap, data: HeatmapFeatureCollection): void {
  let circleMap = circlesById.get(map);
  if (!circleMap) {
    circleMap = new Map<string, Circle>();
    circlesById.set(map, circleMap);
  }

  const nextIds = new Set<string>();
  for (const feature of data.features) {
    const zoneId = feature.properties.zoneId;
    nextIds.add(zoneId);
    const [lng, lat] = feature.geometry.coordinates;
    const color = getZoneColor(feature.properties.riskScore);
    const tooltipHtml = [
      `<div style="font-weight:600;">Risk ${(feature.properties.riskScore * 100).toFixed(0)}%</div>`,
      `<div>Incidents: ${feature.properties.incidentCount}</div>`,
    ].join("");

    const existing = circleMap.get(zoneId);
    if (existing) {
      existing.setLatLng([lat, lng]);
      existing.setRadius(feature.properties.radius);
      existing.setStyle({
        color,
        fillColor: color,
      });
      existing.bindTooltip(tooltipHtml);
      continue;
    }

    const circle = L.circle([lat, lng], {
      radius: feature.properties.radius,
      color,
      fillColor: color,
      fillOpacity: 0.25,
      weight: 2,
    })
      .bindTooltip(tooltipHtml)
      .addTo(map);
    circle.bringToFront();
    circleMap.set(zoneId, circle);
  }

  for (const [zoneId, circle] of circleMap.entries()) {
    if (nextIds.has(zoneId)) continue;
    circle.removeFrom(map);
    circleMap.delete(zoneId);
  }
}

function remove(map: LeafletMap): void {
  const circleMap = circlesById.get(map);
  if (!circleMap) return;
  for (const circle of circleMap.values()) {
    circle.removeFrom(map);
  }
  circleMap.clear();
}

export function HeatmapLayer(props: {
  map: LeafletMap;
  demoData?: HeatmapFeatureCollection;
}): React.ReactElement | null {
  const query = useQuery({
    queryKey: ["zones", "heatmap"],
    queryFn: fetchHeatmap,
    enabled: !props.demoData,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  useEffect(() => {
    const data = props.demoData ?? query.data;
    if (!data) return;
    addOrUpdate(props.map, data);
    return () => {
      remove(props.map);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.map, props.demoData, query.data]);

  return null;
}

