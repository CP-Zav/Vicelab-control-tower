export default function Page() {
  return (
    <main style={{ padding: "40px" }}>
      <h1 style={{
        fontSize: "42px",
        background: "linear-gradient(90deg, cyan, violet, hotpink)",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}>
        ViceLab Control Tower
      </h1>

      <p style={{ opacity: 0.7 }}>
        System online. Awaiting execution commands.
      </p>

      <div style={{
        marginTop: "30px",
        padding: "20px",
        border: "1px solid #222",
        borderRadius: "12px",
        background: "#111"
      }}>
        <h3>Execution Layer</h3>
        <p>Ready to integrate automation pipeline.</p>
      </div>
    </main>
  );
}
