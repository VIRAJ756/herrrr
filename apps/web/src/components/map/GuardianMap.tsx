import React, { useEffect, useMemo, useRef, useState } from "react";
import L, { type CircleMarker, type Map as LeafletMap, type Polyline } from "leaflet";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useMapStore } from "../../store/mapStore";
import { HeatmapLayer } from "./HeatmapLayer";
import { IncidentClusterLayer } from "./IncidentClusterLayer";
import type { Incident } from "../../types/incident";
import type { HeatmapFeatureCollection } from "../../types/zone";

const BENGALURU: { lat: number; lng: number } = { lat: 12.9716, lng: 77.5946 };

function demoIncidents(): Incident[] {
  const now = Date.now();
  const mk = (
    id: string,
    lat: number,
    lng: number,
    type: Incident["type"],
    severity: number,
    minutesAgo: number,
    description: string,
  ): Incident => ({
    id,
    latitude: lat,
    longitude: lng,
    type,
    severity,
    description,
    mediaUrls: [],
    isAnonymous: true,
    verifiedCount: Math.max(0, Math.round(severity * 8 - minutesAgo / 10)),
    flaggedCount: 0,
    createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
  });

  return [
    mk("i1", 12.9352, 77.6245, "HARASSMENT", 4, 35, "Following near metro exit."),
    mk("i2", 12.9357, 77.6241, "POOR_LIGHTING", 3, 70, "Dark stretch beside park."),
    mk("i3", 12.9719, 77.6061, "HARASSMENT", 4, 120, "Persistent catcalling."),
    mk("i4", 12.9753, 77.605, "THEFT", 3, 190, "Bag snatch attempt."),
    mk("i5", 12.9789, 77.637, "SUSPICIOUS_ACTIVITY", 3, 50, "Loitering near alley."),
    mk("i6", 12.97, 77.64, "ISOLATED_AREA", 2, 210, "Isolated road at night."),
    mk("i7", 12.962, 77.615, "STALKING", 5, 20, "Motorbike following repeatedly."),
    mk("i8", 12.966, 77.61, "POOR_LIGHTING", 3, 95, "Streetlights off."),
    mk("i9", 12.926, 77.676, "HARASSMENT", 4, 15, "Crowded stop; harassment report."),
    mk("i10", 12.9267, 77.6766, "OTHER", 2, 240, "General unease in area."),
    mk("i11", 12.91, 77.64, "THEFT", 3, 310, "Pickpocketing."),
    mk("i12", 12.91, 77.645, "SUSPICIOUS_ACTIVITY", 3, 380, "Suspicious vehicle parked."),
    mk("i13", 12.97, 77.595, "POOR_LIGHTING", 3, 60, "Underpass poorly lit."),
    mk("i14", 12.974, 77.592, "HARASSMENT", 4, 85, "Harassment near junction."),
    mk("i15", 12.975, 77.59, "ASSAULT", 5, 540, "Assault report (older)."),
  ];
}

function demoHeatmap(incidents: Incident[]): HeatmapFeatureCollection {
  return {
    type: "FeatureCollection",
    features: incidents.map((i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [i.longitude, i.latitude] },
      properties: {
        zoneId: `demo-${i.id}`,
        riskScore: Math.min(1, Math.max(0.2, i.severity / 5)),
        incidentCount: 1,
        radius: 200,
      },
    })),
  };
}

export function GuardianMap(props: { demo: boolean; userLat?: number; userLng?: number }): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const liveMarkerRef = useRef<CircleMarker | null>(null);
  const safeRouteRef = useRef<Polyline | null>(null);
  const safeRouteMarkersRef = useRef<CircleMarker[]>([]);
  const [ready, setReady] = useState(false);

  const { point } = useGeolocation();
  const { toggles } = useMapStore();

  const demoInc = useMemo(() => (props.demo ? demoIncidents() : []), [props.demo]);
  const demoZones = useMemo(() => (props.demo ? demoHeatmap(demoInc) : null), [props.demo, demoInc]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialLat = props.userLat ?? BENGALURU.lat;
    const initialLng = props.userLng ?? BENGALURU.lng;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initialLat, initialLng], 13);

    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; Stadia Maps",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setReady(true);
    window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      liveMarkerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !point) return;
    map.panTo([point.lat, point.lng], { animate: true, duration: 0.8 });

    if (!toggles.liveTracking) {
      if (liveMarkerRef.current) {
        liveMarkerRef.current.removeFrom(map);
        liveMarkerRef.current = null;
      }
      return;
    }

    if (!liveMarkerRef.current) {
      liveMarkerRef.current = L.circleMarker([point.lat, point.lng], {
        radius: 7,
        color: "#E2E8F0",
        weight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.95,
      }).addTo(map);
      liveMarkerRef.current.bindTooltip("Live location");
      return;
    }

    liveMarkerRef.current.setLatLng([point.lat, point.lng]);
  }, [point, toggles.liveTracking]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || toggles.liveTracking || !liveMarkerRef.current) return;
    liveMarkerRef.current.removeFrom(map);
    liveMarkerRef.current = null;
  }, [toggles.liveTracking]);

  // Safe Route effect
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !point) return;

    // Remove existing safe route
    if (safeRouteRef.current) {
      safeRouteRef.current.removeFrom(map);
      safeRouteRef.current = null;
    }
    safeRouteMarkersRef.current.forEach(marker => marker.removeFrom(map));
    safeRouteMarkersRef.current = [];

    if (!toggles.safeRoute) return;

    // Call safe route API
    const fetchSafeRoute = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/ai/safe-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originLat: point.lat,
            originLng: point.lng,
            destLat: point.lat + 0.02,
            destLng: point.lng + 0.02
          })
        });
        
        if (response.ok) {
          const routeData = await response.json();
          if (routeData.route && routeData.route.length > 0) {
            // Draw polyline from API response
            const coordinates: [number, number][] = routeData.route.map((point: any) => [point.lat, point.lng]);
            const polyline = L.polyline(coordinates, {
              color: '#22c55e',
              weight: 4,
              opacity: 0.8,
              dashArray: '8 4'
            }).addTo(map);
            safeRouteRef.current = polyline;

            // Add origin marker
            const originMarker = L.circleMarker([point.lat, point.lng], {
              radius: 8,
              color: '#22c55e',
              weight: 2,
              fillColor: '#22c55e',
              fillOpacity: 0.8
            }).addTo(map).bindTooltip('You');
            safeRouteMarkersRef.current.push(originMarker);

            // Add destination marker
            const destMarker = L.circleMarker([point.lat + 0.02, point.lng + 0.02], {
              radius: 8,
              color: '#22c55e',
              weight: 2,
              fillColor: '#22c55e',
              fillOpacity: 0.8
            }).addTo(map).bindTooltip('Destination');
            safeRouteMarkersRef.current.push(destMarker);
          }
        } else {
          // Fallback: draw simple straight line
          const coordinates = [
            [point.lat, point.lng],
            [point.lat + 0.02, point.lng + 0.02]
          ];
          const polyline = L.polyline(coordinates, {
            color: '#22c55e',
            weight: 4,
            opacity: 0.8,
            dashArray: '8 4'
          }).addTo(map);
          safeRouteRef.current = polyline;

          // Add origin marker
          const originMarker = L.circleMarker([point.lat, point.lng], {
            radius: 8,
            color: '#22c55e',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.8
          }).addTo(map).bindTooltip('You');
          safeRouteMarkersRef.current.push(originMarker);

          // Add destination marker
          const destMarker = L.circleMarker([point.lat + 0.02, point.lng + 0.02], {
            radius: 8,
            color: '#22c55e',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.8
          }).addTo(map).bindTooltip('Destination');
          safeRouteMarkersRef.current.push(destMarker);
        }
      } catch (error) {
        console.error('Safe route API error:', error);
        // Fallback: draw simple straight line
        const coordinates: [number, number][] = [
          [point.lat, point.lng],
          [point.lat + 0.02, point.lng + 0.02]
        ];
        const polyline = L.polyline(coordinates, {
          color: '#22c55e',
          weight: 4,
          opacity: 0.8,
          dashArray: '8 4'
        }).addTo(map);
        safeRouteRef.current = polyline;

        // Add origin marker
        const originMarker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          color: '#22c55e',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 0.8
        }).addTo(map).bindTooltip('You');
        safeRouteMarkersRef.current.push(originMarker);

        // Add destination marker
        const destMarker = L.circleMarker([point.lat + 0.02, point.lng + 0.02], {
          radius: 8,
          color: '#22c55e',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 0.8
        }).addTo(map).bindTooltip('Destination');
        safeRouteMarkersRef.current.push(destMarker);
      }
    };

    fetchSafeRoute();

    return () => {
      if (safeRouteRef.current) {
        safeRouteRef.current.removeFrom(map);
        safeRouteRef.current = null;
      }
      safeRouteMarkersRef.current.forEach(marker => marker.removeFrom(map));
      safeRouteMarkersRef.current = [];
    };
  }, [toggles.safeRoute, point]);

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <div
        ref={containerRef}
        className="guardian-leaflet-map h-full min-h-[400px] w-full min-w-full"
        aria-label="Safety map"
      />

      {ready && mapRef.current && (
        <>
          {toggles.heatmap && <HeatmapLayer map={mapRef.current} demoData={demoZones ?? undefined} />}
          {toggles.incidents && <IncidentClusterLayer map={mapRef.current} />}

          <div className="pointer-events-none absolute bottom-14 right-4 z-20 rounded-lg border border-guardian-border-subtle bg-guardian-bg-surface/95 p-3 text-xs text-guardian-text-secondary shadow-lg backdrop-blur">
            <div className="text-[11px] font-mono tracking-widest text-guardian-text-primary">
              RISK LEGEND
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
              <span>Green = Safe</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span>Yellow = Medium</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF3B5C]" />
              <span>Red = Dangerous</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

