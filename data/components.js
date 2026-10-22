/**
 * MotoMatch — Component knowledge for the teardown.
 * ---------------------------------------------------
 * Two kinds of information live here, and the UI keeps them visibly separate:
 *
 *  1. GUIDE  — general engineering guidance about what each component does and
 *              what a buyer should look for. Applies to every bike.
 *  2. SPECS  — model-specific hardware details that are NOT in engine.js. Only
 *              added where a source was checked; every block carries its source.
 *              Any field not listed here is shown as "not in dataset".
 *
 * Dataset values (cc, power, torque, mileage, weight, ground clearance, ABS,
 * comfort, experience, purpose, price) always come from BikeEngine.BIKES.
 */
"use strict";

window.TEARDOWN_CHAPTERS = [
  {
    key: "engine",
    code: "01",
    title: "Powertrain",
    parts: ["engine"],
    role: "Converts fuel into rotation. Displacement and tuning set how much power arrives, where in the rev range it arrives, and how much fuel it costs.",
    look: [
      "Torque figure and the rpm it peaks at matter more for city riding than peak horsepower.",
      "Liquid cooling allows higher specific output; air/oil cooling keeps the engine simpler to maintain.",
      "Specific output (bhp per litre) hints at how high-strung an engine is: higher means more revs, usually more maintenance."
    ]
  },
  {
    key: "frame",
    code: "02",
    title: "Frame & Chassis",
    parts: ["frame"],
    role: "The structural spine. Everything bolts to it; its geometry and stiffness decide stability, steering feel and how the weight is carried.",
    look: [
      "Kerb weight is the single best predictor of how a bike feels in traffic and when pushing it around.",
      "Ground clearance decides whether speed breakers and broken roads scrape the underside.",
      "Seat height (where listed) decides whether you can flat-foot at a signal."
    ]
  },
  {
    key: "suspension",
    code: "03",
    title: "Suspension",
    parts: ["fork", "swingarm"],
    role: "Keeps the tyres pressed to the road and isolates the rider from impacts. Front forks steer and absorb; the rear shock(s) control the swingarm.",
    look: [
      "Upside-down (USD) forks are stiffer and usually better damped than conventional telescopic forks.",
      "Preload adjustment at the rear lets you set the bike up for a pillion or luggage.",
      "Longer travel absorbs bad roads but raises the seat."
    ]
  },
  {
    key: "brakes",
    code: "04",
    title: "Braking System",
    parts: ["brakeF", "brakeR"],
    role: "Converts speed into heat. The front brake does most of the work; ABS prevents wheel lock under panic braking on poor surfaces.",
    look: [
      "Dual-channel ABS (both wheels) is the strongest safety feature you can buy at any budget.",
      "Larger front discs and multi-piston calipers resist fade on long descents.",
      "Combined/integrated braking on commuters links front and rear when you press the rear lever."
    ]
  },
  {
    key: "wheels",
    code: "05",
    title: "Wheels & Tyres",
    parts: ["wheelF", "wheelR"],
    role: "The only contact with the road — two patches roughly the size of a palm. Wheel diameter and tyre section shape the handling.",
    look: [
      "Larger front wheels (19–21\") roll over potholes and gravel; 17\" wheels turn in faster.",
      "Wider rear sections add grip and stability but cost more to replace.",
      "Tubeless tyres let you ride to help after a puncture; spoked rims usually need tubes unless specified."
    ]
  },
  {
    key: "fuel",
    code: "06",
    title: "Drivetrain, Fuel & Exhaust",
    parts: ["drive", "exhaust", "tank"],
    role: "Gearbox and final drive deliver the engine's work to the rear wheel; the tank and exhaust decide range, noise and running cost.",
    look: [
      "Claimed mileage × tank capacity gives a rough range per fill.",
      "Six-speed gearboxes keep revs lower on highways; four or five speeds are enough for city use.",
      "Chain final drive needs cleaning and lubrication roughly every 500–1,000 km."
    ]
  },
  {
    key: "ergo",
    code: "07",
    title: "Ergonomics & Cockpit",
    parts: ["seat", "cockpit", "tank"],
    role: "Seat, bars and pegs set the riding posture — the thing you will notice in the first five minutes and every hour after.",
    look: [
      "Upright bars and a flat seat suit commuting and touring; clip-ons and rear-set pegs suit the track.",
      "Test the reach to the ground and the bars before buying; numbers rarely tell the whole story.",
      "Check where the instrument cluster sits relative to your eye line on the move."
    ]
  }
];

/**
 * Model-specific hardware, keyed by BikeEngine.BIKES id.
 * Only fields that were checked against the cited source.
 */
window.BIKE_SPECS = {
  29: {
    source: { label: "Wikipedia — Royal Enfield Interceptor 650", url: "https://en.wikipedia.org/wiki/Royal_Enfield_Interceptor_650" },
    engineType: "Air-&-oil-cooled SOHC 8-valve 270° parallel twin",
    gearbox: "6-speed",
    frame: "Tubular twin-downtube cradle frame",
    frontSusp: "Telescopic fork",
    rearSusp: "Twin shocks, 5-step adjustable",
    frontBrake: "320 mm disc",
    rearBrake: "240 mm disc",
    fuelTank: 13.7,
    seatHeight: 804
  },
  21: {
    source: { label: "Team-BHP — Himalayan 450 specifications", url: "https://www.team-bhp.com/new-bikes/royal-enfield/himalayan-450/specifications/" },
    engineType: "Liquid-cooled single, 4 valves",
    gearbox: "6-speed",
    frontSusp: "43 mm upside-down fork",
    rearSusp: "Linkage-type monoshock",
    frontBrake: "320 mm disc",
    rearBrake: "270 mm disc",
    absType: "Dual-channel",
    tyreF: "90/90-21",
    tyreR: "140/80-R17",
    wheels: "21\" front / 17\" rear, spoked",
    fuelTank: 17,
    seatHeight: 825
  },
  13: {
    source: { label: "KTM India — 390 Duke specifications", url: "https://www.ktmindia.com/ktm-bikes/naked-bike/ktm-390-duke/specifications" },
    engineType: "Liquid-cooled DOHC single",
    frame: "Split-trellis frame",
    frontSusp: "43 mm inverted fork, 5-step damping adjustable",
    rearSusp: "Monoshock, 5-step damping, 10-step preload",
    frontBrake: "320 mm disc, radial caliper",
    rearBrake: "240 mm disc, floating caliper",
    absType: "Cornering ABS with Supermoto mode",
    tyreF: "110/70 R17",
    tyreR: "150/60 R17",
    fuelTank: 15,
    seatHeight: "800 / 820"
  },
  16: {
    source: { label: "Autocar India — Yamaha R15 V4 specifications", url: "https://www.autocarindia.com/bikes/yamaha/yzf-r15-v4/specifications" },
    engineType: "Liquid-cooled single",
    gearbox: "6-speed",
    frame: "Deltabox frame",
    frontSusp: "Upside-down fork",
    rearSusp: "Linked-type Monocross",
    frontBrake: "282 mm disc",
    rearBrake: "220 mm disc",
    absType: "Dual-channel",
    tyreF: "100/80-17",
    tyreR: "140/70-R17",
    fuelTank: 11,
    seatHeight: 815
  },
  27: {
    source: { label: "Royal Enfield — Classic 350 technical specifications (PDF)", url: "https://www.royalenfield.com/content/dam/re-platform-images/home/motorcycles/royal-enfield-classic-350-technical-specifications.pdf" },
    engineType: "Air-oil cooled single, 4-stroke",
    gearbox: "5-speed constant mesh",
    frame: "Twin-downtube spine frame",
    frontSusp: "41 mm telescopic fork, 130 mm travel",
    rearSusp: "Twin-tube emulsion shocks, 6-step preload",
    frontBrake: "300 mm disc, twin-piston floating caliper",
    rearBrake: "270 mm disc or 153 mm drum (variant)",
    absType: "Single or dual channel (variant)",
    tyreF: "100/90-19",
    tyreR: "120/80-18",
    fuelTank: 13,
    seatHeight: 805
  },
  1: {
    source: { label: "Smartprix — Hero Splendor Plus XTEC specifications", url: "https://www.smartprix.com/bikes/hero-splendor-plus-xtec-ppd1i57vy9cq" },
    engineType: "Air-cooled OHC single",
    gearbox: "4-speed",
    frame: "Tubular double cradle",
    frontSusp: "Telescopic hydraulic fork",
    rearSusp: "Swingarm, 5-step adjustable hydraulic shocks",
    frontBrake: "240 mm disc (disc variant) / drum",
    rearBrake: "130 mm drum",
    absType: "Integrated Braking System (no ABS)",
    tyreF: "80/100-18 tubeless",
    tyreR: "80/100-18 tubeless",
    fuelTank: 9.8,
    seatHeight: 785
  }
};
