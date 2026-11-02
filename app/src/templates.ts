/** Starting points on the home screen. Each is a short script in the normal `NAME: line` format, so it is edited like any other.
 *  A picture is optional: put `<id>.webp` in app/public/templates/ (see docs/TEMPLATE_ART_PROMPTS.md); without one the card shows a badge. */
export type TemplateGroup = "story" | "content";
export interface Template { id: string; title: string; tagline: string; group: TemplateGroup; script: string }

export const GROUP_LABEL: Record<TemplateGroup, string> = { story: "Stories and drama", content: "Content and business" };

export const TEMPLATES: Template[] = [
  {
    id: "animation", title: "Animation story", tagline: "Cartoon episodes, shorts", group: "story",
    script: `# Scene 1: The Glowing Path
NARRATOR (storybook warm): Deep in Lantern Wood, where the trees hum at night, a small fox named Pip found something that was not supposed to be there.
PIP (excited): [gasps] A robot! A real, actual robot, and he is stuck in the mud!
BOLO (robotic, sleepy): Greetings. I am Bolo. I appear to have been asleep for... [beeps] four hundred years.
PIP (laughs): Four hundred years? You must be starving.
BOLO: I run on moonlight. And kindness. Mostly moonlight.

# Scene 2: The Missing Moon
NARRATOR: But that very night, the moon went out like a candle, and the whole wood fell silent.
PIP (worried, whispering): Bolo, if you run on moonlight... what happens now?
BOLO (calm, a little brave): Now, Pip, we go and find it.
`,
  },
  {
    id: "bedtime", title: "Bedtime story", tagline: "Calm stories for children", group: "story",
    script: `# The Little Paper Boat
NARRATOR (soft, slow): Once, when the town was fast asleep, a little paper boat floated down the rain gutter, all the way to the edge of the world.
NARRATOR: The moon watched from above and said, very quietly, where are you going, little boat?
BOAT (tiny, sleepy voice): I am going to find the place where all the lost wishes go.
MOON (warm, gentle): Then follow my light. And do not worry. The night is long, and you are never alone.
NARRATOR (whispering): And so the little boat drifted on, rocking gently, gently, gently... until it, too, fell asleep.
`,
  },
  {
    id: "microdrama", title: "Micro-drama", tagline: "60-90 second episodes", group: "story",
    script: `# Episode 1: The Wrong Message
MAYA (shocked, low): You sent it to me. The message about the wedding. It was not meant for me.
DANIEL (panicked): Maya, wait. Let me explain.
MAYA (cold): Explain what? That you are marrying her on Saturday, or that you still wear the ring I gave you?
DANIEL (quietly): I was going to tell you tonight.
MAYA: [laughs bitterly] Tonight. Of course.
DANIEL (desperate): Please. Just give me one minute.
MAYA (turning to leave): You have used all of them.
VOICE ON PHONE (distant, urgent): Daniel? It is your bride. Why is there a woman's voice in your apartment?
`,
  },
  {
    id: "familydrama", title: "Family drama", tagline: "Kitchen-table stories", group: "story",
    script: `# Scene 1: Sunday Dinner
MAMA (warm, firm): Everyone sit. The food is getting cold, and so is my patience.
KOLA (hesitant): Mama, before we eat, I need to tell you something.
MAMA (watching him): You have been rehearsing that for three weeks. Say it.
KOLA: I left the job. I am starting my own business.
AUNTY BISI (gasps): Ah! Without telling us?
MAMA (quietly): Let him finish.
KOLA (steady): I am not asking permission, Mama. I am asking you to believe in me.
MAMA (after a long pause): Sit down, my son. Eat first. Then tell me everything.
`,
  },
  {
    id: "horror", title: "Audio horror", tagline: "Dread, whispers, jump scares", group: "story",
    script: `# The Night Shift
NARRATOR (low, steady): The lights in the east corridor had been flickering since midnight.
GUARD (uneasy): Control, this is Ellis. I am hearing something on level three. Like... someone humming.
CONTROL (static, distant): Level three has been empty since six, Ellis.
GUARD (whispering): [breathes in] It is getting closer.
CHILD'S VOICE (soft, singing, right behind): Ellis... Ellis... you left the door open.
GUARD (terrified): [gasps] Control? Control, answer me!
CONTROL (static): ...Ellis? Who are you talking to?
`,
  },
  {
    id: "scifi", title: "Sci-fi", tagline: "Ships, stations, AI", group: "story",
    script: `# Bridge, Deck One
CAPTAIN RUIZ (calm, tired): Status, Nova.
NOVA (smooth, synthetic): Captain, the signal is repeating from inside our own hull.
CAPTAIN RUIZ: Inside. [sighs] Of course it is.
ENGINEER OKAFOR (alarmed): Captain, life support just dropped four percent. Something is using our air.
NOVA (carefully): I have a suggestion. I should not make it aloud.
CAPTAIN RUIZ (slowly): Nova. Who else is listening?
`,
  },
  {
    id: "comedy", title: "Comedy sketch", tagline: "Timing, bits, punchlines", group: "story",
    script: `# The Returns Desk
CUSTOMER (flustered): I would like to return this. It does not work.
CLERK (dead calm): Sir, that is a banana.
CUSTOMER: Exactly! I have peeled it six times and it is still a banana.
CLERK (pause, then): [sighs] Do you have the receipt?
CUSTOMER (proud): I ate the receipt. It was part of the meal deal.
CLERK: Then I am afraid there is nothing I can do. [beat] Unless it gets worse.
`,
  },
  {
    id: "game", title: "Game dialogue", tagline: "NPC lines, character voices", group: "story",
    script: `# Village gate
GUARD (gruff): Halt. State your business in Brightwater.
HERO (steady): I am looking for the blacksmith. They say she can mend anything.
GUARD: [sighs] Everyone is looking for her lately. Second street on the left, and mind the dogs.
MERCHANT (cheerful): Fresh bread, warm from the oven! Best price in the valley!
`,
  },
  {
    id: "podcast", title: "Podcast", tagline: "Conversations, interviews", group: "content",
    script: `# Episode 1: Cold open
HOST (warm): Welcome back to the show. Today we are talking about the thing everyone is afraid to try.
GUEST (curious): [laughs] Starting with the scary part. I like it.
HOST: Let us begin at the beginning. What made you start?
GUEST (thoughtful): Honestly, I was bored, and a little bit stubborn.
`,
  },
  {
    id: "audiobook", title: "Audiobook", tagline: "Long-form narration", group: "content",
    script: `# Chapter 1
Narrator: The rain had been falling on the harbour for three days when the letter finally arrived.

Narrator: Mara read it twice, folded it into her coat, and walked out into the grey morning without telling anyone where she was going.
`,
  },
  {
    id: "documentary", title: "Documentary", tagline: "Narration with interview clips", group: "content",
    script: `# Opening
Narrator (measured, grave): For nine hundred years, the river has decided who eats and who goes hungry.
Fisherman (weathered, quiet): My father fished here. His father too. The river does not care about us. We care about the river.
Narrator: But this season, the water is rising earlier than anyone remembers.
`,
  },
  {
    id: "explainer", title: "Explainer", tagline: "Short how-it-works videos", group: "content",
    script: `# How a battery works
Narrator (friendly, clear): Every battery is a tiny chemical sandwich with two ends, one that wants to give electrons away, and one that wants to receive them.
Narrator: When you connect a wire between the two, the electrons rush through it, and that rush is the electricity that lights your phone.
`,
  },
  {
    id: "video", title: "Video script", tagline: "YouTube, tutorials", group: "content",
    script: `# Intro
Narrator (upbeat): In the next five minutes you will learn the one trick that saves hours every week.

# Step one
Narrator: First, open the settings panel. Do not worry, nothing here can break.
`,
  },
  {
    id: "training", title: "Training", tagline: "E-learning, courses", group: "content",
    script: `# Module 1: Safety basics
Instructor (calm): Before you start, check that your workspace is clear and your equipment is switched off.
Learner (unsure): What if something is already running?
Instructor: Good question. Stop, switch it off, and tell your supervisor before you continue.
`,
  },
  {
    id: "advert", title: "Advertising", tagline: "Ads, promos, social media", group: "content",
    script: `# 30 second spot
Announcer (energetic): Tired of slow mornings? Meet Dawn, the coffee that wakes up before you do.
Customer (delighted): [gasps] Is that really coffee? It smells amazing!
Announcer: Dawn. Start your day properly.
`,
  },
];

export const templateById = (id: string): Template | undefined => TEMPLATES.find((t) => t.id === id);
export const templateImage = (id: string): string => `/templates/${id}.webp`;
