import React, { useEffect } from "react";
import L, { type LayerGroup, type Map as LeafletMap } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import type { Incident } from "../../types/incident";

const layerStore = new WeakMap<LeafletMap, LayerGroup>();

async function fetchIncidents(): Promise<Incident[]> {
  const response = await api.get<Incident[]>("/incidents");
  return response.data;
}

type Cluster = {
  key: string;
  lat: number;
  lng: number;
  count: number;
  incidents: Incident[];
};

function clusterIncidents(incidents: Incident[]): Cluster[] {
  const byCell = new Map<string, Cluster>();
  for (const incident of incidents) {
    const latCell = Math.round(incident.latitude * 200) / 200;
    const lngCell = Math.round(incident.longitude * 200) / 200;
    const key = `${latCell}:${lngCell}`;
    const existing = byCell.get(key);
    if (existing) {
      existing.count += 1;
      existing.incidents.push(incident);
      continue;
    }
    byCell.set(key, {
      key,
      lat: latCell,
      lng: lngCell,
      count: 1,
      incidents: [incident],
    });
  }
  return [...byCell.values()];
}

export function IncidentClusterLayer(props: { map: LeafletMap }): React.ReactElement | null {
  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const map = props.map;
    let layer = layerStore.get(map);
    if (!layer) {
      layer = L.layerGroup().addTo(map);
      layerStore.set(map, layer);
    }
    layer.clearLayers();

    const clusters = clusterIncidents(incidentsQuery.data ?? []);
    for (const cluster of clusters) {
      const isHighRisk = cluster.incidents.some((incident) => incident.severity >= 4);
      const bgColor = isHighRisk ? "#ef4444" : cluster.count > 1 ? "#f59e0b" : "#22c55e";
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: L.divIcon({
          className: "guardian-cluster-marker",
          html: `<div style="min-width:32px;height:32px;border-radius:16px;background:${bgColor};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid rgba(255,255,255,0.6)">${cluster.count}</div>`,
        }),
      });
      marker.bindTooltip(
        `${cluster.count} incident${cluster.count > 1 ? "s" : ""}<br/>${cluster.incidents[0].type}`,
      );
      marker.addTo(layer);
    }
  }, [incidentsQuery.data, props.map]);

  return null;
}

