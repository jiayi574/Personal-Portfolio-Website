"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowLeft, Shuffle, Download } from "lucide-react";
import {
  work,
  playground,
  notes,
  listeningPrompts,
  type Entry,
} from "@/content/content";
function Cards({ items, base }: { items: Entry[]; base: string }) {
  return (
    <div className="entries">
      {items.map((e, i) => (
        <Link className="entry" href={`${base}/${e.slug}`} key={e.slug}>
          <div
            className="entry-art"
            style={{
              background:
                e.color || ["#bdbe91", "#b7906c", "#9eaeb0", "#baa7ae"][i % 4],
            }}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <i />
            <b>
              {base === "/work"
                ? "FIELD NOTES"
                : base === "/notes"
                  ? "MARGINALIA"
                  : "PLAY / PAUSE"}
            </b>
          </div>
          <small>
            {e.category}
            {e.draft ? " · DRAFT" : ""}
          </small>
          <h3>
            {e.title}
            <ArrowUpRight size={20} />
          </h3>
          <p>{e.summary}</p>
        </Link>
      ))}
    </div>
  );
}
function Roulette() {
  const [index, setIndex] = useState(-1);
  return (
    <div className="experiment roulette">
      <span className="record-disc">♪</span>
      <small>NO ALGORITHM. JUST A LITTLE CHANCE.</small>
      <h3 aria-live="polite">
        {index < 0 ? "What will you listen to next?" : listeningPrompts[index]}
      </h3>
      <button
        className="solid"
        onClick={() =>
          setIndex(
            (i) =>
              (i +
                1 +
                Math.floor(Math.random() * (listeningPrompts.length - 1))) %
              listeningPrompts.length,
          )
        }
      >
        <Shuffle size={16} /> Pull a listening prompt
      </button>
    </div>
  );
}
function Sticker() {
  const [text, setText] = useState("stay curious.");
  const [color, setColor] = useState("#b9c68b");
  function download() {
    const escaped = text.replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[c]!,
    );
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><rect x="12" y="12" width="776" height="276" rx="130" fill="${color}" stroke="#f8f3e7" stroke-width="24"/><text x="400" y="169" text-anchor="middle" font-family="Georgia,serif" font-size="54" fill="#292b21">${escaped}</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "room-sticker.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="experiment">
      <div className="sticker" style={{ background: color }}>
        {text || "your words here"}
      </div>
      <label>
        Your little reminder
        <input
          value={text}
          maxLength={28}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <label>
        Paper color
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>
      <button className="solid" onClick={download}>
        <Download size={16} /> Download SVG
      </button>
    </div>
  );
}
function Geo() {
  const questions = [
    "Does each page answer a clear, specific question?",
    "Can a reader verify your claims with original sources?",
    "Is the main content accessible without JavaScript?",
    "Are authorship and update dates visible?",
    "Have you tested discovery with real audience queries?",
  ];
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <div className="experiment">
      <small>
        {checked.length} / {questions.length} QUESTIONS CONSIDERED
      </small>
      {questions.map((q) => (
        <label className="check" key={q}>
          <input
            type="checkbox"
            checked={checked.includes(q)}
            onChange={() =>
              setChecked((c) =>
                c.includes(q) ? c.filter((x) => x !== q) : [...c, q],
              )
            }
          />
          {q}
        </label>
      ))}
    </div>
  );
}
export default function Content({ path }: { path: string }) {
  const parts = path.split("/").filter(Boolean);
  const section = parts[0];
  const items =
    section === "work" ? work : section === "playground" ? playground : notes;
  const item = parts[1] ? items.find((e) => e.slug === parts[1]) : undefined;
  if (parts[1] && !item)
    return (
      <>
        <small>NOT FOUND</small>
        <h2>This shelf is empty.</h2>
        <Link href={`/${section}`}>Back to {section}</Link>
      </>
    );
  if (item)
    return (
      <>
        <Link className="backlink" href={`/${section}`}>
          <ArrowLeft size={14} /> {section}
        </Link>
        <small className="eyebrow">
          {item.category}
          {item.draft ? " · DRAFT" : ""}
        </small>
        <h2>{item.title}</h2>
        <p className="lede">{item.summary}</p>
        {item.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {item.slug === "album-roulette" && <Roulette />}
        {item.slug === "sticker-generator" && <Sticker />}
        {item.slug === "do-you-geo" && <Geo />}
      </>
    );
  if (section === "work")
    return (
      <>
        <small className="eyebrow">01 / THE WORK DESK</small>
        <h2>
          Good things grow
          <br />
          <em>with intention.</em>
        </h2>
        <p className="lede">
          Product growth, search, and communities. A few things from my side of
          the desk.
        </p>
        <p className="draft-note">
          Case studies are drafts awaiting project details and verified results.
        </p>
        <Cards items={work} base="/work" />
      </>
    );
  if (section === "playground")
    return (
      <>
        <small className="eyebrow">02 / AFTER HOURS</small>
        <h2>
          For the joy
          <br />
          <em>of making.</em>
        </h2>
        <p className="lede">
          Small experiments, happy accidents, and ideas that escaped the
          notebook.
        </p>
        <Cards items={playground} base="/playground" />
      </>
    );
  if (section === "notes")
    return (
      <>
        <small className="eyebrow">03 / THE BOOKSHELF</small>
        <h2>
          Notes from
          <br />
          <em>the margins.</em>
        </h2>
        <p className="lede">
          A place to think out loud. These first pages are clearly marked
          editorial drafts.
        </p>
        <Cards items={notes} base="/notes" />
      </>
    );
  if (section === "music")
    return (
      <>
        <small className="eyebrow">04 / THE LISTENING CORNER</small>
        <h2>
          Life sounds better
          <br />
          <em>on the B-side.</em>
        </h2>
        <p className="lede">
          A little space for listening without doing anything else.
        </p>
        <div className="album-row">
          {["SIDE A", "SLOW DAYS", "AFTER HOURS"].map((s, i) => (
            <div className={`album album-${i}`} key={s}>
              <span>ROOM RECORDS</span>
              <strong>{s}</strong>
              <i />
            </div>
          ))}
        </div>
        <p className="draft-note">
          Original decorative sleeves, not a claim about your music collection.
          Add your own records in the content file.
        </p>
        <Roulette />
        <p>
          The sound switch plays an original, synthesized ambient loop. No
          commercial recordings are used.
        </p>
      </>
    );
  if (section === "about")
    return (
      <>
        <small className="eyebrow">05 / A NOTE FOR YOU</small>
        <h2>
          A curious mind.
          <br />
          <em>A room of my own.</em>
        </h2>
        <p className="lede">
          At the intersection of products, people, and the internet.
        </p>
        <p>
          My background spans overseas growth and product operations, AI product
          growth, SEO and GEO strategy, and social media and community growth.
        </p>
        <p>
          Outside that work: independent creative projects, music, games, and
          internet culture. This room brings those interests together, with
          space left for whatever comes next.
        </p>
        <h3>What I spend time thinking about</h3>
        <div className="tags">
          {[
            "AI product growth",
            "SEO / GEO",
            "Communities",
            "Content systems",
            "Creative experiments",
          ].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="paper-note">
          Make yourself at home.
          <br />
          <em>There is always room for one more idea.</em>
        </div>
        <p className="draft-note">
          Resume and contact links have not been supplied. Add real details
          before publishing.
        </p>
      </>
    );
  if (section === "now")
    return (
      <>
        <small className="eyebrow">06 / THE OPEN NOTEBOOK</small>
        <h2>
          A little more
          <br />
          <em>in the present.</em>
        </h2>
        <p className="lede">What this room is holding right now.</p>
        <div className="now-line">
          <span>BUILDING</span>
          <p>
            This small corner of the internet: a room for work, experiments, and
            interests.
          </p>
        </div>
        <div className="now-line">
          <span>ON THE DESK</span>
          <p>
            Four case study drafts, waiting for their stories and supporting
            evidence.
          </p>
        </div>
        <div className="now-line">
          <span>ON REPEAT</span>
          <p>The idea that useful things can also be playful.</p>
        </div>
        <p className="draft-note">
          Starter copy for the website, not a live personal status. Edit this
          page with your current activities.
        </p>
      </>
    );
  return (
    <>
      <small>NOT FOUND</small>
      <h2>A wrong turn.</h2>
      <Link href="/">Return to the room</Link>
    </>
  );
}
