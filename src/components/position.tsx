"use client";

import React, { useState, useEffect } from "react";

export default function LocationShareClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getLocation = () => {
    setError(null);
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i den här webbläsaren.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Kunde inte hämta position.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Visa confirm-dialog automatiskt när komponenten mountas.
  // OBS: detta kommer direkt visa browserns permissions-dialog om användaren accepterar.
  useEffect(() => {
    try {
      const alreadyAsked = false; // ändra till localStorage-check om du vill spara användarens val
      if (!alreadyAsked) {
        const ok = window.confirm(
          "Vill du dela din position för att få lokal väderinformation?"
        );
        if (ok) getLocation();
      }
    } catch {
      // I vissa körmiljöer kan window vara undefined — ignore
    }
  }, []);

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
        onClick={() => {
          const ok = window.confirm(
            "Vill du dela din position för att få lokal väderinformation?"
          );
          if (ok) getLocation();
        }}
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
