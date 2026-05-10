const extraPuzzles = [
  {
    date: new Date('2025-01-16'), puzzleNumber: 16,
    locations: [
      { order: 1, name: 'Samarkand', country: 'Uzbekistan', latitude: 39.6542, longitude: 66.9597, description: 'A jewel of the Silk Road, Samarkand was Tamerlane\'s capital and a center of Islamic scholarship.', category: 'culture' },
      { order: 2, name: 'Xi\'an (Terracotta Army)', country: 'China', latitude: 34.3848, longitude: 109.2785, description: 'The Terracotta Army of 8,000 life-sized warriors was buried with Emperor Qin Shi Huang in 210 BC.', category: 'discovery' },
      { order: 3, name: 'Kashgar', country: 'China', latitude: 39.4677, longitude: 75.9897, description: 'Ancient oasis city at the crossroads of the northern and southern Silk Road routes.', category: 'culture' },
      { order: 4, name: 'Constantinople (Istanbul)', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, description: 'Capital of the Byzantine Empire for over 1,000 years until its fall to the Ottomans in 1453.', category: 'battle' },
      { order: 5, name: 'Venice', country: 'Italy', latitude: 45.4408, longitude: 12.3155, description: 'Marco Polo departed from Venice in 1271 on his legendary journey to China along the Silk Road.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-01-17'), puzzleNumber: 17,
    locations: [
      { order: 1, name: 'Lalibela', country: 'Ethiopia', latitude: 12.0319, longitude: 39.0454, description: 'Eleven rock-hewn churches carved from solid stone in the 12th-13th century, a pilgrimage site.', category: 'culture' },
      { order: 2, name: 'Great Zimbabwe', country: 'Zimbabwe', latitude: -20.2677, longitude: 30.9338, description: 'Medieval stone city that was the heart of a great trading empire in southern Africa (1100-1450 CE).', category: 'culture' },
      { order: 3, name: 'Aksum', country: 'Ethiopia', latitude: 14.1211, longitude: 38.7468, description: 'Capital of the ancient Aksumite Empire, one of the four great powers of the ancient world.', category: 'culture' },
      { order: 4, name: 'Kilwa Kisiwani', country: 'Tanzania', latitude: -8.9573, longitude: 39.5227, description: 'Medieval Swahili trading port that controlled gold trade from Zimbabwe to the Indian Ocean.', category: 'culture' },
      { order: 5, name: 'Djenne', country: 'Mali', latitude: 13.9054, longitude: -4.5558, description: 'Home to the world\'s largest mud-brick building, the Great Mosque, and a center of Islamic learning since 800 CE.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-18'), puzzleNumber: 18,
    locations: [
      { order: 1, name: 'Teotihuacan', country: 'Mexico', latitude: 19.6925, longitude: -98.8438, description: 'The Pyramid of the Sun in this pre-Aztec city was the largest structure in the ancient Americas.', category: 'culture' },
      { order: 2, name: 'Mesa Verde', country: 'USA', latitude: 37.1838, longitude: -108.4887, description: 'Ancestral Puebloan cliff dwellings built into sandstone alcoves around 1190-1300 CE.', category: 'culture' },
      { order: 3, name: 'Cahokia', country: 'USA', latitude: 38.6504, longitude: -90.0621, description: 'The largest pre-Columbian settlement north of Mexico, with a population rivaling medieval London by 1100 CE.', category: 'culture' },
      { order: 4, name: 'Cusco', country: 'Peru', latitude: -13.5320, longitude: -71.9675, description: 'Capital of the Inca Empire, the largest empire in pre-Columbian Americas.', category: 'culture' },
      { order: 5, name: 'Tikal', country: 'Guatemala', latitude: 17.2220, longitude: -89.6237, description: 'One of the most powerful Maya city-states, with temples rising above the jungle canopy.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-19'), puzzleNumber: 19,
    locations: [
      { order: 1, name: 'Nan Madol', country: 'Micronesia', latitude: 6.8442, longitude: 158.3351, description: 'A mysterious ancient city built on artificial islands of basalt columns in the Pacific Ocean.', category: 'mystery' },
      { order: 2, name: 'Rapa Nui (Easter Island)', country: 'Chile', latitude: -27.1127, longitude: -109.3497, description: 'Nearly 900 moai statues were carved and transported across the island between 1250-1500 CE.', category: 'mystery' },
      { order: 3, name: 'Uluru', country: 'Australia', latitude: -25.3444, longitude: 131.0369, description: 'Sacred to the Anangu people for over 30,000 years, this sandstone monolith is central to Aboriginal Dreamtime.', category: 'culture' },
      { order: 4, name: 'Waitangi', country: 'New Zealand', latitude: -35.2620, longitude: 174.0790, description: 'The Treaty of Waitangi was signed here in 1840 between the British Crown and Maori chiefs.', category: 'politics' },
      { order: 5, name: 'Botany Bay', country: 'Australia', latitude: -33.9811, longitude: 151.1944, description: 'Captain James Cook first landed in Australia here on April 29, 1770.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-01-20'), puzzleNumber: 20,
    locations: [
      { order: 1, name: 'Persepolis', country: 'Iran', latitude: 29.9352, longitude: 52.8914, description: 'Ceremonial capital of the Achaemenid Persian Empire, destroyed by Alexander the Great in 330 BC.', category: 'battle' },
      { order: 2, name: 'Babylon', country: 'Iraq', latitude: 32.5422, longitude: 44.4209, description: 'Home of the Hanging Gardens (one of the Seven Wonders) and center of Mesopotamian civilization.', category: 'culture' },
      { order: 3, name: 'Ur', country: 'Iraq', latitude: 30.9628, longitude: 46.1031, description: 'One of the world\'s first cities, birthplace of Abraham according to biblical tradition.', category: 'culture' },
      { order: 4, name: 'Palmyra', country: 'Syria', latitude: 34.5503, longitude: 38.2691, description: 'A wealthy caravan oasis linking the Roman Empire to Persia, destroyed by ISIS in 2015.', category: 'culture' },
      { order: 5, name: 'Ephesus', country: 'Turkey', latitude: 37.9394, longitude: 27.3417, description: 'Ancient Greek city famous for the Temple of Artemis, one of the Seven Wonders of the Ancient World.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-21'), puzzleNumber: 21,
    locations: [
      { order: 1, name: 'Tanegashima Space Center', country: 'Japan', latitude: 30.4000, longitude: 131.0000, description: 'Japan\'s primary launch facility, where the H-IIA rocket carries satellites and deep-space probes.', category: 'science' },
      { order: 2, name: 'Baikonur Cosmodrome', country: 'Kazakhstan', latitude: 45.9200, longitude: 63.3420, description: 'Yuri Gagarin launched from here on April 12, 1961, becoming the first human in space.', category: 'science' },
      { order: 3, name: 'Kourou', country: 'French Guiana', latitude: 5.2322, longitude: -52.7693, description: 'ESA\'s spaceport near the equator, providing an energy boost for launches into orbit.', category: 'science' },
      { order: 4, name: 'Woomera', country: 'Australia', latitude: -31.1581, longitude: 136.8323, description: 'Australia\'s rocket range, used for British nuclear tests and satellite launches since 1947.', category: 'science' },
      { order: 5, name: 'Jiuquan', country: 'China', latitude: 40.9581, longitude: 100.2914, description: 'China\'s first satellite launch center (1958) and site of all crewed Shenzhou missions.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-01-22'), puzzleNumber: 22,
    locations: [
      { order: 1, name: 'Carthage', country: 'Tunisia', latitude: 36.8529, longitude: 10.3237, description: 'Powerful Phoenician city-state destroyed by Rome in 146 BC after three Punic Wars.', category: 'battle' },
      { order: 2, name: 'Marathon', country: 'Greece', latitude: 38.1144, longitude: 23.9722, description: 'The Athenian victory here in 490 BC inspired the modern marathon race distance.', category: 'battle' },
      { order: 3, name: 'Cannae', country: 'Italy', latitude: 41.3054, longitude: 16.1327, description: 'Hannibal\'s masterful double-envelopment here in 216 BC annihilated 70,000 Roman soldiers.', category: 'battle' },
      { order: 4, name: 'Gaugamela', country: 'Iraq', latitude: 36.5633, longitude: 43.4500, description: 'Alexander the Great defeated Darius III here in 331 BC, conquering the Persian Empire.', category: 'battle' },
      { order: 5, name: 'Actium', country: 'Greece', latitude: 38.9500, longitude: 20.7167, description: 'Octavian\'s naval victory over Antony and Cleopatra in 31 BC made him sole ruler of Rome.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-01-23'), puzzleNumber: 23,
    locations: [
      { order: 1, name: 'Versailles', country: 'France', latitude: 48.8049, longitude: 2.1204, description: 'The Treaty of Versailles was signed here on June 28, 1919, officially ending World War I.', category: 'politics' },
      { order: 2, name: 'Yalta', country: 'Ukraine', latitude: 44.4952, longitude: 34.1663, description: 'Churchill, Roosevelt, and Stalin met here in February 1945 to plan the post-war world order.', category: 'politics' },
      { order: 3, name: 'Potsdam', country: 'Germany', latitude: 52.3906, longitude: 13.0645, description: 'The final Allied conference of WWII (July-Aug 1945) decided the occupation of Germany.', category: 'politics' },
      { order: 4, name: 'Bretton Woods', country: 'USA', latitude: 44.2573, longitude: -71.4418, description: 'The 1944 conference here established the IMF and World Bank, shaping the global financial system.', category: 'politics' },
      { order: 5, name: 'San Francisco (UN Charter)', country: 'USA', latitude: 37.7838, longitude: -122.4189, description: 'The United Nations Charter was signed here on June 26, 1945, creating the modern UN.', category: 'politics' },
    ]
  },
  {
    date: new Date('2025-01-24'), puzzleNumber: 24,
    locations: [
      { order: 1, name: 'Varanasi', country: 'India', latitude: 25.3176, longitude: 83.0064, description: 'One of the world\'s oldest continuously inhabited cities, sacred to Hinduism for over 3,000 years.', category: 'culture' },
      { order: 2, name: 'Bodh Gaya', country: 'India', latitude: 24.6961, longitude: 84.9869, description: 'Siddhartha Gautama attained enlightenment here under the Bodhi Tree, founding Buddhism.', category: 'culture' },
      { order: 3, name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, description: 'Birthplace of Prophet Muhammad and holiest city in Islam, destination of the Hajj pilgrimage.', category: 'culture' },
      { order: 4, name: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137, description: 'Holy city to Judaism, Christianity, and Islam, fought over in multiple Crusades.', category: 'culture' },
      { order: 5, name: 'Lumbini', country: 'Nepal', latitude: 27.4833, longitude: 83.2833, description: 'Birthplace of Siddhartha Gautama (Buddha) in 563 BC, a UNESCO World Heritage Site.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-25'), puzzleNumber: 25,
    locations: [
      { order: 1, name: 'Fukushima Daiichi', country: 'Japan', latitude: 37.4211, longitude: 141.0328, description: 'A 2011 tsunami caused the worst nuclear disaster since Chernobyl, displacing 154,000 people.', category: 'disaster' },
      { order: 2, name: 'Bhopal', country: 'India', latitude: 23.2599, longitude: 77.4126, description: 'The 1984 gas leak from a pesticide plant killed over 3,800 people immediately and thousands more later.', category: 'disaster' },
      { order: 3, name: 'Tunguska', country: 'Russia', latitude: 60.8860, longitude: 101.8940, description: 'A mysterious explosion in 1908 flattened 2,150 sq km of Siberian forest — likely a meteor airburst.', category: 'disaster' },
      { order: 4, name: 'Pripyat', country: 'Ukraine', latitude: 51.4045, longitude: 30.0542, description: 'This purpose-built Soviet city was evacuated in 36 hours after the 1986 Chernobyl disaster.', category: 'disaster' },
      { order: 5, name: 'Pompeii', country: 'Italy', latitude: 40.7503, longitude: 14.4989, description: 'Buried under 6 meters of volcanic ash when Vesuvius erupted in 79 AD, preserving daily Roman life.', category: 'disaster' },
    ]
  },
  {
    date: new Date('2025-01-26'), puzzleNumber: 26,
    locations: [
      { order: 1, name: 'Goree Island', country: 'Senegal', latitude: 14.6673, longitude: -17.3984, description: 'Symbolic departure point of the transatlantic slave trade, now a UNESCO memorial site.', category: 'culture' },
      { order: 2, name: 'Zanzibar Stone Town', country: 'Tanzania', latitude: -6.1622, longitude: 39.1921, description: 'Hub of the East African slave and spice trade for centuries, blending African, Arab, and Indian cultures.', category: 'culture' },
      { order: 3, name: 'Cape Coast Castle', country: 'Ghana', latitude: 5.1013, longitude: -1.2413, description: 'One of 40 slave castles on the Gold Coast, through which millions were shipped to the Americas.', category: 'culture' },
      { order: 4, name: 'Port Royal', country: 'Jamaica', latitude: 17.9381, longitude: -76.8413, description: 'Once called \'the wickedest city on earth\', this pirate haven was destroyed by an earthquake in 1692.', category: 'disaster' },
      { order: 5, name: 'Salvador', country: 'Brazil', latitude: -12.9714, longitude: -38.5124, description: 'First capital of colonial Brazil and largest African diaspora destination outside Africa.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-27'), puzzleNumber: 27,
    locations: [
      { order: 1, name: 'Magellan Strait', country: 'Chile', latitude: -53.4765, longitude: -70.7897, description: 'Ferdinand Magellan navigated this treacherous passage in 1520, connecting Atlantic to Pacific.', category: 'exploration' },
      { order: 2, name: 'Tahiti', country: 'French Polynesia', latitude: -17.6509, longitude: -149.4260, description: 'Captain Cook observed the Transit of Venus here in 1769, advancing astronomical measurement.', category: 'science' },
      { order: 3, name: 'Pitcairn Island', country: 'UK', latitude: -25.0667, longitude: -130.1000, description: 'HMS Bounty mutineers settled here in 1790; their descendants still live on this remote island.', category: 'exploration' },
      { order: 4, name: 'Bikini Atoll', country: 'Marshall Islands', latitude: 11.5833, longitude: 165.3833, description: 'Site of 23 U.S. nuclear weapon tests between 1946 and 1958, including the first hydrogen bomb.', category: 'science' },
      { order: 5, name: 'Guam', country: 'USA', latitude: 13.4443, longitude: 144.7937, description: 'Magellan landed here in 1521 during the first circumnavigation of the Earth.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-01-28'), puzzleNumber: 28,
    locations: [
      { order: 1, name: 'Alhambra', country: 'Spain', latitude: 37.1760, longitude: -3.5880, description: 'Moorish palace complex representing the pinnacle of Islamic art in Europe, completed in the 14th century.', category: 'culture' },
      { order: 2, name: 'Hagia Sophia', country: 'Turkey', latitude: 41.0086, longitude: 28.9802, description: 'Built as a cathedral in 537 AD, converted to mosque in 1453, museum in 1934, mosque again in 2020.', category: 'culture' },
      { order: 3, name: 'Taj Mahal', country: 'India', latitude: 27.1751, longitude: 78.0421, description: 'Built 1632-1653 by Shah Jahan as a mausoleum for his wife, considered the finest Mughal architecture.', category: 'culture' },
      { order: 4, name: 'Notre-Dame de Paris', country: 'France', latitude: 48.8530, longitude: 2.3499, description: 'Gothic masterpiece begun in 1163, devastated by fire in 2019, and painstakingly restored by 2024.', category: 'culture' },
      { order: 5, name: 'Borobudur', country: 'Indonesia', latitude: -7.6079, longitude: 110.2038, description: 'The world\'s largest Buddhist temple, built in the 9th century with 2,672 relief panels.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-01-29'), puzzleNumber: 29,
    locations: [
      { order: 1, name: 'Los Alamos', country: 'USA', latitude: 35.8800, longitude: -106.3031, description: 'Secret laboratory where the Manhattan Project developed the first atomic bombs during WWII.', category: 'science' },
      { order: 2, name: 'Hiroshima Peace Memorial', country: 'Japan', latitude: 34.3955, longitude: 132.4536, description: 'The A-Bomb Dome survived the 1945 blast and now stands as a symbol of nuclear disarmament.', category: 'war' },
      { order: 3, name: 'Nagasaki', country: 'Japan', latitude: 32.7503, longitude: 129.8777, description: 'The second atomic bomb was dropped here on August 9, 1945, killing 70,000 immediately.', category: 'war' },
      { order: 4, name: 'Semipalatinsk', country: 'Kazakhstan', latitude: 50.4111, longitude: 77.7500, description: 'The Soviet Union\'s primary nuclear test site, where 456 nuclear tests were conducted from 1949-1989.', category: 'science' },
      { order: 5, name: 'Moruroa Atoll', country: 'French Polynesia', latitude: -21.8333, longitude: -138.9167, description: 'France conducted 181 nuclear tests here between 1966 and 1996, sparking international protests.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-01-30'), puzzleNumber: 30,
    locations: [
      { order: 1, name: 'Johannesburg (Constitution Hill)', country: 'South Africa', latitude: -26.1880, longitude: 28.0436, description: 'Former prison complex where Mandela and Gandhi were detained, now home to South Africa\'s Constitutional Court.', category: 'politics' },
      { order: 2, name: 'Montgomery', country: 'USA', latitude: 32.3792, longitude: -86.3077, description: 'Rosa Parks\' 1955 bus boycott here launched the American civil rights movement.', category: 'politics' },
      { order: 3, name: 'Stonewall Inn', country: 'USA', latitude: 40.7338, longitude: -74.0020, description: 'The 1969 riots here in Greenwich Village launched the modern LGBTQ+ rights movement.', category: 'politics' },
      { order: 4, name: 'Seneca Falls', country: 'USA', latitude: 42.9106, longitude: -76.7966, description: 'The 1848 convention here launched the American women\'s suffrage movement with the Declaration of Sentiments.', category: 'politics' },
      { order: 5, name: 'Salt March (Dandi)', country: 'India', latitude: 20.9190, longitude: 72.8479, description: 'Gandhi\'s 1930 march to the sea to make salt defied British colonial law and galvanized Indian independence.', category: 'politics' },
    ]
  },
  {
    date: new Date('2025-01-31'), puzzleNumber: 31,
    locations: [
      { order: 1, name: 'Panama Canal (Miraflores)', country: 'Panama', latitude: 9.0153, longitude: -79.5885, description: 'Opened in 1914 after a decade of construction and 25,000 deaths, connecting Atlantic and Pacific.', category: 'science' },
      { order: 2, name: 'Suez Canal', country: 'Egypt', latitude: 30.4574, longitude: 32.3499, description: 'Opened in 1869, this 193 km canal eliminated the need to sail around Africa.', category: 'science' },
      { order: 3, name: 'Channel Tunnel (Folkestone)', country: 'England', latitude: 51.0942, longitude: 1.1528, description: 'The 50 km undersea rail tunnel connecting England and France opened in 1994.', category: 'science' },
      { order: 4, name: 'Hoover Dam', country: 'USA', latitude: 36.0160, longitude: -114.7377, description: 'Built during the Great Depression (1931-1936), this engineering marvel tamed the Colorado River.', category: 'science' },
      { order: 5, name: 'Three Gorges Dam', country: 'China', latitude: 30.8231, longitude: 111.0046, description: 'The world\'s largest power station by capacity, generating 22,500 MW since 2006.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-02-01'), puzzleNumber: 32,
    locations: [
      { order: 1, name: 'Dunkirk', country: 'France', latitude: 51.0381, longitude: 2.3767, description: 'Operation Dynamo evacuated 338,000 Allied soldiers across the English Channel in May-June 1940.', category: 'battle' },
      { order: 2, name: 'Kursk', country: 'Russia', latitude: 51.7500, longitude: 36.1833, description: 'The largest tank battle in history took place here in July 1943, with 6,000 tanks engaged.', category: 'battle' },
      { order: 3, name: 'Arnhem', country: 'Netherlands', latitude: 51.9851, longitude: 5.8987, description: 'Operation Market Garden\'s infamous \'bridge too far\' in September 1944 cost 17,000 Allied casualties.', category: 'battle' },
      { order: 4, name: 'Monte Cassino', country: 'Italy', latitude: 41.4904, longitude: 13.8139, description: 'Four brutal Allied assaults between January-May 1944 destroyed this historic Benedictine monastery.', category: 'battle' },
      { order: 5, name: 'Bastogne', country: 'Belgium', latitude: 50.0000, longitude: 5.7167, description: 'The 101st Airborne\'s famous stand during the Battle of the Bulge in December 1944.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-02-02'), puzzleNumber: 33,
    locations: [
      { order: 1, name: 'Svalbard Global Seed Vault', country: 'Norway', latitude: 78.2355, longitude: 15.4942, description: 'The \'Doomsday Vault\' stores seeds from around the world to preserve crop biodiversity.', category: 'science' },
      { order: 2, name: 'McMurdo Station', country: 'Antarctica', latitude: -77.8419, longitude: 166.6863, description: 'The largest research station in Antarctica, established by the U.S. in 1956.', category: 'science' },
      { order: 3, name: 'International Space Station (Mission Control)', country: 'USA', latitude: 29.5593, longitude: -95.0900, description: 'NASA\'s Johnson Space Center has controlled human spaceflight from here since 1965.', category: 'science' },
      { order: 4, name: 'Arecibo', country: 'Puerto Rico', latitude: 18.3464, longitude: -66.7528, description: 'The 305m radio telescope operated from 1963-2020, sending humanity\'s first deliberate message to space.', category: 'science' },
      { order: 5, name: 'Very Large Array', country: 'USA', latitude: 34.0784, longitude: -107.6184, description: '27 radio antennas in New Mexico searching the cosmos since 1980, featured in the film Contact.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-02-03'), puzzleNumber: 34,
    locations: [
      { order: 1, name: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.7681, description: 'Imperial capital of Japan for over 1,000 years (794-1868), spared from WWII bombing.', category: 'culture' },
      { order: 2, name: 'Forbidden City', country: 'China', latitude: 39.9163, longitude: 116.3972, description: 'Chinese imperial palace for 500 years (1420-1912), the world\'s largest palace complex.', category: 'culture' },
      { order: 3, name: 'Gyeongbokgung', country: 'South Korea', latitude: 37.5796, longitude: 126.9770, description: 'Main royal palace of the Joseon dynasty (1395), destroyed by Japan in 1592 and rebuilt.', category: 'culture' },
      { order: 4, name: 'Hue Imperial City', country: 'Vietnam', latitude: 16.4698, longitude: 107.5785, description: 'Capital of the Nguyen dynasty (1802-1945), heavily damaged during the 1968 Tet Offensive.', category: 'culture' },
      { order: 5, name: 'Bagan', country: 'Myanmar', latitude: 21.1717, longitude: 94.8585, description: 'Over 2,000 Buddhist temples and pagodas built between the 11th and 13th centuries.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-02-04'), puzzleNumber: 35,
    locations: [
      { order: 1, name: 'Gallipoli (ANZAC Cove)', country: 'Turkey', latitude: 40.2333, longitude: 26.2833, description: 'The dawn landing on April 25, 1915 is commemorated as ANZAC Day in Australia and New Zealand.', category: 'battle' },
      { order: 2, name: 'Kokoda Track', country: 'Papua New Guinea', latitude: -8.8833, longitude: 147.7333, description: 'Australian soldiers fought a grueling jungle campaign against Japan here in 1942.', category: 'battle' },
      { order: 3, name: 'Long Tan', country: 'Vietnam', latitude: 10.4833, longitude: 107.1833, description: '108 Australians held off 2,500 Viet Cong in a rubber plantation on August 18, 1966.', category: 'battle' },
      { order: 4, name: 'Tobruk', country: 'Libya', latitude: 32.0764, longitude: 23.9615, description: 'Australian \'Rats of Tobruk\' held this port against Rommel\'s siege for 241 days in 1941.', category: 'battle' },
      { order: 5, name: 'Villers-Bretonneux', country: 'France', latitude: 49.8678, longitude: 2.5092, description: 'Australians recaptured this town on ANZAC Day 1918; the local school still flies the Australian flag.', category: 'battle' },
    ]
  },
  {
    date: new Date('2025-02-05'), puzzleNumber: 36,
    locations: [
      { order: 1, name: 'Wuhan Institute of Virology', country: 'China', latitude: 30.3714, longitude: 114.3553, description: 'Center of debate over COVID-19 origins — the pandemic that reshaped the world beginning in 2020.', category: 'science' },
      { order: 2, name: 'Eyam', country: 'England', latitude: 53.2849, longitude: -1.6707, description: 'This village self-quarantined during the 1665 plague, sacrificing itself to save neighboring towns.', category: 'disaster' },
      { order: 3, name: 'Philadelphia', country: 'USA', latitude: 39.9526, longitude: -75.1652, description: 'The 1918 flu parade here killed 12,000 in 6 weeks — a cautionary tale in pandemic management.', category: 'disaster' },
      { order: 4, name: 'Broad Street Pump', country: 'England', latitude: 51.5133, longitude: -0.1365, description: 'John Snow traced the 1854 cholera outbreak to this water pump, founding modern epidemiology.', category: 'science' },
      { order: 5, name: 'Jenner\'s House (Berkeley)', country: 'England', latitude: 51.6898, longitude: -2.4588, description: 'Edward Jenner performed the first vaccination here in 1796, eventually eradicating smallpox.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-02-06'), puzzleNumber: 37,
    locations: [
      { order: 1, name: 'Silicon Valley (Palo Alto Garage)', country: 'USA', latitude: 37.4419, longitude: -122.1430, description: 'Hewlett-Packard was founded in this garage in 1939, birthing Silicon Valley.', category: 'science' },
      { order: 2, name: 'Bletchley Park', country: 'England', latitude: 51.9976, longitude: -0.7413, description: 'Alan Turing\'s work cracking Enigma here laid the foundations of modern computer science.', category: 'science' },
      { order: 3, name: 'CERN (World Wide Web)', country: 'Switzerland', latitude: 46.2330, longitude: 6.0557, description: 'Tim Berners-Lee invented the World Wide Web here in 1989, transforming human communication.', category: 'science' },
      { order: 4, name: 'Bell Labs (Murray Hill)', country: 'USA', latitude: 40.6826, longitude: -74.4001, description: 'Birthplace of the transistor (1947), Unix, C language, and 9 Nobel Prizes.', category: 'science' },
      { order: 5, name: 'MIT Media Lab', country: 'USA', latitude: 42.3601, longitude: -71.0868, description: 'Pioneering lab where the $100 laptop, E-Ink, and Guitar Hero were invented.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-02-07'), puzzleNumber: 38,
    locations: [
      { order: 1, name: 'Runnymede', country: 'England', latitude: 51.4423, longitude: -0.5633, description: 'King John sealed the Magna Carta here in 1215, laying foundations for constitutional law.', category: 'politics' },
      { order: 2, name: 'Independence Hall', country: 'USA', latitude: 39.9489, longitude: -75.1500, description: 'Both the Declaration of Independence (1776) and U.S. Constitution (1787) were debated here.', category: 'politics' },
      { order: 3, name: 'Bastille (Place de la Bastille)', country: 'France', latitude: 48.8533, longitude: 2.3692, description: 'The storming of this prison on July 14, 1789 symbolized the fall of royal authority in France.', category: 'politics' },
      { order: 4, name: 'Winter Palace', country: 'Russia', latitude: 59.9398, longitude: 30.3146, description: 'Bolsheviks stormed this imperial residence on October 25, 1917, beginning the Russian Revolution.', category: 'politics' },
      { order: 5, name: 'Meiji Shrine', country: 'Japan', latitude: 35.6764, longitude: 139.6993, description: 'Dedicated to Emperor Meiji, whose 1868 restoration transformed Japan from feudal to industrial power.', category: 'politics' },
    ]
  },
  {
    date: new Date('2025-02-08'), puzzleNumber: 39,
    locations: [
      { order: 1, name: 'Great Wall (Badaling)', country: 'China', latitude: 40.3588, longitude: 116.0154, description: 'Stretching 21,196 km, construction began in the 7th century BC to defend against northern invasions.', category: 'culture' },
      { order: 2, name: 'Hadrian\'s Wall', country: 'England', latitude: 55.0244, longitude: -2.2592, description: 'Built in 122 AD to mark the northern limit of the Roman Empire in Britain.', category: 'culture' },
      { order: 3, name: 'Berlin Wall (East Side Gallery)', country: 'Germany', latitude: 52.5053, longitude: 13.4399, description: 'The 155 km wall divided Berlin from 1961-1989; this section is now the world\'s longest open-air gallery.', category: 'politics' },
      { order: 4, name: 'DMZ (Panmunjom)', country: 'South Korea', latitude: 37.9564, longitude: 126.6773, description: 'The 4 km-wide demilitarized zone has separated North and South Korea since the 1953 armistice.', category: 'politics' },
      { order: 5, name: 'Western Wall', country: 'Israel', latitude: 31.7767, longitude: 35.2345, description: 'Last remnant of the Second Temple (destroyed 70 AD), the holiest site where Jews can pray.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-02-09'), puzzleNumber: 40,
    locations: [
      { order: 1, name: 'Titanic Wreck Site', country: 'Atlantic Ocean', latitude: 41.7258, longitude: -49.9469, description: 'RMS Titanic sank here on April 15, 1912 after hitting an iceberg, killing 1,517 people.', category: 'disaster' },
      { order: 2, name: 'Bermuda Triangle (center)', country: 'Atlantic Ocean', latitude: 25.0000, longitude: -71.0000, description: 'The mysterious region where ships and aircraft have allegedly vanished since the 19th century.', category: 'mystery' },
      { order: 3, name: 'Challenger Deep', country: 'Pacific Ocean', latitude: 11.3493, longitude: 142.1996, description: 'The deepest known point on Earth at 10,935 meters, first reached by humans in 1960.', category: 'exploration' },
      { order: 4, name: 'Sargasso Sea', country: 'Atlantic Ocean', latitude: 28.5000, longitude: -66.0000, description: 'The only sea with no land boundaries, feared by sailors for becalming ships in seaweed.', category: 'exploration' },
      { order: 5, name: 'Point Nemo', country: 'Pacific Ocean', latitude: -48.8767, longitude: -123.3933, description: 'The oceanic pole of inaccessibility — the point farthest from any land on Earth.', category: 'exploration' },
    ]
  },
  {
    date: new Date('2025-02-10'), puzzleNumber: 41,
    locations: [
      { order: 1, name: 'Machu Picchu (Sun Gate)', country: 'Peru', latitude: -13.1547, longitude: -72.5448, description: 'The Inti Punku sun gate aligned with the summer solstice, serving as the royal entrance to the citadel.', category: 'science' },
      { order: 2, name: 'Newgrange', country: 'Ireland', latitude: 53.6947, longitude: -6.4756, description: 'A 5,000-year-old passage tomb aligned so that sunlight illuminates the inner chamber on the winter solstice.', category: 'science' },
      { order: 3, name: 'Stonehenge', country: 'England', latitude: 51.1789, longitude: -1.8262, description: 'The heel stone aligns with the midsummer sunrise, suggesting this 5,000-year-old monument was an astronomical calendar.', category: 'science' },
      { order: 4, name: 'Chichen Itza (El Castillo)', country: 'Mexico', latitude: 20.6830, longitude: -88.5686, description: 'During equinoxes, shadows create a serpent descending the pyramid — ancient Maya astronomical precision.', category: 'science' },
      { order: 5, name: 'Abu Simbel', country: 'Egypt', latitude: 22.3360, longitude: 31.6256, description: 'Ramesses II aligned this temple so sunlight illuminates the inner sanctum on Feb 22 and Oct 22 each year.', category: 'science' },
    ]
  },
  {
    date: new Date('2025-02-11'), puzzleNumber: 42,
    locations: [
      { order: 1, name: 'Vienna (Congress of Vienna)', country: 'Austria', latitude: 48.2082, longitude: 16.3738, description: 'The 1814-1815 congress redrew Europe\'s map after Napoleon, maintaining peace for nearly a century.', category: 'politics' },
      { order: 2, name: 'Westphalia (Münster)', country: 'Germany', latitude: 51.9607, longitude: 7.6261, description: 'The 1648 Peace of Westphalia ended the Thirty Years\' War and established the modern concept of sovereignty.', category: 'politics' },
      { order: 3, name: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432, description: 'Home of the Red Cross (1863), League of Nations (1920), and UN European headquarters.', category: 'politics' },
      { order: 4, name: 'The Hague', country: 'Netherlands', latitude: 52.0705, longitude: 4.3007, description: 'Seat of the International Court of Justice and International Criminal Court.', category: 'politics' },
      { order: 5, name: 'Nuremberg', country: 'Germany', latitude: 49.4521, longitude: 11.0767, description: 'The 1945-1946 war crimes trials here established the principle that individuals are accountable under international law.', category: 'politics' },
    ]
  },
  {
    date: new Date('2025-02-12'), puzzleNumber: 43,
    locations: [
      { order: 1, name: 'Victoria Falls', country: 'Zimbabwe', latitude: -17.9243, longitude: 25.8572, description: 'David Livingstone became the first European to see these falls in 1855, calling them \'the most wonderful sight in Africa.\'', category: 'exploration' },
      { order: 2, name: 'Source of the Nile (Jinja)', country: 'Uganda', latitude: 0.4244, longitude: 33.1889, description: 'John Hanning Speke identified this as the Nile\'s source in 1858, ending centuries of speculation.', category: 'exploration' },
      { order: 3, name: 'Timbuktu', country: 'Mali', latitude: 16.7666, longitude: -3.0026, description: 'European explorers risked death to reach this legendary city of gold and Islamic scholarship.', category: 'exploration' },
      { order: 4, name: 'Ujiji', country: 'Tanzania', latitude: -4.9189, longitude: 29.6767, description: '\'Dr. Livingstone, I presume?\' — Stanley found the lost missionary here on November 10, 1871.', category: 'exploration' },
      { order: 5, name: 'Great Rift Valley (Olduvai)', country: 'Tanzania', latitude: -2.9927, longitude: 35.3533, description: 'The Leakeys\' fossil discoveries here rewrote human evolution, pushing our origins back millions of years.', category: 'discovery' },
    ]
  },
  {
    date: new Date('2025-02-13'), puzzleNumber: 44,
    locations: [
      { order: 1, name: 'Potala Palace', country: 'China', latitude: 29.6577, longitude: 91.1172, description: 'Winter palace of the Dalai Lamas since 1649, perched at 3,700m in Lhasa, Tibet.', category: 'culture' },
      { order: 2, name: 'Shwedagon Pagoda', country: 'Myanmar', latitude: 16.8714, longitude: 96.1498, description: 'Golden stupa said to contain relics of the four previous Buddhas, over 2,600 years old.', category: 'culture' },
      { order: 3, name: 'Sigiriya', country: 'Sri Lanka', latitude: 7.9571, longitude: 80.7600, description: 'A 5th-century fortress built atop a 200m rock column by King Kashyapa as an impregnable palace.', category: 'culture' },
      { order: 4, name: 'Hampi', country: 'India', latitude: 15.3350, longitude: 76.4600, description: 'Ruins of Vijayanagara, once one of the richest cities in the world before its destruction in 1565.', category: 'culture' },
      { order: 5, name: 'Prambanan', country: 'Indonesia', latitude: -7.7520, longitude: 110.4914, description: 'The largest Hindu temple complex in Indonesia, built in the 9th century with 240 temples.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-02-14'), puzzleNumber: 45,
    locations: [
      { order: 1, name: 'Champs-Élysées', country: 'France', latitude: 48.8698, longitude: 2.3076, description: 'Paris was liberated along this avenue on August 25, 1944, after four years of Nazi occupation.', category: 'war' },
      { order: 2, name: 'Reichstag', country: 'Germany', latitude: 52.5186, longitude: 13.3762, description: 'Soviet soldiers raised their flag here on April 30, 1945, symbolizing Nazi Germany\'s defeat.', category: 'war' },
      { order: 3, name: 'Remagen Bridge', country: 'Germany', latitude: 50.5783, longitude: 7.2282, description: 'The last Rhine bridge captured intact in March 1945, allowing Allied forces into the German heartland.', category: 'battle' },
      { order: 4, name: 'Dresden', country: 'Germany', latitude: 51.0504, longitude: 13.7373, description: 'The controversial firebombing of February 1945 killed 25,000 and destroyed the baroque city center.', category: 'war' },
      { order: 5, name: 'Auschwitz Gate', country: 'Poland', latitude: 50.0274, longitude: 19.2033, description: 'The \'Arbeit macht frei\' gate is now a memorial to 1.1 million victims of the Holocaust.', category: 'war' },
    ]
  },
  {
    date: new Date('2025-02-15'), puzzleNumber: 46,
    locations: [
      { order: 1, name: 'Volta Region (Akosombo Dam)', country: 'Ghana', latitude: 6.3006, longitude: 0.0475, description: 'Created the world\'s largest artificial lake by surface area when completed in 1965.', category: 'science' },
      { order: 2, name: 'Aswan High Dam', country: 'Egypt', latitude: 23.9706, longitude: 32.8783, description: 'Completed in 1970, it controls the Nile\'s flooding but displaced 100,000 Nubians.', category: 'science' },
      { order: 3, name: 'Itaipu Dam', country: 'Brazil', latitude: -25.4083, longitude: -54.5894, description: 'Joint Brazil-Paraguay project that was the world\'s largest hydroelectric dam until Three Gorges.', category: 'science' },
      { order: 4, name: 'Grand Coulee Dam', country: 'USA', latitude: 47.9555, longitude: -118.9823, description: 'The largest concrete structure in the U.S., generating power for the Manhattan Project during WWII.', category: 'science' },
      { order: 5, name: 'Aral Sea', country: 'Kazakhstan', latitude: 45.0000, longitude: 60.0000, description: 'Once the 4th largest lake, Soviet irrigation projects shrank it by 90% — one of humanity\'s worst ecological disasters.', category: 'disaster' },
    ]
  },
  {
    date: new Date('2025-02-16'), puzzleNumber: 47,
    locations: [
      { order: 1, name: 'Île de la Cité', country: 'France', latitude: 48.8554, longitude: 2.3473, description: 'The birthplace of Paris, where Roman Lutetia stood and where Notre-Dame was built beginning 1163.', category: 'culture' },
      { order: 2, name: 'Acropolis', country: 'Greece', latitude: 37.9715, longitude: 23.7267, description: 'The Parthenon atop this hill has symbolized democracy and Western civilization since 447 BC.', category: 'culture' },
      { order: 3, name: 'Colosseum', country: 'Italy', latitude: 41.8902, longitude: 12.4922, description: 'The 50,000-seat amphitheater hosted gladiatorial combat for over 400 years after opening in 80 AD.', category: 'culture' },
      { order: 4, name: 'Great Pyramid of Giza', country: 'Egypt', latitude: 29.9792, longitude: 31.1342, description: 'Built around 2560 BC, it remained the tallest human-made structure for over 3,800 years.', category: 'culture' },
      { order: 5, name: 'Leaning Tower of Pisa', country: 'Italy', latitude: 43.7230, longitude: 10.3966, description: 'Construction began in 1173; the lean started immediately due to soft ground, yet it stands 850 years later.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-02-17'), puzzleNumber: 48,
    locations: [
      { order: 1, name: 'Roswell', country: 'USA', latitude: 33.3943, longitude: -104.5230, description: 'The 1947 crash of an alleged UFO here sparked decades of conspiracy theories about extraterrestrial life.', category: 'mystery' },
      { order: 2, name: 'Area 51', country: 'USA', latitude: 37.2350, longitude: -115.8111, description: 'Classified U.S. Air Force facility whose secrecy fuels UFO and alien conspiracy theories.', category: 'mystery' },
      { order: 3, name: 'Loch Ness', country: 'Scotland', latitude: 57.3229, longitude: -4.4244, description: 'Reports of a large creature in this deep Scottish lake date back to the 6th century.', category: 'mystery' },
      { order: 4, name: 'Bermuda Triangle (San Juan vertex)', country: 'Puerto Rico', latitude: 18.4655, longitude: -66.1057, description: 'One vertex of the infamous triangle where ships and planes have mysteriously vanished.', category: 'mystery' },
      { order: 5, name: 'Tunguska', country: 'Russia', latitude: 60.8860, longitude: 101.8940, description: 'The 1908 explosion that flattened 80 million trees remains debated — asteroid, comet, or something else?', category: 'mystery' },
    ]
  },
  {
    date: new Date('2025-02-18'), puzzleNumber: 49,
    locations: [
      { order: 1, name: 'Mount Olympus', country: 'Greece', latitude: 40.0859, longitude: 22.3583, description: 'Home of the twelve Olympian gods in Greek mythology, at 2,917m Greece\'s highest peak.', category: 'culture' },
      { order: 2, name: 'Troy', country: 'Turkey', latitude: 39.9573, longitude: 26.2389, description: 'Homer\'s legendary city, once thought mythical until Heinrich Schliemann excavated it in the 1870s.', category: 'discovery' },
      { order: 3, name: 'Delphi', country: 'Greece', latitude: 38.4824, longitude: 22.5010, description: 'The Oracle at Delphi was consulted by kings and commoners for over 1,000 years in ancient Greece.', category: 'culture' },
      { order: 4, name: 'Knossos', country: 'Greece', latitude: 35.2978, longitude: 25.1628, description: 'Capital of Minoan civilization and legendary site of the Minotaur\'s labyrinth, destroyed around 1450 BC.', category: 'culture' },
      { order: 5, name: 'Mycenae', country: 'Greece', latitude: 37.7308, longitude: 22.7564, description: 'Agamemnon\'s legendary kingdom, whose Lion Gate (1250 BC) is Europe\'s oldest monumental sculpture.', category: 'culture' },
    ]
  },
  {
    date: new Date('2025-02-19'), puzzleNumber: 50,
    locations: [
      { order: 1, name: 'Kennedy Space Center (Pad 39A)', country: 'USA', latitude: 28.6082, longitude: -80.6040, description: 'Apollo 11 launched from this pad on July 16, 1969, carrying the first humans to walk on the Moon.', category: 'science' },
      { order: 2, name: 'Tranquility Base', country: 'Moon', latitude: 0.6875, longitude: 23.4333, description: 'Neil Armstrong\'s first words: \'That\'s one small step for man, one giant leap for mankind\' — July 20, 1969.', category: 'science' },
      { order: 3, name: 'Star City', country: 'Russia', latitude: 55.8817, longitude: 38.1217, description: 'The cosmonaut training center where Yuri Gagarin prepared for humanity\'s first spaceflight in 1961.', category: 'science' },
      { order: 4, name: 'Guiana Space Centre', country: 'French Guiana', latitude: 5.2322, longitude: -52.7693, description: 'Launch site of the James Webb Space Telescope on December 25, 2021, peering back to the universe\'s dawn.', category: 'science' },
      { order: 5, name: 'Wenchang', country: 'China', latitude: 19.6145, longitude: 110.9510, description: 'China\'s newest spaceport, launching modules for the Tiangong space station since 2020.', category: 'science' },
    ]
  },
]

export default extraPuzzles