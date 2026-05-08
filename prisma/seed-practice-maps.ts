import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const practiceMaps = [
  // ── a. World Capitals — Easy ──────────────────────────────────────────────
  {
    name: 'World Capitals — Easy',
    description: 'Guess 10 of the world\'s most recognisable capital cities.',
    category: 'capitals',
    difficulty: 'easy',
    isOfficial: true,
    locations: [
      { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, description: 'The City of Light, capital of France, home to the Eiffel Tower.' },
      { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, description: 'Capital of the UK, home to Big Ben and Buckingham Palace.' },
      { name: 'Washington D.C.', country: 'United States', lat: 38.9072, lng: -77.0369, description: 'Capital of the United States, seat of the federal government.' },
      { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, description: 'Capital of Japan, one of the world\'s most populous cities.' },
      { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, description: 'Capital of China, home to the Forbidden City and Tiananmen Square.' },
      { name: 'Canberra', country: 'Australia', lat: -35.2809, lng: 149.1300, description: 'Capital of Australia, purpose-built in the 20th century.' },
      { name: 'Ottawa', country: 'Canada', lat: 45.4215, lng: -75.6972, description: 'Capital of Canada, home to the Parliament Hill.' },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, description: 'Capital of Germany, rich in history and culture.' },
      { name: 'Brasília', country: 'Brazil', lat: -15.7975, lng: -47.8919, description: 'Futuristic capital of Brazil, designed by Oscar Niemeyer.' },
      { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, description: 'Capital of India, the heart of the world\'s largest democracy.' },
    ],
  },

  // ── b. European Capitals — Medium ─────────────────────────────────────────
  {
    name: 'European Capitals — Medium',
    description: 'Navigate across Europe and place 10 capital cities on the map.',
    category: 'capitals',
    difficulty: 'medium',
    isOfficial: true,
    locations: [
      { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, description: 'Capital of Austria, renowned for its imperial palaces and classical music heritage.' },
      { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, description: 'Capital of the Czech Republic, famous for its Old Town Square and Charles Bridge.' },
      { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, description: 'Capital of Hungary, split by the Danube into Buda and Pest.' },
      { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, description: 'Capital of Poland, rebuilt after World War II destruction.' },
      { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, description: 'Capital of Sweden, spread across 14 islands where Lake Mälaren meets the sea.' },
      { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, description: 'Capital of Finland, known for its design culture and coastal architecture.' },
      { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, description: 'Capital of Portugal, perched on seven hills along the Tagus River.' },
      { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, description: 'Capital of Greece, home of the Acropolis and the Parthenon.' },
      { name: 'Reykjavik', country: 'Iceland', lat: 64.1355, lng: -21.8954, description: 'Capital of Iceland, the world\'s northernmost capital of a sovereign state.' },
      { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, description: 'Capital of Romania, known as the "Little Paris of the East".' },
    ],
  },

  // ── c. Asian Capitals — Medium ────────────────────────────────────────────
  {
    name: 'Asian Capitals — Medium',
    description: 'Test your knowledge of capitals across the vast Asian continent.',
    category: 'capitals',
    difficulty: 'medium',
    isOfficial: true,
    locations: [
      { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, description: 'Capital of Thailand, known for ornate shrines and vibrant street life.' },
      { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, description: 'Capital of Indonesia, one of the most populous cities in Southeast Asia.' },
      { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, description: 'Capital of South Korea, a global hub of technology and pop culture.' },
      { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, description: 'Capital of Vietnam, featuring a well-preserved ancient quarter.' },
      { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479, description: 'Capital of Pakistan, a planned city surrounded by the Margalla Hills.' },
      { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, description: 'Capital of Bangladesh, one of the most densely populated cities in the world.' },
      { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lng: 85.3240, description: 'Capital of Nepal, gateway to the Himalayas.' },
      { name: 'Ulaanbaatar', country: 'Mongolia', lat: 47.8864, lng: 106.9057, description: 'Capital of Mongolia, the world\'s coldest national capital.' },
      { name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401, description: 'Capital of Uzbekistan, one of the oldest cities in Central Asia.' },
      { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lng: 104.9282, description: 'Capital of Cambodia, located at the confluence of four rivers.' },
    ],
  },

  // ── d. African Capitals — Hard ────────────────────────────────────────────
  {
    name: 'African Capitals — Hard',
    description: 'Challenge yourself with the capitals of Africa\'s 54 nations.',
    category: 'capitals',
    difficulty: 'hard',
    isOfficial: true,
    locations: [
      { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lng: 38.7469, description: 'Capital of Ethiopia and headquarters of the African Union.' },
      { name: 'Kinshasa', country: 'DR Congo', lat: -4.3217, lng: 15.3222, description: 'Capital of DR Congo, the second-largest city in Africa.' },
      { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870, description: 'Capital of Ghana on the Atlantic coast of West Africa.' },
      { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lng: 32.5599, description: 'Capital of Sudan, located at the confluence of the Blue and White Nile.' },
      { name: 'Luanda', country: 'Angola', lat: -8.8390, lng: 13.2894, description: 'Capital and largest city of Angola.' },
      { name: 'Maputo', country: 'Mozambique', lat: -25.9692, lng: 32.5732, description: 'Capital of Mozambique on the Indian Ocean coast.' },
      { name: 'Bamako', country: 'Mali', lat: 12.6392, lng: -8.0029, description: 'Capital of Mali on the Niger River.' },
      { name: 'Antananarivo', country: 'Madagascar', lat: -18.9137, lng: 47.5361, description: 'Capital of Madagascar, the world\'s fourth-largest island.' },
      { name: 'Lilongwe', country: 'Malawi', lat: -13.9626, lng: 33.7741, description: 'Capital of Malawi since 1975.' },
      { name: 'Niamey', country: 'Niger', lat: 13.5137, lng: 2.1098, description: 'Capital and largest city of Niger on the Niger River.' },
    ],
  },

  // ── e. US State Capitals — Medium ─────────────────────────────────────────
  {
    name: 'US State Capitals — Medium',
    description: 'Can you pinpoint 10 US state capitals? They\'re not always the biggest city!',
    category: 'capitals',
    difficulty: 'medium',
    isOfficial: true,
    locations: [
      { name: 'Sacramento', country: 'California, USA', lat: 38.5816, lng: -121.4944, description: 'Capital of California, located in the Central Valley.' },
      { name: 'Albany', country: 'New York, USA', lat: 42.6526, lng: -73.7562, description: 'Capital of New York state, one of the oldest continuously chartered cities in the US.' },
      { name: 'Juneau', country: 'Alaska, USA', lat: 58.3005, lng: -134.4197, description: 'Capital of Alaska, accessible only by air or sea.' },
      { name: 'Frankfort', country: 'Kentucky, USA', lat: 38.2009, lng: -84.8733, description: 'Capital of Kentucky on the Kentucky River.' },
      { name: 'Montpelier', country: 'Vermont, USA', lat: 44.2601, lng: -72.5754, description: 'Capital of Vermont, the least populous state capital in the US.' },
      { name: 'Santa Fe', country: 'New Mexico, USA', lat: 35.6870, lng: -105.9378, description: 'Capital of New Mexico, the oldest state capital in the US.' },
      { name: 'Tallahassee', country: 'Florida, USA', lat: 30.4518, lng: -84.2727, description: 'Capital of Florida, located in the Panhandle region.' },
      { name: 'Pierre', country: 'South Dakota, USA', lat: 44.3683, lng: -100.3510, description: 'Capital of South Dakota on the Missouri River.' },
      { name: 'Annapolis', country: 'Maryland, USA', lat: 38.9784, lng: -76.4922, description: 'Capital of Maryland, known as the sailing capital of the US.' },
      { name: 'Olympia', country: 'Washington, USA', lat: 47.0379, lng: -122.9007, description: 'Capital of Washington state at the southern tip of Puget Sound.' },
    ],
  },

  // ── f. Ancient Wonders — Hard ─────────────────────────────────────────────
  {
    name: 'Ancient Wonders',
    description: 'Locate the Seven Wonders of the Ancient World — only one still stands.',
    category: 'themed',
    difficulty: 'hard',
    isOfficial: true,
    locations: [
      { name: 'Great Pyramid of Giza', country: 'Egypt', lat: 29.9792, lng: 31.1342, description: 'The only surviving wonder of the ancient world, built around 2560 BC.' },
      { name: 'Hanging Gardens of Babylon', country: 'Iraq', lat: 32.5421, lng: 44.4208, description: 'Legendary terraced gardens near ancient Babylon — their location is debated.' },
      { name: 'Temple of Artemis at Ephesus', country: 'Turkey', lat: 37.9497, lng: 27.3637, description: 'A grand Greek temple near modern Selçuk, destroyed and rebuilt multiple times.' },
      { name: 'Statue of Zeus at Olympia', country: 'Greece', lat: 37.6380, lng: 21.6300, description: 'A colossal chryselephantine statue inside the Temple of Zeus.' },
      { name: 'Mausoleum at Halicarnassus', country: 'Turkey', lat: 37.0380, lng: 27.4241, description: 'Elaborate tomb built for the satrap Mausolus in modern-day Bodrum.' },
      { name: 'Colossus of Rhodes', country: 'Greece', lat: 36.4510, lng: 28.2279, description: 'A giant bronze statue of the sun god Helios on the island of Rhodes.' },
      { name: 'Lighthouse of Alexandria', country: 'Egypt', lat: 31.2131, lng: 29.8852, description: 'A towering lighthouse on the island of Pharos at the mouth of the Nile.' },
    ],
  },

  // ── g. Famous Battles — Hard ──────────────────────────────────────────────
  {
    name: 'Famous Battles',
    description: 'Mark the sites of 10 pivotal battles that changed the course of history.',
    category: 'themed',
    difficulty: 'hard',
    isOfficial: true,
    locations: [
      { name: 'Battle of Hastings', country: 'England', lat: 50.9106, lng: 0.4874, description: 'Norman conquest of England (1066), fought near present-day Battle, East Sussex.' },
      { name: 'Battle of Waterloo', country: 'Belgium', lat: 50.6786, lng: 4.4127, description: 'Napoleon\'s final defeat in June 1815.' },
      { name: 'Battle of Gettysburg', country: 'USA', lat: 39.8283, lng: -77.2311, description: 'Decisive Union victory (1863) in the American Civil War.' },
      { name: 'Battle of Stalingrad', country: 'Russia', lat: 48.7086, lng: 44.5133, description: 'Brutal WWII battle (1942–43) and the turning point on the Eastern Front.' },
      { name: 'Battle of Marathon', country: 'Greece', lat: 38.1131, lng: 23.9681, description: 'Greek victory over Persia in 490 BC; legendary origin of the marathon race.' },
      { name: 'Battle of Agincourt', country: 'France', lat: 50.4615, lng: 2.1369, description: 'Henry V\'s famous English victory in 1415 during the Hundred Years\' War.' },
      { name: 'Battle of Thermopylae', country: 'Greece', lat: 38.7956, lng: 22.5301, description: 'Heroic Spartan last stand against Persian forces in 480 BC.' },
      { name: 'Battle of the Somme', country: 'France', lat: 49.9997, lng: 2.6914, description: 'Costly WWI offensive (1916) on the Western Front.' },
      { name: 'Battle of Midway', country: 'USA (Pacific)', lat: 28.2069, lng: -177.3731, description: 'Pivotal WWII naval battle (1942) turning the tide against Japan.' },
      { name: 'Battle of Austerlitz', country: 'Czech Republic', lat: 49.1309, lng: 16.7695, description: 'Napoleon\'s masterpiece victory over Austro-Russian forces in 1805.' },
    ],
  },

  // ── h. World Landmarks — Easy ─────────────────────────────────────────────
  {
    name: 'World Landmarks — Easy',
    description: 'Find 10 of the most iconic landmarks on the globe.',
    category: 'themed',
    difficulty: 'easy',
    isOfficial: true,
    locations: [
      { name: 'Eiffel Tower', country: 'France', lat: 48.8584, lng: 2.2945, description: 'Iron lattice tower built in 1889, symbol of Paris and France.' },
      { name: 'Statue of Liberty', country: 'USA', lat: 40.6892, lng: -74.0445, description: 'Neoclassical sculpture on Liberty Island, gift from France to the US.' },
      { name: 'Sydney Opera House', country: 'Australia', lat: -33.8568, lng: 151.2153, description: 'Iconic multi-venue performing arts centre on Sydney Harbour.' },
      { name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lng: -72.5450, description: '15th-century Inca citadel set high in the Andes Mountains.' },
      { name: 'Taj Mahal', country: 'India', lat: 27.1751, lng: 78.0421, description: 'Ivory-white marble mausoleum on the south bank of the Yamuna River in Agra.' },
      { name: 'Colosseum', country: 'Italy', lat: 41.8902, lng: 12.4922, description: 'Oval amphitheatre in Rome, the largest ever built (70–80 AD).' },
      { name: 'Great Wall of China', country: 'China', lat: 40.4319, lng: 116.5704, description: 'Series of fortifications across northern China, largely built in the Ming dynasty.' },
      { name: 'Christ the Redeemer', country: 'Brazil', lat: -22.9519, lng: -43.2105, description: 'Art Deco statue of Jesus Christ atop Corcovado Mountain, Rio de Janeiro.' },
      { name: 'Pyramids of Giza', country: 'Egypt', lat: 29.9792, lng: 31.1342, description: 'Ancient pyramid complex on the Giza Plateau near Cairo.' },
      { name: 'Angkor Wat', country: 'Cambodia', lat: 13.4125, lng: 103.8670, description: 'Largest religious monument in the world, originally built as a Hindu temple.' },
    ],
  },

  // ── i. Island Nations — Hard ──────────────────────────────────────────────
  {
    name: 'Island Nations',
    description: 'Locate the capitals of 10 island nations scattered across the world\'s oceans.',
    category: 'capitals',
    difficulty: 'hard',
    isOfficial: true,
    locations: [
      { name: 'Malé', country: 'Maldives', lat: 4.1755, lng: 73.5093, description: 'Capital of the Maldives, one of the world\'s most vulnerable to sea-level rise.' },
      { name: 'Suva', country: 'Fiji', lat: -18.1416, lng: 178.4419, description: 'Capital of Fiji on the southeast coast of Viti Levu.' },
      { name: 'Port Louis', country: 'Mauritius', lat: -20.1609, lng: 57.4991, description: 'Capital and largest city of Mauritius in the Indian Ocean.' },
      { name: 'Honiara', country: 'Solomon Islands', lat: -9.4319, lng: 160.0550, description: 'Capital of Solomon Islands on the island of Guadalcanal.' },
      { name: 'Nassau', country: 'Bahamas', lat: 25.0480, lng: -77.3554, description: 'Capital of the Bahamas on New Providence Island.' },
      { name: 'Bridgetown', country: 'Barbados', lat: 13.0969, lng: -59.6145, description: 'Capital and main port of Barbados, the most easterly Caribbean island.' },
      { name: 'Valletta', country: 'Malta', lat: 35.8997, lng: 14.5146, description: 'Capital of Malta, the smallest EU member state capital by area.' },
      { name: 'Nuku\'alofa', country: 'Tonga', lat: -21.1394, lng: -175.2018, description: 'Capital of Tonga on Tongatapu Island in the South Pacific.' },
      { name: 'Port Moresby', country: 'Papua New Guinea', lat: -9.4438, lng: 147.1803, description: 'Capital of Papua New Guinea on the shores of the Coral Sea.' },
      { name: 'Moroni', country: 'Comoros', lat: -11.7022, lng: 43.2551, description: 'Capital of the Comoros archipelago in the Indian Ocean.' },
    ],
  },

  // ── j. Mountain Peaks — Hard ──────────────────────────────────────────────
  {
    name: 'Mountain Peaks',
    description: 'Scale the globe to pinpoint 10 of the world\'s most famous mountain summits.',
    category: 'themed',
    difficulty: 'hard',
    isOfficial: true,
    locations: [
      { name: 'Mount Everest', country: 'Nepal / China', lat: 27.9881, lng: 86.9250, description: 'Highest mountain on Earth at 8,848.86 m, on the Nepal–China border.' },
      { name: 'K2', country: 'Pakistan / China', lat: 35.8825, lng: 76.5133, description: 'Second-highest mountain at 8,611 m, considered the most dangerous 8000er.' },
      { name: 'Mont Blanc', country: 'France / Italy', lat: 45.8326, lng: 6.8652, description: 'Highest peak in the Alps and Western Europe at 4,808 m.' },
      { name: 'Kilimanjaro', country: 'Tanzania', lat: -3.0674, lng: 37.3556, description: 'Highest mountain in Africa at 5,895 m, a dormant stratovolcano.' },
      { name: 'Aconcagua', country: 'Argentina', lat: -32.6532, lng: -70.0109, description: 'Highest peak outside Asia at 6,961 m in the Andes.' },
      { name: 'Denali', country: 'USA', lat: 63.0695, lng: -151.0074, description: 'Highest peak in North America at 6,190 m, formerly called Mount McKinley.' },
      { name: 'Mount Fuji', country: 'Japan', lat: 35.3606, lng: 138.7274, description: 'Japan\'s highest peak at 3,776 m, an iconic active stratovolcano.' },
      { name: 'Matterhorn', country: 'Switzerland / Italy', lat: 45.9763, lng: 7.6586, description: 'Pyramid-shaped peak at 4,478 m on the Swiss–Italian border.' },
      { name: 'Mount Elbrus', country: 'Russia', lat: 43.3499, lng: 42.4453, description: 'Highest peak in Europe (or Eurasia) at 5,642 m in the Caucasus.' },
      { name: 'Puncak Jaya', country: 'Indonesia', lat: -4.0784, lng: 137.1584, description: 'Highest island peak on Earth at 4,884 m in Papua, Indonesia.' },
    ],
  },
]

async function main() {
  console.log('🌍 Seeding practice maps…')

  for (const mapDef of practiceMaps) {
    // Check if already seeded by name
    const existing = await prisma.practiceMap.findFirst({
      where: { name: mapDef.name, isOfficial: true },
    })

    if (existing) {
      console.log(`  ⏭  Skipping "${mapDef.name}" (already exists)`)
      continue
    }

    await prisma.practiceMap.create({
      data: {
        name: mapDef.name,
        description: mapDef.description,
        category: mapDef.category,
        difficulty: mapDef.difficulty,
        locations: mapDef.locations,
        isOfficial: mapDef.isOfficial,
        playCount: 0,
      },
    })

    console.log(`  ✅  Created "${mapDef.name}"`)
  }

  console.log('✨ Done seeding practice maps.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
