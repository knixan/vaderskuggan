"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationShareClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocationParam = searchParams?.get("location") || "";

  const getLocation = useCallback(() => {
    setError(null);
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i den här webbläsaren.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setLoading(false);

        // Spara senaste position lokalt för framtida auto-laddning
        try {
          localStorage.setItem("lastLocation", `${lat},${lng}`);
        } catch {}

        const q = `${lat},${lng}`; // API:t förväntar sig "lat,lng"
        // Navigera bara om vi inte redan har korrekt location-query
        if (currentLocationParam !== q) {
          router.push(`/?location=${encodeURIComponent(q)}`);
        }
      },
      (err: GeolocationPositionError) => {
        if (err && err.code === 1) {
          setPermissionDenied(true);
          setError(
            "Åtkomst till plats nekades. Skriv en plats i sökfältet eller aktivera platstjänster i webbläsaren."
          );
          try {
            localStorage.setItem("locationDenied", "true");
          } catch {}
        } else {
          setError(err?.message || "Kunde inte hämta position.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [router, currentLocationParam]);

  // Visa confirm-dialog automatiskt när komponenten mountas.
  // OBS: detta kommer direkt visa browserns permissions-dialog om användaren accepterar.
  useEffect(() => {
    try {
      const alreadyAsked = localStorage.getItem("locationAsked") === "true";
      const deniedBefore = localStorage.getItem("locationDenied") === "true";
      const last = localStorage.getItem("lastLocation");

      if (deniedBefore) {
        setPermissionDenied(true);
        // Har användaren tidigare nekat men vi HAR en sparad position -> använd den ändå (kan hända om denial kom efter första load)
        if (last && !coords) {
          const [latStr, lngStr] = last.split(",");
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            setCoords({ lat, lng });
            const q = `${lat},${lng}`;
            if (currentLocationParam !== q) {
              router.push(`/?location=${encodeURIComponent(q)}`);
            }
          }
        }
        return; // Försök inte igen automatiskt om nekat
      }

      if (!alreadyAsked) {
        localStorage.setItem("locationAsked", "true");
        getLocation();
        return;
      }

      // Redan frågat tidigare
      if (last && !coords) {
        const [latStr, lngStr] = last.split(",");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCoords({ lat, lng });
          const q = `${lat},${lng}`;
          if (currentLocationParam !== q) {
            router.push(`/?location=${encodeURIComponent(q)}`);
          }
          return;
        }
      }

      if (!coords) {
        // Sista fallback – försök hämta igen (triggar bara prompt om behörighet förlorats)
        getLocation();
      }
    } catch {
      // ignore
    }
  }, [getLocation, coords, router, currentLocationParam]);

  return (
    <div style={{ maxWidth: 420, fontSize: 14 }}>
      {/* Primär knapp */}
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        aria-label="Hämta min position"
        style={{
          background: loading ? "#89D4F5" : "#0077C0",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: 24,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "progress" : "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          letterSpacing: 0.3,
          transition: "background .2s",
        }}
      >
        {loading ? "⏳ Hämtar…" : "📡 Dela min position"}
      </button>

      {/* Felmeddelande */}
      {error && (
        <div
          role="alert"
          style={{
            color: "#B00020",
            marginTop: 10,
            background: "#FFECEC",
            border: "1px solid #FFB3B3",
            padding: "8px 10px",
            borderRadius: 6,
            lineHeight: 1.35,
          }}
        >
          {error}
        </div>
      )}

      {/* Permission denied panel */}
      {permissionDenied && !coords && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: "linear-gradient(135deg,#FFF4D7,#FFF9EC)",
            border: "1px solid #F4DC9B",
            borderRadius: 12,
            fontSize: 13,
            lineHeight: 1.45,
            color: "#5B4600",
            boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
          }}
        >
          <strong style={{ fontSize: 14 }}>Platstjänst inaktiverad</strong>
          <div style={{ marginTop: 6 }}>
            Ange en plats ovan eller aktivera behörighet och försök igen.
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem("locationDenied");
              } catch {}
              setPermissionDenied(false);
              getLocation();
            }}
            style={{
              marginTop: 10,
              background: "#0077C0",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 18,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Försök igen
          </button>
        </div>
      )}
    </div>
  );
}
