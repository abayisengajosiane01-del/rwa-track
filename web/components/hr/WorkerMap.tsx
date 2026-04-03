"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Pin {
  lat: number;
  lng: number;
  label: string;
  address: string;
  time: string;
}

export default function WorkerMap({ pins }: { pins: Pin[] }) {
  if (pins.length === 0) return null;

  const center: [number, number] = [pins[0].lat, pins[0].lng];

  return (
    <MapContainer center={center} zoom={14} style={{ height: "400px", width: "100%", borderRadius: "12px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin, i) => (
        <Marker key={i} position={[pin.lat, pin.lng]} icon={icon}>
          <Popup>
            <strong>{pin.label}</strong><br />
            {pin.address}<br />
            <span style={{ fontSize: 11, color: "#64748b" }}>{pin.time}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
