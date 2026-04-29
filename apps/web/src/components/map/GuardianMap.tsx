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
  const [destinationInput, setDestinationInput] = useState('');
  const [isGettingRoute, setIsGettingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });

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

  // Call geocoding and routing APIs for destination-based route
  const fetchSafeRoute = async () => {
    if (!destinationInput.trim() || !point || !mapRef.current) return;

    const originLat = point.lat;
    const originLng = point.lng;
    const map = mapRef.current;

    try {
      // Step 1: Geocode the destination using Nominatim
      const query = encodeURIComponent(destinationInput.trim());
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        setRouteError('Location not found. Try adding city name.');
        return;
      }

      const destLat = parseFloat(geoData[0].lat);
      const destLng = parseFloat(geoData[0].lon);
      const destName = geoData[0].display_name || destinationInput;

      // Step 2: Get real road route via OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      if (!routeData.routes || !routeData.routes.length) {
        throw new Error('No route found');
      }

      // Extract route data
      const coordinates = routeData.routes[0].geometry.coordinates;
      const latLngs = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      const distanceKm = (routeData.routes[0].distance / 1000).toFixed(1);
      const durationMin = Math.round(routeData.routes[0].duration / 60);

      // Step 3: Draw route on map
      // Remove existing route first
      if (safeRouteRef.current) {
        safeRouteRef.current.removeFrom(map);
        safeRouteRef.current = null;
      }
      safeRouteMarkersRef.current.forEach(marker => marker.removeFrom(map));
      safeRouteMarkersRef.current = [];

      // Draw new polyline
      const polyline = L.polyline(latLngs, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.85,
        dashArray: '10 6'
      }).addTo(map);
      safeRouteRef.current = polyline;

      // Fit map to show full route
      map.fitBounds(L.polyline(latLngs).getBounds(), { padding: [60, 60] });

      // Add origin marker (green)
      const originMarker = L.circleMarker([originLat, originLng], {
        radius: 8,
        color: '#22c55e',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.8
      }).addTo(map).bindPopup('You are here');
      safeRouteMarkersRef.current.push(originMarker);

      // Add destination marker (red)
      const destMarker = L.circleMarker([destLat, destLng], {
        radius: 8,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.8
      }).addTo(map).bindPopup(destName);
      safeRouteMarkersRef.current.push(destMarker);

      // Step 4: Show route info
      setRouteInfo({ distance: distanceKm, duration: durationMin.toString() });
      setRouteError('');

    } catch (error) {
      console.warn('Route calculation failed:', error);
      setRouteError('Route unavailable. Showing direct path.');
      
      // Fallback: draw straight line to approximate destination
      const destLat = point.lat + 0.02;
      const destLng = point.lng + 0.02;
      
      // Remove existing route first
      if (safeRouteRef.current) {
        safeRouteRef.current.removeFrom(map);
        safeRouteRef.current = null;
      }
      safeRouteMarkersRef.current.forEach(marker => marker.removeFrom(map));
      safeRouteMarkersRef.current = [];

      // Draw fallback straight line
      const coordinates: [number, number][] = [
        [originLat, originLng],
        [destLat, destLng]
      ];
      const polyline = L.polyline(coordinates, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.85,
        dashArray: '10 6'
      }).addTo(map);
      safeRouteRef.current = polyline;

      // Add origin marker
      const originMarker = L.circleMarker([originLat, originLng], {
        radius: 8,
        color: '#22c55e',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.8
      }).addTo(map).bindPopup('You are here');
      safeRouteMarkersRef.current.push(originMarker);

      // Add destination marker
      const destMarker = L.circleMarker([destLat, destLng], {
        radius: 8,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.8
      }).addTo(map).bindPopup('Destination');
      safeRouteMarkersRef.current.push(destMarker);
    } finally {
      setIsGettingRoute(false);
    }
  };

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

    if (!toggles.safeRoute) {
      // Clean up state when toggle is OFF
      setDestinationInput('');
      setRouteError('');
      setRouteInfo({ distance: '', duration: '' });
      setIsGettingRoute(false);
      return;
    }

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

          {/* Safe Route Destination Input Panel */}
          {toggles.safeRoute && (
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0d1520',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: 'fit-content',
              maxWidth: '420px',
              zIndex: 1000
            }}>
              {/* Origin Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e'
                }}></div>
                <span style={{
                  color: '#94a3b8',
                  fontSize: '13px'
                }}>Your Location</span>
              </div>

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '24px',
                background: 'rgba(255,255,255,0.1)',
                borderLeft: '1px dashed rgba(255,255,255,0.2)'
              }}></div>

              {/* Destination Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }}></div>
                <input
                  type="text"
                  placeholder="Enter destination..."
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    width: '260px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Get Route Button */}
              <button
                onClick={async () => {
                  if (!destinationInput.trim() || !point) return;
                  setIsGettingRoute(true);
                  setRouteError('');
                  setRouteInfo({ distance: '', duration: '' });
                  await fetchSafeRoute();
                }}
                disabled={isGettingRoute || !destinationInput.trim()}
                style={{
                  background: isGettingRoute ? '#16a34a' : '#22c55e',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isGettingRoute ? 'not-allowed' : 'pointer',
                  opacity: (isGettingRoute || !destinationInput.trim()) ? 0.7 : 1
                }}
              >
                {isGettingRoute ? 'Finding safe route...' : 'Get Safe Route'}
              </button>
            </div>
          )}

          {/* Route Info Display */}
          {toggles.safeRoute && routeInfo.distance && (
            <div style={{
              position: 'absolute',
              top: '150px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#22c55e',
              fontSize: '12px',
              background: '#0d1520',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(34,197,94,0.2)',
              zIndex: 999
            }}>
              Route found — {routeInfo.distance} km · ~{routeInfo.duration} min
            </div>
          )}

          {/* Error Display */}
          {toggles.safeRoute && routeError && (
            <div style={{
              position: 'absolute',
              top: '150px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ef4444',
              fontSize: '12px',
              background: '#0d1520',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.2)',
              zIndex: 999
            }}>
              {routeError}
            </div>
          )}

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

