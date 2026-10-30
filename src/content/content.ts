export type Entry = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  paragraphs: string[];
  draft?: boolean;
  color?: string;
};
export const work: Entry[] = [
  {
    slug: "concat-pro",
    title: "Concat Pro",
    category: "SEO / GEO · ORGANIC GROWTH",
    summary: "Helping a product find its people, one useful answer at a time.",
    draft: true,
    color: "#b7bd88",
    paragraphs: [
      "Focus: SEO and generative engine optimization for organic discovery.",
      "This case study is a draft. Research, specific responsibilities, execution examples, dates and verified outcomes have not yet been supplied. No performance results are claimed.",
      "To complete: add the starting problem, search research, content and technical changes, measurement method, and evidence-backed results.",
    ],
  },
  {
    slug: "stardesk-reddit",
    title: "Stardesk / In the conversation",
    category: "REDDIT · GEO GROWTH",
    summary:
      "Exploring the intersection of community conversations and discovery.",
    draft: true,
    color: "#d69570",
    paragraphs: [
      "Focus: Reddit and GEO growth for Stardesk.",
      "This case study is a draft awaiting first-hand context and supporting evidence. The project topic was supplied; specific tactics and outcomes are not yet documented.",
      "To complete: add relevant communities, contribution principles, work examples, attribution limits, and verified learnings.",
    ],
  },
  {
    slug: "stardesk-tiktok",
    title: "Stardesk / Made to scroll",
    category: "TIKTOK · CONTENT STRATEGY",
    summary: "A content matrix for a moving, very human feed.",
    draft: true,
    color: "#8aada9",
    paragraphs: [
      "Focus: a TikTok content matrix for Stardesk.",
      "Draft: the original brief supplies the subject, but not the content pillars, production process, results or examples.",
      "To complete: document audience hypotheses, creative formats, sample posts, testing cadence, and verified outcomes.",
    ],
  },
  {
    slug: "stardesk-discord",
    title: "Stardesk / A place to belong",
    category: "DISCORD · COMMUNITY GROWTH",
    summary:
      "Thinking about the systems that help a community feel like a place.",
    draft: true,
    color: "#a69dc0",
    paragraphs: [
      "Focus: Discord community growth for Stardesk.",
      "Draft awaiting project details. Community size, engagement figures, and claims of impact are intentionally omitted.",
      "To complete: describe member needs, onboarding, moderation, community rituals, and evidence-backed observations.",
    ],
  },
];
export const playground: Entry[] = [
  {
    slug: "album-roulette",
    title: "Album Roulette",
    category: "A LITTLE SERENDIPITY",
    summary: "Put your algorithm on a coffee break. Find something unexpected.",
    paragraphs: [
      "A small listening prompt generator. Pull a card, find a record that fits, and listen from beginning to end. No streaming account needed.",
    ],
  },
  {
    slug: "and-kwi",
    title: "And Kwi",
    category: "IDEA ON THE WORKBENCH",
    summary: "An independent experiment, still taking shape.",
    draft: true,
    paragraphs: [
      "The name of this project was supplied without a description. This is a clearly marked draft space for its future story, links and working demo.",
    ],
  },
  {
    slug: "do-you-geo",
    title: "Do You GEO?",
    category: "SEARCH CURIOSITY",
    summary: "A pocket checklist for thinking about AI discovery.",
    paragraphs: [
      "This local checklist helps organize questions; it does not query search engines or grade a live website.",
      "Make useful answers easy to find, cite and verify. Start with these questions, then test against real queries.",
    ],
  },
  {
    slug: "sticker-generator",
    title: "Sticker Generator",
    category: "SMALL THINGS, BIG FEELINGS",
    summary: "Make a tiny typographic sticker. Take it with you.",
    paragraphs: [
      "Type a phrase, choose a color, and download an original SVG sticker. Everything runs in your browser.",
    ],
  },
];
export const notes: Entry[] = [
  {
    slug: "a-place-for-unfinished-things",
    title: "A place for unfinished things",
    category: "STUDIO NOTE · EDITORIAL DRAFT",
    summary: "A room can hold the work before it knows what it wants to be.",
    draft: true,
    paragraphs: [
      "Editorial draft written for this website, not a previously published personal essay.",
      "The most useful corner of a room is sometimes the one without a name. A stack of records, a half-filled notebook, an idea that has not become a project yet.",
      "This website makes room for those things alongside finished work. Replace this draft with your own notes whenever you are ready.",
    ],
  },
  {
    slug: "beyond-the-search-box",
    title: "Beyond the search box",
    category: "DISCOVERY · OUTLINE",
    summary: "Questions at the meeting point of search, community, and AI.",
    draft: true,
    paragraphs: [
      "Draft outline: How do people discover products when their first stop is a conversation?",
      "Questions to investigate: What makes an answer worth citing? How do community recommendations influence search behavior? What can we measure reliably?",
      "Add original research, sources, and examples before publishing this as a substantive article.",
    ],
  },
];
export const listeningPrompts = [
  "A record released before you were born.",
  "An album with a green cover.",
  "A soundtrack to a place you have never been.",
  "A record recommended by a friend.",
  "Something recorded live, with all the imperfections.",
  "An album you loved five years ago.",
  "A debut album, from first track to last.",
  "A record in a language you do not speak.",
];
export const destinations = [
  { href: "/work", label: "Work", detail: "At the desk", key: "work" },
  {
    href: "/playground",
    label: "Playground",
    detail: "On the television",
    key: "playground",
  },
  { href: "/notes", label: "Notes", detail: "On the shelf", key: "notes" },
  { href: "/music", label: "Music", detail: "By the turntable", key: "music" },
  { href: "/about", label: "About", detail: "A note for you", key: "about" },
  { href: "/now", label: "Now", detail: "In the notebook", key: "now" },
];
