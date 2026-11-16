import { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X, RotateCcw, Minus, Camera, ArrowUpRight, ChevronDown, Check, MapPin, Clock, Phone, Mail, Instagram, ArrowLeft } from "lucide-react";

/* =========================================================
   PEAK FORM — concept strength studio
   Single-file React site. Pages are switched with state.
   Every photo slot uses <Photo shot="..."/>; pass src="..." to drop in real images.
   ========================================================= */

/* ---------- Plate system (competition colors carry meaning) ---------- */
const PLATE_SPECS = {
  25: { color: "var(--red)", ink: "#fff", h: 250, w: 30, name: "Red" },
  20: { color: "var(--blue)", ink: "#fff", h: 250, w: 26, name: "Blue" },
  15: { color: "var(--yellow)", ink: "var(--iron)", h: 214, w: 22, name: "Yellow" },
  10: { color: "var(--green)", ink: "#fff", h: 180, w: 20, name: "Green" },
  5: { color: "var(--plate-white)", ink: "var(--iron)", h: 130, w: 16, name: "White" },
  2.5: { color: "var(--plate-black)", ink: "#fff", h: 100, w: 12, name: "Black" },
};
const PLATE_ORDER = [25, 20, 15, 10, 5, 2.5];

/* ---------- Content ---------- */
const PROGRAMS = [
  {
    id: "foundations", name: "Strength Foundations", kg: 10, level: "Beginner", session: "60 min", frequency: "3 a week", block: "8 weeks",
    short: "Learn the four lifts every program here is built on.",
    who: "You’ve never trained with a barbell, or you’re coming back after a long break.",
    includes: ["Movement assessment in your first week", "Squat, hinge, press and pull taught step by step", "Groups capped at six, so every rep gets seen"],
    outcome: "You’ll leave able to train safely on your own, with your first numbers on the board.",
  },
  {
    id: "womens", name: "Women’s Strength", kg: 20, level: "All levels", session: "60 min", frequency: "3 a week", block: "Ongoing",
    short: "Barbell training in a women-only class.",
    who: "You want to lift heavy, learn properly, and train alongside other women.",
    includes: ["Coached by women who compete", "Programming that accounts for cycle, pregnancy and menopause", "Beginner and experienced lanes in every class"],
    outcome: "Real strength gains, with a group that keeps you coming back.",
  },
  {
    id: "hypertrophy", name: "Hypertrophy", kg: 15, level: "Intermediate", session: "75 min", frequency: "4 a week", block: "10 weeks",
    short: "Build muscle with structured, tracked volume.",
    who: "You know your way around a gym and want more size, not just bigger numbers.",
    includes: ["Split routines with logged weekly volume", "Tempo and range-of-motion coaching", "Nutrition check-ins every two weeks"],
    outcome: "Visible muscle gain, backed by a logbook instead of guesswork.",
  },
  {
    id: "powerlifting", name: "Powerlifting", kg: 25, level: "Advanced", session: "90 min", frequency: "4 a week", block: "12-week meet prep",
    short: "Squat, bench and deadlift, programmed to peak.",
    who: "You lift already and want a bigger total, or a meet on the calendar.",
    includes: ["Individual programming reviewed every week", "Video analysis of your top sets", "Meet-day handling, from warm-up room to third attempt"],
    outcome: "A measurable total increase every block, and a lifter ready for the platform.",
  },
  {
    id: "athletic", name: "Athletic Performance", kg: 5, level: "Intermediate", session: "75 min", frequency: "3 a week", block: "Season-based",
    short: "Power, speed and durability for your sport.",
    who: "You play a sport and want to be faster, harder to injure, and stronger late in the game.",
    includes: ["Jump, sprint and change-of-direction work", "Separate in-season and off-season phases", "Performance testing every six weeks"],
    outcome: "Better numbers on the tests that matter for your sport.",
  },
  {
    id: "mobility", name: "Mobility & Recovery", kg: 2.5, level: "All levels", session: "45 min", frequency: "2 a week", block: "Drop in any week",
    short: "Move better, so you can keep lifting for decades.",
    who: "You’re stiff, sore, or working around an old injury.",
    includes: ["Led by a chartered physiotherapist", "Joint-by-joint mobility progressions", "Recovery room access after class"],
    outcome: "Fewer niggles, and full range in the positions you lift in.",
  },
];
const progById = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

const COACHES = [
  { id: "hamza", name: "Hamza Qureshi", role: "Head coach and founder", program: "powerlifting", pr: "Deadlift 285 kg", years: "14 years coaching",
    certs: ["IPF Level 2 coach", "BSc Sport Science"], quote: "Strong is a skill. Skills can be taught.",
    bio: "Hamza competed for a decade before opening Peak Form in 2019. He wrote the studio’s programming framework and still coaches the 6am powerlifting group himself, coffee in hand." },
  { id: "maya", name: "Maya Lindqvist", role: "Women’s strength lead", program: "womens", pr: "Squat 160 kg", years: "9 years coaching",
    certs: ["NSCA-CSCS", "Pre- and postnatal coaching"], quote: "Nobody here is too old, too new, or too anything to lift.",
    bio: "Maya built the Women’s Strength program from a single Saturday class into the busiest slot on the timetable. She specialises in lifting through pregnancy and perimenopause." },
  { id: "tomas", name: "Tomás Reyes", role: "Hypertrophy coach", program: "hypertrophy", pr: "Squat 230 kg", years: "10 years coaching",
    certs: ["MSc Exercise Physiology", "Precision Nutrition L1"], quote: "Write it down. Muscle is built in the logbook first.",
    bio: "Tomás spent six years in a university performance lab before deciding he’d rather coach than measure. He reads every member’s logbook on Sunday nights." },
  { id: "daniel", name: "Daniel Osei", role: "Athletic performance coach", program: "athletic", pr: "Power clean 140 kg", years: "8 years coaching",
    certs: ["UKSCA accredited", "Former academy footballer"], quote: "Speed is strength that’s learned to move fast.",
    bio: "Daniel works with local football, rugby and cricket squads in and out of season. His sprint sessions on the turf lane are loud, short and very popular." },
  { id: "ayesha", name: "Ayesha Rahman", role: "Foundations coach", program: "foundations", pr: "Bench press 95 kg", years: "6 years coaching",
    certs: ["NASM-CPT", "Movement assessment specialist"], quote: "The first rep you own matters more than the hundredth you rush.",
    bio: "Ayesha runs almost every new member’s first session. She’s known for explaining a deadlift in a way that finally makes sense." },
  { id: "lena", name: "Lena Park", role: "Physiotherapist", program: "mobility", pr: "Deadlift 170 kg", years: "11 years in practice",
    certs: ["Chartered physiotherapist", "Sports rehabilitation"], quote: "Pain is information. We read it, then we train around it.",
    bio: "Lena treats in the recovery room and leads the mobility classes. She works closely with the coaches so rehab and training follow one plan." },
];
const coachById = Object.fromEntries(COACHES.map((c) => [c.id, c]));

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHEDULE = [
  ["Mon", "06:00", "powerlifting", "hamza"], ["Mon", "07:00", "foundations", "ayesha"], ["Mon", "12:15", "mobility", "lena"], ["Mon", "17:30", "womens", "maya"], ["Mon", "18:30", "hypertrophy", "tomas"], ["Mon", "19:30", "athletic", "daniel"],
  ["Tue", "06:00", "hypertrophy", "tomas"], ["Tue", "07:00", "womens", "maya"], ["Tue", "12:15", "foundations", "ayesha"], ["Tue", "17:30", "athletic", "daniel"], ["Tue", "18:30", "powerlifting", "hamza"],
  ["Wed", "06:00", "powerlifting", "hamza"], ["Wed", "07:00", "foundations", "ayesha"], ["Wed", "12:15", "mobility", "lena"], ["Wed", "17:30", "womens", "maya"], ["Wed", "18:30", "hypertrophy", "tomas"], ["Wed", "19:30", "foundations", "ayesha"],
  ["Thu", "06:00", "hypertrophy", "tomas"], ["Thu", "07:00", "womens", "maya"], ["Thu", "12:15", "foundations", "ayesha"], ["Thu", "17:30", "athletic", "daniel"], ["Thu", "18:30", "powerlifting", "hamza"],
  ["Fri", "06:00", "powerlifting", "hamza"], ["Fri", "07:00", "foundations", "ayesha"], ["Fri", "12:15", "mobility", "lena"], ["Fri", "17:30", "hypertrophy", "tomas"],
  ["Sat", "08:00", "powerlifting", "hamza"], ["Sat", "09:00", "womens", "maya"], ["Sat", "10:00", "foundations", "ayesha"], ["Sat", "11:00", "athletic", "daniel"],
  ["Sun", "09:00", "mobility", "lena"], ["Sun", "10:00", "hypertrophy", "tomas"],
].map(([day, time, program, coach]) => ({ day, time, program, coach }));

const TIERS = [
  { id: "open", name: "Open Gym", price: 89, blurb: "Train on your own, with the full floor at your disposal.",
    features: ["Open gym, 6am to 10pm daily", "All platforms and equipment", "One technique check each month", "Member app with logbook"] },
  { id: "coached", name: "Coached", price: 159, featured: true, blurb: "Unlimited classes across every program.",
    features: ["Everything in Open Gym", "Unlimited group classes", "Strength testing every quarter", "Recovery room access"] },
  { id: "peak", name: "Peak", price: 299, blurb: "One coach and one plan, built entirely around you.",
    features: ["Everything in Coached", "Weekly 1:1 session with your coach", "Individual programming", "Monthly nutrition review"] },
];
const COMPARE = [
  ["Open gym access", true, true, true],
  ["Group classes", false, "Unlimited", "Unlimited"],
  ["Technique checks", "Monthly", "Every class", "Every session"],
  ["Strength testing", false, "Quarterly", "Monthly"],
  ["Recovery room", false, true, true],
  ["1:1 coaching", false, false, "Weekly"],
  ["Individual program", false, false, true],
  ["Nutrition review", false, false, "Monthly"],
];
const FAQ = [
  ["Do I need any experience?", "No. Strength Foundations exists for exactly this, and most of our members started there. Your coach will meet you where you are."],
  ["What happens in the free session?", "Forty-five minutes with a coach: a conversation about your goals, a short movement assessment, one lift taught properly, and a recommendation for which program fits. No sales pitch at the end."],
  ["Can I cancel at any time?", "Yes. Monthly memberships cancel with 14 days’ notice, and there’s no joining fee."],
  ["What should I bring?", "Flat shoes, water, and clothes you can squat in. We provide chalk, belts, towels and a locker."],
  ["Is it intimidating?", "We work hard to make sure it isn’t. Classes are capped, coaches learn your name in week one, and the person next to you was a beginner once too."],
  ["Can I pause my membership?", "You can freeze for up to eight weeks a year for travel, injury or pregnancy, at no cost."],
];

const STORIES = [
  { id: "nadia", name: "Nadia", age: 41, program: "foundations", lift: "Deadlift", months: 12,
    data: [40, 55, 62, 70, 78, 85, 92, 100, 106, 113, 120, 125],
    quote: "I came in to fix my back. I stayed because I found out I was strong.",
    story: "Nadia joined after two years of on-and-off lower back pain. Lena assessed her first, then Ayesha rebuilt her hinge from a dowel up. Twelve months later she pulls more than her bodyweight and hasn’t had a flare-up since spring." },
  { id: "omar", name: "Omar", age: 29, program: "powerlifting", lift: "Squat", months: 18,
    data: [100, 112, 118, 125, 136, 142, 150, 155, 163, 170, 178, 190],
    quote: "Hamza made me slow down to get stronger. It was annoying. It worked.",
    story: "Omar arrived with a decent squat and a habit of maxing out every Friday. Three meet-prep blocks later, he placed second in his first regional competition with a 190 kg squat." },
  { id: "grace", name: "Grace", age: 63, program: "womens", lift: "Trap bar deadlift", months: 12,
    data: [20, 25, 30, 34, 40, 45, 50, 54, 58, 62, 66, 70],
    quote: "My grandchildren think I’m a superhero. They’re not wrong.",
    story: "Grace’s doctor suggested strength training after a bone density scan. She started on Saturday mornings with Maya, nervous and holding an empty bar. Her latest scan showed improvement, and she now lifts three times a week." },
];

const POSTS = [
  { id: "bracing", title: "How to brace for a heavy lift", category: "Technique", read: "6 min", author: "hamza",
    excerpt: "Your back isn’t weak. It’s probably just unsupported. Here’s how to build pressure that protects your spine.",
    body: [
      "Most people think of bracing as sucking the stomach in. It’s closer to the opposite. A good brace means filling your trunk with air and then tightening the muscles around it, so your torso behaves like a sealed, pressurised can.",
      "Start without a bar. Stand tall, put your hands on your sides just above your hips, and breathe in through your nose so that you feel your hands pushed outward, not just your chest rising. Now tighten as if someone were about to poke you in the stomach. Hold that and exhale slowly. That’s the feeling.",
      "Under the bar, take that breath before you unrack or before you pull, and keep it through the hardest part of the rep. On sets of five or more, you can let a little air out at the top and re-brace for the next rep.",
      "A belt doesn’t do the bracing for you. It gives your abdomen something to push against. Learn it without one first, then the belt becomes a genuine upgrade rather than a crutch.",
    ] },
  { id: "overload", title: "Progressive overload, explained without jargon", category: "Training", read: "5 min", author: "tomas",
    excerpt: "Get slightly better than last time, on purpose, for a long time. That’s the whole idea.",
    body: [
      "Your body adapts to what you ask of it, then stops adapting when the ask stays the same. Progressive overload just means changing the ask, gradually and on purpose.",
      "Adding weight is the obvious lever, but it isn’t the only one. You can add a rep, add a set, slow the lowering phase, or shorten your rest. Any of these tells your body the job got harder.",
      "The trick is to change one thing at a time and write it down. If you can’t remember what you lifted last Tuesday, you can’t beat it on purpose.",
      "Expect it to slow down. A beginner might add weight every session; someone in their third year might add it every month. Both are progressing.",
    ] },
  { id: "eating", title: "Eating for strength: a simple starting point", category: "Nutrition", read: "7 min", author: "maya",
    excerpt: "Before you buy anything in a tub, get these three basics right.",
    body: [
      "Eat enough. Strength training with too little food is like trying to build a wall with half the bricks. If you’re always tired and nothing is moving, this is the first thing to check.",
      "Get protein at every meal. You don’t need to count to the gram to start. A palm-sized portion of meat, fish, eggs, tofu, lentils or yoghurt at each meal covers most people well.",
      "Time your carbohydrates around training. A normal meal two or three hours before a session, and another afterwards, makes a noticeable difference to how hard you can work.",
      "Then, and only then, think about supplements. Creatine has good evidence behind it. Most of the rest is optional.",
    ] },
  { id: "over50", title: "Lifting after 50: what changes and what doesn’t", category: "Longevity", read: "6 min", author: "lena",
    excerpt: "Recovery takes longer and joints need more warming up. Your ability to get stronger doesn’t go anywhere.",
    body: [
      "The research is clear and encouraging: people in their fifties, sixties and beyond gain strength and muscle from lifting, often at rates that surprise them.",
      "What changes is the margin for error. Warm-ups get longer, jumps in weight get smaller, and rest days earn more respect. None of that stops progress.",
      "Heavy, well-coached lifting supports bone density, balance and blood sugar control. These matter more with every decade.",
      "If you have a joint replacement, osteoporosis or a heart condition, talk to your doctor and tell your coach. Almost always the answer is to adapt the training, not avoid it.",
    ] },
];

const ZONES = [
  { name: "The platforms", text: "Six competition platforms with combo racks, calibrated plates and a monolift. This is where the main lifts happen.", shot: "Wide shot of the platform row, low angle, bars loaded, warm overhead light" },
  { name: "The floor", text: "Dumbbells to 60 kg, cable stations and selectorised machines for accessory and hypertrophy work.", shot: "Dumbbell rack in shallow focus, a lifter mid-row in the background" },
  { name: "The lane", text: "Twenty-five metres of turf for sleds, sprints, carries and anything else that needs space to move.", shot: "Sled push down the turf lane, motion blur, chalk dust in the light" },
  { name: "Recovery room", text: "Cold plunge, sauna and a treatment bed where Lena runs physio sessions.", shot: "Quiet recovery room, cold plunge tub, soft daylight" },
  { name: "The lounge", text: "Coffee, a fridge of post-training food, and a long table for logging your session.", shot: "Members at the lounge table, logbooks open, coffee cups" },
];
const EQUIPMENT = ["Eleiko competition bars", "Calibrated IPF plates", "Combo racks with monolift", "Three competition benches", "Reverse hyper", "Two GHDs", "Dumbbells from 2.5 to 60 kg", "Four prowler sleds", "Six air bikes", "Four rowers", "Trap bars and safety squat bars", "Chalk. Lots of chalk."];

const METHOD = [
  { name: "Assess", kg: 10, text: "A coach watches you move, asks what you want, and records where you’re starting from." },
  { name: "Build", kg: 15, text: "You learn the lifts properly, then train them in blocks with a clear plan for each week." },
  { name: "Peak", kg: 20, text: "Every few months, the plan builds to a test day so you can see exactly what changed." },
  { name: "Sustain", kg: 25, text: "We adjust for life, injuries and new goals, so the progress keeps going for years." },
];

/* ---------- Styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Archivo:wght@400;500;600;700&display=swap');
.pf{--chalk:#ECECE7;--chalk-2:#E2E2DC;--concrete:#D2D2CA;--iron:#18191C;--iron-2:#24262A;--steel:#5A5D64;--steel-light:#A4A7AE;--rule:#C3C3BA;
  --red:#D42A2F;--blue:#1E46B4;--yellow:#F2C12E;--green:#1F8A4C;--plate-white:#FAFAF6;--plate-black:#2B2C30;
  --display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;--body:'Archivo',system-ui,-apple-system,sans-serif;
  font-family:var(--body);background:var(--chalk);color:var(--iron);min-height:100vh;font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}
.pf *,.pf *::before,.pf *::after{box-sizing:border-box}
.pf h1,.pf h2,.pf h3,.pf h4{font-family:var(--display);font-weight:800;line-height:.9;margin:0;letter-spacing:-.005em}
.pf p{margin:0}
.pf ul{margin:0;padding:0;list-style:none}
.pf button{font-family:inherit}
.pf :focus-visible{outline:3px solid var(--blue);outline-offset:3px}
.pf-wrap{max-width:1320px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}
.pf-section{padding:clamp(72px,10vw,136px) 0}
.pf-dark{background:var(--iron);color:var(--chalk)}
.pf-dark .pf-muted,.pf-dark .pf-lede{color:var(--steel-light)}
.pf-muted{color:var(--steel)}
.pf-h2{font-size:clamp(46px,6.6vw,100px)}
.pf-h3{font-size:clamp(30px,3vw,44px)}
.pf-lede{font-size:clamp(18px,1.5vw,20px);color:var(--steel);max-width:50ch}
.pf-sec-head{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:end;margin-bottom:clamp(40px,5vw,72px)}
.pf-grain{position:relative;isolation:isolate}
.pf-grain::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;opacity:.35;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}

/* Buttons */
.pf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:15px;padding:14px 22px;border-radius:2px;border:2px solid var(--iron);background:var(--iron);color:var(--chalk);cursor:pointer;transition:background .15s,color .15s,border-color .15s;white-space:nowrap;text-decoration:none}
.pf-btn:hover{background:var(--red);border-color:var(--red)}
.pf-btn--ghost{background:transparent;color:var(--iron)}
.pf-btn--ghost:hover{background:var(--iron);color:var(--chalk);border-color:var(--iron)}
.pf-btn--light{background:var(--chalk);color:var(--iron);border-color:var(--chalk)}
.pf-btn--light:hover{background:var(--yellow);border-color:var(--yellow);color:var(--iron)}
.pf-btn--ghost-light{background:transparent;color:var(--chalk);border-color:var(--chalk)}
.pf-btn--ghost-light:hover{background:var(--chalk);color:var(--iron);border-color:var(--chalk)}
.pf-btn--sm{padding:9px 14px;font-size:14px}
.pf-textlink{background:none;border:0;padding:0;font:inherit;font-weight:600;color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border-bottom:2px solid currentColor;padding-bottom:2px}
.pf-textlink:hover{color:var(--red)}
.pf-dark .pf-textlink:hover{color:var(--yellow)}

/* Nav */
.pf-nav{position:sticky;top:0;z-index:60;background:rgba(236,236,231,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--rule)}
.pf-nav-inner{display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px}
.pf-logo{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;color:inherit;padding:0}
.pf-logo-word{font-family:var(--display);font-weight:900;font-size:28px;letter-spacing:.01em;line-height:1}
.pf-links{display:flex;gap:2px}
.pf-link{background:none;border:0;font-size:15px;font-weight:500;color:var(--steel);padding:8px 11px;cursor:pointer;position:relative}
.pf-link:hover,.pf-link[aria-current="page"]{color:var(--iron)}
.pf-link[aria-current="page"]::after{content:"";position:absolute;left:11px;right:11px;bottom:0;height:3px;background:var(--red)}
.pf-menu-btn{display:none;background:none;border:2px solid var(--iron);width:44px;height:44px;align-items:center;justify-content:center;cursor:pointer;color:var(--iron);border-radius:2px}
.pf-drawer{position:fixed;top:72px;left:0;right:0;bottom:0;background:var(--iron);color:var(--chalk);z-index:59;padding:28px clamp(20px,4vw,48px) 40px;display:flex;flex-direction:column;overflow:auto}
.pf-dlink{font-family:var(--display);font-weight:800;font-size:clamp(40px,9vw,60px);text-align:left;background:none;border:0;color:var(--chalk);padding:4px 0;cursor:pointer;line-height:1.05}
.pf-dlink[aria-current="page"]{color:var(--yellow)}
@media(max-width:1100px){.pf-links,.pf-nav-cta{display:none!important}.pf-menu-btn{display:inline-flex}}

/* Hero + barbell */
.pf-hero{padding:clamp(36px,5vw,72px) 0 clamp(56px,7vw,96px);overflow:hidden}
.pf-hero-top{display:grid;grid-template-columns:1.5fr 1fr;gap:40px;align-items:end}
.pf-hero h1{font-size:clamp(72px,12vw,192px);font-weight:900;line-height:.82;letter-spacing:-.012em}
.pf-hero-intro{font-size:clamp(17px,1.4vw,19px);color:var(--steel);max-width:38ch}
.pf-hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.pf-bar-stage{margin-top:clamp(20px,3vw,40px)}
.pf-bar-svg{width:100%;height:auto;display:block;overflow:visible}
.pf-plate-g{transition:transform .38s cubic-bezier(.2,.8,.2,1)}
@keyframes pfInL{from{transform:translateX(-120px);opacity:0}to{transform:none;opacity:1}}
@keyframes pfInR{from{transform:translateX(120px);opacity:0}to{transform:none;opacity:1}}
.pf-in-l{animation:pfInL .5s cubic-bezier(.2,.8,.2,1) both}
.pf-in-r{animation:pfInR .5s cubic-bezier(.2,.8,.2,1) both}
.pf-bar-controls{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end;border-top:2px solid var(--iron);padding-top:20px}
.pf-bar-label{font-weight:600;font-size:15px;margin-bottom:12px}
.pf-plates-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.pf-plate-btn{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;font-family:var(--display);font-weight:800;font-size:19px;display:grid;place-items:center;box-shadow:inset 0 0 0 5px rgba(0,0,0,.13);transition:transform .12s}
.pf-plate-btn:hover:not(:disabled){transform:translateY(-3px)}
.pf-plate-btn:disabled{opacity:.28;cursor:not-allowed}
.pf-plate-btn.is-white{box-shadow:inset 0 0 0 5px rgba(0,0,0,.08),0 0 0 1.5px var(--rule)}
.pf-icon-btn{height:44px;padding:0 14px;display:inline-flex;align-items:center;gap:6px;background:none;border:2px solid var(--iron);border-radius:2px;cursor:pointer;font-weight:600;font-size:14px;color:var(--iron)}
.pf-icon-btn:hover:not(:disabled){background:var(--iron);color:var(--chalk)}
.pf-icon-btn:disabled{opacity:.3;cursor:not-allowed}
.pf-readout{text-align:right}
.pf-total{font-family:var(--display);font-weight:900;font-size:clamp(72px,9vw,136px);line-height:.82;font-variant-numeric:tabular-nums}
.pf-total small{font-size:.32em;font-weight:700;margin-left:6px}
.pf-milestone{color:var(--steel);max-width:32ch;margin-left:auto;font-size:15px;margin-top:10px;min-height:3.2em}

/* Manifesto */
.pf-manifesto{font-family:var(--display);font-weight:700;font-size:clamp(38px,5.2vw,78px);line-height:.98;max-width:20ch}

/* Method steps */
.pf-steps{display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid var(--iron)}
.pf-step{padding:30px 28px 0 0;position:relative}
.pf-step::before{content:"";position:absolute;top:-4px;left:0;width:56px;height:6px;background:var(--c)}
.pf-step-n{font-family:var(--display);font-weight:900;font-size:92px;line-height:.8;color:transparent;-webkit-text-stroke:1.5px currentColor;margin-bottom:22px;opacity:.9}
.pf-step h3{font-size:40px;margin-bottom:10px}
.pf-step p{font-size:16px;max-width:30ch}

/* Program rows */
.pf-prog-list{border-top:2px solid var(--iron)}
.pf-prog-row{display:grid;grid-template-columns:56px 1.25fr 1fr 130px 28px;gap:24px;align-items:center;padding:24px 0 24px 0;border:0;border-bottom:1px solid var(--rule);cursor:pointer;background:none;width:100%;text-align:left;color:inherit;position:relative;transition:padding .25s}
.pf-prog-row::before{content:"";position:absolute;left:0;top:-1px;bottom:-1px;width:0;background:var(--c);transition:width .25s}
.pf-prog-row:hover{padding-left:20px}
.pf-prog-row:hover::before{width:6px}
.pf-prog-row h3{font-size:clamp(32px,3.6vw,54px)}
.pf-prog-row .pf-arrow{transition:transform .2s}
.pf-prog-row:hover .pf-arrow{transform:translate(3px,-3px)}
.pf-level{font-size:14px;font-weight:600;padding:5px 10px;border:1.5px solid var(--iron);border-radius:999px;justify-self:start}

/* Stats band */
.pf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.pf-stat{padding:8px 32px;border-left:1px solid #3A3C42}
.pf-stat:first-child{border-left:0;padding-left:0}
.pf-stat b{display:block;font-family:var(--display);font-weight:900;font-size:clamp(56px,7vw,104px);line-height:.85;margin-bottom:12px}

/* Photos */
.pf-photo{margin:0;position:relative;overflow:hidden;background:var(--iron-2);color:var(--chalk);display:flex;align-items:flex-end;width:100%}
.pf-photo--light{background:var(--concrete);color:var(--iron)}
.pf-photo::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 80% at 30% 20%,rgba(255,255,255,.14),transparent 60%),linear-gradient(180deg,transparent 40%,rgba(0,0,0,.35))}
.pf-photo--light::before{background:radial-gradient(120% 80% at 30% 20%,rgba(255,255,255,.5),transparent 60%),linear-gradient(180deg,transparent 50%,rgba(0,0,0,.08))}
.pf-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pf-photo figcaption{position:relative;z-index:2;padding:16px;font-size:13px;line-height:1.4;display:flex;gap:8px;align-items:flex-start;opacity:.75;max-width:40ch}

/* Coaches */
.pf-coach-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.pf-coach-card{background:none;border:0;padding:0;text-align:left;cursor:pointer;color:inherit}
.pf-coach-card .pf-photo{transition:transform .3s}
.pf-coach-card:hover .pf-photo{transform:scale(.98)}
.pf-coach-name{font-family:var(--display);font-weight:800;font-size:30px;margin-top:14px;line-height:1}
.pf-coach-meta{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:15px}
.pf-coach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:48px 24px}

/* Story spotlight + charts */
.pf-story{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(32px,5vw,80px);align-items:center}
.pf-quote{font-family:var(--display);font-weight:700;font-size:clamp(34px,4vw,58px);line-height:1}
.pf-chart{width:100%;height:auto;display:block;overflow:visible}

/* Marquee */
.pf-marquee{overflow:hidden;border-block:2px solid var(--iron);padding:16px 0;background:var(--chalk)}
.pf-marquee-track{display:inline-flex;align-items:center;gap:36px;white-space:nowrap;animation:pfMarquee 38s linear infinite;padding-right:36px}
.pf-marquee-track span{font-family:var(--display);font-weight:900;font-size:clamp(44px,6vw,80px);line-height:1}
@keyframes pfMarquee{to{transform:translateX(-50%)}}

/* CTA band */
.pf-cta{background:var(--red);color:#fff}
.pf-cta h2{font-size:clamp(56px,9vw,148px);line-height:.82}
.pf-cta-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:40px;align-items:end}

/* Footer */
.pf-footer{background:var(--iron);color:var(--chalk);padding:clamp(64px,8vw,104px) 0 32px}
.pf-foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px}
.pf-foot-h{font-weight:600;font-size:15px;color:var(--steel-light);margin-bottom:14px}
.pf-foot-link{display:block;background:none;border:0;padding:4px 0;color:var(--chalk);cursor:pointer;font-size:16px;text-align:left}
.pf-foot-link:hover{color:var(--yellow)}
.pf-foot-big{font-family:var(--display);font-weight:900;font-size:clamp(80px,17vw,280px);line-height:.78;margin-top:clamp(48px,7vw,96px);letter-spacing:-.01em;color:var(--iron-2);-webkit-text-stroke:1px #3A3C42;user-select:none}
.pf-foot-bottom{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid #3A3C42;padding-top:24px;margin-top:24px;font-size:14px;color:var(--steel-light)}

/* Page header */
.pf-page-head{padding:clamp(56px,8vw,112px) 0 clamp(40px,5vw,64px);border-bottom:2px solid var(--iron)}
.pf-page-head h1{font-size:clamp(64px,10.5vw,168px);font-weight:900;line-height:.82;max-width:12ch}
.pf-page-head-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:40px;align-items:end}

/* Program detail */
.pf-legend{display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center}
.pf-legend-item{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:500}
.pf-pd{border-bottom:1px solid var(--rule)}
.pf-pd-head{display:grid;grid-template-columns:56px 1fr auto 40px;gap:24px;align-items:center;width:100%;padding:28px 0;background:none;border:0;cursor:pointer;text-align:left;color:inherit}
.pf-pd-head h3{font-size:clamp(34px,4.4vw,64px)}
.pf-pd-chev{transition:transform .25s}
.pf-pd[data-open="true"] .pf-pd-chev{transform:rotate(180deg)}
.pf-pd-body{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,4vw,64px);padding:0 0 48px 80px}
.pf-dl{display:grid;grid-template-columns:auto 1fr;gap:10px 24px;font-size:16px;margin:0}
.pf-dl dt{color:var(--steel)}
.pf-dl dd{margin:0;font-weight:600}
.pf-ticks li{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--rule)}
.pf-ticks li:last-child{border-bottom:1px solid var(--rule)}

/* Quiz + calc */
.pf-quiz{display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(32px,5vw,80px)}
.pf-progress{display:flex;gap:6px;margin-bottom:28px}
.pf-progress i{height:6px;flex:1;background:#3A3C42}
.pf-progress i.on{background:var(--yellow)}
.pf-options{display:grid;gap:10px}
.pf-option{text-align:left;padding:18px 20px;background:var(--iron-2);border:1.5px solid #3A3C42;color:var(--chalk);font-size:17px;font-weight:500;cursor:pointer;border-radius:2px;display:flex;justify-content:space-between;align-items:center}
.pf-option:hover{border-color:var(--chalk)}
.pf-calc{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(32px,5vw,80px);align-items:start}
.pf-field{display:grid;gap:8px}
.pf-field label{font-weight:600;font-size:15px}
.pf-input,.pf-select,.pf-textarea{font:inherit;font-size:17px;padding:14px 16px;border:2px solid var(--iron);border-radius:2px;background:var(--plate-white);color:var(--iron);width:100%}
.pf-input:focus,.pf-select:focus,.pf-textarea:focus{outline:3px solid var(--blue);outline-offset:1px}
.pf-input[aria-invalid="true"]{border-color:var(--red)}
.pf-error{color:var(--red);font-size:14px;font-weight:600}
.pf-range{width:100%;accent-color:var(--red)}
.pf-pct-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.pf-pct-table td{padding:10px 0;border-bottom:1px solid var(--rule);font-size:16px}
.pf-pct-table td:last-child{text-align:right;font-weight:600}

/* Timetable */
.pf-chips{display:flex;flex-wrap:wrap;gap:8px}
.pf-chip{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1.5px solid var(--iron);border-radius:999px;background:none;cursor:pointer;font-size:14px;font-weight:600;color:var(--iron)}
.pf-chip[aria-pressed="true"]{background:var(--iron);color:var(--chalk)}
.pf-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.pf-tt{display:grid;grid-template-columns:repeat(7,minmax(140px,1fr));gap:10px;min-width:1000px}
.pf-tt-day{font-family:var(--display);font-weight:800;font-size:30px;padding-bottom:10px;border-bottom:2px solid var(--iron);margin-bottom:10px}
.pf-tt-col{display:flex;flex-direction:column;gap:8px}
.pf-tt-class{text-align:left;background:var(--plate-white);border:0;border-left:6px solid var(--c);padding:12px;cursor:pointer;color:var(--iron);border-radius:0 2px 2px 0;transition:transform .15s}
.pf-tt-class:hover{transform:translateX(3px)}
.pf-tt-class b{display:block;font-size:14px;font-variant-numeric:tabular-nums}
.pf-tt-class span{display:block;font-family:var(--display);font-weight:800;font-size:21px;line-height:1;margin:6px 0 4px}
.pf-tt-class small{font-size:13px;color:var(--steel)}

/* Membership */
.pf-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:2px solid var(--iron)}
.pf-tier{padding:36px 32px 32px;display:flex;flex-direction:column;gap:20px;border-left:2px solid var(--iron)}
.pf-tier:first-child{border-left:0}
.pf-tier.is-featured{background:var(--iron);color:var(--chalk)}
.pf-price{font-family:var(--display);font-weight:900;font-size:96px;line-height:.8}
.pf-price small{font-family:var(--body);font-size:16px;font-weight:500;margin-left:6px}
.pf-tier ul li{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--rule);font-size:16px}
.pf-tier.is-featured ul li{border-color:#3A3C42}
.pf-badge{align-self:flex-start;background:var(--yellow);color:var(--iron);font-weight:700;font-size:13px;padding:5px 10px;border-radius:999px}
.pf-table{width:100%;border-collapse:collapse;min-width:640px}
.pf-table th,.pf-table td{padding:16px 12px;border-bottom:1px solid var(--rule);text-align:center;font-size:16px}
.pf-table th:first-child,.pf-table td:first-child{text-align:left;padding-left:0}
.pf-table thead th{font-family:var(--display);font-weight:800;font-size:28px;border-bottom:2px solid var(--iron)}
.pf-faq-item{border-bottom:1px solid var(--rule)}
.pf-faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 0;background:none;border:0;cursor:pointer;text-align:left;font-size:clamp(19px,1.8vw,23px);font-weight:600;color:inherit}
.pf-faq-a{padding:0 0 26px;max-width:62ch;color:var(--steel)}

/* Space */
.pf-zone{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(28px,4vw,64px);align-items:center;padding:clamp(40px,5vw,64px) 0;border-bottom:1px solid var(--rule)}
.pf-zone:nth-child(even){grid-template-columns:1fr 1.4fr}
.pf-zone:nth-child(even) .pf-zone-photo{order:2}
.pf-equip{columns:3;column-gap:40px}
.pf-equip li{break-inside:avoid;padding:12px 0;border-top:1px solid #3A3C42;font-size:17px}

/* Journal */
.pf-posts{display:grid;grid-template-columns:repeat(2,1fr);gap:56px 32px}
.pf-post{background:none;border:0;padding:0;text-align:left;cursor:pointer;color:inherit;display:grid;gap:14px}
.pf-post h3{font-size:clamp(32px,3.2vw,46px)}
.pf-post:hover h3{color:var(--red)}
.pf-post-meta{display:flex;gap:14px;font-size:14px;color:var(--steel);font-weight:500}
.pf-article{max-width:68ch;margin:0 auto}
.pf-article p{font-size:19px;line-height:1.7;margin-bottom:24px}

/* Book */
.pf-book{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(32px,5vw,80px);align-items:start}
.pf-form{display:grid;gap:20px}
.pf-form-row{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.pf-seg{display:flex;flex-wrap:wrap;gap:8px}
.pf-seg button{padding:11px 16px;border:2px solid var(--iron);background:none;cursor:pointer;font-size:15px;font-weight:600;border-radius:2px;color:var(--iron)}
.pf-seg button[aria-pressed="true"]{background:var(--iron);color:var(--chalk)}
.pf-aside{background:var(--iron);color:var(--chalk);padding:32px}
.pf-aside-row{display:flex;gap:12px;padding:14px 0;border-top:1px solid #3A3C42;font-size:16px}
.pf-success{border:2px solid var(--iron);padding:clamp(28px,4vw,48px);background:var(--plate-white)}

/* Modal */
.pf-modal-bg{position:fixed;inset:0;background:rgba(24,25,28,.72);z-index:80;display:grid;place-items:center;padding:20px}
.pf-modal{background:var(--chalk);max-width:980px;width:100%;max-height:calc(100vh - 40px);overflow:auto;display:grid;grid-template-columns:1fr 1.2fr;position:relative}
.pf-modal-close{position:absolute;top:14px;right:14px;z-index:3;width:44px;height:44px;border-radius:50%;border:0;background:var(--iron);color:var(--chalk);display:grid;place-items:center;cursor:pointer}

/* Responsive */
@media(max-width:980px){
  .pf-hero-top,.pf-sec-head,.pf-story,.pf-cta-grid,.pf-page-head-grid,.pf-quiz,.pf-calc,.pf-book,.pf-zone,.pf-zone:nth-child(even),.pf-pd-body,.pf-modal{grid-template-columns:1fr}
  .pf-zone:nth-child(even) .pf-zone-photo{order:0}
  .pf-pd-body{padding-left:0}
  .pf-steps{grid-template-columns:1fr 1fr;gap:40px 0}
  .pf-coach-row{grid-template-columns:repeat(2,1fr)}
  .pf-coach-grid{grid-template-columns:repeat(2,1fr)}
  .pf-tiers{grid-template-columns:1fr}
  .pf-tier{border-left:0;border-top:2px solid var(--iron)}
  .pf-tier:first-child{border-top:0}
  .pf-foot-grid{grid-template-columns:1fr 1fr}
  .pf-equip{columns:2}
  .pf-prog-row{grid-template-columns:44px 1fr 28px}
  .pf-prog-row .pf-hide-sm{display:none}
}
@media(max-width:720px){
  .pf-bar-controls{grid-template-columns:1fr}
  .pf-readout{text-align:left}
  .pf-milestone{margin-left:0}
  .pf-stats{grid-template-columns:1fr;gap:28px}
  .pf-stat{border-left:0;padding:0}
  .pf-posts,.pf-form-row{grid-template-columns:1fr}
  .pf-pd-head{grid-template-columns:40px 1fr 28px}
  .pf-pd-head .pf-hide-sm{display:none}
}
@media(max-width:520px){
  .pf-steps,.pf-coach-grid,.pf-foot-grid{grid-template-columns:1fr}
  .pf-equip{columns:1}
  .pf-plate-btn{width:50px;height:50px;font-size:17px}
}
@media(prefers-reduced-motion:reduce){.pf *,.pf *::before,.pf *::after{animation:none!important;transition:none!important}}
`;

/* =========================================================
   SHARED COMPONENTS
   ========================================================= */
const colorOf = (kg) => PLATE_SPECS[kg].color;

function Photo({ shot, ratio = "4 / 5", light, src, style }) {
  return (
    <figure className={"pf-photo" + (light ? " pf-photo--light" : "")} style={{ aspectRatio: ratio, ...style }}>
      {src ? <img src={src} alt={shot} /> : (
        <figcaption>
          <Camera size={16} style={{ flex: "none", marginTop: 2 }} aria-hidden="true" />
          <span>{shot}</span>
        </figcaption>
      )}
    </figure>
  );
}

function PlateDot({ kg, size = 44 }) {
  const s = PLATE_SPECS[kg];
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: "50%", background: s.color, color: s.ink, flex: "none",
      display: "grid", placeItems: "center", fontFamily: "var(--display)", fontWeight: 800, fontSize: size * 0.4,
      boxShadow: kg === 5 ? "inset 0 0 0 4px rgba(0,0,0,.08), 0 0 0 1.5px var(--rule)" : "inset 0 0 0 4px rgba(0,0,0,.14)",
    }}>{kg}</span>
  );
}

function Counter({ to, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf, started = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / duration, 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

function LineChart({ data, unit = "kg", color = "var(--red)", months }) {
  const W = 640, H = 300, pl = 48, pb = 38, pt = 18, pr = 20;
  const niceMax = Math.ceil(Math.max(...data) / 50) * 50;
  const x = (i) => pl + (i / (data.length - 1)) * (W - pl - pr);
  const y = (v) => pt + (1 - v / niceMax) * (H - pt - pb);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));
  const last = data.length - 1;
  return (
    <svg className="pf-chart" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Line chart: lift rose from ${data[0]} ${unit} to ${data[last]} ${unit} over ${months} months`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeWidth="1" />
          <text x={pl - 10} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize="13" fill="var(--steel)">{t}</text>
        </g>
      ))}
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(0)} cy={y(data[0])} r="6" fill="var(--chalk)" stroke={color} strokeWidth="3" />
      <circle cx={x(last)} cy={y(data[last])} r="7" fill={color} />
      <text x={x(0)} y={y(data[0]) - 14} fontSize="15" fontWeight="700" fill="var(--iron)">{data[0]} {unit}</text>
      <text x={x(last)} y={y(data[last]) - 16} textAnchor="end" fontSize="17" fontWeight="700" fill="var(--iron)">{data[last]} {unit}</text>
      <text x={pl} y={H - 8} fontSize="13" fill="var(--steel)">Start</text>
      <text x={W - pr} y={H - 8} textAnchor="end" fontSize="13" fill="var(--steel)">Month {months}</text>
    </svg>
  );
}

function Marquee() {
  const words = ["Strength", "Discipline", "Progress", "Chalk", "Patience", "Iron", "Consistency"];
  const items = [...words, ...words];
  return (
    <div className="pf-marquee" aria-hidden="true">
      <div className="pf-marquee-track">
        {[0, 1].map((n) => items.map((w, i) => (
          <span key={n + "-" + i} style={{ display: "inline-flex", alignItems: "center", gap: 36 }}>
            {w}<PlateDot kg={PLATE_ORDER[i % PLATE_ORDER.length]} size={28} />
          </span>
        )))}
      </div>
    </div>
  );
}

function CtaBand({ go, title = "Come and lift with us." }) {
  return (
    <section className="pf-cta pf-section">
      <div className="pf-wrap pf-cta-grid">
        <h2>{title}</h2>
        <div>
          <p style={{ fontSize: 19, marginBottom: 24, maxWidth: "36ch" }}>
            Your first session is free: 45 minutes with a coach, a movement check and one lift taught properly. No sales pitch.
          </p>
          <button className="pf-btn pf-btn--light" onClick={() => go("book")}>Book a free session</button>
        </div>
      </div>
    </section>
  );
}

function PageHead({ title, text, children }) {
  return (
    <header className="pf-page-head">
      <div className="pf-wrap pf-page-head-grid">
        <h1>{title}</h1>
        <div>
          {text && <p className="pf-lede">{text}</p>}
          {children}
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   NAV + FOOTER
   ========================================================= */
const NAV = [
  ["programs", "Programs"], ["coaches", "Coaches"], ["schedule", "Schedule"], ["membership", "Membership"],
  ["space", "The space"], ["results", "Results"], ["journal", "Journal"],
];

function Logo({ onClick, light }) {
  return (
    <button className="pf-logo" onClick={onClick} aria-label="Peak Form, home" style={light ? { color: "var(--chalk)" } : null}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="16" fill="var(--red)" />
        <circle cx="17" cy="17" r="11" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="2" />
        <circle cx="17" cy="17" r="3.5" fill={light ? "var(--iron)" : "var(--chalk)"} />
      </svg>
      <span className="pf-logo-word">PEAK FORM</span>
    </button>
  );
}

function Nav({ route, go, open, setOpen }) {
  return (
    <>
      <nav className="pf-nav" aria-label="Main">
        <div className="pf-wrap pf-nav-inner">
          <Logo onClick={() => go("home")} />
          <div className="pf-links">
            {NAV.map(([id, label]) => (
              <button key={id} className="pf-link" aria-current={route.page === id ? "page" : undefined} onClick={() => go(id)}>{label}</button>
            ))}
          </div>
          <button className="pf-btn pf-btn--sm pf-nav-cta" onClick={() => go("book")}>Book a free session</button>
          <button className="pf-menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="pf-drawer">
          {NAV.map(([id, label]) => (
            <button key={id} className="pf-dlink" aria-current={route.page === id ? "page" : undefined} onClick={() => go(id)}>{label}</button>
          ))}
          <div style={{ marginTop: 28 }}>
            <button className="pf-btn pf-btn--light" onClick={() => go("book")}>Book a free session</button>
          </div>
        </div>
      )}
    </>
  );
}

function Footer({ go }) {
  return (
    <footer className="pf-footer">
      <div className="pf-wrap">
        <div className="pf-foot-grid">
          <div>
            <Logo light onClick={() => go("home")} />
            <p style={{ color: "var(--steel-light)", marginTop: 18, maxWidth: "30ch" }}>
              A coached strength studio. Small groups, proper programming, honest numbers.
            </p>
          </div>
          <div>
            <h4 className="pf-foot-h" style={{ fontFamily: "var(--body)", fontWeight: 600, lineHeight: 1.4 }}>Explore</h4>
            {NAV.slice(0, 4).map(([id, l]) => <button key={id} className="pf-foot-link" onClick={() => go(id)}>{l}</button>)}
          </div>
          <div>
            <h4 className="pf-foot-h" style={{ fontFamily: "var(--body)", fontWeight: 600, lineHeight: 1.4 }}>More</h4>
            {NAV.slice(4).map(([id, l]) => <button key={id} className="pf-foot-link" onClick={() => go(id)}>{l}</button>)}
            <button className="pf-foot-link" onClick={() => go("book")}>Book a free session</button>
          </div>
          <div>
            <h4 className="pf-foot-h" style={{ fontFamily: "var(--body)", fontWeight: 600, lineHeight: 1.4 }}>Visit</h4>
            <p>14 Foundry Lane<br />Warehouse District</p>
            <p style={{ marginTop: 12 }}>Open daily, 6am to 10pm</p>
            <p style={{ marginTop: 12 }}>hello@peakform.studio<br />+1 (555) 014 2290</p>
          </div>
        </div>
        <div className="pf-foot-big" aria-hidden="true">PEAK FORM</div>
        <div className="pf-foot-bottom">
          <span>© 2026 Peak Form Strength Studio. A concept project.</span>
          <span>Instagram · YouTube · Strava</span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   INTERACTIVE: BARBELL (hero), QUIZ, 1RM CALCULATOR
   ========================================================= */
function milestone(total) {
  if (total <= 20) return "Just the bar. Every lifter here started with this.";
  if (total < 60) return "A good warm-up weight. Nothing wrong with that.";
  if (total < 100) return "A solid working weight for a new lifter.";
  if (total < 140) return "A bodyweight lift for plenty of people.";
  if (total < 200) return "That’s a serious lift. Chalk up.";
  return "Meet-day weight. Call your spotters.";
}

function Barbell() {
  const [stack, setStack] = useState([25, 20, 10]);
  const CENTER = 600, SHAFT = 190, GAP = 3, LIMIT = 360, CY = 140;
  const inner = CENTER - SHAFT;
  const used = stack.reduce((s, k) => s + PLATE_SPECS[k].w + GAP, 0);
  const total = 20 + 2 * stack.reduce((s, k) => s + k, 0);
  const canAdd = (k) => stack.length < 8 && used + PLATE_SPECS[k].w + GAP <= LIMIT;
  let off = 0;
  const placed = stack.map((k, i) => { const s = PLATE_SPECS[k]; const d = off; off += s.w + GAP; return { k, i, s, d }; });

  const plateRect = (p, side) => {
    const x = side === "l" ? inner - 4 - p.d - p.s.w : CENTER + SHAFT + 4 + p.d;
    const cx = x + p.s.w / 2;
    return (
      <g key={side + p.i} className={side === "l" ? "pf-in-l" : "pf-in-r"}>
        <rect x={x} y={CY - p.s.h / 2} width={p.s.w} height={p.s.h} rx="5" style={{ fill: p.s.color }} />
        <rect x={x + 3} y={CY - p.s.h / 2 + 6} width={p.s.w - 6} height={p.s.h - 12} rx="3" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1.5" />
        {p.s.w >= 20 && (
          <text x={cx} y={CY} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${CY})`}
            style={{ fill: p.s.ink, fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 }}>{p.k}</text>
        )}
      </g>
    );
  };

  return (
    <div className="pf-bar-stage">
      <svg className="pf-bar-svg" viewBox="0 0 1200 280" role="img" aria-label={`Barbell loaded to ${total} kilograms`}>
        <rect x="0" y={CY - 9} width="1200" height="18" rx="3" fill="var(--steel-light)" />
        <rect x="0" y={CY - 9} width="1200" height="5" rx="2" fill="rgba(255,255,255,.55)" />
        <rect x={inner + 10} y={CY - 5} width={SHAFT * 2 - 20} height="10" fill="var(--steel)" />
        <rect x={inner - 2} y={CY - 24} width="12" height="48" rx="2" fill="var(--iron)" />
        <rect x={CENTER + SHAFT - 10} y={CY - 24} width="12" height="48" rx="2" fill="var(--iron)" />
        {placed.map((p) => plateRect(p, "l"))}
        {placed.map((p) => plateRect(p, "r"))}
      </svg>
      <div className="pf-bar-controls">
        <div>
          <p className="pf-bar-label">Load the bar. Add plates to each side.</p>
          <div className="pf-plates-row">
            {PLATE_ORDER.map((k) => (
              <button key={k} className={"pf-plate-btn" + (k === 5 ? " is-white" : "")} disabled={!canAdd(k)}
                style={{ background: PLATE_SPECS[k].color, color: PLATE_SPECS[k].ink }}
                onClick={() => setStack([...stack, k])} aria-label={`Add a ${k} kilogram plate to each side`}>{k}</button>
            ))}
            <button className="pf-icon-btn" disabled={!stack.length} onClick={() => setStack(stack.slice(0, -1))}><Minus size={16} /> Take off</button>
            <button className="pf-icon-btn" disabled={!stack.length} onClick={() => setStack([])}><RotateCcw size={16} /> Empty bar</button>
          </div>
        </div>
        <div className="pf-readout" aria-live="polite">
          <div className="pf-total">{total}<small>kg</small></div>
          <p className="pf-milestone">{milestone(total)}</p>
        </div>
      </div>
    </div>
  );
}

const QUIZ = [
  { q: "How much have you lifted before?", a: [
    ["Never, or not for years", { foundations: 3 }],
    ["A bit, but nothing structured", { foundations: 1, hypertrophy: 2, womens: 1 }],
    ["I train regularly", { hypertrophy: 2, powerlifting: 2, athletic: 1 }],
  ] },
  { q: "What do you want most?", a: [
    ["Get stronger on the big lifts", { powerlifting: 3, foundations: 1, womens: 1 }],
    ["Build muscle", { hypertrophy: 3 }],
    ["Play my sport better", { athletic: 3 }],
    ["Move without aches and pains", { mobility: 3, foundations: 1 }],
  ] },
  { q: "Who would you like to train with?", a: [
    ["A women-only group", { womens: 4 }],
    ["A small group at my level", { foundations: 1, hypertrophy: 1, mobility: 1 }],
    ["Serious lifters who push each other", { powerlifting: 2, athletic: 2 }],
  ] },
];

function Quiz({ go }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const done = step >= QUIZ.length;
  const pick = (add) => {
    const next = { ...scores };
    Object.entries(add).forEach(([k, v]) => { next[k] = (next[k] || 0) + v; });
    setScores(next);
    setStep(step + 1);
  };
  const winner = useMemo(() => {
    if (!done) return null;
    return PROGRAMS.map((p) => [p, scores[p.id] || 0]).sort((a, b) => b[1] - a[1])[0][0];
  }, [done, scores]);
  const reset = () => { setStep(0); setScores({}); };
  return (
    <section className="pf-section pf-dark">
      <div className="pf-wrap pf-quiz">
        <div>
          <h2 className="pf-h2">Not sure where to start?</h2>
          <p className="pf-lede" style={{ marginTop: 24 }}>Three questions, and we’ll point you to the program that fits.</p>
        </div>
        <div aria-live="polite">
          <div className="pf-progress" aria-hidden="true">
            {QUIZ.map((_, i) => <i key={i} className={i < step ? "on" : ""} />)}
          </div>
          {!done ? (
            <>
              <h3 className="pf-h3" style={{ marginBottom: 24 }}>{QUIZ[step].q}</h3>
              <div className="pf-options">
                {QUIZ[step].a.map(([label, add]) => (
                  <button key={label} className="pf-option" onClick={() => pick(add)}>{label}<ArrowUpRight size={18} aria-hidden="true" /></button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              <p className="pf-muted">We’d start you in</p>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <PlateDot kg={winner.kg} size={72} />
                <h3 className="pf-h2" style={{ fontSize: "clamp(40px,5vw,72px)" }}>{winner.name}</h3>
              </div>
              <p style={{ maxWidth: "46ch" }}>{winner.short} {winner.who}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="pf-btn pf-btn--light" onClick={() => go("book", { program: winner.id })}>Book a free session</button>
                <button className="pf-btn pf-btn--ghost-light" onClick={() => go("programs", { id: winner.id })}>See the program</button>
                <button className="pf-textlink" onClick={reset}>Retake the quiz</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const roundTo = (n, step = 2.5) => Math.round(n / step) * step;

function OneRepCalc() {
  const [w, setW] = useState("100");
  const [r, setR] = useState("5");
  const wn = parseFloat(w), rn = parseInt(r, 10);
  const wErr = !(wn > 0) ? "Enter the weight you lifted, in kg." : null;
  const rErr = !(rn >= 1 && rn <= 12) ? "Enter a whole number of reps from 1 to 12." : null;
  const est = !wErr && !rErr ? (rn === 1 ? wn : wn * (1 + rn / 30)) : null;
  return (
    <section className="pf-section">
      <div className="pf-wrap pf-calc">
        <div>
          <h2 className="pf-h2">Know your max without testing it.</h2>
          <p className="pf-lede" style={{ marginTop: 24 }}>
            Enter a recent hard set and we’ll estimate your one-rep max, then show the weights to train at. Sets of 2 to 8 reps give the most accurate result.
          </p>
          <div className="pf-form" style={{ marginTop: 32 }}>
            <div className="pf-form-row">
              <div className="pf-field">
                <label htmlFor="calc-w">Weight lifted (kg)</label>
                <input id="calc-w" className="pf-input" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)}
                  aria-invalid={!!wErr} aria-describedby={wErr ? "calc-w-err" : undefined} />
                {wErr && <span id="calc-w-err" className="pf-error">{wErr}</span>}
              </div>
              <div className="pf-field">
                <label htmlFor="calc-r">Reps completed</label>
                <input id="calc-r" className="pf-input" inputMode="numeric" value={r} onChange={(e) => setR(e.target.value)}
                  aria-invalid={!!rErr} aria-describedby={rErr ? "calc-r-err" : undefined} />
                {rErr && <span id="calc-r-err" className="pf-error">{rErr}</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "2px solid var(--iron)", paddingTop: 24 }} aria-live="polite">
          {est ? (
            <>
              <p className="pf-muted">Estimated one-rep max</p>
              <div className="pf-total" style={{ margin: "8px 0 28px" }}>{roundTo(est)}<small>kg</small></div>
              <table className="pf-pct-table">
                <tbody>
                  {[[95, "Heavy single"], [90, "Heavy triple"], [85, "Strength set of 5"], [80, "Strength set of 6 to 8"], [70, "Volume work"], [60, "Warm-up and speed"]].map(([p, label]) => (
                    <tr key={p}><td>{p}%</td><td className="pf-muted" style={{ fontWeight: 400 }}>{label}</td><td>{roundTo(est * p / 100)} kg</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="pf-muted">Fix the highlighted fields to see your estimate.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGES
   ========================================================= */
function Home({ go }) {
  const story = STORIES[0];
  return (
    <>
      <section className="pf-hero">
        <div className="pf-wrap">
          <div className="pf-hero-top">
            <h1>Strength, built properly.</h1>
            <div>
              <p className="pf-hero-intro">
                A coached strength studio for beginners, lifters and everyone between. Small groups, real programming, and a logbook that shows it’s working.
              </p>
              <div className="pf-hero-ctas">
                <button className="pf-btn" onClick={() => go("book")}>Book a free session</button>
                <button className="pf-btn pf-btn--ghost" onClick={() => go("programs")}>See the programs</button>
              </div>
            </div>
          </div>
          <Barbell />
        </div>
      </section>

      <Marquee />

      <section className="pf-section">
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "center" }} data-stack>
          <p className="pf-manifesto">We don’t do quick fixes. We build strength that lasts.</p>
          <Photo shot="Chalked hands gripping a knurled bar, shallow focus, cool grey tones" ratio="4 / 5" light />
        </div>
      </section>

      <section className="pf-section" style={{ paddingTop: 0 }}>
        <div className="pf-wrap">
          <div className="pf-sec-head">
            <h2 className="pf-h2">How training works here</h2>
            <p className="pf-lede">Every member follows the same four steps. The plates get heavier as you go, and so do the lifts.</p>
          </div>
          <ol className="pf-steps" style={{ listStyle: "none", margin: 0, padding: "0" }}>
            {METHOD.map((m, i) => (
              <li key={m.name} className="pf-step" style={{ "--c": colorOf(m.kg), color: "var(--iron)" }}>
                <div className="pf-step-n" aria-hidden="true">{i + 1}</div>
                <h3>{m.name}</h3>
                <p className="pf-muted">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pf-section" style={{ paddingTop: 0 }}>
        <div className="pf-wrap">
          <div className="pf-sec-head">
            <h2 className="pf-h2">Six programs, one standard of coaching</h2>
            <p className="pf-lede">Pick the one that matches where you are. You can switch whenever your goals change.</p>
          </div>
          <div className="pf-prog-list">
            {PROGRAMS.map((p) => (
              <button key={p.id} className="pf-prog-row" style={{ "--c": colorOf(p.kg) }} onClick={() => go("programs", { id: p.id })}>
                <PlateDot kg={p.kg} />
                <h3>{p.name}</h3>
                <span className="pf-muted pf-hide-sm">{p.short}</span>
                <span className="pf-level pf-hide-sm">{p.level}</span>
                <ArrowUpRight className="pf-arrow" size={24} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-section pf-dark">
        <div className="pf-wrap">
          <div className="pf-stats">
            <div className="pf-stat"><b><Counter to={1200} suffix="+" /></b><span className="pf-muted">members training with us</span></div>
            <div className="pf-stat"><b><Counter to={SCHEDULE.length} /></b><span className="pf-muted">coached classes every week</span></div>
            <div className="pf-stat"><b><Counter to={COACHES.length} /></b><span className="pf-muted">certified coaches, all on the floor</span></div>
          </div>
        </div>
      </section>

      <section className="pf-section">
        <div className="pf-wrap">
          <div className="pf-sec-head">
            <h2 className="pf-h2">The people who’ll coach you</h2>
            <div>
              <p className="pf-lede" style={{ marginBottom: 20 }}>Every coach competes or practises in their field, and every one of them learns your name in week one.</p>
              <button className="pf-textlink" onClick={() => go("coaches")}>Meet the team <ArrowUpRight size={16} /></button>
            </div>
          </div>
          <div className="pf-coach-row">
            {COACHES.slice(0, 4).map((c) => (
              <button key={c.id} className="pf-coach-card" onClick={() => go("coaches", { id: c.id })}>
                <Photo shot={`Portrait of ${c.name}, black and white, grey backdrop`} ratio="3 / 4" light />
                <div className="pf-coach-name">{c.name}</div>
                <div className="pf-coach-meta"><PlateDot kg={progById[c.program].kg} size={20} /><span className="pf-muted">{c.role}</span></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-section" style={{ paddingTop: 0 }}>
        <div className="pf-wrap pf-story">
          <div>
            <p className="pf-muted" style={{ marginBottom: 14 }}>{story.name}, {story.age}. {story.lift}, {story.months} months.</p>
            <blockquote className="pf-quote" style={{ margin: "0 0 28px" }}>“{story.quote}”</blockquote>
            <button className="pf-textlink" onClick={() => go("results", { id: story.id })}>Read {story.name}’s story <ArrowUpRight size={16} /></button>
          </div>
          <LineChart data={story.data} months={story.months} />
        </div>
      </section>

      <Quiz go={go} />
      <CtaBand go={go} />
    </>
  );
}

function ProgramsPage({ route, go }) {
  const [open, setOpen] = useState(route.id || "foundations");
  useEffect(() => { if (route.id) setOpen(route.id); }, [route.id]);
  return (
    <>
      <PageHead title="Programs" text="Six ways to train. Each wears a competition plate color, and you’ll see the same color on the timetable.">
        <div className="pf-legend" style={{ marginTop: 24 }}>
          {PROGRAMS.map((p) => <span key={p.id} className="pf-legend-item"><PlateDot kg={p.kg} size={22} />{p.name}</span>)}
        </div>
      </PageHead>
      <section className="pf-section" style={{ paddingTop: 24 }}>
        <div className="pf-wrap">
          {PROGRAMS.map((p) => {
            const isOpen = open === p.id;
            const coach = COACHES.find((c) => c.program === p.id);
            return (
              <div key={p.id} className="pf-pd" data-open={isOpen}>
                <button className="pf-pd-head" aria-expanded={isOpen} aria-controls={`pd-${p.id}`} onClick={() => setOpen(isOpen ? null : p.id)}>
                  <PlateDot kg={p.kg} />
                  <h3>{p.name}</h3>
                  <span className="pf-level pf-hide-sm">{p.level}</span>
                  <ChevronDown className="pf-pd-chev" size={28} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="pf-pd-body" id={`pd-${p.id}`}>
                    <div>
                      <Photo shot={`${p.name} in session, coach mid-cue, natural gym light`} ratio="4 / 3" light style={{ marginBottom: 24 }} />
                      <dl className="pf-dl">
                        <dt>Level</dt><dd>{p.level}</dd>
                        <dt>Session</dt><dd>{p.session}</dd>
                        <dt>Frequency</dt><dd>{p.frequency}</dd>
                        <dt>Block length</dt><dd>{p.block}</dd>
                        {coach && <><dt>Lead coach</dt><dd>{coach.name}</dd></>}
                      </dl>
                    </div>
                    <div>
                      <p className="pf-lede" style={{ color: "var(--iron)", marginBottom: 24 }}>{p.who}</p>
                      <h4 className="pf-h3" style={{ marginBottom: 12 }}>What’s included</h4>
                      <ul className="pf-ticks">
                        {p.includes.map((t) => <li key={t}><Check size={20} style={{ flex: "none", marginTop: 3, color: "var(--green)" }} aria-hidden="true" />{t}</li>)}
                      </ul>
                      <p style={{ margin: "24px 0", fontWeight: 600, fontSize: 19 }}>{p.outcome}</p>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button className="pf-btn" onClick={() => go("book", { program: p.id })}>Book a free session</button>
                        <button className="pf-btn pf-btn--ghost" onClick={() => go("schedule", { program: p.id })}>See classes</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <OneRepCalc />
      <CtaBand go={go} />
    </>
  );
}

function CoachModal({ coach, onClose, go }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const p = progById[coach.program];
  return (
    <div className="pf-modal-bg" onClick={onClose}>
      <div className="pf-modal" role="dialog" aria-modal="true" aria-label={coach.name} onClick={(e) => e.stopPropagation()}>
        <button className="pf-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <Photo shot={`Portrait of ${coach.name}, black and white, grey backdrop`} ratio="3 / 4" light style={{ height: "100%" }} />
        <div style={{ padding: "clamp(24px,4vw,48px)", display: "grid", gap: 18, alignContent: "start" }}>
          <div>
            <h3 style={{ fontSize: "clamp(40px,5vw,64px)" }}>{coach.name}</h3>
            <p className="pf-muted" style={{ marginTop: 8 }}>{coach.role}, {coach.years}</p>
          </div>
          <blockquote className="pf-quote" style={{ margin: 0, fontSize: "clamp(26px,3vw,38px)" }}>“{coach.quote}”</blockquote>
          <p>{coach.bio}</p>
          <dl className="pf-dl">
            <dt>Personal best</dt><dd>{coach.pr}</dd>
            <dt>Credentials</dt><dd>{coach.certs.join(", ")}</dd>
            <dt>Coaches</dt><dd style={{ display: "flex", alignItems: "center", gap: 8 }}><PlateDot kg={p.kg} size={20} />{p.name}</dd>
          </dl>
          <div><button className="pf-btn" onClick={() => go("book", { program: coach.program })}>Train with {coach.name.split(" ")[0]}</button></div>
        </div>
      </div>
    </div>
  );
}

function CoachesPage({ route, go }) {
  const [sel, setSel] = useState(route.id ? coachById[route.id] : null);
  return (
    <>
      <PageHead title="Coaches" text="Six coaches, each with a specialty and a personal best they’re happy to talk about. Select a coach to read their story." />
      <section className="pf-section">
        <div className="pf-wrap pf-coach-grid">
          {COACHES.map((c) => (
            <button key={c.id} className="pf-coach-card" onClick={() => setSel(c)}>
              <Photo shot={`Portrait of ${c.name}, black and white, grey backdrop`} ratio="3 / 4" light />
              <div className="pf-coach-name" style={{ fontSize: 38 }}>{c.name}</div>
              <div className="pf-coach-meta"><PlateDot kg={progById[c.program].kg} size={22} /><span>{c.role}</span></div>
              <p className="pf-muted" style={{ marginTop: 6, fontSize: 15 }}>{c.pr}</p>
            </button>
          ))}
        </div>
      </section>
      {sel && <CoachModal coach={sel} go={go} onClose={() => setSel(null)} />}
      <CtaBand go={go} title="Find your coach." />
    </>
  );
}

function SchedulePage({ route, go }) {
  const [prog, setProg] = useState(route.program || "all");
  const [coach, setCoach] = useState("all");
  const [slot, setSlot] = useState("all");
  const slotOf = (t) => { const h = parseInt(t, 10); return h < 10 ? "morning" : h < 17 ? "midday" : "evening"; };
  const list = useMemo(() => SCHEDULE.filter((c) =>
    (prog === "all" || c.program === prog) && (coach === "all" || c.coach === coach) && (slot === "all" || slotOf(c.time) === slot)
  ), [prog, coach, slot]);
  const clear = () => { setProg("all"); setCoach("all"); setSlot("all"); };
  const filtered = prog !== "all" || coach !== "all" || slot !== "all";
  return (
    <>
      <PageHead title="Schedule" text="Every class runs weekly, capped at six to eight people. Select a class to request your spot." />
      <section className="pf-section" style={{ paddingTop: 40 }}>
        <div className="pf-wrap">
          <div style={{ display: "grid", gap: 20, marginBottom: 40 }}>
            <div className="pf-chips" role="group" aria-label="Filter by program">
              <button className="pf-chip" aria-pressed={prog === "all"} onClick={() => setProg("all")}>All programs</button>
              {PROGRAMS.map((p) => (
                <button key={p.id} className="pf-chip" aria-pressed={prog === p.id} onClick={() => setProg(p.id)}>
                  <PlateDot kg={p.kg} size={16} />{p.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
              <div className="pf-field" style={{ minWidth: 220 }}>
                <label htmlFor="f-coach">Coach</label>
                <select id="f-coach" className="pf-select" value={coach} onChange={(e) => setCoach(e.target.value)}>
                  <option value="all">All coaches</option>
                  {COACHES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="pf-chips" role="group" aria-label="Filter by time of day">
                {[["all", "Any time"], ["morning", "Morning"], ["midday", "Midday"], ["evening", "Evening"]].map(([v, l]) => (
                  <button key={v} className="pf-chip" aria-pressed={slot === v} onClick={() => setSlot(v)}>{l}</button>
                ))}
              </div>
              {filtered && <button className="pf-textlink" onClick={clear}>Clear filters</button>}
            </div>
          </div>
          {list.length === 0 ? (
            <div style={{ padding: "48px 0" }}>
              <p className="pf-h3" style={{ marginBottom: 12 }}>No classes match those filters.</p>
              <button className="pf-btn" onClick={clear}>Show all classes</button>
            </div>
          ) : (
            <div className="pf-scroll">
              <div className="pf-tt">
                {DAYS.map((d) => (
                  <div key={d} className="pf-tt-col">
                    <div className="pf-tt-day">{d}</div>
                    {list.filter((c) => c.day === d).map((c) => {
                      const p = progById[c.program];
                      return (
                        <button key={c.time + c.program} className="pf-tt-class" style={{ "--c": colorOf(p.kg) }} onClick={() => go("book", { program: c.program })}>
                          <b>{c.time}</b><span>{p.name}</span><small>{coachById[c.coach].name}</small>
                        </button>
                      );
                    })}
                    {list.filter((c) => c.day === d).length === 0 && <span className="pf-muted" style={{ fontSize: 14 }}>No class</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="pf-muted" style={{ marginTop: 32, fontSize: 15 }}>Open gym runs daily from 6am to 10pm outside class times.</p>
        </div>
      </section>
    </>
  );
}

function MembershipPage({ go }) {
  const [openQ, setOpenQ] = useState(0);
  const cell = (v) => v === true ? <Check size={20} style={{ color: "var(--green)" }} aria-label="Included" /> : v === false ? <span className="pf-muted" aria-label="Not included">–</span> : v;
  return (
    <>
      <PageHead title="Membership" text="Three tiers, monthly billing, no joining fee. The plates get heavier as the coaching gets closer." />
      <section className="pf-section" style={{ paddingTop: 56 }}>
        <div className="pf-wrap">
          <div className="pf-tiers">
            {TIERS.map((t, i) => {
              const kg = [5, 15, 25][i];
              return (
                <div key={t.id} className={"pf-tier" + (t.featured ? " is-featured" : "")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "space-between" }}>
                    <PlateDot kg={kg} size={56} />
                    {t.featured && <span className="pf-badge">Most popular</span>}
                  </div>
                  <h3 className="pf-h3" style={{ fontSize: 52 }}>{t.name}</h3>
                  <p className={t.featured ? "" : "pf-muted"} style={t.featured ? { color: "var(--steel-light)" } : null}>{t.blurb}</p>
                  <div className="pf-price">${t.price}<small>a month</small></div>
                  <ul>{t.features.map((f) => <li key={f}><Check size={20} style={{ flex: "none", marginTop: 3, color: t.featured ? "var(--yellow)" : "var(--green)" }} aria-hidden="true" />{f}</li>)}</ul>
                  <button className={"pf-btn" + (t.featured ? " pf-btn--light" : "")} style={{ marginTop: "auto" }} onClick={() => go("book")}>Start with a free session</button>
                </div>
              );
            })}
          </div>
          <p className="pf-muted" style={{ marginTop: 20 }}>Drop-in day pass: $25. Ten-visit card: $199, valid for six months.</p>
        </div>
      </section>

      <section className="pf-section" style={{ paddingTop: 0 }}>
        <div className="pf-wrap">
          <h2 className="pf-h2" style={{ marginBottom: 40 }}>Compare tiers</h2>
          <div className="pf-scroll">
            <table className="pf-table">
              <thead><tr><th scope="col"><span className="pf-muted" style={{ fontFamily: "var(--body)", fontSize: 15, fontWeight: 500 }}>What you get</span></th>{TIERS.map((t) => <th key={t.id} scope="col">{t.name}</th>)}</tr></thead>
              <tbody>{COMPARE.map(([label, a, b, c]) => <tr key={label}><th scope="row" style={{ fontWeight: 500, textAlign: "left" }}>{label}</th><td>{cell(a)}</td><td>{cell(b)}</td><td>{cell(c)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pf-section" style={{ background: "var(--chalk-2)" }}>
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "clamp(32px,5vw,80px)" }} data-stack>
          <h2 className="pf-h2">Questions, answered</h2>
          <div style={{ borderTop: "2px solid var(--iron)" }}>
            {FAQ.map(([q, a], i) => (
              <div key={q} className="pf-faq-item">
                <button className="pf-faq-q" aria-expanded={openQ === i} onClick={() => setOpenQ(openQ === i ? -1 : i)}>
                  {q}<ChevronDown size={22} style={{ flex: "none", transform: openQ === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} aria-hidden="true" />
                </button>
                {openQ === i && <p className="pf-faq-a">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand go={go} />
    </>
  );
}

function SpacePage({ go }) {
  return (
    <>
      <PageHead title="The space" text="A converted foundry with 8,000 square feet, high ceilings and good light. Built for lifting, not for looking at yourself in mirrors." />
      <section className="pf-section" style={{ paddingTop: 24 }}>
        <div className="pf-wrap">
          {ZONES.map((z, i) => (
            <div key={z.name} className="pf-zone">
              <div className="pf-zone-photo"><Photo shot={z.shot} ratio="16 / 10" /></div>
              <div>
                <h2 className="pf-h2" style={{ fontSize: "clamp(40px,5vw,72px)", marginBottom: 20 }}>{z.name}</h2>
                <p className="pf-lede">{z.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="pf-section pf-dark">
        <div className="pf-wrap">
          <div className="pf-sec-head">
            <h2 className="pf-h2">What’s on the floor</h2>
            <p className="pf-lede">We buy equipment that lasts and that lifters trust. If it’s on this list, it’s calibrated and maintained weekly.</p>
          </div>
          <ul className="pf-equip">{EQUIPMENT.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </section>
      <CtaBand go={go} title="Come and see it." />
    </>
  );
}

function ResultsPage({ route, go }) {
  const [id, setId] = useState(route.id || STORIES[0].id);
  const s = STORIES.find((x) => x.id === id);
  const p = progById[s.program];
  return (
    <>
      <PageHead title="Results" text="Three members, three timelines, and the logbook entries that prove it. Progress here looks different for everyone." />
      <section className="pf-section" style={{ paddingTop: 40 }}>
        <div className="pf-wrap">
          <div className="pf-chips" role="group" aria-label="Choose a member story" style={{ marginBottom: 48 }}>
            {STORIES.map((x) => <button key={x.id} className="pf-chip" aria-pressed={id === x.id} onClick={() => setId(x.id)}>{x.name}, {x.age}</button>)}
          </div>
          <div className="pf-story">
            <div style={{ display: "grid", gap: 28 }}>
              <blockquote className="pf-quote" style={{ margin: 0 }}>“{s.quote}”</blockquote>
              <p style={{ fontSize: 19, maxWidth: "52ch" }}>{s.story}</p>
              <dl className="pf-dl">
                <dt>Program</dt><dd style={{ display: "flex", alignItems: "center", gap: 8 }}><PlateDot kg={p.kg} size={20} />{p.name}</dd>
                <dt>Lift tracked</dt><dd>{s.lift}</dd>
                <dt>Time</dt><dd>{s.months} months</dd>
                <dt>Gain</dt><dd>{s.data[s.data.length - 1] - s.data[0]} kg</dd>
              </dl>
            </div>
            <div style={{ display: "grid", gap: 20 }}>
              <Photo shot={`${s.name} mid-lift, ${s.lift.toLowerCase()}, documentary style, natural light`} ratio="4 / 3" light />
              <LineChart data={s.data} months={s.months} />
            </div>
          </div>
        </div>
      </section>
      <CtaBand go={go} title="Start your own log." />
    </>
  );
}

function JournalPage({ route, go }) {
  const post = POSTS.find((x) => x.id === route.id);
  if (post) {
    const a = coachById[post.author];
    return (
      <>
        <header className="pf-page-head" style={{ borderBottom: 0 }}>
          <div className="pf-wrap" style={{ maxWidth: 900 }}>
            <button className="pf-textlink" onClick={() => go("journal")} style={{ marginBottom: 32 }}><ArrowLeft size={16} /> All articles</button>
            <p className="pf-muted" style={{ marginBottom: 16 }}>{post.category}, {post.read} read</p>
            <h1 style={{ fontSize: "clamp(48px,7vw,104px)", lineHeight: 0.88, maxWidth: "16ch" }}>{post.title}</h1>
            <p className="pf-lede" style={{ marginTop: 28 }}>{post.excerpt}</p>
            <p style={{ marginTop: 20, fontWeight: 600 }}>By {a.name}</p>
          </div>
        </header>
        <div className="pf-wrap" style={{ maxWidth: 900, marginBottom: 56 }}><Photo shot={`Editorial photo for “${post.title}”`} ratio="16 / 9" light /></div>
        <article className="pf-article pf-wrap" style={{ paddingBottom: 96 }}>
          {post.body.map((para, i) => <p key={i}>{para}</p>)}
          <button className="pf-btn" onClick={() => go("book")}>Try it in a free session</button>
        </article>
        <section className="pf-section pf-dark">
          <div className="pf-wrap">
            <h2 className="pf-h2" style={{ marginBottom: 40 }}>Keep reading</h2>
            <div className="pf-posts">
              {POSTS.filter((x) => x.id !== post.id).slice(0, 2).map((x) => (
                <button key={x.id} className="pf-post" onClick={() => go("journal", { id: x.id })}>
                  <h3 style={{ fontSize: 40 }}>{x.title}</h3>
                  <span className="pf-muted">{x.category}, {x.read}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }
  return (
    <>
      <PageHead title="Journal" text="Practical writing from our coaches on technique, training, food and staying strong for decades." />
      <section className="pf-section" style={{ paddingTop: 56 }}>
        <div className="pf-wrap pf-posts">
          {POSTS.map((x) => (
            <button key={x.id} className="pf-post" onClick={() => go("journal", { id: x.id })}>
              <Photo shot={`Editorial photo for “${x.title}”`} ratio="3 / 2" light />
              <div className="pf-post-meta"><span>{x.category}</span><span>{x.read} read</span><span>{coachById[x.author].name}</span></div>
              <h3>{x.title}</h3>
              <p className="pf-muted">{x.excerpt}</p>
            </button>
          ))}
        </div>
      </section>
      <CtaBand go={go} />
    </>
  );
}

function BookPage({ route }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", program: route.program || "unsure", slot: "Morning", exp: "new", msg: "" });
  const [errs, setErrs] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = "Enter your name so we know who to ask for.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email address, like name@example.com.";
    setErrs(er);
    if (!Object.keys(er).length) setSent(true);
  };
  return (
    <>
      <PageHead title="Book a free session" text="Forty-five minutes with a coach. Tell us a little about you and we’ll reply within one working day to confirm a time." />
      <section className="pf-section" style={{ paddingTop: 56 }}>
        <div className="pf-wrap pf-book">
          {sent ? (
            <div className="pf-success" aria-live="polite">
              <h2 className="pf-h2" style={{ fontSize: "clamp(40px,5vw,72px)", marginBottom: 16 }}>Request sent.</h2>
              <p style={{ fontSize: 19, maxWidth: "46ch", marginBottom: 24 }}>Thanks, {f.name.split(" ")[0]}. We’ll email {f.email} within one working day to confirm your session.</p>
              <button className="pf-btn pf-btn--ghost" onClick={() => { setSent(false); setF({ ...f, name: "", email: "", phone: "", msg: "" }); }}>Send another request</button>
            </div>
          ) : (
            <form className="pf-form" onSubmit={submit} noValidate>
              <div className="pf-form-row">
                <div className="pf-field">
                  <label htmlFor="b-name">Full name</label>
                  <input id="b-name" className="pf-input" value={f.name} onChange={set("name")} aria-invalid={!!errs.name} aria-describedby={errs.name ? "b-name-e" : undefined} autoComplete="name" />
                  {errs.name && <span id="b-name-e" className="pf-error">{errs.name}</span>}
                </div>
                <div className="pf-field">
                  <label htmlFor="b-email">Email</label>
                  <input id="b-email" type="email" className="pf-input" value={f.email} onChange={set("email")} aria-invalid={!!errs.email} aria-describedby={errs.email ? "b-email-e" : undefined} autoComplete="email" />
                  {errs.email && <span id="b-email-e" className="pf-error">{errs.email}</span>}
                </div>
              </div>
              <div className="pf-form-row">
                <div className="pf-field">
                  <label htmlFor="b-phone">Phone (optional)</label>
                  <input id="b-phone" className="pf-input" value={f.phone} onChange={set("phone")} autoComplete="tel" />
                </div>
                <div className="pf-field">
                  <label htmlFor="b-prog">Program you’re curious about</label>
                  <select id="b-prog" className="pf-select" value={f.program} onChange={set("program")}>
                    <option value="unsure">Not sure yet</option>
                    {PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pf-field">
                <span style={{ fontWeight: 600, fontSize: 15 }} id="b-slot">Best time of day</span>
                <div className="pf-seg" role="group" aria-labelledby="b-slot">
                  {["Morning", "Lunchtime", "Evening", "Weekend"].map((s) => <button type="button" key={s} aria-pressed={f.slot === s} onClick={() => setF({ ...f, slot: s })}>{s}</button>)}
                </div>
              </div>
              <div className="pf-field">
                <label htmlFor="b-exp">Training experience</label>
                <select id="b-exp" className="pf-select" value={f.exp} onChange={set("exp")}>
                  <option value="new">New to lifting</option>
                  <option value="some">Some experience</option>
                  <option value="reg">I train regularly</option>
                </select>
              </div>
              <div className="pf-field">
                <label htmlFor="b-msg">Anything we should know? (optional)</label>
                <textarea id="b-msg" rows={4} className="pf-textarea" value={f.msg} onChange={set("msg")} placeholder="Goals, injuries, questions" />
              </div>
              <div><button className="pf-btn" type="submit">Send request</button></div>
            </form>
          )}
          <aside className="pf-aside" aria-label="Studio details">
            <h3 className="pf-h3" style={{ marginBottom: 16 }}>Find us</h3>
            <div className="pf-aside-row"><MapPin size={20} style={{ flex: "none", marginTop: 3 }} aria-hidden="true" /><span>14 Foundry Lane, Warehouse District. Free bike parking out front.</span></div>
            <div className="pf-aside-row"><Clock size={20} style={{ flex: "none", marginTop: 3 }} aria-hidden="true" /><span>Open daily, 6am to 10pm</span></div>
            <div className="pf-aside-row"><Phone size={20} style={{ flex: "none", marginTop: 3 }} aria-hidden="true" /><span>+1 (555) 014 2290</span></div>
            <div className="pf-aside-row"><Mail size={20} style={{ flex: "none", marginTop: 3 }} aria-hidden="true" /><span>hello@peakform.studio</span></div>
            <div className="pf-aside-row"><Instagram size={20} style={{ flex: "none", marginTop: 3 }} aria-hidden="true" /><span>@peakform.studio</span></div>
            <div style={{ marginTop: 20 }}><Photo shot="Map of Warehouse District with the studio marked" ratio="4 / 3" /></div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   APP
   ========================================================= */
export default function PeakForm() {
  const [route, setRoute] = useState({ page: "home" });
  const [open, setOpen] = useState(false);
  const go = (page, extra = {}) => { setRoute({ page, ...extra }); setOpen(false); };
  useEffect(() => { window.scrollTo({ top: 0 }); }, [route.page, route.id]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const key = route.page + (route.id || "") + (route.program || "");
  const pages = {
    home: <Home go={go} />, programs: <ProgramsPage route={route} go={go} />, coaches: <CoachesPage route={route} go={go} />,
    schedule: <SchedulePage route={route} go={go} />, membership: <MembershipPage go={go} />, space: <SpacePage go={go} />,
    results: <ResultsPage route={route} go={go} />, journal: <JournalPage route={route} go={go} />, book: <BookPage route={route} />,
  };
  return (
    <div className="pf">
      <style>{CSS}{`@media(max-width:980px){.pf [data-stack]{grid-template-columns:1fr!important}}`}</style>
      <Nav route={route} go={go} open={open} setOpen={setOpen} />
      <main key={key}>{pages[route.page]}</main>
      <Footer go={go} />
    </div>
  );
}
