/** Starting points on the home screen. Each is a short script in the normal `NAME: line` format, so it is edited like any other. */
export interface Template { id: string; title: string; tagline: string; script: string }

export const TEMPLATES: Template[] = [
  {
    id: "podcast", title: "Podcast", tagline: "Conversations, interviews",
    script: `# Episode 1: Cold open
HOST (warm): Welcome back to the show. Today we are talking about the thing everyone is afraid to try.
GUEST (curious): [laughs] Starting with the scary part. I like it.
HOST: Let us begin at the beginning. What made you start?
GUEST (thoughtful): Honestly, I was bored, and a little bit stubborn.
`,
  },
  {
    id: "audiobook", title: "Audiobook", tagline: "Long-form narration",
    script: `# Chapter 1
Narrator: The rain had been falling on the harbour for three days when the letter finally arrived.

Narrator: Mara read it twice, folded it into her coat, and walked out into the grey morning without telling anyone where she was going.
`,
  },
  {
    id: "video", title: "Video script", tagline: "YouTube, tutorials",
    script: `# Intro
Narrator (upbeat): In the next five minutes you will learn the one trick that saves hours every week.

# Step one
Narrator: First, open the settings panel. Do not worry, nothing here can break.
`,
  },
  {
    id: "training", title: "Training", tagline: "E-learning, courses",
    script: `# Module 1: Safety basics
Instructor (calm): Before you start, check that your workspace is clear and your equipment is switched off.
Learner (unsure): What if something is already running?
Instructor: Good question. Stop, switch it off, and tell your supervisor before you continue.
`,
  },
  {
    id: "advert", title: "Advertising", tagline: "Ads, promos, social media",
    script: `# 30 second spot
Announcer (energetic): Tired of slow mornings? Meet Dawn, the coffee that wakes up before you do.
Customer (delighted): [gasps] Is that really coffee? It smells amazing!
Announcer: Dawn. Start your day properly.
`,
  },
  {
    id: "game", title: "Game dialogue", tagline: "NPC lines, character voices",
    script: `# Village gate
GUARD (gruff): Halt. State your business in Brightwater.
HERO (steady): I am looking for the blacksmith. They say she can mend anything.
GUARD: [sighs] Everyone is looking for her lately. Second street on the left, and mind the dogs.
MERCHANT (cheerful): Fresh bread, warm from the oven! Best price in the valley!
`,
  },
];

export const templateById = (id: string): Template | undefined => TEMPLATES.find((t) => t.id === id);
