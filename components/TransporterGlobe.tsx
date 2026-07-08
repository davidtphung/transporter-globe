"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import type { Payload } from "@/types";
import { vardaTrajectory } from "@/data/transporter";
import { payloadMarkerColor } from "@/lib/payload-status";

type Props = {
  payloads: Payload[];
  selectedPayloadId: string;
  onSelect: (payloadId: string) => void;
  showGroundTracks?: boolean;
  showOrbits?: boolean;
  showVarda?: boolean;
};

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function propagateGroundTrack(payload: Payload, samples = 120) {
  if (!payload.tle1 || !payload.tle2) {
    const offset = payload.deployOrder * 17;
    return Array.from({ length: samples }, (_, index) => {
      const lng = index * 3 - 180;
      const lat = Math.sin((index / samples) * Math.PI * 2 + offset) * (payload.inclinationDeg / 3.8);
      return latLngToVector3(lat, lng, 2.08);
    });
  }

  const satrec = satellite.twoline2satrec(payload.tle1, payload.tle2);
  const now = new Date();
  const points: THREE.Vector3[] = [];

  for (let index = 0; index < samples; index += 1) {
    const time = new Date(now.getTime() + index * 60_000);
    const positionAndVelocity = satellite.propagate(satrec, time);
    if (!positionAndVelocity || typeof positionAndVelocity === "boolean") continue;
    const positionEci = positionAndVelocity.position;
    if (!positionEci || typeof positionEci === "boolean") continue;
    const gmst = satellite.gstime(time);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);
    const lat = satellite.degreesLat(geodetic.latitude);
    const lng = satellite.degreesLong(geodetic.longitude);
    points.push(latLngToVector3(lat, lng, 2.08));
  }

  return points.length > 0 ? points : [latLngToVector3(0, 0, 2.08)];
}

function SatelliteMarker({
  position,
  selected,
  status,
  onSelect
}: {
  position: THREE.Vector3;
  selected: boolean;
  status: Payload["status"];
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const colors = payloadMarkerColor(status, selected);
  const coreRadius = selected ? 0.038 : 0.022;
  const glowRadius = coreRadius * 2.4;
  const ringInner = coreRadius * 2.1;
  const ringOuter = coreRadius * 2.65;

  useFrame((state) => {
    if (!group.current || !selected) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.08;
    group.current.scale.setScalar(pulse);
  });

  return (
    <group ref={group} position={position} onClick={onSelect}>
      <mesh>
        <sphereGeometry args={[glowRadius, 14, 14]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={selected ? 0.28 : 0.14} depthWrite={false} />
      </mesh>
      {selected ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInner, ringOuter, 40]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh>
        <sphereGeometry args={[coreRadius, 18, 18]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.emissive}
          emissiveIntensity={selected ? 0.85 : 0.45}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function OrbitArc({
  payload,
  selected,
  onSelect,
  showGroundTracks,
  showOrbits
}: {
  payload: Payload;
  selected: boolean;
  onSelect: () => void;
  showGroundTracks: boolean;
  showOrbits: boolean;
}) {
  const points = useMemo(() => propagateGroundTrack(payload), [payload]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const colors = payloadMarkerColor(payload.status, selected);
  const line = useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: selected ? "#ffffff" : colors.glow,
          transparent: true,
          opacity: selected ? 0.88 : showOrbits ? 0.26 : 0.08
        })
      ),
    [geometry, selected, showOrbits, colors.glow]
  );
  const marker = points[(payload.deployOrder * 7) % points.length];

  return (
    <group>
      {showGroundTracks ? <primitive object={line} onClick={onSelect} /> : null}
      <SatelliteMarker position={marker} selected={selected} status={payload.status} onSelect={onSelect} />
    </group>
  );
}

function VardaMarker({ position, kind }: { position: THREE.Vector3; kind: "waypoint" | "landing" }) {
  const isLanding = kind === "landing";
  const coreRadius = isLanding ? 0.034 : 0.016;
  const glowRadius = coreRadius * 2.6;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[glowRadius, 12, 12]} />
        <meshBasicMaterial color="#f44336" transparent opacity={isLanding ? 0.32 : 0.16} depthWrite={false} />
      </mesh>
      {isLanding ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[coreRadius * 2, coreRadius * 2.8, 36]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh>
        <sphereGeometry args={[coreRadius, 16, 16]} />
        <meshStandardMaterial
          color={isLanding ? "#ffffff" : "#f44336"}
          emissive={isLanding ? "#ffffff" : "#8b1a1a"}
          emissiveIntensity={isLanding ? 0.7 : 0.4}
        />
      </mesh>
    </group>
  );
}

function VardaTrack() {
  const points = useMemo(() => vardaTrajectory.map((point) => latLngToVector3(point.lat, point.lng, 2.22)), []);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const line = useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#f44336",
          transparent: true,
          opacity: 0.82
        })
      ),
    [geometry]
  );

  return (
    <group>
      <primitive object={line} />
      {points.map((point, index) => (
        <VardaMarker key={vardaTrajectory[index].label} position={point} kind={index === points.length - 1 ? "landing" : "waypoint"} />
      ))}
    </group>
  );
}

function Earth() {
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const [colorMap, bumpMap] = useMemo(() => {
    const color = textureLoader.load("/earth-blue-marble.jpg");
    const bump = textureLoader.load("/earth-topology.png");
    color.colorSpace = THREE.SRGBColorSpace;
    return [color, bump];
  }, [textureLoader]);

  return (
    <mesh>
      <sphereGeometry args={[2, 96, 96]} />
      <meshPhongMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.04} specular={new THREE.Color("#111b25")} shininess={8} />
    </mesh>
  );
}

function Scene({ payloads, selectedPayloadId, onSelect, showGroundTracks, showOrbits, showVarda }: Props) {
  const group = useRef<THREE.Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion.current) {
      group.current.rotation.y += delta * 0.04;
    }
  });

  const visiblePayloads = payloads.slice(0, 28);

  return (
    <group ref={group}>
      <Earth />
      <mesh>
        <sphereGeometry args={[2.012, 96, 96]} />
        <meshBasicMaterial color="#005288" wireframe transparent opacity={0.05} />
      </mesh>
      {visiblePayloads.map((payload) => (
        <OrbitArc
          key={payload.id}
          payload={payload}
          selected={payload.id === selectedPayloadId}
          onSelect={() => onSelect(payload.id)}
          showGroundTracks={showGroundTracks ?? true}
          showOrbits={showOrbits ?? true}
        />
      ))}
      {showVarda !== false ? <VardaTrack /> : null}
    </group>
  );
}

export function TransporterGlobe(props: Props) {
  return (
    <Canvas className="globe-canvas-inner" camera={{ position: [0, 0.8, 5.4], fov: 42 }} dpr={[1, 2]} aria-label="Interactive orbital globe">
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 3, 4]} intensity={1.1} />
      <pointLight position={[-3, -2, 5]} color="#a7d1f0" intensity={0.35} />
      <Scene {...props} />
    </Canvas>
  );
}