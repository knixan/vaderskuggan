import { getWeatherByLocation } from "./actions/weather";
import Image from "next/image";
import WeatherComment from "../components/comments";
import { Location } from "./type/types";

// Helper function for wind direction
function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Helper function for cloud cover
function getCloudCoverIcon(cloudCover: number): string {
  if (cloudCover < 20) return "☀️";
  if (cloudCover < 50) return "⛅";
  if (cloudCover < 80) return "🌥️";
  return "☁️";
}

// Helper function for thunder risk level
function getThunderRiskLevel(probability: number): {
  text: string;
  color: string;
} {
  if (probability < 20) return { text: "Låg", color: "#4CAF50" };
  if (probability < 50) return { text: "Medel", color: "#FF9800" };
  return { text: "Hög", color: "#F44336" };
}

// New: map weather summary text to an emoji
function getWeatherEmoji(summary: string): string {
  const s = (summary || "").toLowerCase();
  if (s.includes("clear") || s.includes("sunny")) return "☀️";
  if (s.includes("nearly clear")) return "🌤️";
  if (s.includes("partly") || s.includes("scattered")) return "⛅";
  if (s.includes("cloud") || s.includes("overcast")) return "☁️";
  if (s.includes("rain") || s.includes("shower") || s.includes("drizzle"))
    return "🌧️";
  if (s.includes("thunder") || s.includes("storm")) return "⛈️";
  if (s.includes("snow") || s.includes("sleet") || s.includes("blizzard"))
    return "❄️";
  if (s.includes("fog") || s.includes("mist") || s.includes("haze"))
    return "🌫️";
  // fallback based on keywords or return a cloud emoji
  return "🌥️";
}

// Format ISO date/time strings into readable Swedish date/time
function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return iso;
  }
}

function formatDateShort(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("sv-SE", {
      day: "numeric",
      month: "short",
    })
      .format(d)
      .replace(".", "");
  } catch {
    return iso;
  }
}

function formatDateTimeShort(iso?: string) {
  if (!iso) return "";
  const date = formatDateShort(iso);
  const time = formatTime(iso);
  return `${date} ${time}`.trim();
}

// Ny: Hitta (eller närmaste) post för varje dag kl 12 för n dagar framåt
function getNextDaysMidday(timeseries: any[] = [], days = 10) {
  const out: any[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + i,
      12,
      0,
      0
    );
    // Filtrera poster som är samma kalendardag
    const sameDay = timeseries.filter((s) => {
      try {
        const d = new Date(s.validTime);
        return (
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        );
      } catch {
        return false;
      }
    });

    if (sameDay.length === 0) continue;

    // Välj posten som ligger närmast 12:00 (minsta timdiff)
    let best = sameDay[0];
    let bestDiff = Math.abs(new Date(best.validTime).getHours() - 12);
    for (const s of sameDay) {
      const diff = Math.abs(new Date(s.validTime).getHours() - 12);
      if (diff < bestDiff) {
        best = s;
        bestDiff = diff;
      }
    }
    out.push(best);
  }
  return out;
}

// Return a short, user-friendly location label (prefer `name`, else clean `display_name`)
function getLocationLabel(loc?: Location) {
  if (!loc) return "Okänd plats";
  if (loc.name && loc.name.trim()) return loc.name;
  const display = loc.display_name ?? "";

  // Split on commas and trim segments
  const parts = display
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    // remove pure postal code segments (3-6 digits) and segments that are just numbers
    .filter((p) => !/^\d{3,6}$/.test(p));

  if (parts.length === 0) return display || "Okänd plats";

  // Locality: first meaningful part
  const locality = parts[0];

  // Municipality/region: prefer second part if it isn't the country
  let municipality = parts.length > 1 ? parts[1] : "";

  // Country: last part (if different from municipality/locality)
  const countryPart = parts[parts.length - 1];

  // If municipality equals country (single segment), omit municipality
  if (
    municipality &&
    municipality.toLowerCase() === countryPart.toLowerCase()
  ) {
    municipality = "";
  }

  // Build label: locality + optional municipality, plus country name (no ISO codes)
  const partsOut: string[] = [];
  if (locality) partsOut.push(locality.replace(/^[\s,-]+|[\s,-]+$/g, ""));
  if (municipality)
    partsOut.push(municipality.replace(/^[\s,-]+|[\s,-]+$/g, ""));

  let countryDisplay = "";
  if (countryPart && countryPart !== locality && countryPart !== municipality) {
    countryDisplay = countryPart;
  }

  if (countryDisplay) partsOut.push(countryDisplay);

  return partsOut.join(", ") || display || "Okänd plats";
}

export default async function Page({
  searchParams,
}: {
  searchParams: { location?: string } | Promise<{ location?: string }>;
}) {
  const params = await searchParams;
  const location = params?.location ?? "";
  const weather = location ? await getWeatherByLocation(location) : null;

  // 10-dagarslista med post närmast kl 12
  const tenDayMidday = weather ? getNextDaysMidday(weather.timeseries, 10) : [];

  return (
    <div
      style={{
        backgroundColor: "#FAFAFA",
        color: "#1D242B",
        minHeight: "100vh",
        padding: "0",
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header Section */}
      <header
        style={{
          backgroundColor: "#0077C0",
          padding: "32px 24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <Image
                src="/image/loggo.png"
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 600px) 80px, 120px"
              />
            </div>
            <h1
              style={{
                margin: "0",
                color: "#FAFAFA",
                fontSize: "32px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              Väderskuggan
            </h1>
          </div>

          <div
            style={{
              margin: "0 0 24px 0",
              color: "#FAFAFA",
              lineHeight: 1.15,
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: 4,
                letterSpacing: "-0.3px",
              }}
            >
              Molnigt med en chans till sol och eftertanke
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              Din dagliga dos av meteorologisk besvikelse.
            </div>
          </div>

          <form
            method="get"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "stretch",
            }}
          >
            <input
              name="location"
              defaultValue={location}
              placeholder="Sök efter stad eller plats..."
              aria-label="location"
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "8px",
                border: "2px solid transparent",
                backgroundColor: "#FFFFFF",
                color: "#1D242B",
                outline: "none",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#C7EEFF",
                color: "#1D242B",
                border: "none",
                padding: "14px 32px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              Sök
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}
      >
        {!location ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "2px dashed #C7EEFF",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌤️</div>
            <p
              style={{
                color: "#1D242B",
                opacity: 0.7,
                fontSize: "18px",
                margin: 0,
              }}
            >
              Skriv in en stad i sökfältet ovan för att se vädret
            </p>
          </div>
        ) : !weather ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "2px solid #C7EEFF",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <p
              style={{
                color: "#1D242B",
                opacity: 0.7,
                fontSize: "18px",
                margin: 0,
              }}
            >
              {`Kunde inte hämta väderdata för “${location}”`}
            </p>
          </div>
        ) : (
          <section>
            {/* Location Header with Current Weather */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "32px",
                marginBottom: "24px",
                border: "1px solid #E8F7FF",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px 0",
                  color: "#0077C0",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {getLocationLabel(weather.location)}
              </h2>

              {/* Insert: compact current weather card */}
              {weather.timeseries[0] && (
                <div
                  className="current-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    padding: "12px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    border: "1px solid #E8F7FF",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontSize: 48, lineHeight: 1 }}>
                    {getWeatherEmoji(weather.timeseries[0].summary)}
                  </div>

                  <div
                    className="temp-col"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#0077C0",
                        marginBottom: 4,
                      }}
                    >
                      {weather.timeseries[0].temp}°C
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#1D242B", opacity: 0.8 }}
                    >
                      {weather.timeseries[0].summary}
                    </div>
                  </div>

                  <div
                    className="temp-right"
                    style={{ marginLeft: "auto", textAlign: "right" }}
                  >
                    <div
                      style={{ fontSize: 12, color: "#1D242B", opacity: 0.7 }}
                    >
                      Känns som
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1D242B",
                      }}
                    >
                      {typeof weather.timeseries[0].temp === "number"
                        ? `${weather.timeseries[0].temp}°C`
                        : "—"}
                    </div>
                    <WeatherComment
                      temp={weather.timeseries[0]?.temp}
                      summary={weather.timeseries[0]?.summary}
                    />
                  </div>
                </div>
              )}

              {/* Current Weather Summary */}
              {weather.timeseries[0] && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "16px",
                    paddingTop: "24px",
                    borderTop: "1px solid #E8F7FF",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1D242B",
                        opacity: 0.6,
                        marginBottom: "4px",
                      }}
                    >
                      Luftfuktighet
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#0077C0",
                      }}
                    >
                      💧 {weather.timeseries[0].humidity}%
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1D242B",
                        opacity: 0.6,
                        marginBottom: "4px",
                      }}
                    >
                      Lufttryck
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#0077C0",
                      }}
                    >
                      🌡️ {weather.timeseries[0].airPressure} hPa
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1D242B",
                        opacity: 0.6,
                        marginBottom: "4px",
                      }}
                    >
                      Sikt
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#0077C0",
                      }}
                    >
                      👁️ {(weather.timeseries[0].visibility / 1000).toFixed(1)}{" "}
                      km
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1D242B",
                        opacity: 0.6,
                        marginBottom: "4px",
                      }}
                    >
                      Molntäcke
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#0077C0",
                      }}
                    >
                      {getCloudCoverIcon(weather.timeseries[0].cloudCover)}{" "}
                      {weather.timeseries[0].cloudCover}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Cards Grid */}
            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              {weather.timeseries.slice(0, 6).map((s, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid #E8F7FF",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative accent */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      backgroundColor: "#C7EEFF",
                    }}
                  />

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1D242B",
                      opacity: 0.6,
                      marginBottom: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {formatDateTimeShort(s.validTime)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        color: "#0077C0",
                        lineHeight: 1,
                      }}
                    >
                      {s.temp}°
                    </div>
                    <div
                      style={{
                        backgroundColor: "#C7EEFF",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1D242B",
                      }}
                      aria-hidden="false"
                      title={s.summary}
                    >
                      <span role="img" aria-label={s.summary}>
                        {getWeatherEmoji(s.summary)}
                      </span>
                    </div>
                  </div>

                  {/* Wind and Precipitation */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      paddingBottom: "12px",
                      marginBottom: "12px",
                      borderBottom: "1px solid #E8F7FF",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1D242B",
                          opacity: 0.6,
                          marginBottom: "4px",
                        }}
                      >
                        Vind
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#1D242B",
                        }}
                      >
                        {s.windSpeed} m/s {getWindDirection(s.windDirection)}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1D242B",
                          opacity: 0.6,
                        }}
                      >
                        Vindbyar: {s.windGust} m/s
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1D242B",
                          opacity: 0.6,
                          marginBottom: "4px",
                        }}
                      >
                        Nederbörd
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#1D242B",
                        }}
                      >
                        {s.precipitationMean} mm
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1D242B",
                          opacity: 0.6,
                        }}
                      >
                        {s.precipitationCategory}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>Luftfuktighet:</span>
                      <span style={{ fontWeight: "600" }}>{s.humidity}%</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>Molntäcke:</span>
                      <span style={{ fontWeight: "600" }}>{s.cloudCover}%</span>
                    </div>
                    {s.thunderProbability > 0 && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          backgroundColor:
                            getThunderRiskLevel(s.thunderProbability).color +
                            "15",
                          padding: "8px",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ opacity: 0.8 }}>⚡ Åskerisk:</span>
                        <span
                          style={{
                            fontWeight: "600",
                            color: getThunderRiskLevel(s.thunderProbability)
                              .color,
                          }}
                        >
                          {getThunderRiskLevel(s.thunderProbability).text} (
                          {s.thunderProbability}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ny: 10-dagarsprognos - temperatur vid kl. 12 + kommentar */}
            {tenDayMidday.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    color: "#0077C0",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  10-dagarsprognos — temperatur vid kl. 12
                </h3>

                {/* Lista: designad på samma sätt som morgonrapporten */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {tenDayMidday.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 16,
                        border: "1px solid #E8F7FF",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1D242B",
                            opacity: 0.8,
                          }}
                        >
                          {formatDateShort(s.validTime)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#1D242B",
                            opacity: 0.7,
                          }}
                        >
                          {formatTime(s.validTime)}
                        </div>
                      </div>

                      <div style={{ fontSize: 48, lineHeight: 1 }}>
                        {getWeatherEmoji(s.summary)}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#0077C0",
                            marginBottom: 4,
                          }}
                        >
                          {typeof s.temp === "number" ? `${s.temp}°C` : "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#1D242B",
                            opacity: 0.85,
                          }}
                        >
                          {s.summary}
                        </div>
                      </div>

                      <div
                        style={{
                          marginLeft: "auto",
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: "#1D242B",
                            opacity: 0.7,
                          }}
                        >
                          Känns som
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1D242B",
                          }}
                        >
                          {typeof s.temp === "number" ? `${s.temp}°C` : "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1D242B",
                            opacity: 0.85,
                          }}
                        >
                          Nederbörd:{" "}
                          <strong>{s.precipitationMean ?? "—"} mm</strong>
                        </div>
                        <div>
                          <WeatherComment temp={s.temp} summary={s.summary} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
