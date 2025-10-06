"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function LocationShareClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const router = useRouter();

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
        // Navigera med koordinater (säkerställer att väder laddas). Friendly name kan visas av API-responsen.
        router.push(`/?location=${encodeURIComponent(q)}`);
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
  }, [router]);

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
            router.push(`/?location=${encodeURIComponent(`${lat},${lng}`)}`);
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
          router.push(`/?location=${encodeURIComponent(`${lat},${lng}`)}`);
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
  }, [getLocation, coords, router]);

  const share = async () => {
    if (!coords) return;
    const text = `Latitude: ${coords.lat}\nLongitude: ${coords.lng}`;
    // Försök använda Web Share API först (mobil/modern browser)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Min position",
          text,
        });
        return;
      } catch {
        // användaren avbröt eller delning misslyckades — fallback fortsätter
      }
    }

    // Försök kopiera till urklipp
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // clipboard misslyckades — fallback fortsätter
      }
    }

    // Fallback: prompt så användaren kan kopiera manuellt
    try {
      window.prompt("Kopiera position", text);
    } catch {
      setError("Kunde inte dela eller kopiera position.");
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        aria-label="Hämta min position"
      >
        {loading ? "Hämtar…" : "Dela min position"}
      </button>

      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      {permissionDenied && !coords && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#FFF8E1",
            border: "1px solid #F0D27A",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.4,
            color: "#5B4600",
          }}
        >
          <strong>Platstjänst inaktiverad.</strong>
          <div style={{ marginTop: 6 }}>
            Du kan:
            <ul style={{ paddingLeft: 18, margin: "4px 0 8px" }}>
              <li>Ange en plats i sökfältet ovan</li>
              <li>
                Aktivera plats i webbläsarens inställningar och klicka
                &quot;Försök igen&quot;
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              // Rensa denial-flagga och försök igen
              try {
                localStorage.removeItem("locationDenied");
              } catch {}
              setPermissionDenied(false);
              getLocation();
            }}
            style={{
              background: "#C7EEFF",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Försök igen
          </button>
        </div>
      )}

      {coords && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "#f4f4f4",
          }}
        >
          <div>
            <strong>Latitude:</strong> {coords.lat.toFixed(5)}
          </div>
          <div>
            <strong>Longitude:</strong> {coords.lng.toFixed(5)}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={share}
              aria-label="Dela eller kopiera position"
            >
              Dela / kopiera
            </button>
            {copied && (
              <span style={{ fontSize: 13, color: "green" }}>Kopierad</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
