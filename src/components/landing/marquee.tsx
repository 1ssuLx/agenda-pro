const PROFESSIONS = [
  "Barbearias",
  "Salões de beleza",
  "Estúdios de tatuagem",
  "Clínicas de estética",
  "Manicures",
  "Cabeleireiros",
  "Nutricionistas",
  "Psicólogos",
  "Fisioterapeutas",
  "Dentistas",
  "Massagistas",
  "Personal trainers",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-12 px-6">
      {PROFESSIONS.map((p) => (
        <span
          key={p}
          className="flex items-center gap-12 font-serif text-2xl italic text-[#a3a3a3] sm:text-3xl"
        >
          {p}
          <span className="text-[#22c55e]">✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <section
      aria-label="Profissões atendidas"
      className="relative overflow-hidden border-y border-[rgba(34,197,94,0.15)] bg-[#0a0a0a] py-6"
    >
      <div className="marquee-track flex w-max">
        <Row />
        <Row />
      </div>
    </section>
  );
}
