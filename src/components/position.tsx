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
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
        try {
          // Reverse geocode för att få stadens namn
          const reverseResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`
          );
          const reverseData = await reverseResponse.json();
          const city =
            reverseData.address?.city ||
            reverseData.address?.town ||
            reverseData.address?.village ||
            reverseData.display_name?.split(",")[0] ||
            `${position.coords.latitude},${position.coords.longitude}`;
          // Navigera till root med location query så server-sidan kan hämta väder
          router.push(`/?location=${encodeURIComponent(city)}`);
        } catch {
          // Om reverse geocode misslyckas, använd koordinater
          const q = `${position.coords.latitude},${position.coords.longitude}`;
          router.push(`/?location=${encodeURIComponent(q)}`);
        }
      },
      (err) => {
        setError(err.message || "Kunde inte hämta position.");
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
      if (!alreadyAsked) {
        localStorage.setItem("locationAsked", "true");
        getLocation();
      }
    } catch {
      // I vissa körmiljöer kan window vara undefined — ignore
    }
  }, [getLocation]);

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
