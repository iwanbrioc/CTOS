var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  handyHacks: () => handyHacks,
  insertJournalEntrySchema: () => insertJournalEntrySchema,
  insertNotificationSchema: () => insertNotificationSchema,
  journalEntries: () => journalEntries,
  meditationSessions: () => meditationSessions,
  milestones: () => milestones,
  notifications: () => notifications,
  sessionAnalytics: () => sessionAnalytics,
  sessionHandyHacks: () => sessionHandyHacks,
  sessions: () => sessions,
  upsertUserSchema: () => upsertUserSchema,
  userHackCompletions: () => userHackCompletions,
  userMilestones: () => userMilestones,
  userProgress: () => userProgress,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions, users, meditationSessions, userProgress, milestones, userMilestones, sessionAnalytics, journalEntries, handyHacks, sessionHandyHacks, userHackCompletions, notifications, upsertUserSchema, insertJournalEntrySchema, insertNotificationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      // Replit user ID (string)
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      currentWeek: integer("current_week").default(1),
      sessionsPace: integer("sessions_pace").default(1),
      // 1 or 2 sessions per week
      courseFormat: text("course_format").default("8-week"),
      // "8-week" or "4-week"
      joinedAt: timestamp("joined_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      notificationsEnabled: boolean("notifications_enabled").default(true),
      reminderTime: text("reminder_time").default("09:00"),
      // HH:MM format
      reminderDays: jsonb("reminder_days").$type().default([1, 2, 3, 4, 5]),
      // 0 = Sunday, 1 = Monday, etc.
      timezone: text("timezone").default("UTC")
    });
    meditationSessions = pgTable("meditation_sessions", {
      id: serial("id").primaryKey(),
      week: integer("week").notNull(),
      title: text("title").notNull(),
      practiceName: text("practice_name"),
      // Name of the meditation practice
      description: text("description").notNull(),
      audioUrl: text("audio_url").notNull(),
      duration: integer("duration").notNull(),
      // in minutes
      illustration: text("illustration").notNull(),
      isLocked: boolean("is_locked").default(true),
      handyHack: text("handy_hack"),
      // Main handy hack for the session
      journaling: text("journaling")
      // Journaling tasks for the session
    });
    userProgress = pgTable("user_progress", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      sessionId: integer("session_id").references(() => meditationSessions.id).notNull(),
      completed: boolean("completed").default(false),
      completedAt: timestamp("completed_at"),
      audioProgress: integer("audio_progress").default(0),
      // seconds
      totalListenTime: integer("total_listen_time").default(0),
      // total seconds listened
      streakDays: integer("streak_days").default(0),
      // consecutive days practiced
      // Enhanced tracking fields
      playCount: integer("play_count").default(0),
      // times session was started
      lastPlayedAt: timestamp("last_played_at"),
      completionPercentage: integer("completion_percentage").default(0),
      // 0-100
      skipCount: integer("skip_count").default(0),
      // times user skipped forward
      pauseCount: integer("pause_count").default(0),
      // times user paused
      averageSessionRating: integer("average_session_rating").default(0),
      // 1-5 rating
      preMood: integer("pre_mood"),
      // 1-5 mood rating before practice
      postMood: integer("post_mood")
      // 1-5 mood rating after practice
    });
    milestones = pgTable("milestones", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      type: text("type").notNull(),
      // 'sessions', 'time', 'streak', 'weekly'
      target: integer("target").notNull(),
      badge: text("badge").notNull(),
      // emoji or icon identifier
      color: text("color").notNull()
      // hex color for the milestone
    });
    userMilestones = pgTable("user_milestones", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      milestoneId: integer("milestone_id").references(() => milestones.id).notNull(),
      achievedAt: timestamp("achieved_at").defaultNow(),
      progress: integer("progress").default(0)
      // current progress toward milestone
    });
    sessionAnalytics = pgTable("session_analytics", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      sessionId: integer("session_id").references(() => meditationSessions.id).notNull(),
      startTime: timestamp("start_time").defaultNow(),
      endTime: timestamp("end_time"),
      totalDuration: integer("total_duration").default(0),
      // total seconds listened in this session
      pauseDurations: integer("pause_durations").array().default([]).notNull(),
      // array of pause durations in milliseconds
      seekEvents: integer("seek_events").array().default([]).notNull(),
      // array of seek positions in seconds
      completionRate: integer("completion_rate").default(0),
      // percentage completed in this play
      deviceType: text("device_type"),
      // mobile, desktop, etc.
      connectionQuality: text("connection_quality")
      // for future network optimization
    });
    journalEntries = pgTable("journal_entries", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      date: timestamp("date").defaultNow(),
      // Morning routine
      gratitude1: text("gratitude_1"),
      gratitude2: text("gratitude_2"),
      gratitude3: text("gratitude_3"),
      highValuePriority1: text("high_value_priority_1"),
      highValuePriority2: text("high_value_priority_2"),
      highValuePriority3: text("high_value_priority_3"),
      highFlowPriority1: text("high_flow_priority_1"),
      highFlowPriority2: text("high_flow_priority_2"),
      highFlowPriority3: text("high_flow_priority_3"),
      scriptingVoiceNote: text("scripting_voice_note"),
      // URL or path to voice recording
      scriptingText: text("scripting_text"),
      // Optional text version
      // Evening routine
      reflectionVoiceNote: text("reflection_voice_note"),
      // URL or path to voice recording
      reflectionText: text("reflection_text"),
      // Optional text version
      // Status tracking
      morningCompleted: boolean("morning_completed").default(false),
      eveningCompleted: boolean("evening_completed").default(false),
      completedAt: timestamp("completed_at")
    });
    handyHacks = pgTable("handy_hacks", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      illustration: text("illustration")
    });
    sessionHandyHacks = pgTable("session_handy_hacks", {
      id: serial("id").primaryKey(),
      sessionId: integer("session_id").references(() => meditationSessions.id).notNull(),
      hackId: integer("hack_id").references(() => handyHacks.id).notNull(),
      sortOrder: integer("sort_order").default(0)
    }, (table) => ({
      uniqueSessionHack: unique().on(table.sessionId, table.hackId)
    }));
    userHackCompletions = pgTable("user_hack_completions", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      hackId: integer("hack_id").references(() => handyHacks.id).notNull(),
      sessionId: integer("session_id").references(() => meditationSessions.id),
      // nullable for session-specific context
      completedAt: timestamp("completed_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // 'practice', 'hack', 'weekly', 'reminder'
      title: text("title").notNull(),
      message: text("message").notNull(),
      scheduledFor: timestamp("scheduled_for").notNull(),
      sent: boolean("sent").default(false),
      read: boolean("read").default(false),
      isRecurring: boolean("is_recurring").default(false),
      recurringPattern: text("recurring_pattern"),
      // 'daily', 'weekly', 'custom'
      nextScheduled: timestamp("next_scheduled"),
      sessionId: integer("session_id").references(() => meditationSessions.id),
      // nullable for session-specific reminders
      hackId: integer("hack_id").references(() => handyHacks.id)
      // nullable for hack-specific reminders
    });
    upsertUserSchema = createInsertSchema(users).pick({
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true
    });
    insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
      gratitude1: true,
      gratitude2: true,
      gratitude3: true,
      highValuePriority1: true,
      highValuePriority2: true,
      highValuePriority3: true,
      highFlowPriority1: true,
      highFlowPriority2: true,
      highFlowPriority3: true,
      scriptingVoiceNote: true,
      scriptingText: true,
      reflectionVoiceNote: true,
      reflectionText: true,
      morningCompleted: true,
      eveningCompleted: true
    });
    insertNotificationSchema = createInsertSchema(notifications).pick({
      type: true,
      title: true,
      message: true,
      scheduledFor: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db2,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db2;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db2 = drizzle({ client: pool, schema: schema_exports });
  }
});

// client/src/lib/session-data.ts
var session_data_exports = {};
__export(session_data_exports, {
  handyHacksData: () => handyHacksData,
  sessionData: () => sessionData,
  sessionHacksMapping: () => sessionHacksMapping
});
var sessionData, sessionHacksMapping, handyHacksData;
var init_session_data = __esm({
  "client/src/lib/session-data.ts"() {
    "use strict";
    sessionData = [
      {
        id: 1,
        week: 1,
        title: "Dropping the Balloon",
        description: "Learning to let go and recognize when we're in 'keepy-uppy' mode.",
        longDescription: [
          "Most of us spend our waking hours playing keepy-uppy. We are juggling tasks and roles; keeping up appearances; maintaining relationships; meeting people's expectations of us, and those we have of ourselves. Mindfulness can sometimes feel like just another bothersome task.",
          "In this session we tried out the 'creative challenge' of keeping up and then dropping an imaginary balloon. We then explored how our inner experience is similar, and tried dropping those balloons too.",
          "We noticed how: 1. There will always be balloons 2. But we don't always have to do something about them. 3. Rather than focus on the balloons, what happens if we focus on the hand twitching to do something about them? Can we relax the hand?",
          "Dropping the balloon inwardly gives us the space to let our attention rest on the breath and the body."
        ],
        quote: "Just stopping, is a radical act of sanity and love.",
        author: "Jon Kabat-Zinn",
        duration: 10,
        audioSrc: "/attached_assets/Grounding 10min_1751647354223.mp3",
        color: "bg-gradient-to-br from-yellow-400 to-orange-500",
        illustration: "dropping-balloon",
        handyHack: "Drop the Balloon (whenever you notice the twitch)",
        journaling: "Write 3 things you are grateful for first thing after waking up"
      },
      {
        id: 2,
        week: 2,
        title: "Journey to Now",
        description: "The body as a reliable anchor to the present moment.",
        longDescription: [
          "Mindfulness is the practice of paying attention to the present moment without judgment. Unlike the mind, the body has no choice but to be present, making it a reliable anchor. As the vessel for life, it carries breath, energy, and vitality\u2014but it also holds the imprint of our past.",
          "Our bodies 'keep the score', not just from personal experience but from social conditioning and inherited genetics. Our creative challenge was to map our journey to now and notice how revisiting our past terrain triggers patterns of clenching.",
          "We then witnessed abstract depictions of others' journeys, evoking a sense of shared experience. We ended the session with another journey\u2014this time through the body, moving along the seven stations of the spine."
        ],
        quote: "Once you start approaching your body with curiosity rather than with fear, everything shifts.",
        author: "Bessel A. van der Kolk",
        duration: 20,
        audioSrc: "/attached_assets/The Seven Stations of the Spine_1751648246548.mp3",
        color: "bg-gradient-to-br from-blue-400 to-indigo-600",
        illustration: "seven-stations-spine",
        handyHack: "Unclench and Breathe",
        journaling: "3 Gratitudes + 3 High Flow Priorities (HFP)"
      },
      {
        id: 3,
        week: 3,
        title: "Coming to Our Senses",
        description: "What if thoughts and emotions were also considered senses?",
        longDescription: [
          "In our previous session, we explored our life experiences and physical bodies. This time, we delved into the realm of our senses: touch, taste, smell, sight, hearing, thoughts, and emotions.",
          "Consider this: what if thoughts and emotions were also considered senses? What if they were energies arising within the physical environment of our bodies and brains, rather than originating from a non-physical entity known as the self, like a ghost in the machine?",
          "If this were the case, who would we be if not the awareness of all these occurrences? By allowing ourselves to be guided blindfolded through a carefully designed sensory journey by a trusted colleague, we catch a glimpse of this timeless and spaceless awareness, which is our true nature."
        ],
        quote: "Being aware of the sound of the bell does not mean the bell belongs to you. Likewise being aware of thoughts does not mean the thoughts belong to you.",
        author: "Wu Sin",
        duration: 20,
        audioSrc: "/attached_assets/The Sense of Being Alive (20 minutes)_1751649276591.mp3",
        color: "bg-gradient-to-br from-purple-400 to-pink-500",
        illustration: "the-sense-being-alive",
        handyHack: "The Three Precious Pills (stillness, silence, spaciousness)",
        journaling: "3 Gratitudes + 3 HFP + 3 High Value Priorities (HVP)"
      },
      {
        id: 4,
        week: 4,
        title: "Body, Movement, Mind",
        description: "Meditation doesn't have to mean stillness.",
        longDescription: [
          "Meditation is to mindfulness what a workout is to fitness. The repeated practice of bringing the mind back to a focal point actively rewires the brain, strengthening metacognition\u2014our ability to notice the impulses of avoidance and craving that drive much of our behavior and thought processes.",
          "Mindfulness begins with noticing these impulses and then opening up to the pleasant and unpleasant thoughts, feelings, and sensations behind them, rather than reacting automatically. But meditation doesn't have to mean stillness. Movement can make these patterns even more noticeable.",
          "A simple game showed how much fun it can be to have a body! We then explored how it is also just plain beautiful, through a simple, repeated physical gesture\u2014opening and closing\u2014the first movement we ever performed."
        ],
        quote: "Experience this one thing for what it is, not what you think it is. Be open to what the world is telling you. Life is nothing more than a stream of experiences - the more widely and deeply you swim in it, the richer your life will be.",
        author: "Mihaly Csikszentmihalyi",
        duration: 10,
        audioSrc: "/attached_assets/Mind in Body, Body in Movement, Movement n Mind (10min)_1751649693383.mp3",
        color: "bg-gradient-to-br from-red-400 to-rose-600",
        illustration: "mind-body-movement",
        handyHack: "Exploring Opening and Closing",
        journaling: "3 Gratitudes + 3 HFP + 3 HVP"
      },
      {
        id: 5,
        week: 5,
        title: "What You Really Want",
        description: "Exploring what happens when we fully accept the present moment.",
        longDescription: [
          "Paying attention to the body reveals patterns of sensation that signal where we hold stress, just as observing our thoughts and emotions helps us recognize and release negative patterns before they shape our mood or actions.",
          "In this week's first Creative Challenge, The OK Corral, we explored how 'life positions' shape our perceptions of ourselves and others. In the second challenge, What Do You Really Want?, we examined the constant craving that keeps us trapped in a cycle of seeking.",
          "All life operates through feedback loops. Most of our brain works unconsciously to maintain homeostasis, keeping us in what we perceive as the 'Goldilocks zone.' But in humans, this process has a strange twist where we keep meeting ourselves from the other side, endlessly feeling somehow divided and incomplete.",
          "Yet, in our happiest moments, when we want for nothing, there is no experiencer\u2014only the experience itself. This is the flow state."
        ],
        quote: "When I look inside and see that I am nothing, that is wisdom. When I look outside and see that I am everything, that is love. And between these two, my life turns.",
        author: "Nisargadatta",
        duration: 10,
        audioSrc: "/attached_assets/What if all there is is this 10 minute version_1751649984256.mp3",
        color: "bg-gradient-to-br from-green-400 to-emerald-600",
        illustration: "what-if-all-there-is",
        handyHack: "Watch the Want",
        journaling: "3 Gratitudes + 3 HFP + 3 HVP"
      },
      {
        id: 6,
        week: 6,
        title: "Leaning into Difficulty",
        description: "Understanding emotions as signals and finding the gold in our wounds.",
        longDescription: [
          "Emotions are probably one of the most misunderstood elements of our human experience. Animals have five basic emotions that are triggered in reaction to 'in the moment' environmental or physiological stimuli: Anger (Get out of my way), Sadness (I need comforting), Joy (This feels good), Disgust (Get that away from me), Fear (I need help).",
          "In humans, because we have created a character with a future and a past, that environment also includes our psyche with all its memories and projections. When we bring our attention to discomfort in the body, we start to notice the contours of our clenched-ness, 'our wounds.'",
          "Surprisingly, when allowed to 'speak' they have a story to tell that have emotional components. One of the most difficult things is to welcome and feel gratitude for discomfort and yet in doing so we can be more at ease with our suffering, or even find that when we offer no resistance to our suffering it becomes joy."
        ],
        quote: "If you want the rainbow, you got to put up with the rain.",
        author: "Steven Wright",
        duration: 15,
        audioSrc: "/attached_assets/turning towards the difficult 15 Minutes_1751650302023.mp3",
        color: "bg-gradient-to-br from-orange-400 to-red-500",
        illustration: "turning-towards-discomfort",
        handyHack: "The 5 Elements (anger, sadness, joy, disgust, fear)",
        journaling: "3 Gratitudes + 3 HFP + 3 HVP"
      },
      {
        id: 7,
        week: 7,
        title: "Finding Your Flow",
        description: "Every moment is a creative challenge.",
        longDescription: [
          "This week, we challenged you to see that every moment is a creative challenge. As we like to say, CoArts is a creative movement towards awareness of the creative movement of awareness! If life is theatre and we're not writing the script\u2014who is?",
          "Our habits, conditioning, and circumstances often shape our experience without us realizing it. Attention is our most powerful tool, yet in the 'Attention Economy,' it's constantly being pulled away. That's why we asked: What do I truly want to experience today?",
          "If we're not choosing where our attention goes, then who\u2014or what\u2014is? Through The Flow Journal System, we explored how scripting\u2014writing down what we expect to see, hear, and feel\u2014helps direct our awareness intentionally.",
          "We also practiced detached reflection, stepping back to notice what serves us, recognizing progress, and embracing joy. If this is all theatre, then scripting isn't about control\u2014it's about waking up to the roles we play, the stories we tell, and the choices we make."
        ],
        quote: "A joyful life is an individual creation that cannot be copied from a recipe.",
        author: "Mihaly Csikszentmihalyi",
        duration: 22,
        audioSrc: "/attached_assets/fourpillarspractice_1751651309349.mp3",
        color: "bg-gradient-to-br from-cyan-400 to-blue-600",
        illustration: "four-pillars",
        handyHack: "Scripting & Reflecting",
        journaling: "Full Flow Journal System (Gratitude, High Flow & High Value Priorities, Script Your Day, Review Your Day)"
      },
      {
        id: 8,
        week: 8,
        title: "Falling Awake",
        description: "Embracing the paradox of awakening and falling in love with what is.",
        longDescription: [
          "In our final session together, we embraced one last creative challenge\u2014writing and performing a poem in front of the group. For many, this felt like standing on the edge of a precipice and being asked to jump. Yet, over the past eight weeks, the trust and care within the group became a safety net, holding each person with unconditional positive regard.",
          "This course has been an invitation to play with the possibility of awakening\u2014to fall in love, gently and courageously, with 'what is.' Through a series of creative challenges as embodied signposts and a journaling method to navigate the edges of awareness, we explored what it means to be truly present.",
          "Often, we soften life's edges with creature comforts\u2014a glass of wine, a good film, or other coping mechanisms. But mindfulness, as taught here, is not about coping. It has invited you to sit on that edge, dangle your feet over the abyss, and notice, despite everything...it's not so bad!"
        ],
        quote: "The bad news is you're falling through the air, nothing to hang on to, no parachute. The good news is, there's no ground.",
        author: "Chogyam Trungpa",
        duration: 10,
        audioSrc: "/attached_assets/What if all there is is this 10 minute version_1751649984256.mp3",
        color: "bg-gradient-to-br from-violet-400 to-purple-600",
        illustration: "great-smile",
        handyHack: "Great Smile",
        journaling: "Full Flow Journal System"
      }
    ];
    sessionHacksMapping = {
      2: ["Drop the Balloon", "Radical Stop", "Hand Check", "Three Conscious Breaths"],
      // Dropping the Balloon
      3: ["Spine Stations", "Journey Mapping", "Body Curiosity", "Mindful Listening"],
      // Journey to Now
      4: ["Sense Door Opening", "Thoughts as Senses", "Timeless Awareness", "Gratitude Moment"],
      // Coming to Our Senses
      5: ["Opening & Closing", "Body Joy", "Movement Meditation", "Three Conscious Breaths"],
      // Body, Movement, Mind
      6: ["What Do I Really Want?", "Flow Check", "Goldilocks Zone", "Gratitude Moment"],
      // What You Really Want
      7: ["Welcome Discomfort", "Emotion Check-in", "Find the Gold", "Three Conscious Breaths"],
      // Leaning in to Difficulty
      8: ["Attention Check", "Script Your Experience", "Creative Challenge", "Mindful Listening"],
      // Finding Your Flow
      9: ["Great Smile Practice", "Falling Awake", "Love What Is", "Gratitude Moment"]
      // Falling Awake
    };
    handyHacksData = [
      // Session 1: Dropping the Balloon - Letting go, stopping, mindfulness basics
      {
        title: "Drop the Balloon",
        description: "When you notice yourself in 'keepy-uppy' mode, imagine dropping an invisible balloon. Let your hand relax.",
        category: "letting-go"
      },
      {
        title: "Radical Stop",
        description: "Stop whatever you're doing for 30 seconds. Just be. Notice this is a radical act of sanity and love.",
        category: "stopping"
      },
      {
        title: "Hand Check",
        description: "Notice if your hands are tense or reaching for something. Consciously relax them and breathe.",
        category: "body-awareness"
      },
      // Session 2: Journey to Now - Body awareness, presence, spine awareness
      {
        title: "Spine Stations",
        description: "Feel each section of your spine from base to crown. Notice how your body anchors you to the present.",
        category: "body-awareness"
      },
      {
        title: "Journey Mapping",
        description: "Briefly acknowledge how you got to this moment, then return your attention to now.",
        category: "presence"
      },
      {
        title: "Body Curiosity",
        description: "Approach your body with curiosity rather than judgment. What is it telling you right now?",
        category: "body-awareness"
      },
      // Session 3: Coming to Our Senses - Senses, awareness, thoughts as senses
      {
        title: "Sense Door Opening",
        description: "Cycle through your five senses. What do you see, hear, smell, taste, and feel right now?",
        category: "awareness"
      },
      {
        title: "Thoughts as Senses",
        description: "Notice thoughts arising like sounds. They don't belong to you\u2014you're just aware of them.",
        category: "awareness"
      },
      {
        title: "Timeless Awareness",
        description: "Rest in the awareness that notices all experiences. This awareness is your true nature.",
        category: "awareness"
      },
      // Session 4: Body, Movement, Mind - Movement meditation, opening/closing
      {
        title: "Opening & Closing",
        description: "Make gentle opening and closing gestures with your hands. The first movement you ever made.",
        category: "movement"
      },
      {
        title: "Body Joy",
        description: "Celebrate having a body! Stretch, move, or wiggle\u2014notice how fun it can be to be embodied.",
        category: "movement"
      },
      {
        title: "Movement Meditation",
        description: "Turn any movement into meditation. Walk, stretch, or gesture with complete presence.",
        category: "movement"
      },
      // Session 5: What You Really Want - Investigating craving, acceptance, flow
      {
        title: "What Do I Really Want?",
        description: "Ask yourself what you really want right now. Notice the craving, then see if you can want nothing.",
        category: "wanting"
      },
      {
        title: "Flow Check",
        description: "Notice if you're wanting something to be different. Can you find contentment with what is?",
        category: "acceptance"
      },
      {
        title: "Goldilocks Zone",
        description: "Notice when you're seeking the 'just right' feeling. Can you be okay with 'just this'?",
        category: "acceptance"
      },
      // Session 6: Leaning in to Difficulty - Emotions, discomfort, finding gold
      {
        title: "Welcome Discomfort",
        description: "If you notice discomfort, breathe into it. What is this feeling trying to tell you?",
        category: "difficulty"
      },
      {
        title: "Emotion Check-in",
        description: "Name what you're feeling: anger, sadness, joy, disgust, or fear. Let it be here.",
        category: "emotions"
      },
      {
        title: "Find the Gold",
        description: "In any difficult moment, look for the hidden gift or lesson. What gold can you find in this wound?",
        category: "difficulty"
      },
      // Session 7: Finding Your Flow - Integration, attention, scripting
      {
        title: "Attention Check",
        description: "Notice where your attention is right now. Are you choosing its direction, or is something else?",
        category: "attention"
      },
      {
        title: "Script Your Experience",
        description: "Briefly set an intention for how you want to experience the next hour. What do you want to notice?",
        category: "intention"
      },
      {
        title: "Creative Challenge",
        description: "See this moment as a creative challenge. How can you approach it with fresh awareness?",
        category: "creativity"
      },
      // Session 8: Falling Awake - Culmination, paradox, love with what is
      {
        title: "Great Smile Practice",
        description: "Take a moment to smile genuinely. Notice how it changes your internal state and the energy around you.",
        category: "joy"
      },
      {
        title: "Falling Awake",
        description: "Notice you're falling through life with no solid ground. Feel how this is actually liberating.",
        category: "awakening"
      },
      {
        title: "Love What Is",
        description: "Look at this moment with unconditional positive regard. Can you fall in love with what is?",
        category: "acceptance"
      },
      // General practice hacks (can be used across sessions)
      {
        title: "Three Conscious Breaths",
        description: "Pause and take three deep, mindful breaths. Feel your body settling with each exhale.",
        category: "breathing"
      },
      {
        title: "Gratitude Moment",
        description: "Notice one thing you're grateful for right now. Really feel the appreciation in your body.",
        category: "gratitude"
      },
      {
        title: "Mindful Listening",
        description: "Stop and listen to the sounds around you for 30 seconds. Be completely present with what you hear.",
        category: "awareness"
      }
    ];
  }
});

// server/index.ts
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
var DatabaseStorage = class {
  async getUser(id) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const [user] = await db3.select().from(users).where(eq2(users.id, id));
    return user || void 0;
  }
  async upsertUser(userData) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const [user] = await db3.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUserWeek(userId, week) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    await db3.update(users).set({ currentWeek: week }).where(eq2(users.id, userId));
  }
  async updateUserSessionsPace(userId, sessionsPace) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    await db3.update(users).set({ sessionsPace }).where(eq2(users.id, userId));
  }
  async updateUserCourseFormat(userId, courseFormat) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    await db3.update(users).set({ courseFormat }).where(eq2(users.id, userId));
  }
  async getAllSessions() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { asc } = await import("drizzle-orm");
    return await db3.select().from(meditationSessions).orderBy(asc(meditationSessions.week), asc(meditationSessions.id));
  }
  async getSessionsByWeek(week) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(meditationSessions).where(eq2(meditationSessions.week, week));
  }
  async initializeSessions() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { sessionData: sessionData2 } = await Promise.resolve().then(() => (init_session_data(), session_data_exports));
    const existingSessions = await db3.select().from(meditationSessions).limit(1);
    if (existingSessions.length > 0) {
      return;
    }
    for (const session of sessionData2) {
      await db3.insert(meditationSessions).values({
        id: session.id,
        // Preserve the explicit ID from sessionData
        week: session.week,
        title: session.title,
        description: session.description || session.desc || `Week ${session.week} meditation session`,
        audioUrl: session.audioSrc || session.audioUrl || "/attached_assets/placeholder.mp3",
        duration: session.duration || 10,
        illustration: session.illustration || "default",
        isLocked: false
      });
    }
  }
  async getUserProgress(userId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(userProgress).where(eq2(userProgress.userId, userId));
  }
  async updateSessionProgress(userId, sessionId, progress) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and } = await import("drizzle-orm");
    await db3.update(userProgress).set(progress).where(and(eq2(userProgress.userId, userId), eq2(userProgress.sessionId, sessionId)));
  }
  async completeSession(userId, sessionId, preMood, postMood) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and } = await import("drizzle-orm");
    const updateData = {
      completed: true,
      completedAt: /* @__PURE__ */ new Date()
    };
    if (preMood !== void 0) updateData.preMood = preMood;
    if (postMood !== void 0) updateData.postMood = postMood;
    await db3.update(userProgress).set(updateData).where(and(eq2(userProgress.userId, userId), eq2(userProgress.sessionId, sessionId)));
  }
  async getUserJournalEntries(userId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(journalEntries).where(eq2(journalEntries.userId, userId));
  }
  async createJournalEntry(userId, entry) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const [journalEntry] = await db3.insert(journalEntries).values({ ...entry, userId }).returning();
    return journalEntry;
  }
  async updateJournalEntry(userId, entryId, entryData) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and } = await import("drizzle-orm");
    const [updatedEntry] = await db3.update(journalEntries).set(entryData).where(and(eq2(journalEntries.id, entryId), eq2(journalEntries.userId, userId))).returning();
    return updatedEntry;
  }
  async getAllHandyHacks() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    return await db3.select().from(handyHacks);
  }
  async getRandomHandyHack() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { sql } = await import("drizzle-orm");
    const [hack] = await db3.select().from(handyHacks).orderBy(sql`RANDOM()`).limit(1);
    return hack;
  }
  async markHackComplete(userId, hackId, sessionId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    await db3.insert(userHackCompletions).values({ userId, hackId, sessionId }).onConflictDoNothing();
  }
  async getUserHackCompletions(userId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(userHackCompletions).where(eq2(userHackCompletions.userId, userId));
  }
  async getHackPracticeCounts(userId, hackId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and, gte } = await import("drizzle-orm");
    const now = /* @__PURE__ */ new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const [todayCompletions, weekCompletions] = await Promise.all([
      db3.select().from(userHackCompletions).where(and(
        eq2(userHackCompletions.userId, userId),
        eq2(userHackCompletions.hackId, hackId),
        gte(userHackCompletions.completedAt, startOfToday)
      )),
      db3.select().from(userHackCompletions).where(and(
        eq2(userHackCompletions.userId, userId),
        eq2(userHackCompletions.hackId, hackId),
        gte(userHackCompletions.completedAt, startOfWeek)
      ))
    ]);
    return {
      today: todayCompletions.length,
      thisWeek: weekCompletions.length
    };
  }
  async initializeHandyHacks() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { handyHacksData: handyHacksData2 } = await Promise.resolve().then(() => (init_session_data(), session_data_exports));
    const existingHacks = await db3.select().from(handyHacks).limit(1);
    if (existingHacks.length > 0) {
      return;
    }
    for (const hack of handyHacksData2) {
      await db3.insert(handyHacks).values({
        title: hack.title,
        description: hack.description,
        category: hack.category
      });
    }
  }
  async getHandyHacksForSession(sessionId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, asc } = await import("drizzle-orm");
    const result = await db3.select({
      id: handyHacks.id,
      title: handyHacks.title,
      description: handyHacks.description,
      category: handyHacks.category,
      illustration: handyHacks.illustration
    }).from(sessionHandyHacks).innerJoin(handyHacks, eq2(sessionHandyHacks.hackId, handyHacks.id)).where(eq2(sessionHandyHacks.sessionId, sessionId)).orderBy(asc(sessionHandyHacks.sortOrder), asc(handyHacks.id));
    return result;
  }
  async addHackToSession(sessionId, hackId, sortOrder = 0) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    await db3.insert(sessionHandyHacks).values({ sessionId, hackId, sortOrder }).onConflictDoNothing();
  }
  async removeHackFromSession(sessionId, hackId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and } = await import("drizzle-orm");
    await db3.delete(sessionHandyHacks).where(and(eq2(sessionHandyHacks.sessionId, sessionId), eq2(sessionHandyHacks.hackId, hackId)));
  }
  async initializeSessionHandyHacks() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { sessionHacksMapping: sessionHacksMapping2 } = await Promise.resolve().then(() => (init_session_data(), session_data_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const existingSessionHacks = await db3.select().from(sessionHandyHacks).limit(1);
    if (existingSessionHacks.length > 0) {
      return;
    }
    const allHacks = await db3.select().from(handyHacks);
    const hackTitleToId = new Map(allHacks.map((hack) => [hack.title, hack.id]));
    for (const [sessionIdStr, hackTitles] of Object.entries(sessionHacksMapping2)) {
      const sessionId = parseInt(sessionIdStr);
      for (let i = 0; i < hackTitles.length; i++) {
        const hackTitle = hackTitles[i];
        const hackId = hackTitleToId.get(hackTitle);
        if (hackId) {
          await this.addHackToSession(sessionId, hackId, i);
        }
      }
    }
  }
  async scheduleHackReminder(userId, hackId, sessionId, scheduledFor, pattern, count = 1) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const [hack] = await db3.select().from(handyHacks).where(eq2(handyHacks.id, hackId));
    if (!hack) {
      throw new Error(`Handy hack with ID ${hackId} not found`);
    }
    const createdNotifications = [];
    const reminderData = {
      userId,
      type: "hack",
      title: `Handy Hack: ${hack.title}`,
      message: hack.description,
      scheduledFor,
      sessionId,
      hackId,
      isRecurring: pattern ? true : false,
      recurringPattern: pattern || null
    };
    const [notification] = await db3.insert(notifications).values(reminderData).returning();
    createdNotifications.push(notification);
    for (let i = 1; i < count; i++) {
      const nextScheduled = new Date(scheduledFor);
      nextScheduled.setDate(nextScheduled.getDate() + i);
      const [nextNotification] = await db3.insert(notifications).values({
        ...reminderData,
        scheduledFor: nextScheduled
      }).returning();
      createdNotifications.push(nextNotification);
    }
    return createdNotifications;
  }
  async getHackReminders(userId, sessionId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2, and } = await import("drizzle-orm");
    if (sessionId !== void 0) {
      return await db3.select().from(notifications).where(and(
        eq2(notifications.userId, userId),
        eq2(notifications.type, "hack"),
        eq2(notifications.sessionId, sessionId)
      ));
    }
    return await db3.select().from(notifications).where(and(
      eq2(notifications.userId, userId),
      eq2(notifications.type, "hack")
    ));
  }
  async createNotification(userId, notification) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const [newNotification] = await db3.insert(notifications).values({ ...notification, userId }).returning();
    return newNotification;
  }
  async getUserNotifications(userId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(notifications).where(eq2(notifications.userId, userId));
  }
  async markNotificationRead(notificationId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    await db3.update(notifications).set({ read: true }).where(eq2(notifications.id, notificationId));
  }
  async getAllMilestones() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    return await db3.select().from(milestones);
  }
  async getUserMilestones(userId) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    return await db3.select().from(userMilestones).where(eq2(userMilestones.userId, userId));
  }
  async checkAndUpdateMilestones(userId) {
    return [];
  }
  async initializeMilestones() {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const existingMilestones = await db3.select().from(milestones).limit(1);
    if (existingMilestones.length > 0) {
      return;
    }
    const milestonesData = [
      { title: "First Session", description: "Complete your first meditation session", type: "sessions", target: 1, badge: "\u{1F9D8}", color: "#3B82F6" },
      { title: "Week Warrior", description: "Complete all sessions in a week", type: "weekly", target: 1, badge: "\u2B50", color: "#10B981" },
      { title: "Consistent Practice", description: "Meditate for 7 days in a row", type: "streak", target: 7, badge: "\u{1F525}", color: "#F59E0B" },
      { title: "Deep Listener", description: "Listen for 60 minutes total", type: "time", target: 3600, badge: "\u{1F3A7}", color: "#8B5CF6" }
    ];
    for (const milestone of milestonesData) {
      await db3.insert(milestones).values(milestone);
    }
  }
  async updateUserNotificationSettings(userId, settings) {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    await db3.update(users).set({
      notificationsEnabled: settings.notificationsEnabled,
      reminderTime: settings.reminderTime,
      reminderDays: settings.reminderDays
    }).where(eq2(users.id, userId));
  }
  async scheduleUserReminders(userId) {
  }
  async createSessionAnalytics(userId, analytics) {
    const [result] = await db.insert(sessionAnalytics).values({
      userId,
      ...analytics
    }).returning();
    return result;
  }
  async updateSessionAnalytics(analyticsId, analytics) {
    await db.update(sessionAnalytics).set(analytics).where(eq(sessionAnalytics.id, analyticsId));
  }
  async getSessionAnalytics(userId, sessionId) {
    const query = db.select().from(sessionAnalytics).where(eq(sessionAnalytics.userId, userId));
    if (sessionId) {
      return await query.where(eq(sessionAnalytics.sessionId, sessionId));
    }
    return await query;
  }
  async getAdvancedProgressData(userId) {
    const { sql, sum, avg, count, max } = await import("drizzle-orm");
    const totalListenTimeResult = await db.select({ total: sum(userProgress.totalListenTime) }).from(userProgress).where(eq(userProgress.userId, userId));
    const totalListenTime = totalListenTimeResult[0]?.total || 0;
    const avgCompletionResult = await db.select({ avg: avg(userProgress.completionPercentage) }).from(userProgress).where(eq(userProgress.userId, userId));
    const averageSessionCompletion = avgCompletionResult[0]?.avg || 0;
    const mostPlayedResult = await db.select({
      sessionId: userProgress.sessionId,
      playCount: max(userProgress.playCount)
    }).from(userProgress).where(eq(userProgress.userId, userId)).groupBy(userProgress.sessionId).orderBy(sql`${max(userProgress.playCount)} DESC`).limit(1);
    let mostPlayedSession = null;
    if (mostPlayedResult[0]?.sessionId) {
      const sessionResult = await db.select().from(meditationSessions).where(eq(meditationSessions.id, mostPlayedResult[0].sessionId));
      mostPlayedSession = sessionResult[0] || null;
    }
    const streakResult = await db.select({ streak: max(userProgress.streakDays) }).from(userProgress).where(eq(userProgress.userId, userId));
    const streakDays = streakResult[0]?.streak || 0;
    const weeklyProgressResult = await db.select({
      week: meditationSessions.week,
      completedSessions: count(sql`CASE WHEN ${userProgress.completed} = true THEN 1 END`),
      totalSessions: count(meditationSessions.id)
    }).from(meditationSessions).leftJoin(
      userProgress,
      sql`${meditationSessions.id} = ${userProgress.sessionId} AND ${userProgress.userId} = ${userId}`
    ).groupBy(meditationSessions.week).orderBy(meditationSessions.week);
    const weeklyProgress = weeklyProgressResult.map((row) => ({
      week: row.week,
      completedSessions: row.completedSessions || 0,
      totalSessions: row.totalSessions || 0
    }));
    const practicePatternResult = await db.select({
      hour: sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`.as("hour"),
      sessionCount: count(sessionAnalytics.id)
    }).from(sessionAnalytics).where(eq(sessionAnalytics.userId, userId)).groupBy(sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`).orderBy(sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`);
    const practicePattern = practicePatternResult.map((row) => ({
      hour: Number(row.hour),
      sessionCount: row.sessionCount || 0
    }));
    return {
      totalListenTime,
      averageSessionCompletion,
      mostPlayedSession,
      streakDays,
      weeklyProgress,
      practicePattern
    };
  }
};
var MemStorage = class {
  users;
  sessions;
  userProgress;
  journalEntries;
  handyHacks;
  userHackCompletions;
  notifications;
  milestones;
  userMilestones;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.sessions = /* @__PURE__ */ new Map();
    this.userProgress = /* @__PURE__ */ new Map();
    this.journalEntries = /* @__PURE__ */ new Map();
    this.handyHacks = /* @__PURE__ */ new Map();
    this.userHackCompletions = /* @__PURE__ */ new Map();
    this.notifications = /* @__PURE__ */ new Map();
    this.milestones = /* @__PURE__ */ new Map();
    this.userMilestones = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.initializeSessions();
    this.initializeHandyHacks();
    this.initializeMilestones();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = {
      ...insertUser,
      id,
      currentWeek: 1,
      joinedAt: /* @__PURE__ */ new Date(),
      notificationsEnabled: true,
      reminderTime: "09:00",
      reminderDays: [1, 2, 3, 4, 5],
      timezone: "UTC"
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserWeek(userId, week) {
    const user = this.users.get(userId);
    if (user) {
      user.currentWeek = week;
      this.users.set(userId, user);
    }
  }
  async updateUserSessionsPace(userId, sessionsPace) {
    const numericUserId = parseInt(userId);
    const user = this.users.get(numericUserId);
    if (user) {
      user.sessionsPace = sessionsPace;
      this.users.set(numericUserId, user);
    }
  }
  async updateUserCourseFormat(userId, courseFormat) {
    const numericUserId = parseInt(userId);
    const user = this.users.get(numericUserId);
    if (user) {
      user.courseFormat = courseFormat;
      this.users.set(numericUserId, user);
    }
  }
  async getAllSessions() {
    return Array.from(this.sessions.values());
  }
  async getSessionsByWeek(week) {
    return Array.from(this.sessions.values()).filter((session) => session.week === week);
  }
  async initializeSessions() {
    const sessionData2 = [
      {
        week: 1,
        title: "Dropping the Balloon",
        practiceName: "Grounding",
        description: "Learning to let go and recognize when we're in 'keepy-uppy' mode.",
        audioUrl: "/attached_assets/Grounding 10min_1751647354223.mp3",
        duration: 10,
        illustration: "dropping-balloon",
        isLocked: false,
        handyHack: "Drop the Balloon (whenever you notice the twitch)"
      },
      {
        week: 2,
        title: "Journey to Now",
        practiceName: "Seven Stations of the Spine",
        description: "The body as a reliable anchor to the present moment.",
        audioUrl: "/attached_assets/The Seven Stations of the Spine_1751648246548.mp3",
        duration: 20,
        illustration: "seven-stations-spine",
        isLocked: false,
        handyHack: "Unclench and Breathe"
      },
      {
        week: 3,
        title: "Coming to Our Senses",
        practiceName: "The Sense of Being Alive",
        description: "What if thoughts and emotions were also considered senses?",
        audioUrl: "/attached_assets/The Sense of Being Alive (20 minutes)_1751649276591.mp3",
        duration: 20,
        illustration: "the-sense-being-alive",
        isLocked: false,
        handyHack: "The Three Precious Pills (stillness, silence, spaciousness)"
      },
      {
        week: 4,
        title: "Body, Movement, Mind",
        practiceName: "Mind in Body, Body in Movement, Movement in Mind",
        description: "Meditation doesn't have to mean stillness.",
        audioUrl: "/attached_assets/Mind in Body, Body in Movement, Movement n Mind (10min)_1751649693383.mp3",
        duration: 10,
        illustration: "mind-body-movement",
        isLocked: false,
        handyHack: "Exploring Opening and Closing"
      },
      {
        week: 5,
        title: "What You Really Want",
        practiceName: "What if All There is is This?",
        description: "Exploring what happens when we fully accept the present moment.",
        audioUrl: "/attached_assets/What if all there is is this 10 minute version_1751649984256.mp3",
        duration: 10,
        illustration: "what-if-all-there-is",
        isLocked: false,
        handyHack: "Watch the Want"
      },
      {
        week: 6,
        title: "Leaning into Difficulty",
        practiceName: "Turning Towards the Difficult",
        description: "Understanding emotions as signals and finding the gold in our wounds.",
        audioUrl: "/attached_assets/turning towards the difficult 15 Minutes_1751650302023.mp3",
        duration: 15,
        illustration: "turning-towards-discomfort",
        isLocked: false,
        handyHack: "The 5 Elements (anger, sadness, joy, disgust, fear)"
      },
      {
        week: 6,
        title: "Five Elements Practice",
        description: "Harmonizing with natural elements for deeper awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/5-elements-practice",
        duration: 15,
        illustration: "five-elements",
        isLocked: false
      },
      {
        week: 7,
        title: "The Perfect Distance",
        practiceName: "The Four Pillars",
        description: "When distance collapses, there is simply what is happening \u2014 and true response-ability becomes possible.",
        audioUrl: "/attached_assets/fourpillarspractice_1751651309349.mp3",
        duration: 22,
        illustration: "journaling-flow",
        isLocked: false,
        handyHack: "Presence - Set Frame - Release",
        journaling: "Full Flow Journal System (Gratitude, High Flow & High Value Priorities, Script Your Day, Review Your Day)"
      },
      {
        week: 8,
        title: "Falling Awake",
        practiceName: "Great Smile Practice",
        description: "Embracing the paradox of awakening and falling in love with what is.",
        audioUrl: "/attached_assets/great smile practice_1751652000000.mp3",
        duration: 16,
        illustration: "great-smile",
        isLocked: false,
        handyHack: "Great Smile"
      }
    ];
    sessionData2.forEach((session, index2) => {
      const id = index2 + 1;
      this.sessions.set(id, { ...session, id });
    });
  }
  async getUserProgress(userId) {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }
  async updateSessionProgress(userId, sessionId, progress) {
    const key = `${userId}-${sessionId}`;
    const existing = this.userProgress.get(key);
    if (existing) {
      const updated = { ...existing, ...progress };
      this.userProgress.set(key, updated);
    } else {
      const id = this.currentId++;
      const newProgress = {
        id,
        userId,
        sessionId,
        completed: false,
        completedAt: null,
        audioProgress: 0,
        totalListenTime: 0,
        streakDays: 0,
        ...progress
      };
      this.userProgress.set(key, newProgress);
    }
  }
  async completeSession(userId, sessionId, preMood, postMood) {
    const key = `${userId}-${sessionId}`;
    const existing = this.userProgress.get(key);
    if (existing) {
      existing.completed = true;
      existing.completedAt = /* @__PURE__ */ new Date();
      if (preMood !== void 0) existing.preMood = preMood;
      if (postMood !== void 0) existing.postMood = postMood;
      this.userProgress.set(key, existing);
    } else {
      const id = this.currentId++;
      const newProgress = {
        id,
        userId,
        sessionId,
        completed: true,
        completedAt: /* @__PURE__ */ new Date(),
        audioProgress: 0,
        totalListenTime: 0,
        streakDays: 0,
        preMood: preMood ?? null,
        postMood: postMood ?? null
      };
      this.userProgress.set(key, newProgress);
    }
  }
  async getUserJournalEntries(userId) {
    return Array.from(this.journalEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }
  async createJournalEntry(userId, entry) {
    const id = this.currentId++;
    const journalEntry = {
      id,
      userId,
      date: /* @__PURE__ */ new Date(),
      gratitude1: entry.gratitude1 || null,
      gratitude2: entry.gratitude2 || null,
      gratitude3: entry.gratitude3 || null,
      highValuePriority1: entry.highValuePriority1 || null,
      highValuePriority2: entry.highValuePriority2 || null,
      highValuePriority3: entry.highValuePriority3 || null,
      highFlowPriority1: entry.highFlowPriority1 || null,
      highFlowPriority2: entry.highFlowPriority2 || null,
      highFlowPriority3: entry.highFlowPriority3 || null,
      scriptingVoiceNote: entry.scriptingVoiceNote || null,
      scriptingText: entry.scriptingText || null,
      reflectionVoiceNote: entry.reflectionVoiceNote || null,
      reflectionText: entry.reflectionText || null,
      morningCompleted: entry.morningCompleted || false,
      eveningCompleted: entry.eveningCompleted || false,
      completedAt: null
    };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }
  async updateJournalEntry(userId, entryId, entryData) {
    const existingEntry = this.journalEntries.get(entryId);
    if (!existingEntry || existingEntry.userId !== userId) {
      throw new Error("Journal entry not found");
    }
    const updatedEntry = {
      ...existingEntry,
      gratitude1: entryData.gratitude1 !== void 0 ? entryData.gratitude1 : existingEntry.gratitude1,
      gratitude2: entryData.gratitude2 !== void 0 ? entryData.gratitude2 : existingEntry.gratitude2,
      gratitude3: entryData.gratitude3 !== void 0 ? entryData.gratitude3 : existingEntry.gratitude3,
      highValuePriority1: entryData.highValuePriority1 !== void 0 ? entryData.highValuePriority1 : existingEntry.highValuePriority1,
      highValuePriority2: entryData.highValuePriority2 !== void 0 ? entryData.highValuePriority2 : existingEntry.highValuePriority2,
      highValuePriority3: entryData.highValuePriority3 !== void 0 ? entryData.highValuePriority3 : existingEntry.highValuePriority3,
      highFlowPriority1: entryData.highFlowPriority1 !== void 0 ? entryData.highFlowPriority1 : existingEntry.highFlowPriority1,
      highFlowPriority2: entryData.highFlowPriority2 !== void 0 ? entryData.highFlowPriority2 : existingEntry.highFlowPriority2,
      highFlowPriority3: entryData.highFlowPriority3 !== void 0 ? entryData.highFlowPriority3 : existingEntry.highFlowPriority3,
      scriptingVoiceNote: entryData.scriptingVoiceNote !== void 0 ? entryData.scriptingVoiceNote : existingEntry.scriptingVoiceNote,
      scriptingText: entryData.scriptingText !== void 0 ? entryData.scriptingText : existingEntry.scriptingText,
      reflectionVoiceNote: entryData.reflectionVoiceNote !== void 0 ? entryData.reflectionVoiceNote : existingEntry.reflectionVoiceNote,
      reflectionText: entryData.reflectionText !== void 0 ? entryData.reflectionText : existingEntry.reflectionText,
      morningCompleted: entryData.morningCompleted !== void 0 ? entryData.morningCompleted : existingEntry.morningCompleted,
      eveningCompleted: entryData.eveningCompleted !== void 0 ? entryData.eveningCompleted : existingEntry.eveningCompleted,
      completedAt: entryData.morningCompleted && entryData.eveningCompleted ? /* @__PURE__ */ new Date() : existingEntry.completedAt
    };
    this.journalEntries.set(entryId, updatedEntry);
    return updatedEntry;
  }
  async getAllHandyHacks() {
    return Array.from(this.handyHacks.values());
  }
  async getRandomHandyHack() {
    const hacks = Array.from(this.handyHacks.values());
    if (hacks.length === 0) return void 0;
    return hacks[Math.floor(Math.random() * hacks.length)];
  }
  async markHackComplete(userId, hackId) {
    const id = this.currentId++;
    const completion = {
      id,
      userId,
      hackId,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.userHackCompletions.set(id, completion);
  }
  async getUserHackCompletions(userId) {
    return Array.from(this.userHackCompletions.values()).filter(
      (completion) => completion.userId === userId
    );
  }
  async getHackPracticeCounts(userId, hackId) {
    const now = /* @__PURE__ */ new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const completions = Array.from(this.userHackCompletions.values()).filter(
      (completion) => completion.userId === userId && completion.hackId === hackId
    );
    const todayCount = completions.filter(
      (c) => c.completedAt && new Date(c.completedAt) >= startOfToday
    ).length;
    const weekCount = completions.filter(
      (c) => c.completedAt && new Date(c.completedAt) >= startOfWeek
    ).length;
    return { today: todayCount, thisWeek: weekCount };
  }
  async initializeHandyHacks() {
    const hacksData = [
      {
        title: "Remember to Drop the Balloon!",
        description: "Let go of what you're carrying that isn't yours to hold. Release mental burdens and find lightness.",
        category: "week-1",
        illustration: "dropping-balloon"
      },
      {
        title: "Remember to Unclench and Breathe",
        description: "Notice where you're holding tension and soften. Allow your breath to flow naturally.",
        category: "week-2",
        illustration: "seven-stations-spine"
      },
      {
        title: "Remember to Take the Three Precious Pills!",
        description: "Connect with the fundamental aliveness within. Feel the sense of being alive in this moment.",
        category: "week-3",
        illustration: "the-sense-being-alive"
      },
      {
        title: "Remember to Explore Opening and Closing to Experience",
        description: "Notice how you open to pleasant experiences and close to difficult ones. Practice staying present with both.",
        category: "week-4",
        illustration: "mind-body-movement"
      },
      {
        title: "Remember to Watch the Wanting",
        description: "Observe your desires and wanting without being swept away by them. What if all there is is this moment?",
        category: "week-5",
        illustration: "what-if-all-there-is"
      },
      {
        title: "Remember to Connect with the 5 Elements",
        description: "Ground yourself by connecting with earth, water, fire, air, and space. Feel your place in the natural world.",
        category: "week-6",
        illustration: "five-elements"
      },
      {
        title: "Remember to Add Scripting and Reflecting to Your Journaling",
        description: "Use the four pillars of wellbeing: script your day, reflect on what went well, and plan mindfully.",
        category: "week-7",
        illustration: "four-pillars"
      },
      {
        title: "Remember to Do a Great Smile",
        description: "Let a genuine smile arise from within. Feel how it transforms your inner state and radiates outward.",
        category: "week-8",
        illustration: "great-smile"
      }
    ];
    hacksData.forEach((hack, index2) => {
      const id = index2 + 1;
      this.handyHacks.set(id, { ...hack, id });
    });
  }
  async createNotification(userId, notification) {
    const id = this.currentId++;
    const newNotification = {
      ...notification,
      id,
      userId,
      sent: false,
      read: false,
      isRecurring: false,
      recurringPattern: null,
      nextScheduled: null
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  async getUserNotifications(userId) {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }
  async markNotificationRead(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }
  // Milestone methods
  async getAllMilestones() {
    return Array.from(this.milestones.values());
  }
  async getUserMilestones(userId) {
    return Array.from(this.userMilestones.values()).filter(
      (milestone) => milestone.userId === userId
    );
  }
  async checkAndUpdateMilestones(userId) {
    const userProgress2 = await this.getUserProgress(userId);
    const userHackCompletions2 = await this.getUserHackCompletions(userId);
    const allMilestones = await this.getAllMilestones();
    const userMilestones2 = await this.getUserMilestones(userId);
    const newMilestones = [];
    for (const milestone of allMilestones) {
      const existingMilestone = userMilestones2.find((um) => um.milestoneId === milestone.id);
      if (existingMilestone) continue;
      let currentProgress = 0;
      let achieved = false;
      switch (milestone.type) {
        case "sessions":
          currentProgress = userProgress2.filter((p) => p.completed).length;
          achieved = currentProgress >= milestone.target;
          break;
        case "time":
          currentProgress = userProgress2.reduce((total, p) => total + (p.totalListenTime || 0), 0);
          achieved = currentProgress >= milestone.target;
          break;
        case "streak":
          currentProgress = userProgress2.length > 0 ? Math.max(...userProgress2.map((p) => p.streakDays || 0)) : 0;
          achieved = currentProgress >= milestone.target;
          break;
        case "weekly":
          const completedWeeks = new Set(userProgress2.filter((p) => p.completed).map((p) => {
            const session = Array.from(this.sessions.values()).find((s) => s.id === p.sessionId);
            return session?.week;
          }));
          currentProgress = completedWeeks.size;
          achieved = currentProgress >= milestone.target;
          break;
      }
      if (achieved) {
        const id = this.currentId++;
        const newUserMilestone = {
          id,
          userId,
          milestoneId: milestone.id,
          achievedAt: /* @__PURE__ */ new Date(),
          progress: currentProgress
        };
        this.userMilestones.set(id, newUserMilestone);
        newMilestones.push(newUserMilestone);
      }
    }
    return newMilestones;
  }
  async initializeMilestones() {
    if (this.milestones.size > 0) return;
    const milestoneData = [
      {
        id: 1,
        title: "First Steps",
        description: "Complete your first meditation session",
        type: "sessions",
        target: 1,
        badge: "\u{1F331}",
        color: "#10B981"
      },
      {
        id: 2,
        title: "Building Momentum",
        description: "Complete 5 meditation sessions",
        type: "sessions",
        target: 5,
        badge: "\u{1F33F}",
        color: "#3B82F6"
      },
      {
        id: 3,
        title: "Dedication",
        description: "Complete 10 meditation sessions",
        type: "sessions",
        target: 10,
        badge: "\u{1F333}",
        color: "#8B5CF6"
      },
      {
        id: 4,
        title: "Time Traveler",
        description: "Meditate for 30 minutes total",
        type: "time",
        target: 1800,
        // 30 minutes in seconds
        badge: "\u23F0",
        color: "#F59E0B"
      },
      {
        id: 5,
        title: "Mindful Hour",
        description: "Meditate for 60 minutes total",
        type: "time",
        target: 3600,
        // 60 minutes in seconds
        badge: "\u{1F550}",
        color: "#EF4444"
      },
      {
        id: 6,
        title: "Week Explorer",
        description: "Complete sessions from 3 different weeks",
        type: "weekly",
        target: 3,
        badge: "\u{1F5D3}\uFE0F",
        color: "#06B6D4"
      },
      {
        id: 7,
        title: "Journey Master",
        description: "Complete sessions from all 8 weeks",
        type: "weekly",
        target: 8,
        badge: "\u{1F3C6}",
        color: "#DC2626"
      }
    ];
    milestoneData.forEach((milestone) => {
      this.milestones.set(milestone.id, milestone);
    });
  }
  // Notification Settings methods
  async updateUserNotificationSettings(userId, settings) {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        notificationsEnabled: settings.notificationsEnabled,
        reminderTime: settings.reminderTime,
        reminderDays: settings.reminderDays
      };
      this.users.set(userId, updatedUser);
    }
  }
  async scheduleUserReminders(userId) {
    const user = this.users.get(userId);
    if (!user || !user.notificationsEnabled) {
      return;
    }
    const existingReminders = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && n.type === "reminder"
    );
    existingReminders.forEach((reminder) => {
      this.notifications.delete(reminder.id);
    });
    const reminderDays = user.reminderDays || [1, 2, 3, 4, 5];
    const reminderTime = user.reminderTime || "09:00";
    const [hours, minutes] = reminderTime.split(":").map(Number);
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = /* @__PURE__ */ new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const dayOfWeek = targetDate.getDay();
      if (reminderDays.includes(dayOfWeek)) {
        targetDate.setHours(hours, minutes, 0, 0);
        if (targetDate > /* @__PURE__ */ new Date()) {
          const reminderMessages = [
            "Time for your daily mindfulness practice! \u{1F9D8}\u200D\u2640\uFE0F",
            "Take a moment to breathe and be present \u{1F331}",
            "Your meditation session is waiting for you \u2728",
            "Remember to pause and practice mindfulness today \u{1F338}",
            "A few minutes of mindfulness can transform your day \u{1F31F}"
          ];
          const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
          const id = this.currentId++;
          const reminder = {
            id,
            userId,
            type: "reminder",
            title: "Practice Reminder",
            message: randomMessage,
            scheduledFor: targetDate,
            sent: false,
            read: false,
            isRecurring: true,
            recurringPattern: "daily",
            nextScheduled: targetDate
          };
          this.notifications.set(id, reminder);
        }
      }
    }
  }
};
var storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

// server/routes.ts
init_schema();

// server/transcription.ts
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
async function transcribeAudio(audioBuffer, originalFilename) {
  let tempFilePath = null;
  try {
    const fileExtension = path.extname(originalFilename) || ".webm";
    tempFilePath = path.join(tmpdir(), `audio_${Date.now()}${fileExtension}`);
    await fs.promises.writeFile(tempFilePath, audioBuffer);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });
    return transcription;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    if (tempFilePath) {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError);
      }
    }
  }
}

// server/routes.ts
import multer from "multer";
async function registerRoutes(app2) {
  const mockAuthMiddleware = (req, res, next) => {
    req.user = {
      claims: {
        sub: "1",
        // Demo user ID
        email: "demo@example.com",
        first_name: "Demo",
        last_name: "User"
      }
    };
    req.isAuthenticated = () => true;
    next();
  };
  app2.put("/api/users/:userId/sessions-pace", mockAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionsPace } = req.body;
      if (sessionsPace !== 1 && sessionsPace !== 2) {
        return res.status(400).json({ error: "Sessions pace must be 1 or 2" });
      }
      await storage.updateUserSessionsPace(userId, sessionsPace);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating sessions pace:", error);
      res.status(500).json({ error: "Failed to update sessions pace" });
    }
  });
  app2.put("/api/users/:userId/course-format", mockAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseFormat } = req.body;
      if (!["8-week", "4-week", "3-day"].includes(courseFormat)) {
        return res.status(400).json({ error: "Course format must be '8-week', '4-week', or '3-day'" });
      }
      await storage.updateUserCourseFormat(userId, courseFormat);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating course format:", error);
      res.status(500).json({ error: "Failed to update course format" });
    }
  });
  try {
    await storage.initializeSessions();
    await storage.initializeHandyHacks();
    await storage.initializeSessionHandyHacks();
    await storage.initializeMilestones();
    await storage.upsertUser({
      id: "1",
      email: null,
      firstName: null,
      lastName: null
    });
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Only audio files are allowed"));
      }
    }
  });
  app2.get("/api/auth/user", mockAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = upsertUserSchema.parse(req.body);
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app2.get("/api/users/:id", mockAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.put("/api/users/:id/week", mockAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { week } = req.body;
      await storage.updateUserWeek(userId, week);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user week" });
    }
  });
  app2.get("/api/sessions", async (req, res) => {
    try {
      const sessions2 = await storage.getAllSessions();
      res.json(sessions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });
  app2.get("/api/sessions/week/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const sessions2 = await storage.getSessionsByWeek(week);
      res.json(sessions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions for week" });
    }
  });
  app2.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });
  app2.post("/api/users/:userId/progress/:sessionId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionId = parseInt(req.params.sessionId);
      const { audioProgress, completed, totalListenTime } = req.body;
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      await storage.updateSessionProgress(userId, sessionId, {
        audioProgress,
        completed,
        totalListenTime
      });
      if (req.body.analyticsData) {
        const { analyticsData } = req.body;
        await storage.createSessionAnalytics(userId, {
          sessionId,
          ...analyticsData
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });
  app2.post("/api/users/:userId/complete/:sessionId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const { preMood, postMood } = req.body;
      const parsedPreMood = preMood !== void 0 ? parseInt(preMood) : void 0;
      const parsedPostMood = postMood !== void 0 ? parseInt(postMood) : void 0;
      await storage.completeSession(userId, sessionId, parsedPreMood, parsedPostMood);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ error: "Failed to complete session" });
    }
  });
  app2.post("/api/users/:userId/analytics", async (req, res) => {
    try {
      const userId = req.params.userId;
      const analyticsData = req.body;
      if (!analyticsData.sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      const analytics = await storage.createSessionAnalytics(userId, analyticsData);
      res.json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(500).json({ error: "Failed to create analytics" });
    }
  });
  app2.get("/api/users/:userId/analytics", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : void 0;
      const analytics = await storage.getSessionAnalytics(userId, sessionId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/users/:userId/progress/advanced", async (req, res) => {
    try {
      const userId = req.params.userId;
      const advancedData = await storage.getAdvancedProgressData(userId);
      res.json(advancedData);
    } catch (error) {
      console.error("Error fetching advanced progress data:", error);
      res.status(500).json({ error: "Failed to fetch advanced progress data" });
    }
  });
  app2.get("/api/users/:userId/journal", async (req, res) => {
    try {
      const userId = req.params.userId;
      const entries = await storage.getUserJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });
  app2.post("/api/users/:userId/journal", async (req, res) => {
    try {
      const userId = req.params.userId;
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(userId, entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });
  app2.put("/api/users/:userId/journal/:entryId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const entryId = parseInt(req.params.entryId);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.updateJournalEntry(userId, entryId, entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });
  app2.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      const transcription = await transcribeAudio(req.file.buffer, req.file.originalname);
      res.json({ transcription });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });
  app2.get("/api/handy-hacks", async (req, res) => {
    try {
      const hacks = await storage.getAllHandyHacks();
      res.json(hacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch handy hacks" });
    }
  });
  app2.get("/api/handy-hacks/random", async (req, res) => {
    try {
      const hack = await storage.getRandomHandyHack();
      if (!hack) {
        return res.status(404).json({ error: "No handy hacks available" });
      }
      res.json(hack);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch random handy hack" });
    }
  });
  app2.get("/api/sessions/:sessionId/hacks", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const hacks = await storage.getHandyHacksForSession(sessionId);
      res.json(hacks);
    } catch (error) {
      console.error("Error fetching session hacks:", error);
      res.status(500).json({ error: "Failed to fetch session handy hacks" });
    }
  });
  app2.post("/api/users/:userId/hacks/:hackId/complete", async (req, res) => {
    try {
      const userId = req.params.userId;
      const hackId = parseInt(req.params.hackId);
      const { sessionId } = req.body;
      if (isNaN(hackId)) {
        return res.status(400).json({ error: "Invalid hack ID" });
      }
      await storage.markHackComplete(userId, hackId, sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking hack as complete:", error);
      res.status(500).json({ error: "Failed to mark hack as complete" });
    }
  });
  app2.post("/api/hacks/:hackId/reminders", async (req, res) => {
    try {
      const hackId = parseInt(req.params.hackId);
      const { userId, scheduledFor, count = 1, pattern, sessionId } = req.body;
      if (isNaN(hackId)) {
        return res.status(400).json({ error: "Invalid hack ID" });
      }
      if (!userId || !scheduledFor) {
        return res.status(400).json({ error: "userId and scheduledFor are required" });
      }
      const reminders = await storage.scheduleHackReminder(
        userId,
        hackId,
        sessionId,
        new Date(scheduledFor),
        pattern,
        count
      );
      res.json(reminders);
    } catch (error) {
      console.error("Error scheduling hack reminders:", error);
      res.status(500).json({ error: "Failed to schedule hack reminders" });
    }
  });
  app2.get("/api/users/:userId/hack-reminders", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : void 0;
      const reminders = await storage.getHackReminders(userId, sessionId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching hack reminders:", error);
      res.status(500).json({ error: "Failed to fetch hack reminders" });
    }
  });
  app2.get("/api/users/:userId/hack-completions", async (req, res) => {
    try {
      const userId = req.params.userId;
      const completions = await storage.getUserHackCompletions(userId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching hack completions:", error);
      res.status(500).json({ error: "Failed to fetch hack completions" });
    }
  });
  app2.get("/api/users/:userId/hacks/:hackId/practice-counts", async (req, res) => {
    try {
      const userId = req.params.userId;
      const hackId = parseInt(req.params.hackId);
      if (isNaN(hackId)) {
        return res.status(400).json({ error: "Invalid hack ID" });
      }
      const counts = await storage.getHackPracticeCounts(userId, hackId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching hack practice counts:", error);
      res.status(500).json({ error: "Failed to fetch practice counts" });
    }
  });
  app2.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = req.params.userId;
      const notifications2 = await storage.getUserNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = req.params.userId;
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(userId, notificationData);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(400).json({ error: "Invalid notification data" });
    }
  });
  app2.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/milestones", async (req, res) => {
    try {
      const milestones2 = await storage.getAllMilestones();
      res.json(milestones2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });
  app2.get("/api/users/:userId/milestones", async (req, res) => {
    try {
      const userId = req.params.userId;
      const userMilestones2 = await storage.getUserMilestones(userId);
      res.json(userMilestones2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user milestones" });
    }
  });
  app2.post("/api/users/:userId/milestones/check", async (req, res) => {
    try {
      const userId = req.params.userId;
      const newMilestones = await storage.checkAndUpdateMilestones(userId);
      res.json(newMilestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to check milestones" });
    }
  });
  app2.put("/api/users/:userId/notification-settings", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { notificationsEnabled, reminderTime, reminderDays } = req.body;
      await storage.updateUserNotificationSettings(userId, {
        notificationsEnabled,
        reminderTime,
        reminderDays
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });
  app2.post("/api/users/:userId/schedule-reminders", async (req, res) => {
    try {
      const userId = req.params.userId;
      await storage.scheduleUserReminders(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule reminders" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import fs2 from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Copy attached_assets into the build output so Capacitor iOS/Android can serve them
    {
      name: "copy-attached-assets",
      closeBundle() {
        const src = path2.resolve(import.meta.dirname, "attached_assets");
        const dest = path2.resolve(import.meta.dirname, "dist/public/attached_assets");
        if (fs2.existsSync(src)) {
          fs2.cpSync(src, dest, { recursive: true });
        }
      }
    },
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(cors());
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use("/attached_assets", express2.static("attached_assets"));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
