"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationShareClient() {
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLocationParam = searchParams?.get("location") || "";

  const getLocation = useCallback(() => {
    setError(null);
    setPermissionDenied(false);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i den här webbläsaren.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({ lat, lng });
        setLoading(false);

        try {
          localStorage.setItem("lastLocation", `${lat},${lng}`);
        } catch {}

        const q = `${lat},${lng}`;

        if (currentLocationParam !== q) {
          router.replace(`/?location=${encodeURIComponent(q)}`);
        }
      },
      (err: GeolocationPositionError) => {
        if (err.code === 1) {
          setPermissionDenied(true);
          setError(
            "Åtkomst till plats nekades. Ange en plats manuellt eller aktivera platstjänster."
          );
        } else {
          setError(err.message || "Kunde inte hämta position.");
        }

        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minuter
      }
    );
  }, [router, currentLocationParam]);

  return (
    <div style={{ maxWidth: 420, fontSize: 14 }}>
      <div
        style={{
          marginBottom: 8,
          fontSize: 13,
          color: "#45535A",
        }}
      >
        Använd din position för att automatiskt visa vädret där du befinner dig.
      </div>

      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        aria-label="Hämta min position"
        style={{
          background: loading ? "#E3EEF4" : "#E8F4FA",
          color: "#164559",
          border: "1px solid #C7E2EE",
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: loading ? "progress" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          letterSpacing: 0.2,
          transition: "background .15s, border-color .15s",
        }}
      >
        {loading ? "Hämtar…" : "📍 Visa vädret där jag är"}
      </button>

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

      {permissionDenied && !coords && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "#F9FAFB",
            border: "1px solid #E5E8EA",
            borderRadius: 8,
            fontSize: 12.5,
            lineHeight: 1.4,
            color: "#45535A",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 12.5,
            }}
          >
            Platstjänst inaktiverad
          </div>

          <div
            style={{
              marginTop: 4,
              opacity: 0.85,
            }}
          >
            Ange en plats i sökfältet eller aktivera behörighet och försök igen.
          </div>

          <button
            type="button"
            onClick={getLocation}
            style={{
              marginTop: 8,
              background: "#EEF6FA",
              color: "#1F5062",
              border: "1px solid #D0E4EC",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
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