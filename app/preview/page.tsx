export default function Preview() {
  const els: [string, string][] = [
    ["wind", "Voltaris"],
    ["fire", "Pyros"],
    ["earth", "Bardoran"],
    ["water", "Glacion"],
  ];
  return (
    <main style={{ padding: 16, display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
      {els.map(([el, name]) => (
        <div
          key={el}
          className="boss-portrait"
          style={{ backgroundImage: "url(/bosses/" + el + ".svg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <img src={"/bosses/" + el + "-dragon.png"} alt={name} className="block h-auto w-full object-cover" />
        </div>
      ))}
    </main>
  );
}
