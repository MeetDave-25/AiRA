// Director's note shown at the top of the About page (and as her profile bio).
// DRAFT — written for Dr. Anuradha Sharma's review. Edit the text here once she approves or changes it.

export const director = {
    name: "Dr. Anuradha Sharma",
    title: "Director",
    org: "L J College of Computer Application",
    photo: "/team/dr-anuradha-sharma.webp",
    pullQuote: "Mistakes in this lab are not failures — they are the first draft of something better.",
    message: [
        "Dear students,",
        "AiRA Lab was built on a simple belief: the best way to learn technology is to build with it. Every project here — an app, a model, a robot — began with a question someone was curious enough to ask.",
        "I encourage each of you to be that person. Ask questions, try ideas that might not work, and learn from one another as much as from your teachers. Mistakes in this lab are not failures; they are the first draft of something better.",
        "Your seniors are proof of what students can achieve when they are trusted to lead. Now it is your turn. Bring your curiosity, your discipline and your kindness — and let us build a future we are proud of, together.",
    ],
    signOff: "With warm wishes,",
} as const;

/** The note as plain text, used for her profile bio. */
export const directorBio = [...director.message, director.signOff, director.name].join("\n\n");
