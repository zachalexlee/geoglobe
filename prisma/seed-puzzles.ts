import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import extraPuzzles from './extra-puzzles'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const puzzles = [
  {
    date: new Date('2025-01-01'), puzzleNumber: 1,
    locations: [
      { order: 1, name: 'Machu Picchu', country: 'Peru', latitude: -13.1631, longitude: -72.5450, description: 'The Lost City of the Incas was rediscovered on July 24, 1911 by explorer Hiram Bingham III.', category: 'discovery' },
      { order: 2, name: 'Gettysburg', country: 'USA', latitude: 39.8309, longitude: -77.2311, description: 'Site of the decisive Civil War battle (July 1–3, 1863) and Lincoln\'s famous address.', category: 'battle' },
      { order: 3, name: 'Pompeii', country: 'Italy', latitude: 40.7503, longitude: 14.4989, description: 'Buried by the eruption of Mount Vesuvius in 79 AD, preserved under volcanic ash for centuries.', category: 'disaster' },
      { order: 4, name: 'Cape Canaveral', country: 'USA', latitude: 28.3922, longitude: -80.6077, description: 'Launch site of Apollo 11 on July 16, 1969 — humanity\'s first crewed mission to the Moon.', category: 'science' },
      { order: 5, name: 'Waterloo', country: 'Belgium', latitude: 50.6981, longitude: 4.4120, description: 'Napoleon Bonaparte\'s final defeat on June 18, 1815, ending his Hundred Days campaign.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-01-02'), puzzleNumber: 2,
    locations: [
      { order: 1, name: 'Hiroshima', country: 'Japan', latitude: 34.3853, longitude: 132.4553, description: 'First city in history struck by an atomic bomb, on August 6, 1945.', category: 'war' },
      { order: 2, name: 'Berlin Wall (Brandenburg Gate)', country: 'Germany', latitude: 52.5163, longitude: 13.3777, description: 'The Berlin Wall fell on November 9, 1989, reunifying East and West Germany.', category: 'politics' },
      { order: 3, name: 'Normandy (Omaha Beach)', country: 'France', latitude: 49.3714, longitude: -0.8647, description: 'The largest amphibious invasion in history began here on D-Day, June 6, 1944.', category: 'battle' },
      { order: 4, name: 'Sarajevo', country: 'Bosnia', latitude: 43.8563, longitude: 18.4131, description: 'Archduke Franz Ferdinand was assassinated here on June 28, 1914, triggering World War I.', category: 'politics' },
      { order: 5, name: 'Verdun', country: 'France', latitude: 49.1620, longitude: 5.3882, description: 'Site of one of WWI\'s longest battles (Feb–Dec 1916), with over 700,000 casualties.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-01-03'), puzzleNumber: 3,
    locations: [
      { order: 1, name: 'Kitty Hawk', country: 'USA', latitude: 36.0221, longitude: -75.6681, description: 'Orville Wright made the first powered airplane flight here on December 17, 1903.', category: 'science' },
      { order: 2, name: 'Rosetta', country: 'Egypt', latitude: 31.4015, longitude: 30.4177, description: 'The Rosetta Stone was discovered here in 1799, unlocking the secrets of Egyptian hieroglyphics.', category: 'discovery' },
      { order: 3, name: 'Baikonur Cosmodrome', country: 'Kazakhstan', latitude: 45.9200, longitude: 63.3420, description: 'Sputnik 1, the first artificial satellite, launched from here on October 4, 1957.', category: 'science' },
      { order: 4, name: 'Cambridge', country: 'England', latitude: 52.2043, longitude: 0.1218, description: 'James Watson and Francis Crick announced the discovery of DNA\'s double helix structure here in 1953.', category: 'science' },
      { order: 5, name: 'Alamogordo', country: 'USA', latitude: 32.9001, longitude: -105.9603, description: 'Trinity Site near Alamogordo was where the first nuclear bomb test detonated on July 16, 1945.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-01-04'), puzzleNumber: 4,
    locations: [
      { order: 1, name: 'Timbuktu', country: 'Mali', latitude: 16.7666, longitude: -3.0026, description: 'A legendary center of Islamic scholarship and gold trade in medieval West Africa.', category: 'culture' },
      { order: 2, name: 'Angkor Wat', country: 'Cambodia', latitude: 13.4125, longitude: 103.8670, description: 'The world\'s largest religious monument, built in the 12th century for King Suryavarman II.', category: 'culture' },
      { order: 3, name: 'Easter Island', country: 'Chile', latitude: -27.1127, longitude: -109.3497, description: 'Home to the mysterious moai statues, carved by the Rapa Nui people between 1250–1500 CE.', category: 'culture' },
      { order: 4, name: 'Petra', country: 'Jordan', latitude: 30.3285, longitude: 35.4444, description: 'The rose-red city carved into sandstone cliffs, capital of the Nabataean Kingdom around 312 BC.', category: 'culture' },
      { order: 5, name: 'Chichen Itza', country: 'Mexico', latitude: 20.6843, longitude: -88.5678, description: 'Major pre-Columbian city of the Maya civilization, built around 600–1200 CE.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-05'), puzzleNumber: 5,
    locations: [
      { order: 1, name: 'Gallipoli Peninsula', country: 'Turkey', latitude: 40.2552, longitude: 26.6781, description: 'Site of the ill-fated Allied campaign of 1915, a defining moment for ANZAC forces.', category: 'battle' },
      { order: 2, name: 'Trafalgar', country: 'Spain', latitude: 36.1800, longitude: -6.0330, description: 'Admiral Nelson defeated the Franco-Spanish fleet here on October 21, 1805.', category: 'battle' },
      { order: 3, name: 'Thermopylae', country: 'Greece', latitude: 38.8003, longitude: 22.5271, description: '300 Spartans under King Leonidas held off the Persian army in 480 BC at this narrow pass.', category: 'battle' },
      { order: 4, name: 'Agincourt', country: 'France', latitude: 50.4619, longitude: 2.1416, description: 'Henry V of England defeated a much larger French force here on October 25, 1415.', category: 'battle' },
      { order: 5, name: 'Hastings', country: 'England', latitude: 50.8582, longitude: 0.5735, description: 'William the Conqueror defeated King Harold II here on October 14, 1066, changing English history.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-01-06'), puzzleNumber: 6,
    locations: [
      { order: 1, name: 'Galapagos Islands', country: 'Ecuador', latitude: -0.9538, longitude: -90.9656, description: 'Darwin\'s observations of unique wildlife here in 1835 helped inspire his theory of evolution.', category: 'science' },
      { order: 2, name: 'Olduvai Gorge', country: 'Tanzania', latitude: -2.9927, longitude: 35.3533, description: 'One of the most important paleoanthropological sites; fossils of early humans found here.', category: 'discovery' },
      { order: 3, name: 'Lascaux', country: 'France', latitude: 45.0546, longitude: 1.0817, description: 'Cave paintings discovered here in 1940 date back 17,000 years, among the earliest human art.', category: 'culture' },
      { order: 4, name: 'Chernobyl', country: 'Ukraine', latitude: 51.3890, longitude: 30.0978, description: 'Site of the world\'s worst nuclear disaster on April 26, 1986.', category: 'disaster' },
      { order: 5, name: 'Krakatoa', country: 'Indonesia', latitude: -6.1021, longitude: 105.4231, description: 'The 1883 eruption of Krakatoa was heard 4,800 km away and caused a global temperature drop.', category: 'disaster' },
    ]
  },
  {
    date: new Date('2025-01-07'), puzzleNumber: 7,
    locations: [
      { order: 1, name: 'Jamestown', country: 'USA', latitude: 37.2090, longitude: -76.7756, description: 'The first permanent English settlement in the Americas, founded in 1607.', category: 'exploration' },
      { order: 2, name: 'Tenochtitlan (Mexico City)', country: 'Mexico', latitude: 19.4326, longitude: -99.1332, description: 'Capital of the Aztec Empire, conquered by Hernán Cortés in 1521.', category: 'exploration' },
      { order: 3, name: 'Roanoke Island', country: 'USA', latitude: 35.9060, longitude: -75.6722, description: 'Site of the "Lost Colony" — 115 English settlers vanished without explanation around 1590.', category: 'mystery' },
      { order: 4, name: 'Cape of Good Hope', country: 'South Africa', latitude: -34.3568, longitude: 18.4734, description: 'Bartolomeu Dias rounded this cape in 1488, opening the sea route from Europe to Asia.', category: 'exploration' },
      { order: 5, name: 'Tonga', country: 'Tonga', latitude: -21.1789, longitude: -175.1982, description: 'Abel Tasman was the first European to encounter these islands in 1643.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-01-08'), puzzleNumber: 8,
    locations: [
      { order: 1, name: 'Auschwitz-Birkenau', country: 'Poland', latitude: 50.0343, longitude: 19.1784, description: 'The largest Nazi concentration camp, where over 1.1 million people were murdered during WWII.', category: 'war' },
      { order: 2, name: 'Srebrenica', country: 'Bosnia', latitude: 44.1028, longitude: 19.2960, description: 'Site of the 1995 massacre of over 8,000 Bosniak Muslims, the worst genocide in Europe since WWII.', category: 'war' },
      { order: 3, name: 'Nanking (Nanjing)', country: 'China', latitude: 32.0603, longitude: 118.7969, description: 'Site of the 1937–38 massacre by Japanese troops in which an estimated 200,000–300,000 civilians died.', category: 'war' },
      { order: 4, name: 'Wounded Knee', country: 'USA', latitude: 43.1560, longitude: -102.3633, description: 'Site of the 1890 massacre of Lakota Sioux by U.S. troops, the last major armed conflict of the Indian Wars.', category: 'battle' },
      { order: 5, name: 'My Lai', country: 'Vietnam', latitude: 15.1792, longitude: 108.8742, description: 'Site of the 1968 massacre of hundreds of unarmed civilians by U.S. troops during the Vietnam War.', category: 'war' },
    ]
  },
  {
    date: new Date('2025-01-09'), puzzleNumber: 9,
    locations: [
      { order: 1, name: 'Mount Everest Base Camp', country: 'Nepal', latitude: 28.0048, longitude: 86.8528, description: 'Edmund Hillary and Tenzing Norgay reached the summit of Everest on May 29, 1953.', category: 'exploration' },
      { order: 2, name: 'South Pole (Amundsen–Scott Station)', country: 'Antarctica', latitude: -90.0000, longitude: 0.0000, description: 'Roald Amundsen\'s team became the first to reach the South Pole on December 14, 1911.', category: 'exploration' },
      { order: 3, name: 'North Pole', country: 'Arctic', latitude: 90.0000, longitude: 0.0000, description: 'Robert Peary claimed to reach the geographic North Pole on April 6, 1909.', category: 'exploration' },
      { order: 4, name: 'Mariana Trench', country: 'Pacific Ocean', latitude: 11.3733, longitude: 142.5917, description: 'Don Walsh and Jacques Piccard descended to the deepest point on Earth (10,916m) on January 23, 1960.', category: 'exploration' },
      { order: 5, name: 'K2 Base Camp', country: 'Pakistan', latitude: 35.8818, longitude: 76.5142, description: 'The world\'s second-highest mountain was first summited on July 31, 1954 by an Italian expedition.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-01-10'), puzzleNumber: 10,
    locations: [
      { order: 1, name: 'Tiananmen Square', country: 'China', latitude: 39.9055, longitude: 116.3976, description: 'Massive pro-democracy protests here ended with a military crackdown on June 4, 1989.', category: 'politics' },
      { order: 2, name: 'Tahrir Square, Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, description: 'Epicenter of the 2011 Egyptian Revolution that led to the resignation of President Mubarak.', category: 'politics' },
      { order: 3, name: 'Bastille', country: 'France', latitude: 48.8533, longitude: 2.3692, description: 'The storming of the Bastille prison on July 14, 1789 marked the start of the French Revolution.', category: 'politics' },
      { order: 4, name: 'Selma (Edmund Pettus Bridge)', country: 'USA', latitude: 32.4072, longitude: -87.0217, description: 'The 1965 Selma to Montgomery marches across this bridge galvanized support for the Voting Rights Act.', category: 'politics' },
      { order: 5, name: 'Gdańsk (Lenin Shipyard)', country: 'Poland', latitude: 54.3697, longitude: 18.6400, description: 'Lech Wałęsa led the Solidarity strikes here in 1980, sparking the fall of communism in Eastern Europe.', category: 'politics' },
    ]
  },
]

// Generate more puzzles covering remaining themes
const morePuzzles = [
  {
    date: new Date('2025-01-11'), puzzleNumber: 11,
    locations: [
      { order: 1, name: 'Stonehenge', country: 'England', latitude: 51.1789, longitude: -1.8262, description: 'Prehistoric monument built around 3000–1500 BC, its purpose remains a mystery.', category: 'mystery' },
      { order: 2, name: 'Nazca Lines', country: 'Peru', latitude: -14.7390, longitude: -75.1300, description: 'Enormous geoglyphs etched into the desert between 500 BC and 500 CE by the Nazca culture.', category: 'mystery' },
      { order: 3, name: 'Great Zimbabwe', country: 'Zimbabwe', latitude: -20.2677, longitude: 30.9338, description: 'Ruins of a medieval city that was the capital of the Kingdom of Zimbabwe, c. 1100–1450 CE.', category: 'culture' },
      { order: 4, name: 'Çatalhöyük', country: 'Turkey', latitude: 37.6682, longitude: 32.8265, description: 'One of the world\'s oldest cities, inhabited from around 7500 BC.', category: 'discovery' },
      { order: 5, name: 'Mohenjo-daro', country: 'Pakistan', latitude: 27.3244, longitude: 68.1379, description: 'One of the largest cities of the ancient Indus Valley Civilization (c. 2500 BC).', category: 'discovery' },
    ]
  },
  {
    date: new Date('2025-01-12'), puzzleNumber: 12,
    locations: [
      { order: 1, name: 'Pearl Harbor', country: 'USA', latitude: 21.3648, longitude: -157.9750, description: 'The surprise Japanese attack on December 7, 1941 brought the United States into World War II.', category: 'war' },
      { order: 2, name: 'Midway Atoll', country: 'USA', latitude: 28.2072, longitude: -177.3735, description: 'The Battle of Midway (June 4–7, 1942) was a decisive naval victory that turned the tide in the Pacific.', category: 'battle' },
      { order: 3, name: 'Stalingrad (Volgograd)', country: 'Russia', latitude: 48.7080, longitude: 44.5133, description: 'One of WWII\'s bloodiest battles (Aug 1942–Feb 1943), a major turning point on the Eastern Front.', category: 'battle' },
      { order: 4, name: 'El Alamein', country: 'Egypt', latitude: 30.8418, longitude: 28.9534, description: 'Montgomery\'s victory over Rommel here in 1942 ended the Axis threat to North Africa.', category: 'battle' },
      { order: 5, name: 'Iwo Jima', country: 'Japan', latitude: 24.7576, longitude: 141.2933, description: 'The iconic flag-raising photo was taken during the fierce WWII battle here in February 1945.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-01-13'), puzzleNumber: 13,
    locations: [
      { order: 1, name: 'Greenwich', country: 'England', latitude: 51.4769, longitude: -0.0005, description: 'The Prime Meridian passes through the Royal Observatory here, defining longitude 0°.', category: 'science' },
      { order: 2, name: 'Menlo Park (Edison Lab)', country: 'USA', latitude: 40.7327, longitude: -74.3618, description: 'Thomas Edison invented the phonograph and improved the lightbulb at his laboratory here.', category: 'science' },
      { order: 3, name: 'Bletchley Park', country: 'England', latitude: 51.9976, longitude: -0.7413, description: 'Alan Turing and colleagues cracked the German Enigma code here during WWII, shortening the war.', category: 'science' },
      { order: 4, name: 'CERN (Geneva)', country: 'Switzerland', latitude: 46.2330, longitude: 6.0557, description: 'The Higgs boson was confirmed here at the Large Hadron Collider on July 4, 2012.', category: 'science' },
      { order: 5, name: 'Stratford-upon-Avon', country: 'England', latitude: 52.1920, longitude: -1.7081, description: 'Birthplace of William Shakespeare in 1564, the most influential writer in the English language.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-14'), puzzleNumber: 14,
    locations: [
      { order: 1, name: 'Wounded Knee (1973)', country: 'USA', latitude: 43.1560, longitude: -102.3633, description: 'In 1973, American Indian Movement members occupied this site for 71 days in protest.', category: 'politics' },
      { order: 2, name: 'Soweto', country: 'South Africa', latitude: -26.2677, longitude: 27.8585, description: 'The 1976 Soweto Uprising — students protesting apartheid — marked a turning point in anti-apartheid resistance.', category: 'politics' },
      { order: 3, name: 'Robben Island', country: 'South Africa', latitude: -33.8063, longitude: 18.3664, description: 'Nelson Mandela was imprisoned here for 18 of his 27 years, before becoming South Africa\'s first Black president.', category: 'politics' },
      { order: 4, name: 'Hanoi', country: 'Vietnam', latitude: 21.0285, longitude: 105.8542, description: 'Capital of North Vietnam, heavily bombed during the Vietnam War, now a unified nation\'s capital.', category: 'war' },
      { order: 5, name: 'Havana', country: 'Cuba', latitude: 23.1136, longitude: -82.3666, description: 'Fidel Castro\'s revolution toppled Batista\'s government on January 1, 1959.', category: 'politics' },
    ]
  },
  {
    date: new Date('2025-01-15'), puzzleNumber: 15,
    locations: [
      { order: 1, name: 'Mount Vesuvius', country: 'Italy', latitude: 40.8213, longitude: 14.4260, description: 'Erupted in 79 AD, burying Pompeii and Herculaneum under volcanic ash.', category: 'disaster' },
      { order: 2, name: 'Tambora', country: 'Indonesia', latitude: -8.2500, longitude: 117.9993, description: 'The 1815 eruption of Mount Tambora was the largest in recorded history, causing the "Year Without a Summer."', category: 'disaster' },
      { order: 3, name: 'San Francisco (1906)', country: 'USA', latitude: 37.7749, longitude: -122.4194, description: 'The 1906 earthquake and fire destroyed 80% of San Francisco, killing over 3,000 people.', category: 'disaster' },
      { order: 4, name: 'Lisbon', country: 'Portugal', latitude: 38.7169, longitude: -9.1395, description: 'The 1755 earthquake and tsunami killed 60,000 and reshaped Enlightenment thought on natural evil.', category: 'disaster' },
      { order: 5, name: 'Tangshan', country: 'China', latitude: 39.6310, longitude: 118.1800, description: 'The 1976 Tangshan earthquake killed an estimated 250,000 people, one of the deadliest in modern history.', category: 'disaster' },
    ]
  },
]

const allPuzzles = [...puzzles, ...morePuzzles, ...extraPuzzles]

async function main() {
  console.log(`Seeding ${allPuzzles.length} puzzles...`)
  for (const puzzle of allPuzzles) {
    const existing = await prisma.dailyPuzzle.findUnique({ where: { puzzleNumber: puzzle.puzzleNumber } })
    if (existing) {
      console.log(`Puzzle #${puzzle.puzzleNumber} already exists, skipping.`)
      continue
    }
    await prisma.dailyPuzzle.create({
      data: {
        date: puzzle.date,
        puzzleNumber: puzzle.puzzleNumber,
        locations: {
          create: puzzle.locations.map(loc => ({
            order: loc.order,
            name: loc.name,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
            description: loc.description,
            category: loc.category,
          })),
        },
      },
    })
    console.log(`Created puzzle #${puzzle.puzzleNumber}: ${puzzle.locations[0].name}...`)
  }
  console.log('Seeding complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
