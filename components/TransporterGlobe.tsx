"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import type { Payload } from "@/types";
import { vardaTrajectory } from "@/data/transporter";

type Props = {
  payloads: Payload[];
  selectedPayloadId: string;
  onSelect: (payloadId: string) => void;
  showGroundTracks?: boolean;
  showOrbits?: boolean;
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
  const line = useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: selected ? "#ffffff" : "#a7d1f0",
          transparent: true,
          opacity: selected ? 0.95 : showOrbits ? 0.32 : 0.1
        })
      ),
    [geometry, selected, showOrbits]
  );
  const marker = points[(payload.deployOrder * 7) % points.length];

  return (
    <group>
      {showGroundTracks ? <primitive object={line} onClick={onSelect} /> : null}
      <mesh position={marker} onClick={onSelect}>
        <sphereGeometry args={[selected ? 0.055 : 0.035, 18, 18]} />
        <meshStandardMaterial color={selected ? "#ffffff" : "#a7d1f0"} emissive={selected ? "#005288" : "#003d66"} />
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
          opacity: 0.9
        })
      ),
    [geometry]
  );

  return (
    <group>
      <primitive object={line} />
      {points.map((point, index) => (
        <mesh key={vardaTrajectory[index].label} position={point}>
          <sphereGeometry args={[index === points.length - 1 ? 0.06 : 0.04, 18, 18]} />
          <meshStandardMaterial color={index === points.length - 1 ? "#ffffff" : "#f44336"} emissive="#8b1a1a" />
        </mesh>
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

function Scene({ payloads, selectedPayloadId, onSelect, showGroundTracks, showOrbits }: Props) {
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
        <meshBasicMaterial color="#005288" wireframe transparent opacity={0.06} />
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
      <VardaTrack />
    </group>
  );
}

export function TransporterGlobe(props: Props) {
  return (
    <Canvas camera={{ position: [0, 0.8, 5.4], fov: 42 }} dpr={[1, 2]} aria-label="Interactive orbital globe">
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 3, 4]} intensity={1.1} />
      <pointLight position={[-3, -2, 5]} color="#a7d1f0" intensity={0.35} />
      <Scene {...props} />
    </Canvas>
  );
}