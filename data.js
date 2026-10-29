// Demo data per country. Everyone here is made up.
// Amounts are in the country's money. `dueIn` is days from today, so the demo always looks current.
// `funded` is how much other (pretend) donors already gave to that bill.

window.MANNY_BILL_TYPES = {
  electricity: { icon: '⚡', group: 'bills' },
  water:       { icon: '💧', group: 'bills' },
  internet:    { icon: '📶', group: 'bills' },
  rent:        { icon: '🏠', group: 'home' },
  repair:      { icon: '🔨', group: 'home' },
  tuition:     { icon: '🎓', group: 'school' },
  hospital:    { icon: '🏥', group: 'health' },
  medicine:    { icon: '💊', group: 'health' },
  other:       { icon: '🧾', group: 'bills' }
};

window.MANNY_COUNTRIES = {
  PH: {
    code: 'PH', symbol: '₱', locale: 'en-PH',
    presets: [50, 100, 500, 1000], firstAmount: 500, wallet: 5000, topUp: 1000, amountPh: '2500',
    namePh: 'Juan',
    idTypes: ['PhilSys National ID', "Driver's License", 'UMID', 'Passport', 'Postal ID', "Voter's ID", 'PRC ID', 'Senior Citizen ID'],
    places: ['Quezon City', 'Manila', 'Caloocan', 'Pasig', 'Taguig', 'Cebu City', 'Davao City', 'Iloilo City', 'Bacolod City', 'Cagayan de Oro', 'Baguio City', 'Tacloban City', 'Zamboanga City', 'General Santos', 'Angeles, Pampanga', 'Batangas City', 'Naga City', 'Legazpi City', 'Dumaguete', 'Puerto Princesa'],
    donorNames: [null, null, 'Tita Baby', 'Kuya Jun', null, 'R. Santos', 'Ate Liza'],
    billers: {
      electricity: ['Meralco', 'VECO', 'Davao Light', 'MORE Power', 'BENECO', 'CEPALCO', 'CENECO'],
      water: ['Maynilad', 'Manila Water', 'Local water district'],
      internet: ['PLDT Home', 'Converge', 'Globe At Home', 'Sky Fiber'],
      rent: ['Landlord (verified account)'],
      repair: ['Hardware supplier'],
      tuition: ['School cashier'],
      hospital: ['Hospital billing office'],
      medicine: ['Mercury Drug', 'Watsons', 'Rose Pharmacy', 'Generika'],
      other: []
    },
    profiles: [
      {
        id: 'p1', name: 'Marites', age: 42, city: 'Tondo, Manila', job: 'Runs a small sari-sari store', household: 6, tone: 0,
        headline: 'Puputulan na kami ng kuryente this week',
        story: 'Hi po! Ako si Marites, may 4 na anak. Humina ang tindahan namin since nagsara yung factory sa kanto, so nahuli kami sa Meralco. May disconnection notice na kami. Yung bunso ko may hika, kailangan namin ng electric fan at nebulizer. Kahit konting tulong lang po, malaking bagay na.',
        bills: [
          { id: 'p1b1', type: 'electricity', biller: 'Meralco', acct: '4821', amount: 3480, dueIn: 3, funded: 1200, note: 'Disconnection notice' },
          { id: 'p1b2', type: 'water', biller: 'Maynilad', acct: '0937', amount: 860, dueIn: 9, funded: 0 }
        ],
        updates: [],
        thanks: 'Maraming maraming salamat po! Hindi na kami mapuputulan. God bless po sa inyo at sa pamilya niyo 🙏'
      },
      {
        id: 'p2', name: 'Arnel', age: 35, city: 'Cebu City', job: 'Tricycle driver', household: 4, tone: 1,
        headline: 'My daughter is in the hospital with dengue',
        story: 'Na-confine ang anak kong si Mika (7) for dengue, 5 days na. PhilHealth covered part of it pero may balance pa kami bago siya ma-discharge. Ang kita ko sa pamamasada ay ₱500–₱700 a day. Nagbenta na kami ng TV para sa gamot. Salamat po sa kahit anong tulong.',
        bills: [
          { id: 'p2b1', type: 'hospital', biller: 'Hospital billing office', acct: '2210', amount: 38500, dueIn: 2, funded: 14200, note: 'Balance after PhilHealth' },
          { id: 'p2b2', type: 'medicine', biller: 'Rose Pharmacy', acct: '—', amount: 4200, dueIn: 5, funded: 900 }
        ],
        updates: [{ daysAgo: 1, text: 'Update: tumaas na platelet count ni Mika! Salamat sa mga tumulong na 🙏' }],
        thanks: 'Salamat po talaga! Makakauwi na si Mika soon. Hindi ko po kayo makakalimutan.'
      },
      {
        id: 'p3', name: 'Princess', age: 19, city: 'Iloilo City', job: 'Nursing student, 2nd year', household: 5, tone: 2,
        headline: 'One semester away from not dropping out',
        story: 'First in our family to go to college. Si Papa ay construction worker at nawalan ng project. I work part-time sa milk tea shop pero kulang pa rin for tuition this sem. Kung hindi mabayaran, hindi ako makaka-take ng prelims. Gusto ko lang po makatapos para matulungan ko sila.',
        bills: [
          { id: 'p3b1', type: 'tuition', biller: 'School cashier', acct: '1186', amount: 18750, dueIn: 6, funded: 9400, note: '2nd semester balance' },
          { id: 'p3b2', type: 'electricity', biller: 'MORE Power', acct: '3392', amount: 1240, dueIn: 12, funded: 0 }
        ],
        updates: [{ daysAgo: 3, text: 'Halfway na po! 14 donors so far. Nag-aaral ako nang mabuti para sa inyo 📚' }],
        thanks: 'Thank you so much po! Makakapag-exam na ako. Promise, gagalingan ko po 💚'
      },
      {
        id: 'p4', name: 'Lola Remedios', age: 71, city: 'Baguio City', job: 'Retired teacher', household: 2, tone: 3,
        headline: 'Maintenance meds para sa puso',
        story: 'Ako ay retired public school teacher. Maliit lang ang pension ko at inaalagaan ko ang apo ko. Kailangan ko ng gamot para sa high blood at puso araw-araw. Ngayong buwan, hindi umabot ang pension dahil nagpa-check up pa ako.',
        bills: [
          { id: 'p4b1', type: 'medicine', biller: 'Mercury Drug', acct: '—', amount: 2600, dueIn: 4, funded: 300, note: '1 month of maintenance meds' },
          { id: 'p4b2', type: 'electricity', biller: 'BENECO', acct: '7745', amount: 1150, dueIn: 10, funded: 0 }
        ],
        updates: [],
        thanks: 'Salamat sa iyo, anak. Ipagdarasal kita. Pagpalain ka ng Diyos.'
      },
      {
        id: 'p5', name: 'Ramon', age: 48, city: 'Davao City', job: 'Construction worker (laid off)', household: 5, tone: 4,
        headline: 'Laid off, 2 months behind on rent',
        story: 'Natapos na yung project namin at wala pang bagong trabaho for 2 months. May interview ako next week as warehouse helper. Ang problema, pinapaalis na kami kung hindi makakabayad ng upa. Kahit isang buwan lang po, para makahinga kami habang naghahanap ako.',
        bills: [
          { id: 'p5b1', type: 'rent', biller: 'Landlord (verified account)', acct: '5503', amount: 6000, dueIn: 1, funded: 2500, note: '1 month of rent' },
          { id: 'p5b2', type: 'electricity', biller: 'Davao Light', acct: '6120', amount: 1980, dueIn: 8, funded: 0 }
        ],
        updates: [],
        thanks: 'Maraming salamat, boss! Hindi na kami paaalisin. Pag nakabawi ako, ako naman ang tutulong.'
      },
      {
        id: 'p6', name: 'Joy', age: 29, city: 'Quezon City', job: 'Call center agent, single mom', household: 3, tone: 5,
        headline: 'Need my internet to keep my WFH job',
        story: 'Single mom of 2. I work from home night shift kasi walang mag-aalaga sa mga bata. Nagkasakit ako last month and na-unpaid leave, so na-late ako sa internet at kuryente. If maputol ang internet, mawawalan ako ng trabaho. Babawi po ako next cutoff.',
        bills: [
          { id: 'p6b1', type: 'internet', biller: 'PLDT Home', acct: '8814', amount: 1699, dueIn: 2, funded: 400, note: 'Needed for work' },
          { id: 'p6b2', type: 'electricity', biller: 'Meralco', acct: '2047', amount: 2150, dueIn: 7, funded: 0 }
        ],
        updates: [],
        thanks: 'Thank you po!! Hindi ako mawawalan ng work. You have no idea how much this means to me 😭💚'
      },
      {
        id: 'p7', name: 'Nestor', age: 56, city: 'Tacloban City', job: 'Fisherman', household: 7, tone: 6,
        headline: 'Typhoon took half our roof',
        story: 'Nasira ng bagyo ang kalahati ng bubong namin. Pag umuulan, basa lahat pati mga gamit ng mga apo ko sa school. Nakahanap ako ng hardware na magdedeliver ng yero at kahoy, ako na ang magkakabit kasama ng mga kapitbahay.',
        bills: [
          { id: 'p7b1', type: 'repair', biller: 'Hardware supplier', acct: '3301', amount: 12400, dueIn: 10, funded: 3100, note: 'GI sheets, lumber, nails' },
          { id: 'p7b2', type: 'electricity', biller: 'LEYECO II', acct: '9027', amount: 740, dueIn: 5, funded: 0 }
        ],
        updates: [],
        thanks: 'Salamat gid! May bubong na kami bago ang susunod na ulan. Daghang salamat!'
      },
      {
        id: 'p8', name: 'Aiza', age: 24, city: 'Cagayan de Oro', job: 'Sales clerk', household: 3, tone: 7,
        headline: "Keeping Mama's dialysis going",
        story: 'Ang Mama ko ay nagda-dialysis 2x a week. Ako lang ang may trabaho sa bahay. Malaking tulong ang PhilHealth pero may share pa rin kami bawat session, plus gamot. Ngayong buwan hindi na talaga kaya.',
        bills: [
          { id: 'p8b1', type: 'hospital', biller: 'Dialysis center', acct: '4410', amount: 11200, dueIn: 4, funded: 5600, note: '4 sessions, our share' },
          { id: 'p8b2', type: 'electricity', biller: 'CEPALCO', acct: '1572', amount: 1300, dueIn: 11, funded: 0 }
        ],
        updates: [{ daysAgo: 2, text: 'Natuloy po ang dialysis ni Mama this week. Salamat sa lahat 🙏' }],
        thanks: 'Salamat po! Tuloy-tuloy na ang dialysis ni Mama this month. Ipagdadasal ko po kayo.'
      },
      {
        id: 'p9', name: 'Carlo', age: 21, city: 'Bacolod City', job: 'Working student (IT)', household: 4, tone: 8,
        headline: 'Final year, last tuition balance',
        story: 'Graduating na po ako sa BS IT! Nagwo-work ako as freelance graphic artist at night. Kulang na lang ang huling balance para makakuha ako ng clearance at maka-graduate. Kailangan ko rin ng internet para sa capstone namin.',
        bills: [
          { id: 'p9b1', type: 'tuition', biller: 'School cashier', acct: '6634', amount: 9500, dueIn: 14, funded: 6100, note: 'Final balance for clearance' },
          { id: 'p9b2', type: 'internet', biller: 'Converge', acct: '0418', amount: 1500, dueIn: 6, funded: 0 }
        ],
        updates: [],
        thanks: 'Salamat kaayo! Makaka-graduate na ako. Isasama ko po kayo sa thank-you ng capstone namin 😄'
      },
      {
        id: 'p10', name: 'Tess', age: 63, city: 'San Fernando, Pampanga', job: 'Caring for her husband after a stroke', household: 2, tone: 9,
        headline: 'Therapy so my husband can walk again',
        story: 'Na-stroke ang asawa ko 3 months ago. Sabi ng doktor, kaya pa niyang makalakad ulit kung tuloy-tuloy ang therapy. Pareho kaming senior, at ubos na ang ipon namin. Bawat session ay may bayad, at kailangan pa niya ng 10 sessions.',
        bills: [
          { id: 'p10b1', type: 'hospital', biller: 'Rehab clinic', acct: '2258', amount: 7500, dueIn: 7, funded: 1500, note: '5 therapy sessions' },
          { id: 'p10b2', type: 'water', biller: 'Local water district', acct: '3349', amount: 540, dueIn: 9, funded: 0 }
        ],
        updates: [],
        thanks: 'Salamat, iho/iha. Tuloy ang therapy ni Pedro. Nakakahakbang na siya nang kaunti!'
      }
    ]
  },

  US: {
    code: 'US', symbol: '$', locale: 'en-US',
    presets: [5, 10, 25, 50], firstAmount: 25, wallet: 200, topUp: 50, amountPh: '150',
    namePh: 'Alex',
    idTypes: ["Driver's license", 'State ID', 'US passport', 'Permanent resident card', 'Military ID'],
    places: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Jacksonville, FL', 'Columbus, OH', 'Charlotte, NC', 'Detroit, MI', 'Atlanta, GA', 'Seattle, WA', 'Las Vegas, NV', 'Daly City, CA', 'Honolulu, HI', 'Tampa, FL', 'Fresno, CA'],
    donorNames: [null, null, 'Mike R.', 'Auntie Grace', null, 'J. Lee', 'The Garcias'],
    billers: {
      electricity: ['PG&E', 'Con Edison', 'Duke Energy', 'ComEd', 'Georgia Power', 'FPL', 'DTE Energy', 'Reliant'],
      water: ['City water utility'],
      internet: ['Xfinity', 'Spectrum', 'AT&T', 'Verizon Fios'],
      rent: ['Landlord (verified account)'],
      repair: ['Repair shop'],
      tuition: ['College bursar'],
      hospital: ['Hospital billing office'],
      medicine: ['CVS Pharmacy', 'Walgreens', 'Walmart Pharmacy'],
      other: ['Daycare center']
    },
    profiles: [
      {
        id: 'u1', name: 'Denise', age: 34, city: 'Detroit, MI', job: 'Nursing assistant', household: 4, tone: 2,
        headline: 'Shutoff notice, and winter is coming',
        story: "I work full time as a CNA, but my hours got cut in August and I fell behind on the gas and electric. Now there's a shutoff notice on the door. I have two kids and my mom lives with us. I've already set up a payment plan for next month. I just need to get through this one.",
        bills: [
          { id: 'u1b1', type: 'electricity', biller: 'DTE Energy', acct: '5531', amount: 412, dueIn: 3, funded: 120, note: 'Shutoff notice' },
          { id: 'u1b2', type: 'water', biller: 'City water utility', acct: '2290', amount: 96, dueIn: 10, funded: 0 }
        ],
        updates: [],
        thanks: "Thank you so much. The lights stay on and my kids won't be cold. I'll pay it forward, I promise."
      },
      {
        id: 'u2', name: 'Marcus', age: 41, city: 'Houston, TX', job: 'Warehouse worker (injured)', household: 3, tone: 4,
        headline: 'Hurt my back at work, rent is due',
        story: "I herniated a disc lifting at the warehouse. Workers' comp is taking weeks to start paying, and until it does I have nothing coming in. My landlord has been patient but says he can't wait past this month. Physical therapy is going well and I should be back on light duty soon.",
        bills: [
          { id: 'u2b1', type: 'rent', biller: 'Landlord (verified account)', acct: '7712', amount: 1150, dueIn: 2, funded: 400, note: "One month's rent" },
          { id: 'u2b2', type: 'electricity', biller: 'Reliant', acct: '3046', amount: 187, dueIn: 9, funded: 0 }
        ],
        updates: [{ daysAgo: 2, text: "Comp claim got approved! First check in 3 weeks. This month's rent is the last gap." }],
        thanks: "Man, thank you. You kept a roof over my family's head. I won't forget it."
      },
      {
        id: 'u3', name: 'Linda', age: 68, city: 'Tampa, FL', job: 'Retired school bus driver', household: 1, tone: 6,
        headline: "Insulin costs more than my groceries",
        story: "I'm type 1 diabetic and on Social Security. My plan changed this year and my insulin and pump supplies went way up until I hit the deductible. I've been stretching doses, which my doctor says I can't keep doing. I just need help getting to next month.",
        bills: [
          { id: 'u3b1', type: 'medicine', biller: 'Walgreens', acct: '—', amount: 315, dueIn: 4, funded: 60, note: 'Insulin + pump supplies' },
          { id: 'u3b2', type: 'electricity', biller: 'FPL', acct: '8820', amount: 142, dueIn: 11, funded: 0 }
        ],
        updates: [],
        thanks: 'Bless you, sweetheart. I can take my full dose again. Thank you from the bottom of my heart.'
      },
      {
        id: 'u4', name: 'Carlos', age: 27, city: 'Fresno, CA', job: 'Nursing student, works nights', household: 5, tone: 1,
        headline: "Can't register for spring until I pay",
        story: "I'm in the nursing program at community college and work night shifts at a grocery store. My financial aid got delayed because of a paperwork mix-up, and there's a hold on my account. If I can't clear it, I lose my spot in clinicals and have to wait a whole year.",
        bills: [
          { id: 'u4b1', type: 'tuition', biller: 'College bursar', acct: '4471', amount: 1280, dueIn: 12, funded: 540, note: 'Registration hold' },
          { id: 'u4b2', type: 'internet', biller: 'Xfinity', acct: '9031', amount: 79, dueIn: 6, funded: 0 }
        ],
        updates: [],
        thanks: "Thank you!! Hold is cleared and I'm registered for clinicals. Future nurse right here 🩺"
      },
      {
        id: 'u5', name: 'Ana', age: 45, city: 'Daly City, CA', job: 'Caregiver', household: 4, tone: 8,
        headline: 'ER bill after my son broke his arm',
        story: "My son broke his arm at basketball practice. Insurance covered some but our deductible is high, so we owe a lot. I'm a caregiver for an elderly couple, so my pay is hourly. Kaya po humihingi ako ng tulong. Even a little helps us not go to collections.",
        bills: [
          { id: 'u5b1', type: 'hospital', biller: 'Hospital billing office', acct: '6208', amount: 2350, dueIn: 14, funded: 900, note: 'ER visit + cast, after insurance' },
          { id: 'u5b2', type: 'electricity', biller: 'PG&E', acct: '1157', amount: 236, dueIn: 6, funded: 0 }
        ],
        updates: [{ daysAgo: 4, text: 'Cast comes off next week! Thank you to everyone who helped so far 🙏' }],
        thanks: 'Salamat po! Thank you so much. We are not going to collections. God bless you and your family.'
      },
      {
        id: 'u6', name: 'Jamal', age: 30, city: 'Atlanta, GA', job: 'Delivery driver', household: 2, tone: 3,
        headline: 'No car means no job',
        story: "I deliver for a living, and my transmission went out last week. The shop gave me a fair quote but I can't cover it, and every day it sits there is a day I can't work. If I can get the car back, I can catch up on everything else on my own.",
        bills: [
          { id: 'u6b1', type: 'repair', biller: 'Repair shop', acct: '3389', amount: 860, dueIn: 5, funded: 210, note: 'Transmission repair' },
          { id: 'u6b2', type: 'electricity', biller: 'Georgia Power', acct: '7640', amount: 168, dueIn: 8, funded: 0 }
        ],
        updates: [],
        thanks: "Car's fixed and I'm back on the road. Thank you, for real. You got me working again."
      },
      {
        id: 'u7', name: 'Brenda', age: 52, city: 'Charlotte, NC', job: 'Laid off after a plant closed', household: 2, tone: 5,
        headline: 'Need the internet to find a new job',
        story: "I worked at the same plant for 19 years until it closed. Unemployment helps but doesn't cover everything. Every job application is online now, and if they cut my internet I can't apply or do video interviews. I have two interviews next week.",
        bills: [
          { id: 'u7b1', type: 'internet', biller: 'Spectrum', acct: '5502', amount: 85, dueIn: 1, funded: 20, note: 'For job applications' },
          { id: 'u7b2', type: 'electricity', biller: 'Duke Energy', acct: '2214', amount: 298, dueIn: 7, funded: 50 }
        ],
        updates: [],
        thanks: "Thank you! I had my interview on video yesterday and it went great. Fingers crossed!"
      },
      {
        id: 'u8', name: 'Kayla', age: 23, city: 'Chicago, IL', job: 'Single mom, medical assistant', household: 2, tone: 7,
        headline: "If daycare drops us, I can't work",
        story: "I'm a medical assistant and a single mom to a 2-year-old. My childcare subsidy lapsed while they processed my renewal, and I owe the daycare for the weeks in between. They said they can't hold her spot past Friday. The renewal is approved now; I just need to cover the gap.",
        bills: [
          { id: 'u8b1', type: 'other', biller: 'Daycare center', acct: '8106', amount: 640, dueIn: 2, funded: 180, note: 'Gap while subsidy renewed' },
          { id: 'u8b2', type: 'electricity', biller: 'ComEd', acct: '4419', amount: 134, dueIn: 9, funded: 0 }
        ],
        updates: [],
        thanks: "Thank you thank you thank you. She gets to stay with her teachers and I get to keep my job 💛"
      }
    ]
  }
};
