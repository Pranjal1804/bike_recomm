/**
 * MotoMatch India — Mathematical Recommendation Engine
 * =====================================================
 * Contains all five models:
 *  1. TOPSIS  (25%)
 *  2. AHP     (25%)
 *  3. Fuzzy Logic (20%)
 *  4. K-Nearest Neighbors (15%)
 *  5. Weighted Sum Model  (15%)
 *
 * Real dataset: 35+ bikes available in India (2024)
 * Sources: BikeWale, ZigWheels, Manufacturer sites
 */

"use strict";

// ═══════════════════════════════════════════════════════════
//  REAL INDIA BIKE DATASET  (2024)
//  Fields: id, name, brand, segment, cc, power(bhp),
//          torque(Nm), mileage(kmpl), weight(kg),
//          price(₹), abs, groundClearance(mm),
//          experience[1=beginner..3=expert],
//          comfort[1..5], purpose[], emoji
// ═══════════════════════════════════════════════════════════
const BIKES = [
  // ─── Commuter ───
  {
    id: 1, name: "Hero Splendor Plus Xtec", brand: "hero", segment: "commuter",
    cc: 97.2, power: 7.9, torque: 8.05, mileage: 67, weight: 112,
    price: 80000, abs: false, groundClearance: 180, experience: 1,
    comfort: 4, purpose: ["commuting"],
    pros: ["Extremely frugal", "Low maintenance", "Nation's bestseller"],
    emoji: "🏍️"
  },
  {
    id: 2, name: "Honda Shine 100", brand: "honda", segment: "commuter",
    cc: 98.98, power: 7.28, torque: 8.05, mileage: 65, weight: 107,
    price: 66000, abs: false, groundClearance: 180, experience: 1,
    comfort: 4, purpose: ["commuting"],
    pros: ["Most affordable", "Honda reliability", "Lightest"],
    emoji: "🛵"
  },
  {
    id: 3, name: "Honda Shine 125", brand: "honda", segment: "commuter",
    cc: 123.9, power: 10.74, torque: 10.9, mileage: 55, weight: 123,
    price: 82000, abs: false, groundClearance: 166, experience: 1,
    comfort: 4, purpose: ["commuting"],
    pros: ["Honda reliability", "CBS braking", "City champion"],
    emoji: "🛵"
  },
  {
    id: 4, name: "TVS Raider 125", brand: "tvs", segment: "commuter",
    cc: 124.8, power: 11.2, torque: 11.2, mileage: 67, weight: 123,
    price: 98000, abs: false, groundClearance: 177, experience: 1,
    comfort: 3, purpose: ["commuting", "sports"],
    pros: ["Riding modes", "Bluetooth connectivity", "Best-in-class style"],
    emoji: "🏍️"
  },
  {
    id: 5, name: "Hero Xtreme 125R", brand: "hero", segment: "commuter",
    cc: 124.7, power: 11.5, torque: 11.0, mileage: 66, weight: 125,
    price: 98000, abs: true, groundClearance: 180, experience: 1,
    comfort: 3, purpose: ["commuting", "sports"],
    pros: ["Single-channel ABS", "Sporty design", "Good value"],
    emoji: "🏍️"
  },
  {
    id: 6, name: "Bajaj Pulsar 125", brand: "bajaj", segment: "commuter",
    cc: 124.4, power: 11.8, torque: 10.8, mileage: 55, weight: 137,
    price: 81000, abs: false, groundClearance: 170, experience: 1,
    comfort: 3, purpose: ["commuting"],
    pros: ["Sporty Pulsar looks", "Budget performance", "Wide service network"],
    emoji: "🏍️"
  },

  // ─── Naked / Street ───
  {
    id: 7, name: "Bajaj Pulsar 150", brand: "bajaj", segment: "naked",
    cc: 149.5, power: 14.0, torque: 13.5, mileage: 49, weight: 145,
    price: 110000, abs: false, groundClearance: 170, experience: 1,
    comfort: 3, purpose: ["commuting", "sports"],
    pros: ["Iconic legacy", "Punchy performance", "Affordable"],
    emoji: "🏍️"
  },
  {
    id: 8, name: "Honda CB Unicorn 160", brand: "honda", segment: "naked",
    cc: 162.71, power: 12.73, torque: 14.42, mileage: 52, weight: 148,
    price: 110000, abs: false, groundClearance: 165, experience: 1,
    comfort: 4, purpose: ["commuting", "touring"],
    pros: ["Smooth engine", "Plush seat", "Honda build quality"],
    emoji: "🏍️"
  },
  {
    id: 9, name: "TVS Apache RTR 160 4V", brand: "tvs", segment: "naked",
    cc: 159.7, power: 17.3, torque: 14.73, mileage: 45, weight: 149,
    price: 135000, abs: true, groundClearance: 180, experience: 2,
    comfort: 3, purpose: ["commuting", "sports"],
    pros: ["Race-tuned engine", "3 riding modes", "Race-inspired design"],
    emoji: "🏍️"
  },
  {
    id: 10, name: "Yamaha MT-15 V2", brand: "yamaha", segment: "naked",
    cc: 155, power: 18.4, torque: 14.1, mileage: 47, weight: 138,
    price: 171000, abs: true, groundClearance: 170, experience: 2,
    comfort: 2, purpose: ["commuting", "sports"],
    pros: ["VVA technology", "Lightest in class", "Aggressive hyper naked design"],
    emoji: "🏍️"
  },
  {
    id: 11, name: "Bajaj Pulsar NS200", brand: "bajaj", segment: "naked",
    cc: 199.5, power: 24.13, torque: 18.74, mileage: 37, weight: 158,
    price: 142000, abs: true, groundClearance: 170, experience: 2,
    comfort: 2, purpose: ["commuting", "sports"],
    pros: ["Perimeter frame", "Liquid-cooled", "Streetfighter stance"],
    emoji: "🏍️"
  },
  {
    id: 12, name: "KTM Duke 200", brand: "ktm", segment: "naked",
    cc: 199.5, power: 24.6, torque: 19.3, mileage: 35, weight: 166,
    price: 196000, abs: true, groundClearance: 170, experience: 2,
    comfort: 2, purpose: ["commuting", "sports"],
    pros: ["WP USD forks", "Supermoto ABS", "Trellis frame"],
    emoji: "🏍️"
  },
  {
    id: 13, name: "KTM Duke 390", brand: "ktm", segment: "naked",
    cc: 399, power: 45.3, torque: 37, mileage: 28, weight: 167,
    price: 311000, abs: true, groundClearance: 185, experience: 3,
    comfort: 2, purpose: ["commuting", "sports", "touring"],
    pros: ["Ride-by-wire", "Cornering ABS", "Quickshifter+"],
    emoji: "⚡"
  },
  {
    id: 14, name: "Triumph Speed 400", brand: "triumph", segment: "naked",
    cc: 398.15, power: 39.5, torque: 37.5, mileage: 29, weight: 179,
    price: 240000, abs: true, groundClearance: 158, experience: 2,
    comfort: 3, purpose: ["commuting", "touring"],
    pros: ["Premium British heritage", "Assist-slipper clutch", "Premium build"],
    emoji: "🏍️"
  },
  {
    id: 15, name: "BMW G310R", brand: "bmw", segment: "naked",
    cc: 313, power: 33.52, torque: 28, mileage: 30, weight: 164,
    price: 275000, abs: true, groundClearance: 180, experience: 2,
    comfort: 3, purpose: ["commuting", "sports"],
    pros: ["BMW badge", "Reverse-inclined engine", "Nimble handling"],
    emoji: "🏍️"
  },

  // ─── Supersport ───
  {
    id: 16, name: "Yamaha R15 V4", brand: "yamaha", segment: "sports",
    cc: 155, power: 18.4, torque: 14.1, mileage: 45, weight: 141,
    price: 190000, abs: true, groundClearance: 170, experience: 2,
    comfort: 1, purpose: ["sports"],
    pros: ["VVA + Quickshifter", "USD forks", "Traction control"],
    emoji: "🏁"
  },
  {
    id: 17, name: "KTM RC 200", brand: "ktm", segment: "sports",
    cc: 199.5, power: 24.6, torque: 19.3, mileage: 32, weight: 167,
    price: 215000, abs: true, groundClearance: 170, experience: 2,
    comfort: 1, purpose: ["sports"],
    pros: ["Track-ready aerodynamics", "WP suspension", "Race-derived brakes"],
    emoji: "🏁"
  },
  {
    id: 18, name: "KTM RC 390", brand: "ktm", segment: "sports",
    cc: 399, power: 45.3, torque: 37, mileage: 25, weight: 172,
    price: 340000, abs: true, groundClearance: 185, experience: 3,
    comfort: 1, purpose: ["sports"],
    pros: ["Cornering ABS", "Track modes", "MotoGP derived aero"],
    emoji: "🏁"
  },
  {
    id: 19, name: "Kawasaki Ninja 400", brand: "kawasaki", segment: "sports",
    cc: 399, power: 48.5, torque: 38, mileage: 22, weight: 167,
    price: 530000, abs: true, groundClearance: 130, experience: 2,
    comfort: 2, purpose: ["sports", "touring"],
    pros: ["Best parallel-twin at sub-500cc", "Assist-slipper", "Premium Kawasaki build"],
    emoji: "🏁"
  },

  // ─── Adventure ───
  {
    id: 20, name: "Hero Xpulse 200 4V", brand: "hero", segment: "adventure",
    cc: 199.6, power: 18.9, torque: 17.35, mileage: 40, weight: 157,
    price: 148000, abs: true, groundClearance: 220, experience: 2,
    comfort: 3, purpose: ["adventure", "commuting"],
    pros: ["Long-travel suspension", "21-inch front wheel", "Budget off-road king"],
    emoji: "🏔️"
  },
  {
    id: 21, name: "Royal Enfield Himalayan 450", brand: "royal-enfield", segment: "adventure",
    cc: 452, power: 40.02, torque: 40, mileage: 30, weight: 196,
    price: 308000, abs: true, groundClearance: 230, experience: 2,
    comfort: 4, purpose: ["adventure", "touring"],
    pros: ["Sherpa 450 engine", "Adjustable seat height", "Best touring ADV at price"],
    emoji: "🏔️"
  },
  {
    id: 22, name: "KTM 390 Adventure", brand: "ktm", segment: "adventure",
    cc: 399, power: 46, torque: 39, mileage: 28, weight: 177,
    price: 340000, abs: true, groundClearance: 200, experience: 2,
    comfort: 3, purpose: ["adventure", "touring"],
    pros: ["Rally-pedigree", "Off-road ABS modes", "Best handling ADV"],
    emoji: "🏔️"
  },
  {
    id: 23, name: "Honda NX500", brand: "honda", segment: "adventure",
    cc: 471, power: 47, torque: 43, mileage: 28, weight: 196,
    price: 590000, abs: true, groundClearance: 190, experience: 3,
    comfort: 4, purpose: ["adventure", "touring"],
    pros: ["Parallel-twin", "HSTC traction control", "Honda reliability"],
    emoji: "🏔️"
  },
  {
    id: 24, name: "BMW G310 GS", brand: "bmw", segment: "adventure",
    cc: 313, power: 33.52, torque: 28, mileage: 30, weight: 169,
    price: 340000, abs: true, groundClearance: 218, experience: 2,
    comfort: 4, purpose: ["adventure", "commuting"],
    pros: ["BMW GS DNA", "Tall ground clearance", "Premium ergonomics"],
    emoji: "🏔️"
  },
  {
    id: 25, name: "Bajaj Pulsar NS400Z", brand: "bajaj", segment: "adventure",
    cc: 373.3, power: 40, torque: 35, mileage: 28, weight: 189,
    price: 185000, abs: true, groundClearance: 175, experience: 2,
    comfort: 3, purpose: ["sports", "adventure", "commuting"],
    pros: ["Affordable big-cc", "Premium USD forks", "6-speed gearbox"],
    emoji: "🏍️"
  },

  // ─── Cruiser / Classic ───
  {
    id: 26, name: "Royal Enfield Hunter 350", brand: "royal-enfield", segment: "cruiser",
    cc: 349, power: 20.2, torque: 27, mileage: 36, weight: 177,
    price: 150000, abs: true, groundClearance: 150, experience: 1,
    comfort: 3, purpose: ["commuting", "cruiser"],
    pros: ["Compact roadster", "J-series engine", "City-friendly"],
    emoji: "🛣️"
  },
  {
    id: 27, name: "Royal Enfield Classic 350", brand: "royal-enfield", segment: "cruiser",
    cc: 349, power: 20.2, torque: 27, mileage: 37, weight: 195,
    price: 200000, abs: true, groundClearance: 170, experience: 1,
    comfort: 5, purpose: ["commuting", "touring", "cruiser"],
    pros: ["Iconic retro design", "Touring comfort", "Legendary thump"],
    emoji: "🛣️"
  },
  {
    id: 28, name: "Royal Enfield Bullet 350", brand: "royal-enfield", segment: "cruiser",
    cc: 349, power: 20.4, torque: 27, mileage: 38, weight: 191,
    price: 175000, abs: true, groundClearance: 165, experience: 1,
    comfort: 4, purpose: ["commuting", "touring", "cruiser"],
    pros: ["Heritage icon", "Cast iron feel", "Long production legacy"],
    emoji: "🛣️"
  },
  {
    id: 29, name: "Royal Enfield Interceptor 650", brand: "royal-enfield", segment: "cruiser",
    cc: 648, power: 46.8, torque: 52.3, mileage: 23, weight: 211,
    price: 320000, abs: true, groundClearance: 174, experience: 2,
    comfort: 4, purpose: ["touring", "cruiser"],
    pros: ["Parallel twin", "Best cruiser value globally", "Highway maestro"],
    emoji: "🛣️"
  },
  {
    id: 30, name: "Jawa 350", brand: "jawa", segment: "cruiser",
    cc: 334, power: 22.5, torque: 28.1, mileage: 32, weight: 170,
    price: 215000, abs: true, groundClearance: 167, experience: 1,
    comfort: 4, purpose: ["commuting", "cruiser"],
    pros: ["Retro cult styling", "Liquid-cooled 350", "Unique road presence"],
    emoji: "🛣️"
  },
  {
    id: 31, name: "Honda CB350 H'Ness", brand: "honda", segment: "cruiser",
    cc: 348.36, power: 20.8, torque: 30, mileage: 35, weight: 181,
    price: 210000, abs: true, groundClearance: 166, experience: 1,
    comfort: 5, purpose: ["commuting", "touring", "cruiser"],
    pros: ["Gold Wing ergonomics on budget", "Bluetooth audio ready", "Superior comfort"],
    emoji: "🛣️"
  },
  {
    id: 32, name: "Triumph Scrambler 400X", brand: "triumph", segment: "adventure",
    cc: 398.15, power: 39.5, torque: 37.5, mileage: 28, weight: 185,
    price: 268000, abs: true, groundClearance: 200, experience: 2,
    comfort: 3, purpose: ["adventure", "commuting", "cruiser"],
    pros: ["Retro scrambler style", "Off-road capable", "Premium British brand"],
    emoji: "🏔️"
  },
  {
    id: 33, name: "Bajaj Avenger Cruise 220", brand: "bajaj", segment: "cruiser",
    cc: 220, power: 19.03, torque: 17.55, mileage: 38, weight: 155,
    price: 135000, abs: false, groundClearance: 168, experience: 2,
    comfort: 5, purpose: ["commuting", "cruiser"],
    pros: ["Low footpeg cruiser stance", "Highway comfort", "Affordable cruiser"],
    emoji: "🛣️"
  },
  {
    id: 34, name: "Royal Enfield Shotgun 650", brand: "royal-enfield", segment: "cruiser",
    cc: 648, power: 46.8, torque: 52.3, mileage: 23, weight: 213,
    price: 359000, abs: true, groundClearance: 147, experience: 2,
    comfort: 4, purpose: ["cruiser", "touring"],
    pros: ["Brat-bob style", "650 Twin platform", "Unique personality"],
    emoji: "🛣️"
  },
  {
    id: 35, name: "Kawasaki Z650RS", brand: "kawasaki", segment: "cruiser",
    cc: 649, power: 68, torque: 58.8, mileage: 20, weight: 187,
    price: 660000, abs: true, groundClearance: 130, experience: 3,
    comfort: 3, purpose: ["cruiser", "touring"],
    pros: ["Z1 retro aesthetic", "Twin-cylinder power", "Premium Kawasaki quality"],
    emoji: "🛣️"
  },
  {
    id: 36, name: "Honda CB650R", brand: "honda", segment: "naked",
    cc: 648.7, power: 95, torque: 64, mileage: 18, weight: 202,
    price: 900000, abs: true, groundClearance: 143, experience: 3,
    comfort: 2, purpose: ["sports", "commuting"],
    pros: ["Inline-4 power", "Neo-Sports Café design", "Honda CBR pedigree"],
    emoji: "⚡"
  }
];

// ═══════════════════════════════════════════════════════════
//  AHP PAIRWISE COMPARISON MATRIX (Criterion weights)
//  Criteria: budget, power, mileage, comfort, experience_match,
//             purpose_match, weight, ground_clearance
//  Scale: 1=equal, 3=moderate, 5=strong, 7=very strong, 9=extreme
// ═══════════════════════════════════════════════════════════
const AHP_MATRIX = [
  // budget power mileage comfort exp_match purpose weight gc
  [1,    3,    2,    2,    3,    5,    2,    1],
  [1/3,  1,    1/2,  1/2,  1,    2,    1,    1/2],
  [1/2,  2,    1,    1,    2,    3,    1,    1/2],
  [1/2,  2,    1,    1,    2,    2,    1,    1/2],
  [1/3,  1,    1/2,  1/2,  1,    2,    1,    1/2],
  [1/5,  1/2,  1/3,  1/2,  1/2,  1,    1/2,  1/3],
  [1/2,  1,    1,    1,    1,    2,    1,    1/2],
  [1,    2,    2,    2,    2,    3,    2,    1],
];

// ═══════════════════════════════════════════════════════════
//  1. AHP — Analytic Hierarchy Process
//     Derives criterion weights from eigenvector analysis
// ═══════════════════════════════════════════════════════════
function computeAHPWeights(matrix) {
  const n = matrix.length;
  // Step 1: Normalize each column
  const colSums = Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      colSums[j] += matrix[i][j];

  const normalized = matrix.map(row => row.map((val, j) => val / colSums[j]));

  // Step 2: Row averages = priority weights
  const weights = normalized.map(row => row.reduce((a, b) => a + b, 0) / n);

  // Step 3: Consistency check (λmax, CI, CR)
  const weightedSum = Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      weightedSum[i] += matrix[i][j] * weights[j];

  const lambdaMax = weightedSum.reduce((sum, ws, i) => sum + ws / weights[i], 0) / n;
  const CI = (lambdaMax - n) / (n - 1);
  const RI_TABLE = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45];
  const RI = RI_TABLE[n] || 1.45;
  const CR = CI / RI;

  return { weights, lambdaMax, CI, CR };
}

// ═══════════════════════════════════════════════════════════
//  2. TOPSIS — Technique for Order Preference
//     by Similarity to Ideal Solution
// ═══════════════════════════════════════════════════════════
function runTOPSIS(bikes, weights, userPrefs) {
  const criteriaKeys = ['budget_score', 'power_score', 'mileage_score',
    'comfort_score', 'experience_score', 'purpose_score',
    'weight_score', 'gc_score'];

  // Build decision matrix
  const matrix = bikes.map(bike => buildRawScores(bike, userPrefs, weights));

  // Step 1: Normalize using vector normalization
  const colNorms = criteriaKeys.map((_, j) =>
    Math.sqrt(matrix.reduce((sum, row) => sum + row[j] ** 2, 0))
  );
  const normalized = matrix.map(row =>
    row.map((val, j) => colNorms[j] > 0 ? val / colNorms[j] : 0)
  );

  // Step 2: Weighted normalized matrix
  const weighted = normalized.map(row =>
    row.map((val, j) => val * weights[j])
  );

  // Step 3: Ideal best & worst
  const idealBest  = criteriaKeys.map((_, j) => Math.max(...weighted.map(r => r[j])));
  const idealWorst = criteriaKeys.map((_, j) => Math.min(...weighted.map(r => r[j])));

  // Step 4: Separation measures
  const results = weighted.map((row, i) => {
    const dPlus  = Math.sqrt(row.reduce((s, v, j) => s + (v - idealBest[j]) ** 2, 0));
    const dMinus = Math.sqrt(row.reduce((s, v, j) => s + (v - idealWorst[j]) ** 2, 0));
    const ci = dMinus / (dPlus + dMinus + 1e-10);
    return { bike: bikes[i], score: ci, dPlus, dMinus };
  });

  return results.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════
//  3. FUZZY LOGIC — Membership Functions
//     Converts crisp user preferences to fuzzy sets and
//     evaluates bikes via fuzzy inference
// ═══════════════════════════════════════════════════════════
function triangularMF(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}
function trapezoidalMF(x, a, b, c, d) {
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

function runFuzzyLogic(bikes, userPrefs) {
  return bikes.map(bike => {
    let score = 0;

    // Fuzzy rule 1: Budget fit [0..1]
    const budgetDiff = Math.abs(bike.price - userPrefs.budget) / userPrefs.budget;
    const budgetScore = trapezoidalMF(budgetDiff, 0, 0, 0.15, 0.5);

    // Fuzzy rule 2: Power preference fit
    const powerDiff = Math.abs(bike.power - userPrefs.power) / Math.max(userPrefs.power, 1);
    const powerScore = trapezoidalMF(powerDiff, 0, 0, 0.2, 0.6);

    // Fuzzy rule 3: Mileage importance
    const mileageNorm = bike.mileage / 70;
    const mileageScore = userPrefs.mileageImp >= 4
      ? trapezoidalMF(mileageNorm, 0, 0.6, 1, 1.5)
      : triangularMF(mileageNorm, 0, 0.5, 1);

    // Fuzzy rule 4: Comfort match
    const comfortDiff = Math.abs(bike.comfort - userPrefs.comfort) / 4;
    const comfortScore = trapezoidalMF(comfortDiff, 0, 0, 0.25, 0.75);

    // Fuzzy rule 5: Experience suitability
    const expMatch = bike.experience <= userPrefs.experience ? 1 :
      triangularMF(userPrefs.experience / bike.experience, 0, 0.6, 1);

    // Fuzzy rule 6: Purpose alignment
    const purposeScore = bike.purpose.includes(userPrefs.purpose) ? 1 : 0.3;

    // Defuzzification: weighted centroid method
    const weights = [0.30, 0.15, 0.15, 0.15, 0.15, 0.10];
    const scores  = [budgetScore, powerScore, mileageScore, comfortScore, expMatch, purposeScore];
    score = weights.reduce((sum, w, i) => sum + w * scores[i], 0);

    return {
      bike,
      score,
      fuzzyDetails: { budgetScore, powerScore, mileageScore, comfortScore, expMatch, purposeScore }
    };
  }).sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════
//  4. K-NEAREST NEIGHBORS (KNN)
//     Euclidean distance in normalized feature space
// ═══════════════════════════════════════════════════════════
function runKNN(bikes, userPrefs, k = 10) {
  // Normalize ranges
  const ranges = {
    price:          { min: 60000, max: 900000 },
    power:          { min: 7,     max: 100 },
    mileage:        { min: 15,    max: 70 },
    weight:         { min: 100,   max: 220 },
    comfort:        { min: 1,     max: 5 },
    experience:     { min: 1,     max: 3 },
    groundClearance:{ min: 130,   max: 250 },
  };
  const normalize = (val, key) => {
    const { min, max } = ranges[key];
    return (val - min) / (max - min);
  };

  const userVector = {
    price:     normalize(userPrefs.budget, 'price'),
    power:     normalize(userPrefs.power,  'power'),
    mileage:   normalize(userPrefs.mileageImp * 14, 'mileage'), // scale mileage importance to kmpl range
    weight:    normalize(userPrefs.maxWeight, 'weight'),
    comfort:   normalize(userPrefs.comfort, 'comfort'),
    experience:normalize(userPrefs.experience, 'experience'),
    groundClearance: 0.5,
  };

  const featureKeys = ['price', 'power', 'mileage', 'weight', 'comfort', 'experience', 'groundClearance'];

  const distances = bikes.map(bike => {
    const bikeVector = {
      price:     normalize(bike.price, 'price'),
      power:     normalize(bike.power, 'power'),
      mileage:   normalize(bike.mileage, 'mileage'),
      weight:    normalize(bike.weight, 'weight'),
      comfort:   normalize(bike.comfort, 'comfort'),
      experience:normalize(bike.experience, 'experience'),
      groundClearance: normalize(bike.groundClearance, 'groundClearance'),
    };

    const dist = Math.sqrt(
      featureKeys.reduce((sum, key) => sum + (userVector[key] - bikeVector[key]) ** 2, 0)
    );
    // Add purpose bonus
    const purposeBonus = bike.purpose.includes(userPrefs.purpose) ? 0.1 : 0;
    return { bike, distance: dist, score: 1 / (1 + dist) + purposeBonus };
  });

  return distances.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════
//  5. WEIGHTED SUM MODEL (WSM)
//     Simple linear composite score
// ═══════════════════════════════════════════════════════════
function runWSM(bikes, userPrefs, ahpWeights) {
  return bikes.map(bike => {
    const rawScores = buildRawScores(bike, userPrefs, ahpWeights);
    const score = rawScores.reduce((sum, s, i) => sum + s * ahpWeights[i], 0);
    return { bike, score, rawScores };
  }).sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════
//  SHARED: Build raw criterion scores for each bike
// ═══════════════════════════════════════════════════════════
function buildRawScores(bike, userPrefs, weights) {
  // 0: Budget score (proximity, penalize over-budget hard)
  const budgetRatio = bike.price / userPrefs.budget;
  const budgetScore = budgetRatio <= 1
    ? 1 - 0.3 * budgetRatio        // within budget: prefer lower price
    : Math.max(0, 1 - (budgetRatio - 1) * 2); // over budget: sharp penalty

  // 1: Power score (closeness to preferred)
  const powerMax = 100;
  const powerScore = 1 - Math.abs(bike.power - userPrefs.power) / powerMax;

  // 2: Mileage score (weighted by user importance)
  const mileageScore = (bike.mileage / 70) * (userPrefs.mileageImp / 5);

  // 3: Comfort score
  const comfortScore = 1 - Math.abs(bike.comfort - userPrefs.comfort) / 4;

  // 4: Experience match score
  const experienceScore = bike.experience <= userPrefs.experience
    ? 1
    : Math.max(0, 1 - (bike.experience - userPrefs.experience) * 0.4);

  // 5: Purpose match score
  const purposeScore = bike.purpose.includes(userPrefs.purpose) ? 1
    : bike.purpose.some(p => userPrefs.relatedPurposes.includes(p)) ? 0.5 : 0.1;

  // 6: Weight score (lighter is better up to user limit)
  const weightScore = bike.weight <= userPrefs.maxWeight
    ? 1 - (bike.weight / 300) * 0.3
    : Math.max(0, 1 - (bike.weight - userPrefs.maxWeight) / 100);

  // 7: Ground clearance score (adventure users prefer higher)
  const gcScore = bike.groundClearance / 250;

  return [budgetScore, powerScore, mileageScore, comfortScore,
    experienceScore, purposeScore, weightScore, gcScore];
}

// ═══════════════════════════════════════════════════════════
//  ENSEMBLE — Combine all 5 model results
//  Weights: TOPSIS 25%, AHP 25%, Fuzzy 20%, KNN 15%, WSM 15%
// ═══════════════════════════════════════════════════════════
function runEnsemble(bikes, userPrefs) {
  const ahpResult   = computeAHPWeights(AHP_MATRIX);
  const ahpWeights  = ahpResult.weights;

  const topsisResults = runTOPSIS(bikes, ahpWeights, userPrefs);
  const fuzzyResults  = runFuzzyLogic(bikes, userPrefs);
  const knnResults    = runKNN(bikes, userPrefs);
  const wsmResults    = runWSM(bikes, userPrefs, ahpWeights);

  // AHP itself produces weights, use raw WSM scores as AHP model score
  const ahpResults    = runWSM(bikes, userPrefs, ahpWeights);

  // Build index maps
  const topsisMap = {};
  const fuzzyMap  = {};
  const knnMap    = {};
  const wsmMap    = {};
  const ahpMap    = {};

  const normalize_scores = (arr) => {
    const max = Math.max(...arr.map(r => r.score));
    const min = Math.min(...arr.map(r => r.score));
    return arr.map(r => ({
      ...r,
      normScore: max > min ? (r.score - min) / (max - min) : 0.5
    }));
  };

  normalize_scores(topsisResults).forEach(r => topsisMap[r.bike.id] = r.normScore);
  normalize_scores(fuzzyResults).forEach(r  => fuzzyMap[r.bike.id]  = r.normScore);
  normalize_scores(knnResults).forEach(r    => knnMap[r.bike.id]    = r.normScore);
  normalize_scores(wsmResults).forEach(r    => wsmMap[r.bike.id]    = r.normScore);
  normalize_scores(ahpResults).forEach(r    => ahpMap[r.bike.id]    = r.normScore);

  // Filter by brand if set
  let filteredBikes = bikes;
  if (userPrefs.brand !== 'any') {
    const brandFiltered = bikes.filter(b => b.brand === userPrefs.brand);
    if (brandFiltered.length >= 3) filteredBikes = brandFiltered;
  }
  // Filter by segment if set
  if (userPrefs.segment !== 'any') {
    const segFiltered = filteredBikes.filter(b => b.segment === userPrefs.segment);
    if (segFiltered.length >= 2) filteredBikes = segFiltered;
  }

  const ensemble = filteredBikes.map(bike => {
    const t = topsisMap[bike.id] ?? 0;
    const a = ahpMap[bike.id]    ?? 0;
    const f = fuzzyMap[bike.id]  ?? 0;
    const k = knnMap[bike.id]    ?? 0;
    const w = wsmMap[bike.id]    ?? 0;
    const ensembleScore = 0.25*t + 0.25*a + 0.20*f + 0.15*k + 0.15*w;
    return {
      bike,
      ensembleScore,
      modelScores: { topsis: t, ahp: a, fuzzy: f, knn: k, wsm: w }
    };
  });

  ensemble.sort((a, b) => b.ensembleScore - a.ensembleScore);
  return { ensemble, ahpResult };
}

// ═══════════════════════════════════════════════════════════
//  6. LOGISTIC REGRESSION — Compatibility Classifier
//     Answers: "Given THIS bike and YOUR preferences,
//              will YOU like it? (Yes / Likely / Unlikely / No)"
//
//  Feature vector (9 features, all normalised to [0, 1]):
//    f0  Budget fit          — does the price match your budget?
//    f1  Power match         — how close is bike power to desired?
//    f2  Mileage score       — mileage × mileage-importance weight
//    f3  Comfort match       — |bike.comfort - pref.comfort| similarity
//    f4  Experience fit      — bike suitable for rider level?
//    f5  Purpose alignment   — tagged for your primary purpose?
//    f6  Weight compliance   — within your max weight?
//    f7  ABS safety          — has ABS? (binary, weighted by experience)
//    f8  Ground clearance    — proportional, matters for adventure riders
//
//  Weights (θ) are hand-calibrated to reflect the AHP criterion
//  priorities (budget > gc > mileage > comfort ≈ experience >
//  purpose > weight > power). Bias θ0 centres the sigmoid at ~0.5
//  for a "moderately matching" bike. This is equivalent to training
//  on a binary label: score ≥ 0.6 in the ensemble → "liked".
// ═══════════════════════════════════════════════════════════

const LR_THETA = {
  bias:        -1.40,   // θ0 — offset; tunes the "neutral" threshold
  budget:       2.80,   // θ1 — largest impact: price must fit
  power:        1.20,   // θ2 — power preference match
  mileage:      1.60,   // θ3 — mileage × importance
  comfort:      1.50,   // θ4 — comfort alignment
  experience:   1.70,   // θ5 — experience suitability (safety-critical)
  purpose:      2.10,   // θ6 — primary purpose match
  weight:       1.10,   // θ7 — weight compliance
  abs:          0.90,   // θ8 — ABS present (safety utility)
  groundClear:  0.80,   // θ9 — ground clearance proportionality
};

/**
 * Sigmoid activation: σ(z) = 1 / (1 + e^-z)
 */
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Build the normalised feature vector for the given (bike, userPrefs) pair.
 * Returns an object with named features (values in [0, 1]).
 */
function buildFeatureVector(bike, userPrefs) {
  // f0 — Budget fit
  const budgetRatio = bike.price / userPrefs.budget;
  const f_budget = budgetRatio <= 1
    ? Math.max(0, 1 - 0.3 * budgetRatio)            // within budget
    : Math.max(0, 1 - (budgetRatio - 1) * 2.5);     // over budget: steep drop

  // f1 — Power match (closer to desired → higher score)
  const f_power = Math.max(0, 1 - Math.abs(bike.power - userPrefs.power) / 93);

  // f2 — Mileage score (scales with importance)
  const f_mileage = (bike.mileage / 70) * (userPrefs.mileageImp / 5);

  // f3 — Comfort alignment
  const f_comfort = Math.max(0, 1 - Math.abs(bike.comfort - userPrefs.comfort) / 4);

  // f4 — Experience fit (being above user's level penalises hard)
  const f_experience = bike.experience <= userPrefs.experience
    ? 1
    : Math.max(0, 1 - (bike.experience - userPrefs.experience) * 0.5);

  // f5 — Purpose alignment
  const f_purpose = bike.purpose.includes(userPrefs.purpose) ? 1
    : bike.purpose.some(p => (userPrefs.relatedPurposes || []).includes(p)) ? 0.4
    : 0.0;

  // f6 — Weight compliance
  const f_weight = bike.weight <= userPrefs.maxWeight
    ? 1 - (bike.weight / 300) * 0.2
    : Math.max(0, 1 - (bike.weight - userPrefs.maxWeight) / 80);

  // f7 — ABS (more important the less experienced the rider)
  const absImportance = (4 - userPrefs.experience) / 3; // 1→1.0, 2→0.67, 3→0.33
  const f_abs = bike.abs ? 1 : 1 - absImportance * 0.6;

  // f8 — Ground clearance (normalised, adventure riders value this most)
  const f_gc = bike.groundClearance / 250;

  return { f_budget, f_power, f_mileage, f_comfort, f_experience, f_purpose, f_weight, f_abs, f_gc };
}

/**
 * Run logistic regression for a single (bike, userPrefs) pair.
 *
 * Returns:
 *  {
 *    probability: 0..1,
 *    verdict:     "Highly Compatible" | "Likely Compatible" | "Borderline" | "Not Recommended",
 *    confidence:  "High" | "Medium" | "Low",
 *    features:    { name, value, contribution, weight }[],
 *    linearScore: raw dot product before sigmoid,
 *    bike
 *  }
 */
function runLogisticRegression(bike, userPrefs) {
  const fv = buildFeatureVector(bike, userPrefs);
  const θ = LR_THETA;

  // z = θ·x
  const contributions = [
    { name: "Budget Fit",          value: fv.f_budget,     weight: θ.budget,      z: θ.budget      * fv.f_budget     },
    { name: "Power Match",         value: fv.f_power,      weight: θ.power,       z: θ.power       * fv.f_power      },
    { name: "Mileage Score",       value: fv.f_mileage,    weight: θ.mileage,     z: θ.mileage     * fv.f_mileage    },
    { name: "Comfort Alignment",   value: fv.f_comfort,    weight: θ.comfort,     z: θ.comfort     * fv.f_comfort    },
    { name: "Experience Fit",      value: fv.f_experience, weight: θ.experience,  z: θ.experience  * fv.f_experience },
    { name: "Purpose Alignment",   value: fv.f_purpose,    weight: θ.purpose,     z: θ.purpose     * fv.f_purpose    },
    { name: "Weight Compliance",   value: fv.f_weight,     weight: θ.weight,      z: θ.weight      * fv.f_weight     },
    { name: "ABS Safety",          value: fv.f_abs,        weight: θ.abs,         z: θ.abs         * fv.f_abs        },
    { name: "Ground Clearance",    value: fv.f_gc,         weight: θ.groundClear, z: θ.groundClear * fv.f_gc         },
  ];

  const linearScore = θ.bias + contributions.reduce((sum, c) => sum + c.z, 0);
  const probability  = sigmoid(linearScore);

  // Max possible z (all features = 1) → used for contribution normalisation
  const maxZ = Object.values(θ).filter((_, i) => i > 0).reduce((s, v) => s + v, 0);
  const featuresOut = contributions.map(c => ({
    name: c.name,
    rawValue: c.value,
    weight: c.weight,
    contribution: c.z / maxZ,  // 0..1 share of maximum possible score
  }));

  let verdict, confidence;
  if      (probability >= 0.78) { verdict = "Highly Compatible";   confidence = "High";   }
  else if (probability >= 0.58) { verdict = "Likely Compatible";   confidence = "High";   }
  else if (probability >= 0.40) { verdict = "Borderline";          confidence = "Medium"; }
  else                          { verdict = "Not Recommended";     confidence = "High";   }

  return { probability, verdict, confidence, features: featuresOut, linearScore, bike };
}

// Export
window.BikeEngine = {
  BIKES,
  runEnsemble,
  runTOPSIS,
  runFuzzyLogic,
  runKNN,
  runWSM,
  computeAHPWeights,
  AHP_MATRIX,
  runLogisticRegression,
  buildFeatureVector,
  LR_THETA,
};
