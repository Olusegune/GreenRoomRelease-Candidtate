/** A curated "casting call": voices grouped by accent that can be added to the library in one step. Piper keys were checked
 *  against the public rhasspy/piper-voices catalogue on 2026-11-02. Accent comes from the voice's locale. Nobody at Greenroom
 *  has rated how convincing each one is, so every card has a preview and the notes stay factual. */
export interface PiperRole { kind: "piper"; key: string; name: string; accent: string; language: string; mb: number; use: string }
export interface WazobiaRole { kind: "wazobia"; voice: string; lang: "en" | "yo" | "ha" | "ig"; name: string; accent: string; language: string; use: string }
export interface DesignRecipe { kind: "design"; id: string; name: string; accent: string; description: string; line: string }
export type CastRole = PiperRole | WazobiaRole | DesignRecipe;

const p = (key: string, name: string, accent: string, language: string, mb: number, use: string): PiperRole => ({ kind: "piper", key, name, accent, language, mb, use });

export const PIPER_ROLES: PiperRole[] = [
  p("en_GB-alan-medium", "Alan", "British", "English", 63, "Narrator, documentary"),
  p("en_GB-alba-medium", "Alba", "Scottish", "English", 63, "Guide, storyteller"),
  p("en_GB-northern_english_male-medium", "Northern", "Northern English", "English", 63, "Everyman, shopkeeper"),
  p("en_GB-jenny_dioco-medium", "Jenny", "British", "English", 63, "Presenter, assistant"),
  p("en_GB-cori-high", "Cori", "British", "English", 114, "Audiobook, high quality"),
  p("en_US-lessac-high", "Lessac", "American", "English", 114, "Narrator, high quality"),
  p("en_US-amy-medium", "Amy", "American", "English", 63, "Assistant, explainer"),
  p("en_US-joe-medium", "Joe", "American", "English", 63, "Casual, podcast co-host"),
  p("en_US-john-medium", "John", "American", "English", 64, "Announcer, trailer"),
  p("en_US-kristin-medium", "Kristin", "American", "English", 64, "Ads, social"),
  p("en_US-bryce-medium", "Bryce", "American", "English", 64, "Younger male, game NPC"),
  p("en_US-kusal-medium", "Kusal", "American", "English", 63, "Calm lecturer"),
  p("es_MX-claude-high", "Claude", "Mexican", "Spanish", 63, "Dialogue, narration"),
  p("es_AR-daniela-high", "Daniela", "Argentine", "Spanish", 114, "Dialogue, narration"),
  p("es_ES-davefx-medium", "Davefx", "Castilian", "Spanish", 63, "Narration"),
  p("fr_FR-siwis-medium", "Siwis", "French", "French", 63, "Narration, dialogue"),
  p("fr_FR-tom-medium", "Tom", "French", "French", 64, "Dialogue"),
  p("de_DE-thorsten-medium", "Thorsten", "German", "German", 63, "Narration"),
  p("pt_BR-faber-medium", "Faber", "Brazilian", "Portuguese", 63, "Narration"),
  p("hi_IN-priyamvada-medium", "Priyamvada", "Indian", "Hindi", 64, "Narration, dialogue"),
  p("hi_IN-rohan-medium", "Rohan", "Indian", "Hindi", 63, "Dialogue"),
  p("ko_KR-kss-medium", "KSS", "Korean", "Korean", 63, "Narration"),
  p("ar_JO-kareem-medium", "Kareem", "Jordanian", "Arabic", 63, "Narration"),
  p("sw_CD-lanfrica-medium", "Lanfrica", "Congolese", "Swahili", 63, "Narration"),
];

const WAZOBIA_NAMES = ["adaeze", "amara", "bolaji", "elder_deji", "emeka", "hauwa", "ife", "james", "john", "musa", "ngozi", "tunde", "wura"];
const LANGS = [["en", "Nigerian English", "Nigerian"], ["yo", "Yoruba", "Yoruba"], ["ha", "Hausa", "Hausa"], ["ig", "Igbo", "Igbo"]] as const;
const title = (v: string) => v.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
export const WAZOBIA_ROLES: WazobiaRole[] = LANGS.flatMap(([lang, language, accent]) =>
  WAZOBIA_NAMES.map((voice): WazobiaRole => ({ kind: "wazobia", voice, lang, name: title(voice), accent, language, use: "Pick by ear: voice names are not mapped to age or gender" })));

/** Written recipes for ElevenLabs Voice Design (paid). They open in Design a voice; nothing is spent until you generate. */
export const DESIGN_RECIPES: DesignRecipe[] = [
  { kind: "design", id: "lagos-trader", name: "Lagos market trader", accent: "Nigerian English", description: "A warm, quick-witted woman in her mid-forties from Lagos, speaking Nigerian English with a lively, slightly raspy voice, projecting over market noise, friendly but shrewd.", line: "Madam, come and see! Fresh fish today, I will give you good price." },
  { kind: "design", id: "yoruba-elder", name: "Yoruba elder", accent: "Yoruba-accented English", description: "An elderly Yoruba man in his seventies, slow and deliberate, deep gravelly voice, speaking English with a Yoruba accent and proverb-like cadence, calm authority.", line: "A child who respects his elders will walk far, my son." },
  { kind: "design", id: "naija-teen", name: "Naija teenager", accent: "Nigerian Pidgin-influenced", description: "A confident Nigerian teenage boy, fast and playful, light voice, mixing Nigerian English and Pidgin rhythm, cheeky humour.", line: "Wahala no dey, I don sort am. Just relax." },
  { kind: "design", id: "cockney-detective", name: "London detective", accent: "British (London)", description: "A weary London detective in his fifties, low and gravelly, dry understatement, slow pace, cigarette-roughened voice.", line: "I have seen this before. It never ends well." },
  { kind: "design", id: "southern-sheriff", name: "Southern sheriff", accent: "American (Southern)", description: "A big, easygoing Southern American sheriff in his sixties, slow drawl, warm baritone with a hint of menace.", line: "Now, son, I am going to ask you nicely one more time." },
  { kind: "design", id: "irish-storyteller", name: "Irish storyteller", accent: "Irish", description: "A lilting Irish woman in her sixties, soft and musical, a smile in the voice, storytelling pace with gentle pauses.", line: "Sit down now, and I will tell you how it all began." },
  { kind: "design", id: "jamaican-dj", name: "Kingston radio host", accent: "Jamaican", description: "An energetic Jamaican radio host in his thirties, deep and smooth, rhythmic, high charisma, big smile.", line: "Welcome back, you are locked in, and the vibes are right." },
  { kind: "design", id: "indian-professor", name: "Indian professor", accent: "Indian English", description: "A kind Indian English professor in her fifties, precise and clear, measured pace, patient and encouraging.", line: "Let us look at this problem step by step, together." },
  { kind: "design", id: "aussie-ranger", name: "Outback ranger", accent: "Australian", description: "A relaxed Australian park ranger in his forties, dry humour, medium-low voice, outdoors and unhurried.", line: "She will be right, mate. Just keep walking." },
  { kind: "design", id: "villain-whisper", name: "Whispering villain", accent: "Neutral British", description: "A calm, intimate villain, ageless, quiet breathy voice close to the microphone, precise and cold, never raising it.", line: "You really thought I would let you leave?" },
  { kind: "design", id: "child-narrator", name: "Curious child", accent: "Neutral American", description: "A curious eight-year-old child, bright and a little breathless, rising intonation, innocent and excited.", line: "Wait, what is that noise? Come on, let us go look!" },
  { kind: "design", id: "robot-assistant", name: "Gentle AI assistant", accent: "Neutral", description: "A gentle synthetic assistant voice, smooth and even, slightly airy, friendly with very subtle digital texture.", line: "I have found three routes. Shall I begin?" },
];
