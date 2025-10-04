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
        "⛈️ Åska: naturen gör sin egen rave — utan att fråga dig.",
        "⚡ Åskväder: himlen skriker, och du inser att du glömde stänga fönstret.",
        "🌩️ Storm: perfekt tid att låtsas du är med i en katastroffilm.",
        "🌬️ Vind + åska = gratis frisyrförstörelse.",
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
        "🌧️ Regn: vädret har bestämt sig för att sabotera din outfit.",
        "💦 Skyfall: paraplyer? Dekorationer. Inte hjälpmedel.",
        "⛵ Så mycket vatten att du borde överväga sjöfartsutbildning.",
        "🌊 Hällregn: naturens sätt att säga 'stanna hemma, din optimist'.",
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
        "🌦️ Duggregn: precis tillräckligt för att irritera, men inte för att imponera.",
        "☔ Lätt regn: som att naturen nysar på dig.",
        "🌧️ Duggregn — perfekt väder för att ifrågasätta livsval och frisyr.",
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
        "❄️ Snö: alla är plötsligt trafikspecialister och väderexperter.",
        "☃️ Snökaos: kollektivtrafiken tog semester.",
        "🥶 Vitt och kallt — precis som ditt leende på måndagar.",
        "🧤 Snö: dags att leka 'var är mina vantar?'-leken.",
      ],
      seed
    );
  }

  // Hagel
  if (s.includes("hail")) {
    return pickDeterministic(
      [
        "🧊 Hagel: gratis massage för bilen.",
        "⚒️ Hagel: vädret tränar för gladiatorspel.",
        "🧊 Hagelstorm: som snö, men argare.",
      ],
      seed
    );
  }

  // Dimma / dis
  if (s.includes("fog") || s.includes("mist") || s.includes("haze")) {
    return pickDeterministic(
      [
        "🌫️ Dimma: perfekt om du gillar att köra i slow motion.",
        "🌁 Dis: som ett dåligt Snapchat-filter på världen.",
        "🌀 Dimma: världen på ‘mystiskt läge’.",
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
            "🔥 Hetta: som att bo i en hårtork.",
            "🥵 Solen vill dig personligen illa.",
            "🍦 Allt smälter – inklusive din motivation.",
          ],
          seed
        );
      if (temp >= 25)
        return pickDeterministic(
          [
            "🌞 Soligt: dags att låtsas njuta medan du kokar.",
            "😅 Perfekt väder för att svettas på nya ställen.",
          ],
          seed
        );
      if (temp >= 20)
        return pickDeterministic(
          [
            "🧺 Perfekt väder för en picknick du inte kommer planera.",
            "🌤️ Sol och lagom värme — nästan så du får dåligt samvete om du stannar inne.",
          ],
          seed
        );
      if (temp >= 15)
        return pickDeterministic(
          [
            "🙂 Perfekt väder för att gå ut och låtsas vara frisk.",
            "🧥 Sådär lagom — som din entusiasm.",
          ],
          seed
        );
      if (temp >= 10)
        return pickDeterministic(
          [
            "🍃 Krispigt men soligt: naturen försöker vara trevlig.",
            "☀️ Frisk luft — ta med en extra tröja och lite hopp.",
          ],
          seed
        );
      return pickDeterministic(
        [
          "☀️ Soligt men kallt: ljus i tunneln, men frost på själen.",
          "❄️ Sol — bara för syns skull.",
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
        "☁️ Mulet: himlen har gett upp — precis som du.",
        "🌥️ Molnigt: solen är på obestämd semester.",
        "☁️ Grått, trist och perfekt matchning till din kalender.",
      ],
      seed
    );
  }

  // Vindigt
  if (s.includes("wind") || s.includes("breezy") || s.includes("gale")) {
    return pickDeterministic(
      [
        "💨 Blåsigt: naturens sätt att sabba din frisyr och din dag.",
        "🌀 Vind: håll i hatten, eller låt den flytta hemifrån.",
        "💨 Vinden: gratis ansiktspeeling. Grov version.",
      ],
      seed
    );
  }

  // Kallt
  if (typeof temp === "number" && temp <= 0) {
    return pickDeterministic(
      [
        "🥶 Så kallt att självrespekt fryser till is.",
        "🧊 Minusgrader: för den som älskar smärta i ansiktet.",
        "❄️ Kallt nog att ifrågasätta varför du bor här.",
      ],
      seed
    );
  }

  // Default
  return pickDeterministic(
    [
      "🤷 Ingen aning. Vädret verkar lika förvirrat som du.",
      "😐 Varken kul eller katastrof — precis som livet ibland.",
      "🌤️ Mediokert väder: passa på att vara medioker själv.",
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
