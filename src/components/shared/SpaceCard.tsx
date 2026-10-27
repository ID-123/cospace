import Link from "next/link";

type SpaceCardProps = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
};

export function SpaceCard({
  id,
  name,
  description,
  capacity,
  pricePerHour,
}: SpaceCardProps) {
  return (
    <article className="space-card">
      <div className="space-card__content">
        <span className="space-card__label">ESPACIO DISPONIBLE</span>
        <h2>{name}</h2>
        <p>{description}</p>
      </div>

      <div className="space-card__details">
        <p>
          <span>Capacidad</span>
          <strong>{capacity} personas</strong>
        </p>

        <p>
          <span>Precio por hora</span>
          <strong>${pricePerHour.toLocaleString("es-CO")}</strong>
        </p>
      </div>
      <Link className="space-card__link" href={`/spaces/${id}`}>
        Ver detalles →
      </Link>
    </article>
  );
}
