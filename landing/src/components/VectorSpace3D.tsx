"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

type P = { pos: [number, number, number]; cluster: number };

const CLUSTERS = [
  { name: "Transformers", center: [2.6, 1.4, 0.5] as [number, number, number] },
  { name: "Vector DBs", center: [-2.4, 0.6, 1.4] as [number, number, number] },
  { name: "AI Agents", center: [0.4, -1.8, -1.6] as [number, number, number] },
  { name: "Math & ML", center: [0.2, 2.2, -1.2] as [number, number, number] },
];

const POINT_COLOR = "#9aa0a6";
const HIT_COLOR = "#ff0033";

function buildPoints(): P[] {
  const pts: P[] = [];
  CLUSTERS.forEach((c, ci) => {
    for (let i = 0; i < 17; i++) {
      const j = () => (Math.random() - 0.5) * 1.7;
      pts.push({ pos: [c.center[0] + j(), c.center[1] + j(), c.center[2] + j()], cluster: ci });
    }
  });
  return pts;
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function Scene({
  points,
  query,
  neighbors,
  cycle,
}: {
  points: P[];
  query: [number, number, number] | null;
  neighbors: number[];
  cycle: number;
}) {
  const group = useRef<THREE.Group>(null);
  const queryMesh = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const neighborRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lineRefs = useRef<(any | null)[]>([]);
  const hitSet = useMemo(() => new Set(neighbors), [neighbors]);

  const mountT = useRef(0);
  const cycleStart = useRef(0);
  const lastCycle = useRef(-1);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;

    // camera intro dolly
    const t = state.clock.elapsedTime - mountT.current;
    const introCam = easeOut(t / 1.2);
    state.camera.position.z = THREE.MathUtils.lerp(13, 9, introCam);

    // query arrival easing
    if (lastCycle.current !== cycle) {
      lastCycle.current = cycle;
      cycleStart.current = state.clock.elapsedTime;
    }
    const a = state.clock.elapsedTime - cycleStart.current;
    if (queryMesh.current) queryMesh.current.scale.setScalar(easeOut(a / 0.5));
    neighbors.forEach((_, i) => {
      const m = neighborRefs.current[i];
      if (m) m.scale.setScalar(easeOut((a - i * 0.08) / 0.4));
      const ln = lineRefs.current[i];
      if (ln && ln.material) ln.material.opacity = 0.55 * easeOut(a / 0.5);
    });

    // pulse ring
    if (ring.current) {
      const p = (state.clock.elapsedTime * 0.8) % 1;
      ring.current.scale.setScalar(1 + p * 1.8);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - p * 0.6);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 6]} intensity={30} color="#ffffff" />
      {query && <pointLight position={query} intensity={22} color={HIT_COLOR} distance={7} />}

      <group ref={group}>
        {/* base points */}
        {points.map((p, i) => {
          const hit = hitSet.has(i);
          if (hit) return null;
          return (
            <mesh key={i} position={p.pos}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshStandardMaterial color={POINT_COLOR} />
            </mesh>
          );
        })}

        {/* retrieved neighbours (animated) */}
        {query && neighbors.map((ni, i) => (
          <mesh key={`h${ni}`} ref={(el) => { neighborRefs.current[i] = el; }} position={points[ni].pos}>
            <sphereGeometry args={[0.11, 18, 18]} />
            <meshStandardMaterial color={HIT_COLOR} emissive={HIT_COLOR} emissiveIntensity={0.85} />
          </mesh>
        ))}

        {/* cluster labels */}
        {CLUSTERS.map((c) => (
          <Html key={c.name} position={[c.center[0], c.center[1] + 1.1, c.center[2]]} center distanceFactor={12}>
            <div className="select-none whitespace-nowrap rounded border border-white/10 bg-black/60 px-2 py-0.5 text-[11px] text-white/70 backdrop-blur">
              {c.name}
            </div>
          </Html>
        ))}

        {/* query + lines */}
        {query && (
          <>
            <mesh ref={queryMesh} position={query}>
              <sphereGeometry args={[0.14, 20, 20]} />
              <meshStandardMaterial color={HIT_COLOR} emissive={HIT_COLOR} emissiveIntensity={1} />
            </mesh>
            <mesh ref={ring} position={query} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.18, 0.23, 44]} />
              <meshBasicMaterial color={HIT_COLOR} transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            {neighbors.map((ni, i) => (
              <Line
                key={`l${ni}`}
                ref={(el: any) => { lineRefs.current[i] = el; }}
                points={[query, points[ni].pos]}
                color={HIT_COLOR}
                lineWidth={1.5}
                transparent
                opacity={0}
              />
            ))}
          </>
        )}
      </group>

      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function VectorSpace3D() {
  const [cycle, setCycle] = useState(0);
  const [query, setQuery] = useState<[number, number, number] | null>(null);
  const [neighbors, setNeighbors] = useState<number[]>([]);
  const allPoints = useMemo(buildPoints, []);

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), 4400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ci = cycle % CLUSTERS.length;
    const c = CLUSTERS[ci].center;
    const q: [number, number, number] = [c[0] + 0.3, c[1] + 0.3, c[2] + 0.3];
    setQuery(q);
    const dist = allPoints.map((p, i) => ({ i, d: (p.pos as number[]).reduce((s, v, k) => s + (v - q[k]) ** 2, 0) }));
    dist.sort((a, b) => a.d - b.d);
    setNeighbors(dist.slice(0, 3).map((x) => x.i));
  }, [cycle, allPoints]);

  const clusterName = CLUSTERS[cycle % CLUSTERS.length].name;

  return (
    <section id="vectors" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">/ vector space</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Meaning becomes geometry.</h2>
        <p className="mt-4 text-muted">
          Every video&apos;s transcript is embedded into a point in high-dimensional space. Videos that{" "}
          <em>mean</em> similar things land close together. A query drops in and pulls its nearest neighbours — that&apos;s semantic search, visualised. Drag to orbit.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-line bg-[#0b0b0b] sm:h-[520px]">
          <Canvas camera={{ position: [0, 0, 13], fov: 50 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
            <fog attach="fog" args={["#0b0b0b", 9, 19]} />
            <Scene points={allPoints} query={query} neighbors={neighbors} cycle={cycle} />
          </Canvas>

          {/* legend */}
          <div className="pointer-events-none absolute left-3 top-3 space-y-1 rounded-lg bg-black/50 px-2.5 py-2 text-[10.5px] text-white/70 backdrop-blur">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#9aa0a6]" /> video</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: HIT_COLOR }} /> query + top-3</div>
          </div>
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white/60 backdrop-blur">
            drag to orbit · 68 videos indexed
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div className="surface rounded-2xl p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">live query</p>
            <div className="mt-2 h-9">
              <div key={cycle} className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                retrieving “{clusterName}”
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="text-fg/70">neighbour {i + 1}</span>
                  <span className="font-mono text-brand">{query ? 96 - i * 4 - (cycle % 3) : 0}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-line bg-bg p-2.5 font-mono text-[10.5px] text-muted">
              q = [0.31, -0.12, 0.84, …] <span className="text-brand">· 384-d</span>
            </div>
          </div>

          <div className="surface rounded-2xl p-5 text-[12px] leading-relaxed text-muted">
            <span className="font-medium text-fg">Why 3D?</span> Real embeddings live in 384
            dimensions — far more than we can draw. This is a projection: the clustering you see is
            what makes retrieval work.
          </div>
        </div>
      </div>
    </section>
  );
}
