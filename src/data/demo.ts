export const demo = {
  // CHAPTER 1 — Birth
  chapter_1: {
    id: "chapter_1",
    text: "You're born on a quiet evening in early autumn. Your mother is steady and patient; your father is a dreamer with half-finished projects. They argue about money sometimes, but they tuck you in with care. For now, the world chooses for you.",
    age: 0,
    choices: [
      { id: "choice_1", text: "Next", next: "chapter_2" }
    ]
  },

  // CHAPTER 2 — Early Childhood
  chapter_2: {
    id: "chapter_2",
    text: "Age 6. Your parents debate moving to a cheaper apartment across town. You like your school and the swing your father built. A sealed box labeled 'Keepsakes' sits by the door.",
    age: 6,
    choices: [
      { id: "choice_1", text: "Hide your favorite toy in the keepsake box so it isn't lost.", next: "chapter_3a" },
      { id: "choice_2", text: "Tell your parents you want to stay; refuse to pack.", next: "ending_runaway_6" },
      { id: "choice_3", text: "Help pack quickly and label every box.", next: "chapter_3b" }
    ]
  },

  // CHAPTER 3a — Preteen Pivot (music-forward)
  chapter_3a: {
    id: "chapter_3a",
    text: "Age 12. New neighborhood, new school. A teacher notices you tap rhythms on your desk and suggests the after-school music club. Your mother worries about grades; your father says try everything once.",
    age: 12,
    choices: [
      { id: "choice_1", text: "Join the music club and practice daily.", next: "chapter_4" },
      { id: "choice_2", text: "Skip the club; accelerate in academics.", next: "chapter_5" }, // variant skips to 5
      { id: "choice_3", text: "Do both and sleep less.", next: "ending_collapse_12" }
    ]
  },

  // CHAPTER 3b — Preteen Pivot (move-first, cautious)
  chapter_3b: {
    id: "chapter_3b",
    text: "Age 12. Boxes still line the hallway. You keep your head down at school and learn the bus routes by heart. A neighbor offers to teach you basic guitar on weekends.",
    age: 12,
    choices: [
      { id: "choice_1", text: "Accept guitar lessons; practice in the stairwell.", next: "chapter_4" },
      { id: "choice_2", text: "Focus on helping at home; postpone hobbies.", next: "chapter_4" },
      { id: "choice_3", text: "Roam the city alone at night to feel free.", next: "ending_freeway_18" }
    ]
  },

  // CHAPTER 4 — Late Teen Choice
  chapter_4: {
    id: "chapter_4",
    text: "Age 18. Your band is offered a small summer tour. The same week you receive a scholarship offer that requires a preparatory course over the summer. Your parents say they'll support whatever you decide, even if they look nervous saying it.",
    age: 18,
    choices: [
      { id: "choice_1", text: "Take the tour and defer the scholarship if possible.", next: "chapter_5" },
      { id: "choice_2", text: "Decline the tour and commit to the scholarship.", next: "chapter_5" },
      { id: "choice_3", text: "Try to do both—drive between dates and classes overnight.", next: "ending_freeway_18" }
    ]
  },

  // CHAPTER 5 — Early Adult Ethics
  chapter_5: {
    id: "chapter_5",
    text: "Age 25. First real job. You discover a bug that misreports fees to low-income customers. Your manager says a fix will hurt quarterly numbers and suggests waiting.",
    age: 25,
    choices: [
      { id: "choice_1", text: "Report it to compliance and push for an immediate fix.", next: "chapter_6a" },
      { id: "choice_2", text: "Quietly patch it on your own time and hope it sticks.", next: "chapter_6b" },
      { id: "choice_3", text: "Ignore it and protect your team for now.", next: "chapter_6b" }
    ]
  },

  // CHAPTER 6a — Midlife Crossroads (reputation intact)
  chapter_6a: {
    id: "chapter_6a",
    text: "Age 35. Your relationship is strained by long hours. Your mother is diagnosed with a manageable but chronic illness. A chance to relocate abroad appears, promising advancement and time-zone distance.",
    age: 35,
    choices: [
      { id: "choice_1", text: "Stay, reduce hours, and become primary support for your mother.", next: "chapter_7a" },
      { id: "choice_2", text: "Relocate abroad and send money home regularly.", next: "chapter_7b" },
      { id: "choice_3", text: "Ask your partner to relocate with you and set strict work boundaries.", next: "chapter_7a" }
    ]
  },

  // CHAPTER 6b — Midlife Crossroads (compromised or secretive path)
  chapter_6b: {
    id: "chapter_6b",
    text: "Age 35. You carry quiet compromises from your twenties. Your partner senses the distance. A recruiter dangles an overseas role that wipes history clean—on paper.",
    age: 35,
    choices: [
      { id: "choice_1", text: "Confess past choices; rebuild trust; stay local.", next: "chapter_7a" },
      { id: "choice_2", text: "Take the overseas offer and outrun the past.", next: "chapter_7b" },
      { id: "choice_3", text: "Work nights to keep everyone happy.", next: "ending_burnout_35" }
    ]
  },

  // CHAPTER 7a — Second Act (roots)
  chapter_7a: {
    id: "chapter_7a",
    text: "Age 50. You've stayed closer to home. An old bandmate proposes a reunion fundraiser for a community music program. Your father mails a late apology letter with a cassette from your first gig.",
    age: 50,
    choices: [
      { id: "choice_1", text: "Play the reunion and donate more than you planned.", next: "chapter_8" },
      { id: "choice_2", text: "Decline the show; invest in a safer retirement plan.", next: "chapter_8" },
      { id: "choice_3", text: "Confront your father about the past in person.", next: "ending_stroke_50" }
    ]
  },

  // CHAPTER 7b — Second Act (distance)
  chapter_7b: {
    id: "chapter_7b",
    text: "Age 50. Years abroad taught you to travel light. The community center back home asks if you'll send recordings for an archive. Your father's letter arrives late, foreign stamps layered like scales.",
    age: 50,
    choices: [
      { id: "choice_1", text: "Fly back quietly and play the reunion unannounced.", next: "chapter_8" },
      { id: "choice_2", text: "Mail the tapes; keep your life offshore.", next: "chapter_8" },
      { id: "choice_3", text: "Call your father to settle things now.", next: "ending_stroke_50" }
    ]
  },

  // CHAPTER 8 — Late Life Reckoning
  chapter_8: {
    id: "chapter_8",
    text: "Age 70. Your adult child asks whether to sell the family house. The community center offers to archive your band's old recordings. A sealed box marked 'Attic: Do Not Open' resurfaces from years ago.",
    age: 70,
    choices: [
      { id: "choice_1", text: "Donate the recordings and host one last small show.", next: "ending_reunion_70" },
      { id: "choice_2", text: "Sell the house and fund scholarships for music students.", next: "ending_legacy_70" },
      { id: "choice_3", text: "Open the old box alone at midnight first.", next: "ending_letters_70" }
    ]
  },

  // ENDINGS — Abrupt paths now end in death; late-life endings remain reflective.
  ending_runaway_6: {
    id: "ending_runaway_6",
    text: "You slip out after refusing to pack and wander past the avenue. Sirens bloom and fade somewhere else. By dawn, a driver who didn't see the small figure in the rain carries the weight forever.",
    age: 6,
    choices: []
  },

  ending_collapse_12: {
    id: "ending_collapse_12",
    text: "After weeks of sleepless practicing and extra homework, you collapse on the stairs at school. The fall is brief; the silence after is longer than any song.",
    age: 12,
    choices: []
  },

  ending_freeway_18: {
    id: "ending_freeway_18",
    text: "You chase two lives down the same highway. At 2 a.m., a jackknifed truck blocks the lane. The tour plays without you; the class meets without you. The world keeps moving, carrying your echo.",
    age: 18,
    choices: []
  },

  ending_burnout_35: {
    id: "ending_burnout_35",
    text: "You work nights to keep everyone happy until your heart refuses the bargain. In the hospital's bright hush, monitors flatten to a single, steady line.",
    age: 35,
    choices: []
  },

  ending_stroke_50: {
    id: "ending_stroke_50",
    text: "In the heat of old arguments, your father's face slackens and words slide away. The stroke takes him before the ambulance arrives. What you meant to say is a letter you never send.",
    age: 50,
    choices: []
  },

  // Existing reflective late-life endings (not abrupt)
  ending_reunion_70: {
    id: "ending_reunion_70",
    text: "Neighbors fill folding chairs. You play simple songs, and they sound better than when they were complicated. After cake in paper bowls, you sleep the best you have in years.",
    age: 71,
    choices: []
  },

  ending_legacy_70: {
    id: "ending_legacy_70",
    text: "The house sells. Scholarships begin. Your name appears on a small plaque inside a practice room where someone learns their first chord and grins the way you once did.",
    age: 72,
    choices: []
  },

  ending_letters_70: {
    id: "ending_letters_70",
    text: "The box holds letters between your parents from the move years ago: worry, love, plans that almost worked. You write your own letter at dawn and leave it where someone will find it.",
    age: 70,
    choices: []
  }
};
