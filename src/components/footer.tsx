export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0077C0",
        color: "#FFFFFF",
        padding: "20px 24px",
        textAlign: "center",
        fontSize: "14px",
        lineHeight: 1.4,
        marginTop: "auto",
      }}
    >
      <p style={{ margin: 0 }}>
        © Kod och Design{" "}
        <a
          href="https://kodochdesign.se"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#E6F7FF", textDecoration: "underline" }}
        >
          https://kodochdesign.se
        </a>{" "}
        av Josefine Eriksson Snestil
      </p>
      <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
        Kommentarerna på denna sida är sarkastiska och skapade för att göra
        väderprognosen humoristisk eftersom ingen någonsing är 100% nöjd med
        vädret.
      </p>
    </footer>
  );
}
