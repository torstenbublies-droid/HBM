import { useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

export default function TestHash() {
  const [location] = useLocation();
  const [hashLocation] = useHashLocation();
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>Hash Routing Test</h1>
      <p><strong>window.location.href:</strong> {window.location.href}</p>
      <p><strong>window.location.hash:</strong> {window.location.hash}</p>
      <p><strong>useLocation():</strong> {location}</p>
      <p><strong>useHashLocation():</strong> {hashLocation}</p>
    </div>
  );
}
