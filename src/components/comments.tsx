"use client";

import React from "react";

type Props = {
  temp?: number | null;
  summary?: string;
};

function pickComment(temp?: number | null, summary?: string): string {
  const s = (summary ?? "").toLowerCase();

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // Åska / storm
  if (s.includes("thunder") || s.includes("storm")) {
    return pick([
      "Åskväder: naturens stora pyrotekniska show — från soffan är den bäst.",
      "Åska och blixtar: perfekt tid att låtsas vara åskledare (skojigt, men gör det inte på riktigt).",
      "Blixtrar: gratis ljusshow. Rekommendation — titta genom fönstret, stanna inomhus.",
      "Stormvarning: evig ursäkt för att stanna hemma och skylla på vädret.",
    ]);
  }

  // Kraftig regn
  if (
    s.includes("heavy rain") ||
    s.includes("downpour") ||
    (s.includes("rain") && s.includes("heavy"))
  ) {
    return pick([
      "Regn: dags att testa om dina skor flyter — tips: de gör det inte.",
      "Skyfall: om du tänkt ta bilen kanske en segelbåt varit bättre plan.",
      "Hällregn: perfekt väder för att bli blöt och vinna inga priser för stil.",
      "Regn och dramatik — ta med dramatisk blick och en vattentät attitude.",
    ]);
  }

  // Lätt regn / duggregn
  if (
    s.includes("drizzle") ||
    s.includes("light rain") ||
    s.includes("shower")
  ) {
    return pick([
      "Duggregn: naturens subtila kommentar till dina morgonplaner.",
      "Små regndroppar: paraplyet känns överdrivet, men du kommer ångra dig om du skippat det.",
      "Lätt regn: perfekt ursäkt att sakta ner — eller ta en roddbåt till jobbet.",
    ]);
  }

  // Snö / halka
  if (
    s.includes("snow") ||
    s.includes("sleet") ||
    s.includes("blizzard") ||
    s.includes("slush")
  ) {
    return pick([
      "Snö: marken får ny personlighet. Ditt skosamling får panik.",
      "Snökaos: plogbilar bestämmer vägens kurs, inte du.",
      "Vitt och kallt — perfekta förutsättningar att tappa bort vantarna och skylla på vädret.",
    ]);
  }

  // Hagel
  if (s.includes("hail")) {
    return pick([
      "Hagel: stenig nedkylning från himlen — parkera bilen under tak om du kan.",
      "Hagelstorm: när vädret tränar för en actionfilm.",
    ]);
  }

  // Dimma / dis
  if (s.includes("fog") || s.includes("mist") || s.includes("haze")) {
    return pick([
      "Dimma: när världen plötsligt får filter — mysigt tills du kör bil.",
      "Dis: perfekt för mystisk promenad eller att försvinna i vardagens tristess.",
    ]);
  }

  // Klar / soligt
  if (s.includes("clear") || s.includes("sunny") || s.includes("sun")) {
    if (typeof temp === "number") {
      if (temp >= 30)
        return pick([
          "Hettsol: fritt fram för svettiga planer och smältande ambitioner.",
          "Extrem värme: glass är inte en rekommendation, det är en livsstil.",
        ]);
      if (temp >= 25)
        return pick([
          "Soligt och varmt: perfekt för att undvika ansvar och dricka något kallt.",
          "Sol och värme — eller som vi kallar det: svettig optimism.",
        ]);
      if (temp >= 20)
        return pick([
          "Härligt ute — låtsas att du har en picknick och tja, kanske gör du det.",
          "Milt och soligt: bra väder att bli produktiv eller prokrastinera med stil.",
        ]);
      if (temp >= 15)
        return pick([
          "Behagligt: gå ut och låtsas vara aktiv, folk tror dig.",
          "Skön temperatur — jackan får vila och humöret får en chans.",
        ]);
      if (temp >= 10)
        return pick([
          "Krispigt och klart: tunn jacka krävs, optimism valfri.",
          "Frisk luft och sol — men ta ändå med en extra tröja, bara i fall.",
        ]);
      return pick([
        "Kallt men klart: solskenet försöker trösta dig, uppskatta det.",
        "Klart och kyligt — kaffe rekommenderas som överlevnadsstrategi.",
      ]);
    }
    return "Soligt: njut eller låtsas göra det, valet är ditt.";
  }

  // Mulet
  if (s.includes("cloud") || s.includes("overcast")) {
    return pick([
      "Mulet: perfekt väder för inre monolog och dramatisk stirrande ut genom fönstret.",
      "Grått och neutralt — som kaffet du glömde värma.",
      "Molnigt: solens favorit-tidsinställda paus.",
    ]);
  }

  // Vindigt
  if (s.includes("wind") || s.includes("breezy") || s.includes("gale")) {
    return pick([
      "Blåsigt: hårfixaren tappar jobbet idag.",
      "Stark vind: håll i hatten och dina tvivel.",
      "Vinden är på språng — kanske försöker den blåsa bort dina planer.",
    ]);
  }

  // Kallt
  if (typeof temp === "number" && temp <= 0) {
    return pick([
      "Under noll: ditt ansikte kommer att uttrycka ånger senare.",
      "Minusgrader: dags att låtsas att kyla är karaktärsbildande.",
      "Frostigt — att ta på sig fler lager än nödvändigt är helt acceptabelt.",
    ]);
  }

  // Default / neutral
  return pick([
    "Väderstatus: tillräckligt mediokert. Fortsätt som vanligt.",
    "Mediokert väder: varken spektakulärt eller värt att rapportera för dramatikens skull.",
    "Vädret gör sitt, du gör ditt. Vindarna säkert applåderar svagt.",
  ]);
}

export default function WeatherComment({ temp, summary }: Props) {
  // DEBUG: log when the component mounts/updates so you can verify it renders
  React.useEffect(() => {
    console.log("WeatherComment mounted/updated", { temp, summary });
  }, [temp, summary]);

  return (
    <div className="weather-comment" role="note" aria-live="polite">
      <div className="wc-card">
        {/* Accent bar */}
        <div className="wc-accent" aria-hidden />

        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <div className="wc-title">
            <strong>Kommentar</strong>
          </div>

          {/* Kommentar på egen rad med pratbubbla-emoji */}
          <div className="wc-bubble">
            <p className="wc-text">{pickComment(temp, summary)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
