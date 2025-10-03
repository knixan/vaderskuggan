"use client";
import React from "react";

type Props = {
  temp?: number | null;
  summary?: string;
};

// Enkel deterministisk hash för att välja kommentar utan Math.random
function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickDeterministic(arr: string[], seed: string) {
  if (!arr || arr.length === 0) return "";
  return arr[hashString(seed) % arr.length];
}

function pickComment(temp?: number | null, summary?: string): string {
  const s = (summary ?? "").toLowerCase();
  const seed = `${s}|${String(temp ?? "")}`;

  // Åska / storm
  if (s.includes("thunder") || s.includes("storm")) {
    return pickDeterministic(
      [
        "⛈️ Åskväder: naturens stora pyrotekniska show — från soffan är den bäst.",
        "⚡ Åska och blixtar: perfekt tid att låtsas vara åskledare (skojigt, men gör det inte på riktigt).",
        "⚡ Blixtrar: gratis ljusshow. Rekommendation — titta genom fönstret, stanna inomhus.",
        "🌩️ Stormvarning: evig ursäkt för att stanna hemma och skylla på vädret.",
      ],
      seed
    );
  }

  // Kraftigt regn
  if (
    (s.includes("heavy") && s.includes("rain")) ||
    s.includes("downpour") ||
    (s.includes("rain") && s.includes("heavy"))
  ) {
    return pickDeterministic(
      [
        "🌧️ Regn: dags att testa om dina skor flyter — tips: de gör det inte.",
        "⛵ Skyfall: om du tänkt ta bilen kanske en segelbåt varit bättre plan.",
        "💦 Hällregn: perfekt väder för att bli blöt och vinna inga priser för stil.",
        "🌧️ Regn och dramatik — ta med dramatisk blick och en vattentät attitude.",
      ],
      seed
    );
  }

  // Lätt regn / duggregn
  if (
    s.includes("drizzle") ||
    s.includes("light rain") ||
    s.includes("shower")
  ) {
    return pickDeterministic(
      [
        "🌦️ Duggregn: naturens subtila kommentar till dina morgonplaner.",
        "☔ Små regndroppar: paraplyet känns överdrivet, men du kommer ångra dig om du skippat det.",
        "🌧️ Lätt regn: perfekt ursäkt att sakta ner — eller ta en roddbåt till jobbet.",
      ],
      seed
    );
  }

  // Snö / halka
  if (
    s.includes("snow") ||
    s.includes("sleet") ||
    s.includes("blizzard") ||
    s.includes("slush")
  ) {
    return pickDeterministic(
      [
        "❄️ Snö: marken får ny personlighet. Ditt skosamling får panik.",
        "☃️ Snökaos: plogbilar bestämmer vägens kurs, inte du.",
        "🥶 Vitt och kallt — perfekta förutsättningar att tappa bort vantarna och skylla på vädret.",
      ],
      seed
    );
  }

  // Hagel
  if (s.includes("hail")) {
    return pickDeterministic(
      [
        "🧊 Hagel: stenig nedkylning från himlen — parkera bilen under tak om du kan.",
        "⚒️ Hagelstorm: när vädret tränar för en actionfilm.",
      ],
      seed
    );
  }

  // Dimma / dis
  if (s.includes("fog") || s.includes("mist") || s.includes("haze")) {
    return pickDeterministic(
      [
        "🌫️ Dimma: när världen plötsligt får filter — mysigt tills du kör bil.",
        "🌁 Dis: perfekt för mystisk promenad eller att försvinna i vardagens tristess.",
      ],
      seed
    );
  }

  // Klar / soligt (temperaturberoende)
  if (s.includes("clear") || s.includes("sunny") || s.includes("sun")) {
    if (typeof temp === "number") {
      if (temp >= 30)
        return pickDeterministic(
          [
            "🔥 Hettsol: fritt fram för svettiga planer och smältande ambitioner.",
            "🍦 Extrem värme: glass är inte rekommendation, det är en livsstil.",
          ],
          seed
        );
      if (temp >= 25)
        return pickDeterministic(
          [
            "🌞 Soligt och varmt: perfekt för att undvika ansvar och dricka något kallt.",
            "😅 Sol och värme — svettig optimism.",
          ],
          seed
        );
      if (temp >= 20)
        return pickDeterministic(
          [
            "🧺 Härligt ute — låtsas att du har en picknick.",
            "🌤️ Milt och soligt: prokrastinera med stil.",
          ],
          seed
        );
      if (temp >= 15)
        return pickDeterministic(
          [
            "🙂 Behagligt: gå ut och låtsas vara aktiv.",
            "🧥 Skön temperatur — jackan får vila.",
          ],
          seed
        );
      if (temp >= 10)
        return pickDeterministic(
          [
            "🍃 Krispigt och klart: tunn jacka krävs.",
            "☀️ Frisk luft — ta med en extra tröja.",
          ],
          seed
        );
      return pickDeterministic(
        [
          "🌤️ Kallt men klart: solskenet tröstar.",
          "☕ Klart och kyligt — kaffe rekommenderas.",
        ],
        seed
      );
    }
    return "☀️ Soligt: njut eller låtsas göra det, valet är ditt.";
  }

  // Mulet
  if (s.includes("cloud") || s.includes("overcast")) {
    return pickDeterministic(
      [
        "☁️ Mulet: perfekt väder för inre monolog.",
        "☁️ Grått och neutralt — som kaffet du glömde värma.",
        "🌥️ Molnigt: solens favorit-paus.",
      ],
      seed
    );
  }

  // Vindigt
  if (s.includes("wind") || s.includes("breezy") || s.includes("gale")) {
    return pickDeterministic(
      [
        "💨 Blåsigt: hårfixaren tappar jobbet.",
        "🌀 Stark vind: håll i hatten.",
      ],
      seed
    );
  }

  // Kallt
  if (typeof temp === "number" && temp <= 0) {
    return pickDeterministic(
      [
        "🥶 Under noll: ditt ansikte ångrar det senare.",
        "🧊 Minusgrader: låtsas att kyla är karaktärsbildande.",
      ],
      seed
    );
  }

  // Default
  return pickDeterministic(
    [
      "🤷 Väderstatus: mediokert. Fortsätt som vanligt.",
      "😐 Mediokert väder: varken spektakulärt.",
    ],
    seed
  );
}

export default function WeatherComment({ temp, summary }: Props) {
  React.useEffect(() => {
    // optional debug: console.debug("WeatherComment mounted", { temp, summary });
  }, [temp, summary]);

  return (
    <div className="weather-comment" role="note" aria-live="polite">
      <div
        className="wc-card"
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <div style={{ flex: 1 }}>
          {/* Kommentar på egen rad med pratbubbla-emoji */}
          {/* Mörk bakgrund + vit text för bättre läsbarhet */}
          <div
            className="wc-bubble"
            style={{
              background: "#0077C0",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            <p
              className="wc-text"
              style={{ margin: 0, fontSize: 13, color: "#FFFFFF" }}
            >
              {pickComment(temp, summary)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
