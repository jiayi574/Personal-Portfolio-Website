"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  RoundedBox,
  ContactShadows,
  SoftShadows,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
type V = [number, number, number];
type Props = {
  path: string;
  onNavigate: (path: string) => void;
  night: boolean;
  reduced: boolean;
  reset: number;
  immersive: boolean;
  onReady: () => void;
};
const wood = "#775039",
  dark = "#322c24",
  cream = "#e6d9b5",
  green = "#65714e",
  brass = "#b39552";
function texture(kind: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const x = c.getContext("2d")!;
  let seed = 41;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  x.fillStyle =
    kind === "rug" ? "#a5a37b" : kind === "wall" ? "#a9a387" : "#8a6041";
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i++) {
    const a = rand(),
      b = rand();
    x.fillStyle = `rgba(${rand() > 0.5 ? "255,237,200" : "37,23,10"},${rand() * 0.045})`;
    kind === "wood"
      ? x.fillRect(a * 512, b * 512, rand() * 150 + 10, 0.5 + rand())
      : x.fillRect(a * 512, b * 512, rand() * 3 + 1, rand() * 3 + 1);
  }
  if (kind === "rug") {
    for (let i = 0; i < 512; i += 4) {
      x.fillStyle = "rgba(35,50,28,.13)";
      x.fillRect(i, 0, 1, 512);
      x.fillRect(0, i, 512, 1);
    }
    x.strokeStyle = "#dad2a9";
    x.lineWidth = 7;
    x.strokeRect(25, 25, 462, 462);
    x.lineWidth = 2;
    x.strokeRect(38, 38, 436, 436);
    for (let i = 65; i < 450; i += 60) {
      x.save();
      x.translate(i, 256);
      x.rotate(Math.PI / 4);
      x.fillStyle = "#687253";
      x.fillRect(-13, -13, 26, 26);
      x.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function artTexture(title: string, style = 0) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const x = c.getContext("2d")!;
  const bg = ["#b7bc8d", "#c16e4b", "#233d4a", "#d9c798", "#887e9d"][style % 5];
  x.fillStyle = bg;
  x.fillRect(0, 0, 512, 640);
  x.fillStyle = ["#e7dfbc", "#e9ca83", "#b9c6bd", "#6a7958", "#ded4b9"][
    style % 5
  ];
  if (style % 3 === 0) {
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      x.arc(256, 340, 170 - i * 27, Math.PI, 0);
      x.lineWidth = 17;
      x.strokeStyle = i % 2 ? "#c38352" : "#e9dfb5";
      x.stroke();
    }
    x.fillStyle = "#6d744e";
    x.fillRect(86, 341, 340, 95);
  } else if (style % 3 === 1) {
    x.beginPath();
    x.arc(256, 300, 150, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#6c763e";
    x.beginPath();
    x.moveTo(0, 500);
    x.bezierCurveTo(210, 210, 270, 570, 512, 310);
    x.lineTo(512, 640);
    x.lineTo(0, 640);
    x.fill();
  } else {
    for (let i = 0; i < 7; i++) {
      x.beginPath();
      x.ellipse(256, 300, 170 - i * 20, 200 - i * 20, 0.4, 0, Math.PI * 2);
      x.strokeStyle = i % 2 ? "#b6b88d" : "#6c8785";
      x.lineWidth = 9;
      x.stroke();
    }
  }
  x.fillStyle = style === 2 ? "#efe6cd" : "#303b2b";
  x.textAlign = "center";
  x.font = "19px monospace";
  x.fillText("A ROOM OF ONE’S OWN", 256, 55);
  x.font = "bold 45px Georgia";
  title.split("|").forEach((s, i) => x.fillText(s, 256, 535 + i * 48));
  x.font = "14px monospace";
  x.fillText("INDEPENDENT THOUGHTS / ORIGINAL WORK", 256, 615);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function labelTexture(lines: string[], bg = "#152f2b", fg = "#c4dcac") {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = bg;
  x.fillRect(0, 0, 768, 512);
  x.fillStyle = fg;
  x.font = "23px monospace";
  x.fillText("ROOM_OS  /  PERSONAL STUDIO", 42, 62);
  x.fillRect(42, 85, 684, 2);
  lines.forEach((s, i) => {
    x.font = i === 0 ? "bold 48px monospace" : "25px monospace";
    x.fillText(s, 42, 170 + i * 64);
  });
  for (let y = 0; y < 512; y += 5) {
    x.fillStyle = "rgba(0,0,0,.13)";
    x.fillRect(0, y, 768, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  c = wood,
  r = [0, 0, 0],
  map,
  round = 0,
  ...rest
}: {
  p?: V;
  s?: V;
  c?: string;
  r?: V;
  map?: THREE.Texture;
  round?: number;
  [key: string]: unknown;
}) {
  return round ? (
    <RoundedBox
      position={p}
      args={s}
      radius={round}
      smoothness={3}
      rotation={r}
      castShadow
      receiveShadow
      {...rest}
    >
      <meshStandardMaterial color={c} map={map} roughness={0.75} />
    </RoundedBox>
  ) : (
    <mesh position={p} rotation={r} castShadow receiveShadow {...rest}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} map={map} roughness={0.82} />
    </mesh>
  );
}
function Cylinder({
  p = [0, 0, 0],
  radius = 0.1,
  height = 0.1,
  c = dark,
  r = [0, 0, 0],
}: {
  p?: V;
  radius?: number;
  height?: number;
  c?: string;
  r?: V;
}) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={c} roughness={0.65} />
    </mesh>
  );
}
function Rod({
  a,
  b,
  r = 0.025,
  c = dark,
}: {
  a: V;
  b: V;
  r?: number;
  c?: string;
}) {
  const mid = new THREE.Vector3(...a)
    .add(new THREE.Vector3(...b))
    .multiplyScalar(0.5);
  const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    d.clone().normalize(),
  );
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, d.length(), 10]} />
      <meshStandardMaterial color={c} />
    </mesh>
  );
}
function Plant({ p, scale = 1 }: { p: V; scale?: number }) {
  return (
    <group position={p} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.17, 0.4, 24]} />
        <meshStandardMaterial color="#b96e49" roughness={0.95} />
      </mesh>
      <Cylinder p={[0, 0.405, 0]} radius={0.2} height={0.02} c="#352c20" />
      {Array.from({ length: 9 }, (_, i) => {
        const angle = i * 2.4;
        const end: V = [
          Math.cos(angle) * (0.25 + i * 0.018),
          0.7 + (i % 3) * 0.14,
          Math.sin(angle) * 0.28,
        ];
        return (
          <group key={i}>
            <Rod a={[0, 0.4, 0]} b={end} r={0.012} c="#4c6039" />
            <mesh
              position={end}
              rotation={[0.3, angle, Math.PI / 4]}
              scale={[0.12, 0.29, 0.035]}
              castShadow
            >
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial
                color={i % 2 ? "#536c38" : "#819257"}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
function Book({
  p,
  height = 0.5,
  width = 0.12,
  c = green,
  rotation = 0,
}: {
  p: V;
  height?: number;
  width?: number;
  c?: string;
  rotation?: number;
}) {
  return (
    <group position={p} rotation={[0, 0, rotation]}>
      <Box s={[width, height, 0.34]} c={c} />
      <Box
        p={[0, height * 0.27, 0.173]}
        s={[width * 0.7, 0.014, 0.006]}
        c={cream}
      />
      <Box
        p={[0, -height * 0.33, 0.173]}
        s={[width * 0.7, 0.014, 0.006]}
        c={cream}
      />
    </group>
  );
}
function Frame({
  p,
  title,
  index = 0,
  size = [0.95, 1.2],
  onClick,
}: {
  p: V;
  title: string;
  index?: number;
  size?: [number, number];
  onClick: () => void;
}) {
  const map = useMemo(() => artTexture(title, index), [title, index]);
  return (
    <Hotspot
      p={p}
      title={title.replace("|", " ")}
      href=""
      onNavigate={onClick}
      marker={[0, -size[1] / 2 - 0.12, 0.1]}
    >
      <Box
        s={[size[0] + 0.14, size[1] + 0.14, 0.1]}
        c={index % 2 ? brass : dark}
      />
      <Box p={[0, 0, 0.057]} s={[size[0], size[1], 0.035]} c={cream} />
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[size[0] - 0.13, size[1] - 0.13]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </Hotspot>
  );
}
function Hotspot({
  p = [0, 0, 0],
  title,
  href,
  onNavigate,
  children,
  marker = [0, 1, 0],
}: {
  p?: V;
  title: string;
  href: string;
  onNavigate: (s: string) => void;
  children: React.ReactNode;
  marker?: V;
}) {
  const [hover, setHover] = useState(false);
  function enter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = "pointer";
  }
  function leave() {
    setHover(false);
    document.body.style.cursor = "auto";
  }
  return (
    <group
      position={p}
      onPointerOver={enter}
      onPointerOut={leave}
      onClick={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
        onNavigate(href);
      }}
    >
      {children}
      <Html position={marker} center zIndexRange={[12, 0]}>
        <button
          className={`hotspot ${href === "" ? "art-marker" : ""} ${hover ? "hover" : ""}`}
          aria-label={title}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(href);
          }}
        >
          <span className="hotspot-dot" />
          <span className="hotspot-label">
            {title}
            <span>↗</span>
          </span>
        </button>
      </Html>
    </group>
  );
}
const focus: Record<string, { target: V; camera: V }> = {
  work: { target: [-1.7, 1.7, -1.8], camera: [2, 3.6, 5] },
  playground: { target: [2.5, 1.5, -1.7], camera: [5.8, 3.5, 5] },
  notes: { target: [-4, 1.6, 0.2], camera: [1, 3.2, 5] },
  music: { target: [2.7, 1.2, 1.4], camera: [6.5, 4.1, 7] },
  about: { target: [-2.7, 1.7, -1.5], camera: [1, 3.5, 5] },
  now: { target: [-1, 1.5, -1], camera: [2, 3.9, 5] },
};
function CameraRig({
  path,
  reduced,
  reset,
  immersive,
}: {
  path: string;
  reduced: boolean;
  reset: number;
  immersive: boolean;
}) {
  const controls = useRef<any>(null);
  const { camera, size } = useThree();
  const prior = useRef<{ p: THREE.Vector3; t: THREE.Vector3 } | null>(null);
  const last = useRef("");
  useEffect(() => {
    if (!controls.current) return;
    const c = controls.current;
    const section = path.split("/")[1];
    const selected = focus[section];
    if (selected && last.current === "") {
      prior.current = { p: camera.position.clone(), t: c.target.clone() };
    }
    const home = immersive
      ? [0.2, 2.7, 4.8]
      : size.width < 650
        ? [19, 15.3, 26.6]
        : [8.3, 6.4, 11.4];
    const pos = selected
      ? selected.camera
      : prior.current
        ? prior.current.p.toArray()
        : home;
    const tar = selected
      ? selected.target
      : prior.current
        ? prior.current.t.toArray()
        : immersive
          ? [0, 1.8, -1.3]
          : [0, 1.4, 0];
    c.enabled = !selected;
    const duration = reduced ? 0 : 1.1;
    const a = gsap.to(camera.position, {
      x: pos[0],
      y: pos[1],
      z: pos[2],
      duration,
      ease: "power3.inOut",
      onUpdate: () => c.update(),
    });
    const b = gsap.to(c.target, {
      x: tar[0],
      y: tar[1],
      z: tar[2],
      duration,
      ease: "power3.inOut",
      onUpdate: () => c.update(),
    });
    if (!selected) prior.current = null;
    last.current = section;
    return () => {
      a.kill();
      b.kill();
    };
  }, [path, reduced, camera, size.width, reset, immersive]);
  return (
    <OrbitControls
      ref={controls}
      target={[0, 1.4, 0]}
      enablePan={false}
      minDistance={immersive ? 4.5 : 9}
      maxDistance={immersive ? 8 : 42}
      minAzimuthAngle={immersive ? -0.2 : -0.12}
      maxAzimuthAngle={immersive ? 0.2 : 1.05}
      minPolarAngle={immersive ? 0.95 : 0.58}
      maxPolarAngle={immersive ? 1.5 : 1.3}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.45}
      zoomSpeed={0.6}
    />
  );
}
function Record({ p, reduced }: { p: V; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current && !reduced) ref.current.rotation.y += d * 0.35;
  });
  return (
    <group position={p} ref={ref}>
      <Cylinder radius={0.33} height={0.025} />
      {[0.14, 0.19, 0.24, 0.29].map((r) => (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} key={r}>
          <ringGeometry args={[r, r + 0.003, 48]} />
          <meshStandardMaterial color="#555349" />
        </mesh>
      ))}
      <Cylinder p={[0, 0.02, 0]} radius={0.105} height={0.01} c="#c58555" />
      <Cylinder p={[0, 0.035, 0]} radius={0.012} height={0.04} c={brass} />
    </group>
  );
}
function World({ onNavigate, night, reduced, onReady }: Props) {
  const textures = useMemo(
    () => ({
      wood: texture("wood"),
      wall: texture("wall"),
      rug: texture("rug"),
      screen: labelTexture(["A room for", "good ideas.", "> selected work_"]),
      tv: labelTexture(
        ["PLAY / PAUSE", "a few experiments", "PRESS START"],
        "#25394b",
        "#bdc6a6",
      ),
    }),
    [],
  );
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <>
      <color attach="background" args={[night ? "#272d28" : "#b5b29b"]} />
      <ambientLight intensity={night ? 0.48 : 0.85} color="#e7d9bd" />
      <hemisphereLight args={["#e4e2c7", "#65523b", night ? 0.5 : 1.2]} />
      <directionalLight
        position={[-3, 8, 3]}
        intensity={night ? 0.55 : 2.8}
        color="#ffe4b3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight
        position={[-2.8, 2.5, -1.7]}
        intensity={night ? 12 : 5}
        color="#ffc46f"
        distance={7}
        decay={2}
      />
      <pointLight
        position={[2.7, 1.7, -1.5]}
        intensity={1.5}
        color="#8cc7b6"
        distance={3}
      />
      <group>
        <Box p={[0, -0.2, 0]} s={[9.4, 0.4, 7.4]} c="#44382a" round={0.08} />
        {Array.from({ length: 16 }, (_, i) =>
          Array.from({ length: 4 }, (_, j) => (
            <Box
              key={`${i}-${j}`}
              p={[
                -4.22 + i * 0.563,
                0.012,
                -2.66 + j * 1.77 + (i % 2 ? 0.0 : 0),
              ]}
              s={[0.55, 0.035, 1.75]}
              c={i % 3 === 0 ? "#c4b59b" : "#d3c3a6"}
              map={textures.wood}
            />
          )),
        )}
        <Box
          p={[0, 2, -3.5]}
          s={[9.25, 4, 0.14]}
          c="#c6b998"
          map={textures.wall}
        />
        <Box
          p={[-4.57, 2, 0]}
          s={[0.14, 4, 7.14]}
          c="#b6ac8e"
          map={textures.wall}
        />
        {Array.from({ length: 25 }, (_, i) => (
          <Box
            key={i}
            p={[-4.4 + i * 0.366, 0.58, -3.39]}
            s={[0.35, 1.15, 0.06]}
            c={i % 2 ? "#7f7050" : "#8f7d5c"}
            map={textures.wood}
          />
        ))}
        <Box p={[0, 1.17, -3.3]} s={[9.2, 0.065, 0.09]} c={wood} />
        <Box p={[0, 0.09, -3.3]} s={[9.2, 0.18, 0.09]} c={wood} />
        <Box p={[-4.44, 0.09, 0]} s={[0.09, 0.18, 7]} c={wood} />
        <Box p={[0, 3.96, -3.42]} s={[9.25, 0.1, 0.13]} c={wood} />
        {/* window, sill, crossbars and quiet scenery */}
        <group position={[-4.46, 2.6, -1.9]} rotation={[0, Math.PI / 2, 0]}>
          <Box s={[1.85, 1.85, 0.1]} c={wood} />
          <Box p={[0, 0, 0.065]} s={[1.6, 1.6, 0.07]} c="#a0b6b1" />
          {[-0.55, 0, 0.53].map((v, i) => (
            <mesh key={i} position={[v, -0.25, 0.11]}>
              <sphereGeometry args={[0.45, 16, 12]} />
              <meshBasicMaterial color={["#7e8c6a", "#8e9a79", "#b2ad7f"][i]} />
            </mesh>
          ))}
          <Box p={[0, 0, 0.16]} s={[0.055, 1.64, 0.1]} c={cream} />
          <Box p={[0, 0, 0.16]} s={[1.64, 0.055, 0.1]} c={cream} />
          <Box p={[0, -0.88, 0.22]} s={[2, 0.1, 0.4]} c={cream} />
          <Box p={[-1.02, 0.1, 0.12]} s={[0.22, 2.02, 0.13]} c="#b9ab83" />
          <Box p={[1.02, 0.1, 0.12]} s={[0.22, 2.02, 0.13]} c="#b9ab83" />
        </group>
        {/* work desk: walnut surface, drawers, detailed terminal */}
        <group position={[-1.85, 0, -2.15]}>
          <Box
            p={[0, 1.43, 0]}
            s={[3.4, 0.13, 1.35]}
            map={textures.wood}
            c="#a98258"
            round={0.045}
          />
          {[-1.48, 1.48].map((x) =>
            [-0.5, 0.5].map((z) => (
              <Box
                key={`${x}${z}`}
                p={[x, 0.7, z]}
                s={[0.075, 1.4, 0.075]}
                c={dark}
              />
            )),
          )}
          <Box p={[1.04, 0.92, 0]} s={[0.95, 0.92, 1.1]} c={wood} />
          {[0.64, 0.96, 1.28].map((y) => (
            <group key={y}>
              <Box p={[1.04, y, 0.57]} s={[0.88, 0.27, 0.06]} c="#916d48" />
              <Box p={[1.04, y, 0.61]} s={[0.26, 0.025, 0.035]} c={brass} />
            </group>
          ))}
          <Hotspot
            p={[-0.3, 1.5, -0.15]}
            title="Selected work"
            href="/work"
            onNavigate={onNavigate}
            marker={[0, 0.62, 0.14]}
          >
            <Box
              p={[0, 0.12, 0]}
              s={[0.58, 0.1, 0.38]}
              c={cream}
              round={0.03}
            />
            <Box p={[0, 0.3, -0.07]} s={[0.14, 0.4, 0.12]} c={dark} />
            <Box
              p={[0, 0.62, -0.08]}
              s={[1.32, 0.85, 0.2]}
              c="#d2c7a7"
              round={0.065}
            />
            <mesh position={[0, 0.62, 0.027]}>
              <planeGeometry args={[1.13, 0.65]} />
              <meshStandardMaterial
                map={textures.screen}
                emissiveMap={textures.screen}
                emissive="#a5cba5"
                emissiveIntensity={0.4}
              />
            </mesh>
            <Box
              p={[0, 0.018, 0.38]}
              s={[1.08, 0.055, 0.35]}
              c="#c7c0a7"
              round={0.025}
            />
            {Array.from({ length: 4 }, (_, i) =>
              Array.from({ length: 12 }, (_, j) => (
                <Box
                  key={`${i}${j}`}
                  p={[-0.47 + j * 0.084, 0.053, 0.26 + i * 0.07]}
                  s={[0.062, 0.018, 0.045]}
                  c={i % 2 ? "#b8b39c" : "#dcd5b9"}
                />
              )),
            )}
          </Hotspot>
          <Hotspot
            p={[-1.25, 1.53, -0.1]}
            title="Turn the lamp on / off"
            href="lamp"
            onNavigate={onNavigate}
            marker={[0, 0.9, 0]}
          >
            <Cylinder p={[0, 0.025, 0]} radius={0.22} height={0.05} c={green} />
            <Rod a={[0, 0.05, 0]} b={[0.1, 0.65, -0.12]} r={0.027} c={brass} />
            <Rod
              a={[0.1, 0.65, -0.12]}
              b={[0.35, 0.88, 0]}
              r={0.027}
              c={brass}
            />
            <mesh position={[0.36, 0.8, 0]} rotation={[0, 0, -0.35]} castShadow>
              <coneGeometry args={[0.27, 0.3, 32, 1, true]} />
              <meshStandardMaterial color={green} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.36, 0.72, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial
                color="#fff1bd"
                emissive="#ffc674"
                emissiveIntensity={night ? 3 : 1}
              />
            </mesh>
          </Hotspot>
          <Hotspot
            p={[0.72, 1.53, 0.25]}
            title="Currently / Now"
            href="/now"
            onNavigate={onNavigate}
            marker={[0, 0.16, 0]}
          >
            <Box s={[0.5, 0.045, 0.35]} c="#c7bea0" r={[0, -0.2, 0]} />
            <Box
              p={[0, 0.027, 0]}
              s={[0.45, 0.008, 0.31]}
              c="#e9dfbd"
              r={[0, -0.2, 0]}
            />
            <Rod
              a={[-0.2, 0.05, 0.14]}
              b={[0.18, 0.05, -0.08]}
              r={0.012}
              c={dark}
            />
          </Hotspot>
          <Hotspot
            p={[-1.15, 1.57, 0.43]}
            title="A note about me"
            href="/about"
            onNavigate={onNavigate}
            marker={[0, 0.03, 0]}
          >
            <Box s={[0.38, 0.009, 0.26]} c="#e3c875" r={[0, 0.22, 0]} />
            <Box p={[0, 0.006, 0]} s={[0.24, 0.004, 0.01]} c="#937e46" />
          </Hotspot>
          <Cylinder
            p={[-0.93, 1.65, 0.22]}
            radius={0.09}
            height={0.25}
            c="#e4d8b4"
          />
        </group>
        {/* curved upholstered desk chair */}
        <group position={[-1.8, 0, -0.15]} rotation={[0, -0.16, 0]}>
          <Cylinder p={[0, 0.53, 0]} radius={0.34} height={0.12} c={green} />
          <Rod a={[0, 0.13, 0]} b={[0, 0.53, 0]} r={0.05} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Rod
              key={i}
              a={[0, 0.13, 0]}
              b={[Math.sin(i * 1.256) * 0.36, 0.08, Math.cos(i * 1.256) * 0.36]}
              r={0.026}
            />
          ))}
          <Box
            p={[0, 0.98, 0.26]}
            s={[0.65, 0.65, 0.15]}
            c={green}
            round={0.12}
          />
          <Rod a={[-0.23, 0.55, 0.23]} b={[-0.23, 0.98, 0.26]} r={0.025} />
          <Rod a={[0.23, 0.55, 0.23]} b={[0.23, 0.98, 0.26]} r={0.025} />
        </group>
        {/* gallery of original poster textures */}
        <Frame
          p={[-2.6, 2.9, -3.27]}
          title="ORGANIC|GROWTH"
          index={0}
          onClick={() => onNavigate("/work/concat-pro")}
        />
        <Frame
          p={[-0.94, 2.94, -3.27]}
          title="STAY|CURIOUS"
          index={1}
          size={[1.15, 1.45]}
          onClick={() => onNavigate("/work/stardesk-reddit")}
        />
        <Frame
          p={[0.6, 3.05, -3.27]}
          title="MAKE|SOME NOISE"
          index={2}
          size={[0.9, 1.2]}
          onClick={() => onNavigate("/work/stardesk-tiktok")}
        />
        <Frame
          p={[0.55, 1.98, -3.27]}
          title="TOGETHER"
          index={3}
          size={[0.7, 0.65]}
          onClick={() => onNavigate("/work/stardesk-discord")}
        />
        {/* bookshelf on left wall */}
        <Hotspot
          p={[-3.98, 0, 0.9]}
          title="Notes & marginalia"
          href="/notes"
          onNavigate={onNavigate}
          marker={[0.3, 2.2, 0.35]}
        >
          <group rotation={[0, Math.PI / 2, 0]}>
            <Box p={[-0.76, 1.12, 0]} s={[0.08, 2.24, 0.54]} c={wood} />
            <Box p={[0.76, 1.12, 0]} s={[0.08, 2.24, 0.54]} c={wood} />
            {[0.12, 0.78, 1.44, 2.14].map((y) => (
              <Box
                key={y}
                p={[0, y, 0]}
                s={[1.58, 0.08, 0.57]}
                c="#7f5c3e"
                map={textures.wood}
              />
            ))}
            {[0, 1, 2].map((row) =>
              Array.from({ length: row === 2 ? 6 : 9 }, (_, i) => (
                <Book
                  key={`${row}${i}`}
                  p={[-0.6 + i * 0.14, 0.43 + row * 0.67, 0]}
                  height={0.43 + (i % 3) * 0.06}
                  width={0.11}
                  c={
                    ["#64704e", "#c1ad7e", "#a0694e", "#bdc0a2", "#4f6d70"][
                      i % 5
                    ]
                  }
                  rotation={i === 6 ? -0.12 : 0}
                />
              )),
            )}
            <Box p={[0.37, 1.72, 0]} s={[0.41, 0.45, 0.36]} c="#bfbaa0" />
            <Cylinder
              p={[0.37, 1.72, 0.19]}
              radius={0.12}
              height={0.02}
              c={dark}
              r={[Math.PI / 2, 0, 0]}
            />
          </group>
        </Hotspot>
        <Plant p={[-3.95, 2.2, 0.5]} scale={0.65} />
        {/* television cabinet and console */}
        <group position={[2.5, 0, -2.15]}>
          <Box
            p={[0, 0.57, 0]}
            s={[2.65, 0.8, 0.9]}
            c={wood}
            map={textures.wood}
            round={0.035}
          />
          {[-1.05, 1.05].map((x) =>
            [-0.3, 0.3].map((z) => (
              <Box
                key={`${x}${z}`}
                p={[x, 0.14, z]}
                s={[0.1, 0.28, 0.1]}
                c={dark}
              />
            )),
          )}
          <Box p={[0, 0.57, 0.46]} s={[2.4, 0.6, 0.025]} c="#4d3e2b" />
          {[-0.78, 0, 0.78].map((x) => (
            <Box key={x} p={[x, 0.57, 0.5]} s={[0.72, 0.02, 0.04]} c={wood} />
          ))}
          <Hotspot
            p={[-0.12, 1.02, 0]}
            title="Playground"
            href="/playground"
            onNavigate={onNavigate}
            marker={[0.1, 1, 0.15]}
          >
            <Box
              p={[0, 0.45, 0]}
              s={[1.5, 0.91, 0.65]}
              c="#43493c"
              round={0.09}
            />
            <Box
              p={[-0.1, 0.45, 0.34]}
              s={[1.16, 0.71, 0.05]}
              c={dark}
              round={0.08}
            />
            <mesh position={[-0.1, 0.45, 0.375]}>
              <planeGeometry args={[1.03, 0.58]} />
              <meshStandardMaterial
                map={textures.tv}
                emissiveMap={textures.tv}
                emissive="#a1bdcb"
                emissiveIntensity={0.55}
              />
            </mesh>
            {[0.33, 0.59].map((y) => (
              <Cylinder
                key={y}
                p={[0.6, y, 0.35]}
                radius={0.065}
                height={0.03}
                c={brass}
                r={[Math.PI / 2, 0, 0]}
              />
            ))}
            <Rod a={[-0.2, 0.9, 0]} b={[-0.55, 1.35, 0]} r={0.014} />
            <Rod a={[-0.2, 0.9, 0]} b={[0.3, 1.35, 0]} r={0.014} />
          </Hotspot>
          <Hotspot
            p={[0.85, 1.03, 0.08]}
            title="Small games, big ideas"
            href="/playground"
            onNavigate={onNavigate}
            marker={[0, 0.22, 0]}
          >
            <Box s={[0.48, 0.13, 0.48]} c="#b7b8a7" round={0.025} />
            <Cylinder
              p={[0, 0.073, 0]}
              radius={0.15}
              height={0.015}
              c="#989c8d"
            />
            <Box
              p={[0, -0.48, 0.53]}
              s={[0.4, 0.1, 0.18]}
              c="#aaa993"
              round={0.04}
            />
          </Hotspot>
          <Book p={[-0.9, 0.48, 0.3]} width={0.13} height={0.4} c="#929978" />
          <Book p={[-0.72, 0.48, 0.3]} width={0.13} height={0.4} c="#c4b08d" />
        </group>
        {/* wall clock */}
        <group position={[3.45, 3.05, -3.28]}>
          <Cylinder
            radius={0.4}
            height={0.08}
            c={wood}
            r={[Math.PI / 2, 0, 0]}
          />
          <Cylinder
            p={[0, 0, 0.05]}
            radius={0.345}
            height={0.015}
            c={cream}
            r={[Math.PI / 2, 0, 0]}
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Box
              key={i}
              p={[
                Math.sin((i * Math.PI) / 6) * 0.285,
                Math.cos((i * Math.PI) / 6) * 0.285,
                0.068,
              ]}
              s={[0.016, 0.03, 0.005]}
              c={dark}
              r={[0, 0, (-i * Math.PI) / 6]}
            />
          ))}
          <Rod a={[0, 0, 0.09]} b={[-0.19, 0.1, 0.09]} r={0.012} />
          <Rod a={[0, 0, 0.09]} b={[0.1, 0.22, 0.09]} r={0.009} />
        </group>
        {/* record console in foreground */}
        <group position={[2.7, 0, 1.7]}>
          <Box
            p={[0, 0.64, 0]}
            s={[1.8, 0.85, 0.95]}
            c="#956c45"
            map={textures.wood}
            round={0.04}
          />
          <Box p={[0, 0.62, 0.49]} s={[1.63, 0.63, 0.03]} c="#40382a" />
          <Box p={[0, 0.61, 0.51]} s={[0.06, 0.66, 0.05]} c={wood} />
          {[-0.7, 0.7].map((x) =>
            [-0.33, 0.33].map((z) => (
              <Box
                key={`${x}${z}`}
                p={[x, 0.17, z]}
                s={[0.08, 0.35, 0.08]}
                c={dark}
              />
            )),
          )}
          {Array.from({ length: 7 }, (_, i) => (
            <Book
              key={i}
              p={[-0.62 + i * 0.075, 0.62, 0.37]}
              height={0.48}
              width={0.055}
              c={["#ad6749", "#b8bd93", "#c0a572", "#6c8283"][i % 4]}
              rotation={-0.1}
            />
          ))}
          <Box p={[0.42, 0.48, 0.35]} s={[0.6, 0.13, 0.38]} c="#c3b797" />
          <Hotspot
            p={[0, 1.12, 0]}
            title="The music shelf"
            href="/music"
            onNavigate={onNavigate}
            marker={[0, 0.4, 0]}
          >
            <Box s={[1.32, 0.12, 0.76]} c="#4c3e2b" round={0.035} />
            <Record p={[-0.18, 0.075, 0]} reduced={reduced} />
            <Rod
              a={[0.49, 0.1, -0.22]}
              b={[0.48, 0.14, 0.16]}
              r={0.018}
              c={brass}
            />
            <Rod
              a={[0.48, 0.14, 0.16]}
              b={[0.18, 0.14, 0.23]}
              r={0.018}
              c={brass}
            />
            <Box p={[0.43, 0.1, 0.27]} s={[0.09, 0.05, 0.06]} c={cream} />
          </Hotspot>
          <Hotspot
            p={[-0.47, 1.48, -0.32]}
            title="Album Roulette"
            href="/playground/album-roulette"
            onNavigate={onNavigate}
            marker={[0, 0.42, 0.01]}
          >
            <Box s={[0.6, 0.65, 0.03]} c="#c1c08a" r={[0.12, 0, -0.1]} />
            <Cylinder
              p={[0, 0, 0.03]}
              radius={0.23}
              height={0.01}
              c="#d8754b"
              r={[Math.PI / 2, 0, 0]}
            />
            <Cylinder
              p={[0, 0, 0.04]}
              radius={0.08}
              height={0.01}
              c={cream}
              r={[Math.PI / 2, 0, 0]}
            />
          </Hotspot>
        </group>
        {/* woven rug, cushions, coffee table and ephemera */}
        <Box
          p={[0.0, 0.055, 0.8]}
          s={[3.5, 0.025, 3.05]}
          c="#ece5cb"
          map={textures.rug}
        />
        {Array.from({ length: 32 }, (_, i) => (
          <Rod
            key={i}
            a={[-1.72 + i * 0.11, 0.06, 2.32]}
            b={[-1.72 + i * 0.11, 0.06, 2.44]}
            r={0.009}
            c="#b9af8c"
          />
        ))}
        <group position={[-0.25, 0, 0.95]}>
          <Cylinder p={[0, 0.5, 0]} radius={0.62} height={0.09} c="#a57c4f" />
          {[0, 1, 2].map((i) => (
            <Rod
              key={i}
              a={[Math.sin(i * 2.094) * 0.35, 0.47, Math.cos(i * 2.094) * 0.35]}
              b={[Math.sin(i * 2.094) * 0.46, 0.08, Math.cos(i * 2.094) * 0.46]}
              r={0.045}
              c={wood}
            />
          ))}
          <Box
            p={[-0.12, 0.57, 0.06]}
            s={[0.48, 0.07, 0.34]}
            c="#bc784f"
            r={[0, 0.2, 0]}
          />
          <Box
            p={[-0.12, 0.62, 0.06]}
            s={[0.45, 0.025, 0.31]}
            c={cream}
            r={[0, 0.2, 0]}
          />
          <Cylinder
            p={[0.27, 0.64, -0.17]}
            radius={0.085}
            height={0.2}
            c="#e0d5b8"
          />
          <Cylinder
            p={[0.27, 0.745, -0.17]}
            radius={0.067}
            height={0.006}
            c="#53422b"
          />
        </group>
        <Box
          p={[-2.6, 0.28, 2.06]}
          s={[1.1, 0.42, 0.95]}
          c="#a77d50"
          round={0.18}
          r={[0, 0.3, 0]}
        />
        <Box
          p={[-2.65, 0.55, 2.05]}
          s={[0.74, 0.17, 0.7]}
          c="#b6b08b"
          round={0.07}
          r={[0, 0.3, 0]}
        />
        <Plant p={[3.95, 0, -0.2]} scale={1.45} />
        <Plant p={[-3.5, 0, 2.8]} scale={1.05} />
        {/* paper star, house mascot, and floor magazines */}
        <Hotspot
          p={[1.19, 0.22, 2.65]}
          title="A tiny room friend"
          href="egg"
          onNavigate={onNavigate}
          marker={[0, 0.3, 0]}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.18, 24, 16]} />
            <meshStandardMaterial color="#c4be87" />
          </mesh>
          {[-0.08, 0.08].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.18, 0]}>
                <sphereGeometry args={[0.065, 16, 12]} />
                <meshStandardMaterial color="#c4be87" />
              </mesh>
              <mesh position={[x, 0.19, 0.052]}>
                <sphereGeometry args={[0.019, 8, 8]} />
                <meshStandardMaterial color={dark} />
              </mesh>
            </group>
          ))}
          <Box
            p={[0, -0.1, 0.12]}
            s={[0.12, 0.02, 0.03]}
            c="#7c8556"
            round={0.008}
          />
        </Hotspot>
        <Box
          p={[0.95, 0.09, -0.35]}
          s={[0.58, 0.07, 0.42]}
          c="#738f8a"
          r={[0, -0.3, 0]}
        />
        <Box
          p={[0.95, 0.14, -0.35]}
          s={[0.52, 0.025, 0.38]}
          c="#dfcb98"
          r={[0, -0.15, 0]}
        />
        {/* The little evidence of a room being lived in. */}
        <group position={[-4.44, 2.95, 1.65]} rotation={[0, Math.PI / 2, 0]}>
          <Box s={[1.4, 0.95, 0.06]} c="#8a694a" />
          <Box p={[0, 0, 0.04]} s={[1.3, 0.85, 0.02]} c="#c4b28a" />
          {[-0.38, 0, 0.37].map((x, i) => (
            <group
              key={i}
              position={[x, 0, 0.065]}
              rotation={[0, 0, (i - 1) * 0.09]}
            >
              <Box
                s={[0.31, 0.46, 0.005]}
                c={["#dfcc8c", "#e8ddba", "#aab89a"][i]}
              />
              <Cylinder
                p={[0, 0.18, 0.01]}
                radius={0.018}
                height={0.013}
                r={[Math.PI / 2, 0, 0]}
                c={brass}
              />
              {[0, 1, 2, 3].map((j) => (
                <Box
                  key={j}
                  p={[0, 0.07 - j * 0.06, 0.01]}
                  s={[0.21, 0.007, 0.002]}
                  c="#8f967b"
                />
              ))}
            </group>
          ))}
        </group>
        <group position={[-3.4, 0.2, -2.2]}>
          <Box
            p={[0, 0.43, 0]}
            s={[0.34, 0.86, 0.63]}
            c="#393d31"
            round={0.02}
          />
          <Box p={[0.18, 0.43, 0]} s={[0.012, 0.73, 0.5]} c="#656553" />
          {Array.from({ length: 10 }, (_, i) => (
            <Box
              key={i}
              p={[0.191, 0.18 + i * 0.05, 0]}
              s={[0.012, 0.015, 0.41]}
              c="#33382b"
            />
          ))}
          <Cylinder
            p={[0.2, 0.71, 0]}
            radius={0.025}
            height={0.02}
            r={[0, 0, Math.PI / 2]}
            c="#afc67f"
          />
        </group>
        <group position={[3.9, 0, 2.45]} rotation={[0, -0.22, 0]}>
          <Box p={[0, 0.24, 0]} s={[0.62, 0.42, 0.62]} c="#8d6d49" />
          {[-0.3, 0.3].map((x) => (
            <Box key={x} p={[x, 0.46, 0]} s={[0.035, 0.15, 0.65]} c="#b09468" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <Box
              key={i}
              p={[0, 0.52, -0.23 + i * 0.085]}
              s={[0.51, 0.6, 0.035]}
              c={
                [
                  "#77846a",
                  "#b68360",
                  "#c6b48a",
                  "#d5c7a1",
                  "#687e80",
                  "#a8997d",
                ][i]
              }
              r={[-0.16, 0, 0]}
            />
          ))}
          <Box p={[0, 0.31, 0.32]} s={[0.2, 0.07, 0.006]} c={dark} />
        </group>
        <group position={[1.5, 0, -2.8]}>
          <Rod a={[0, 0.1, 0]} b={[0, 3.13, 0]} r={0.032} c={brass} />
          <Cylinder p={[0, 0.05, 0]} radius={0.3} height={0.07} c={dark} />
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.29, 0.47, 0.6, 48, 1, true]} />
            <meshStandardMaterial
              color="#d5c49c"
              side={THREE.DoubleSide}
              roughness={1}
            />
          </mesh>
          <Cylinder p={[0, 2.72, 0]} radius={0.43} height={0.018} c="#e2d3ac" />
          <pointLight
            position={[0, 2.7, 0]}
            intensity={night ? 7 : 1.4}
            color="#ffc982"
            distance={5}
          />
        </group>
        <group position={[1.02, 1.64, -3.18]}>
          <Box s={[0.33, 0.42, 0.02]} c="#d6ca9e" r={[0, 0, 0.09]} />
          <Box p={[0, 0.13, 0.018]} s={[0.1, 0.05, 0.005]} c="#bcb083" />
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              p={[0, 0.02 - i * 0.07, 0.018]}
              s={[0.21, 0.012, 0.003]}
              c="#8a8f70"
            />
          ))}
        </group>
        {/* A slack cable, not an impossible floating connection. */}
        <Rod
          a={[-2.15, 1.5, -2.52]}
          b={[-2.15, 0.25, -2.7]}
          r={0.012}
          c="#3c382a"
        />
        <Rod
          a={[-2.15, 0.25, -2.7]}
          b={[-3.3, 0.18, -2.25]}
          r={0.012}
          c="#3c382a"
        />
      </group>
      <ContactShadows
        position={[0, -0.025, 0]}
        opacity={0.32}
        scale={18}
        blur={2.5}
        far={7}
        resolution={512}
        frames={1}
      />
    </>
  );
}
export default function RoomScene(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [8.3, 6.4, 11.4], fov: 39, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <Suspense fallback={null}>
        <SoftShadows size={18} samples={8} focus={0.5} />
        <World {...props} />
        <CameraRig
          path={props.path}
          reduced={props.reduced}
          reset={props.reset}
          immersive={props.immersive}
        />
      </Suspense>
    </Canvas>
  );
}


