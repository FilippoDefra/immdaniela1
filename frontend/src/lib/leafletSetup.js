import L from "leaflet";

// Fix marker icons for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const goldIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="width:24px;height:24px;background:#B8860B;border:3px solid #fff;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
