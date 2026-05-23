import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

export function PropertyCard({ l }) {
  const img = (l.images && l.images[0]) || FALLBACK_IMG;
  return (
    <Link to={`/immobili/${l.id}`} className="pc" data-testid={`property-card-${l.id}`}>
      <div className="pc-img">
        <img src={img} alt={l.title} />
        <div className="pc-img-overlay">
          {l.tag && <span className="pc-tag">{l.tag}</span>}
          <span className="pc-type">{l.type}</span>
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-loc">{l.town}</div>
        <h3 className="pc-ttl">{l.title}</h3>
        <div className="pc-meta">{l.sqm} mq · {l.rooms} locali · {l.baths} bagni · Classe {l.energy}</div>
        <div className="pc-price">{l.price}</div>
      </div>
    </Link>
  );
}
