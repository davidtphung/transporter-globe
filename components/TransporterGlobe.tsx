"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Payload } from "@/types";
import { vardaTrajectory } from "@/data/transporter";
import { propagateGroundTrack, propagatePayloadPosition } from "@/lib/orbital-propagate";
import { payloadMarkerColor } from "@/lib/payload-status";

type Props = {
  payloads: Payload[];
  selectedPayloadId: string;
  onSelect: (payloadId: string) => void;
  showGroundTracks?: boolean;
  showOrbits?: boolean;
  showVarda?: boolean;
  playbackRate?: "live" | "60x" | "600x";
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

function playbackMultiplier(rate: Props["playbackRate"]) {
  if (rate === "60x") return 60;
  if (rate === "600x") return 600;
  return 1;
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
  const coreRadius = selected ? 0.04 : 0.022;
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
        <meshBasicMaterial color={colors.glow} transparent opacity={selected ? 0.32 : 0.14} depthWrite={false} />
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

function InstancedPayloadCloud({
  payloads,
  selectedPayloadId,
  playbackRate,
  onSelect
}: {
  payloads: Payload[];
  selectedPayloadId: string;
  playbackRate: Props["playbackRate"];
  onSelect: (payloadId: string) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const simStart = useRef(Date.now());
  const simOffset = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const multiplier = playbackMultiplier(playbackRate);
    simOffset.current += delta * multiplier * 1000;
    const at = new Date(simStart.current + simOffset.current);

    for (let index = 0; index < payloads.length; index += 1) {
      const payload = payloads[index];
      if (payload.id === selectedPayloadId) {
        tempObject.position.set(0, 0, 0);
        tempObject.scale.setScalar(0);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(index, tempObject.matrix);
        continue;
      }
      const position = propagatePayloadPosition(payload, at);
      if (!position) continue;
      const vector = latLngToVector3(position.lat, position.lng, 2.08);
      tempObject.position.copy(vector);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(index, tempObject.matrix);
      const colors = payloadMarkerColor(payload.status, false);
      tempColor.set(colors.core);
      meshRef.current.setColorAt(index, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (payloads.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, payloads.length]}
      frustumCulled={false}
      onClick={(event) => {
        event.stopPropagation();
        const instanceId = event.instanceId;
        if (instanceId === undefined) return;
        const payload = payloads[instanceId];
        if (payload && payload.id !== selectedPayloadId) {
          onSelect(payload.id);
        }
      }}
    >
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshStandardMaterial vertexColors roughness={0.4} metalness={0.05} emissiveIntensity={0.35} />
    </instancedMesh>
  );
}

function SelectedOrbitArc({
  payload,
  playbackRate,
  showGroundTracks,
  showOrbits,
  onSelect
}: {
  payload: Payload;
  playbackRate: Props["playbackRate"];
  showGroundTracks: boolean;
  showOrbits: boolean;
  onSelect: () => void;
}) {
  const simStart = useRef(Date.now());
  const simOffset = useRef(0);
  const markerRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const track = useMemo(() => propagateGroundTrack(payload, 120), [payload]);
  const points = useMemo(() => track.map((point) => latLngToVector3(point.lat, point.lng, 2.08)), [track]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const colors = payloadMarkerColor(payload.status, true);
  const line = useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: showOrbits ? 0.9 : 0.12
        })
      ),
    [geometry, showOrbits]
  );

  useFrame((_, delta) => {
    const multiplier = playbackMultiplier(playbackRate);
    simOffset.current += delta * multiplier * 1000;
    const at = new Date(simStart.current + simOffset.current);
    const position = propagatePayloadPosition(payload, at);
    if (!position) return;
    const vector = latLngToVector3(position.lat, position.lng, 2.08);
    markerRef.current?.position.copy(vector);
    glowRef.current?.position.copy(vector);
  });

  const origin = useMemo(() => new THREE.Vector3(), []);

  return (
    <group>
      {showGroundTracks ? <primitive object={line} onClick={onSelect} /> : null}
      <group ref={markerRef} position={points[0]}>
        <SatelliteMarker position={origin} selected status={payload.status} onSelect={onSelect} />
      </group>
      <mesh ref={glowRef} position={points[0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.08} depthWrite={false} />
      </mesh>
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

function Scene({ payloads, selectedPayloadId, onSelect, showGroundTracks, showOrbits, showVarda, playbackRate }: Props) {
  const group = useRef<THREE.Group>(null);
  const reducedMotion = useRef(false);
  const selectedPayload = payloads.find((payload) => payload.id === selectedPayloadId) ?? payloads[0];

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion.current) {
      group.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={group}>
      <Earth />
      <mesh>
        <sphereGeometry args={[2.012, 96, 96]} />
        <meshBasicMaterial color="#005288" wireframe transparent opacity={0.04} />
      </mesh>
      <InstancedPayloadCloud
        payloads={payloads}
        selectedPayloadId={selectedPayloadId}
        playbackRate={playbackRate}
        onSelect={onSelect}
      />
      {selectedPayload ? (
        <SelectedOrbitArc
          payload={selectedPayload}
          playbackRate={playbackRate}
          showGroundTracks={showGroundTracks ?? true}
          showOrbits={showOrbits ?? true}
          onSelect={() => onSelect(selectedPayload.id)}
        />
      ) : null}
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