"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Gamepad2,
  BookOpen,
  Disc3,
  UserRound,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Move,
  Plus,
  Minus,
  Compass,
  Menu,
  Clock3,
} from "lucide-react";
import Content from "./Content";
import { destinations } from "@/content/content";
const Scene = dynamic(() => import("./RoomScene"), { ssr: false });
const icons = [BriefcaseBusiness, Gamepad2, BookOpen, Disc3, UserRound, Clock3];
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function RoomApp() {
  const path = usePathname();
  const router = useRouter();
  const [immersive, setImmersive] = useState(false);
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reset, setReset] = useState(0);
  const [menu, setMenu] = useState(false);
  const [egg, setEgg] = useState(false);
  const [help, setHelp] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const opened = path !== "/";
  const onReady = useCallback(() => setReady(true), []);
  const close = useCallback(() => router.push("/"), [router]);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const update = () => setReduced(q.matches);
    q.addEventListener("change", update);
    const test = document.createElement("canvas");
    if (!test.getContext("webgl2")) {
      setFailed(true);
      setReady(true);
    }
    return () => q.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (opened) {
      previousFocus.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [opened]);
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (opened) close();
        setMenu(false);
        setHelp(false);
      }
      if (e.key === "Tab" && opened && panelRef.current) {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a,button,input,select,textarea,[tabindex="0"]',
          ),
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [opened, close]);
  useEffect(
    () => () => {
      audio.current?.close();
    },
    [],
  );
  function toggleAudio() {
    if (!audio.current) {
      const context = new AudioContext();
      audio.current = context;
      const g = context.createGain();
      gain.current = g;
      g.gain.value = 0;
      g.connect(context.destination);
      [130.81, 164.81, 196, 261.63].forEach((f, i) => {
        const o = context.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const voice = context.createGain();
        voice.gain.value = 0.025 / (i + 1);
        o.connect(voice);
        voice.connect(g);
        o.start();
      });
    }
    audio.current.resume();
    gain.current!.gain.setTargetAtTime(
      sound ? 0 : 0.6,
      audio.current.currentTime,
      0.3,
    );
    setSound(!sound);
  }
  function navigate(href: string) {
    if (href === "lamp") {
      setNight((x) => !x);
      return;
    }
    if (href === "egg") {
      setEgg(true);
      setTimeout(() => setEgg(false), 4500);
      return;
    }
    router.push(href);
    setMenu(false);
  }
  return (
    <main
      className={["app", night ? "night" : "", immersive ? "inside" : ""].join(
        " ",
      )}
    >
      <a className="skip" href="#room-navigation">
        Skip to navigation
      </a>
      <header className="masthead">
        <Link
          href="/"
          className="identity"
          aria-label="A Room of One’s Own home"
        >
          <span className="brand-mark">
            a<span>r</span>
          </span>
          <span>
            A Room of One’s Own<small>A LITTLE CORNER OF THE INTERNET</small>
          </span>
        </Link>
        <div className="header-note">
          <span className="status-dot" /> An ongoing collection of work & wonder
        </div>
        <button
          className="index-button"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
        >
          <Menu size={16} /> Room index
        </button>
      </header>
      <section
        className="room-stage"
        aria-label="Interactive three-dimensional personal studio"
      >
        <div className="room-caption">
          <small>WELCOME IN. STAY A WHILE.</small>
          <h1>
            Somewhere between
            <br />
            <em>work & play.</em>
          </h1>
          <p>My work, my curiosities, my kind of quiet.</p>
        </div>
        <div
          className="scene-canvas"
          aria-label="Drag to look around. Select an object to explore."
        >
          {!failed && (
            <SceneBoundary
              onFailure={() => {
                setFailed(true);
                setReady(true);
              }}
            >
              <Scene
                path={path}
                onNavigate={navigate}
                night={night}
                reduced={reduced}
                reset={reset}
                immersive={immersive}
                onReady={onReady}
              />
            </SceneBoundary>
          )}
        </div>
        <div className="scene-grain" />
        <div className="scene-vignette" />
        {!ready && !failed && (
          <div className="loading" role="status">
            <span className="loading-icon">✳</span>
            <p>Putting the records on the shelf…</p>
            <small>MAKING ROOM FOR YOU</small>
          </div>
        )}
        {failed && (
          <div className="fallback">
            <Compass size={32} />
            <h2>The room is taking a breather.</h2>
            <p>
              3D is unavailable on this device. Everything is still here —
              explore using the navigation below.
            </p>
          </div>
        )}
        <button className="enter-room" onClick={() => setImmersive((x) => !x)}>
          {immersive ? "See the whole room" : "Step inside"}
          <ArrowUpRight size={13} />
        </button>
        <div className="room-number">
          <span>ROOM 001</span>
          <small>AN OPEN DOOR, ALWAYS.</small>
        </div>
        <div className="room-tools">
          <button
            onClick={() => setNight(!night)}
            aria-label={night ? "Switch to daylight" : "Switch to evening"}
            title={night ? "Daylight" : "Evening"}
          >
            {night ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            onClick={toggleAudio}
            aria-label={sound ? "Mute ambient sound" : "Play ambient sound"}
            title={sound ? "Sound on" : "Sound off"}
          >
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <span />
          <button
            onClick={() => setReset((x) => x + 1)}
            aria-label="Reset camera"
            title="Reset view"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setHelp(!help)}
            aria-label="Room controls"
            aria-expanded={help}
          >
            <Compass size={17} />
          </button>
        </div>
        <div className="explore-hint">
          <span className="hint-line" />
          <span>
            Every object has a story.
            <br />
            <b>Find one that speaks to you.</b>
          </span>
          <ArrowUpRight size={18} />
        </div>
        <div className="gesture-hint">
          <Move size={13} />
          <span>DRAG TO LOOK · SCROLL TO ZOOM</span>
        </div>
        {help && (
          <div className="help-panel">
            <button
              aria-label="Close room controls"
              onClick={() => setHelp(false)}
            >
              <X size={15} />
            </button>
            <strong>Around the room</strong>
            <p>
              Drag to orbit. Scroll or pinch to zoom. Click a glowing dot or an
              object to open its story. Escape brings you home.
            </p>
            <p>Use the room index or navigation below with a keyboard.</p>
          </div>
        )}
        {egg && (
          <div className="egg" role="status">
            You found the room’s tiniest resident. 🐸
            <small>Keeper of unfinished ideas.</small>
          </div>
        )}
      </section>
      <footer className="room-footer">
        <div className="footer-intro">
          <span className="little-star">✳</span>
          <div>
            Make yourself at home.<small>THERE’S MORE THAN ONE WAY IN.</small>
          </div>
        </div>
        <nav id="room-navigation" aria-label="Explore the room">
          {destinations.slice(0, 5).map((d, i) => {
            const Icon = icons[i];
            return (
              <Link
                href={d.href}
                key={d.href}
                aria-current={path.startsWith(d.href) ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{d.label}</span>
                <ArrowUpRight size={12} />
              </Link>
            );
          })}
        </nav>
        <Link className="now-link" href="/now">
          <span className="status-dot" /> Now
          <ArrowUpRight size={13} />
        </Link>
      </footer>
      {menu && (
        <div className="menu-scrim" onClick={() => setMenu(false)}>
          <aside
            className="room-index"
            aria-label="Room index"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <small>FIND YOUR WAY</small>
              <button
                onClick={() => setMenu(false)}
                aria-label="Close room index"
              >
                <X size={20} />
              </button>
            </div>
            <h2>
              Everything
              <br />
              <em>has its place.</em>
            </h2>
            {destinations.map((d, i) => (
              <Link href={d.href} key={d.href} onClick={() => setMenu(false)}>
                <small>0{i + 1}</small>
                <span>
                  {d.label}
                  <small>{d.detail}</small>
                </span>
                <ArrowUpRight size={19} />
              </Link>
            ))}
            <Link href="/" onClick={() => setMenu(false)}>
              ↶ Back to the room
            </Link>
          </aside>
        </div>
      )}
      {opened && (
        <div className="content-scrim" onClick={close}>
          <section
            ref={panelRef}
            className="content-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${path.split("/")[1]} content`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-top">
              <Link href="/" className="panel-brand">
                A ROOM OF ONE’S OWN
              </Link>
              <button
                ref={closeRef}
                onClick={close}
                aria-label="Close and return to room"
              >
                Back to the room <X size={18} />
              </button>
            </div>
            <article key={path}>
              <Content path={path} />
            </article>
            <div className="panel-bottom">
              <span>A little corner of the internet.</span>
              <Link href="/">Return to the room ↶</Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
