// MST Create Booking — Step 4 Nominal Roll: mock data + the row shape (moved out of MSTNominalRollStep).
export interface MSTRollTrainee {
  id:          string;
  rank:        string;
  name:        string;
  svcId:        string;
  battalion:   string;
  company:     string;
  section:     string;
  appointment: string;
  platoon:     string;
  roles:       string;
  batch:       string;
  course:      string;
  unit:        string;
  callSign:    string;
  /** "Last Updated On" — Figma shows a single "17 January 2025" line. */
  updatedOn:   string;
}

type Seed = Omit<MSTRollTrainee, "id" | "updatedOn">;

const SEED: Seed[] = [
  { rank: "CPL", name: "Roger Botosh",    svcId: "*****212A", battalion: "1st", company: "AA", section: "1", appointment: "-", platoon: "Platoon 1", roles: "VO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11Z" },
  { rank: "PTE", name: "Davis Culhane",   svcId: "*****212A", battalion: "2nd", company: "BB", section: "2", appointment: "-", platoon: "Platoon 1", roles: "VC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "MAJ", name: "Kadin Torff",     svcId: "*****212A", battalion: "3rd", company: "CC", section: "3", appointment: "-", platoon: "Platoon 1", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11" },
  { rank: "WO",  name: "Craig Septimus",  svcId: "*****212A", battalion: "5th", company: "DD", section: "4", appointment: "-", platoon: "Platoon 1", roles: "VO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "SGT", name: "Roger Septimus",  svcId: "*****212A", battalion: "8th", company: "AA", section: "5", appointment: "-", platoon: "Platoon 1", roles: "SC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11A" },
  { rank: "CPL", name: "Jaxson Donin",    svcId: "*****212A", battalion: "9th", company: "BB", section: "1", appointment: "-", platoon: "Platoon 1", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11SZ" },
  { rank: "PTE", name: "James Lubin",     svcId: "*****212A", battalion: "1st", company: "CC", section: "2", appointment: "-", platoon: "Platoon 1", roles: "SO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "MAJ", name: "Jakob Vaccaro",   svcId: "*****212A", battalion: "2nd", company: "DD", section: "3", appointment: "-", platoon: "Platoon 1", roles: "SC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11S" },
  { rank: "WO",  name: "Ruben Calzoni",   svcId: "*****212A", battalion: "3rd", company: "AA", section: "4", appointment: "-", platoon: "Platoon 1", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "SGT", name: "Tyrone Whitfield",svcId: "*****212B", battalion: "1st", company: "BB", section: "5", appointment: "-", platoon: "Platoon 2", roles: "VO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "11B" },
  { rank: "CPL", name: "Marcus Chen",     svcId: "*****212B", battalion: "2nd", company: "CC", section: "1", appointment: "-", platoon: "Platoon 2", roles: "VC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "PTE", name: "Alvin Tan",       svcId: "*****212B", battalion: "3rd", company: "DD", section: "2", appointment: "-", platoon: "Platoon 2", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "12" },
  { rank: "MAJ", name: "Wei Ming Lim",    svcId: "*****212B", battalion: "5th", company: "AA", section: "3", appointment: "-", platoon: "Platoon 2", roles: "SC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "WO",  name: "Iskandar Shah",   svcId: "*****212B", battalion: "8th", company: "BB", section: "4", appointment: "-", platoon: "Platoon 2", roles: "SO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "12A" },
  { rank: "SGT", name: "Rahul Patel",     svcId: "*****212B", battalion: "9th", company: "CC", section: "5", appointment: "-", platoon: "Platoon 2", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "CPL", name: "Dylan Ong",       svcId: "*****212C", battalion: "1st", company: "DD", section: "1", appointment: "-", platoon: "Platoon 3", roles: "VO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "13" },
  { rank: "PTE", name: "Brandon Lee",     svcId: "*****212C", battalion: "2nd", company: "AA", section: "2", appointment: "-", platoon: "Platoon 3", roles: "VC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "MAJ", name: "Justin Koh",      svcId: "*****212C", battalion: "3rd", company: "BB", section: "3", appointment: "-", platoon: "Platoon 3", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "13A" },
  { rank: "WO",  name: "Nathan Yeo",      svcId: "*****212C", battalion: "5th", company: "CC", section: "4", appointment: "-", platoon: "Platoon 3", roles: "SC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "SGT", name: "Ethan Ho",        svcId: "*****212C", battalion: "8th", company: "DD", section: "5", appointment: "-", platoon: "Platoon 3", roles: "SO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "13S" },
  { rank: "CPL", name: "Samuel Ng",       svcId: "*****212D", battalion: "9th", company: "AA", section: "1", appointment: "-", platoon: "Platoon 4", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "PTE", name: "Aaron Lim",       svcId: "*****212D", battalion: "1st", company: "BB", section: "2", appointment: "-", platoon: "Platoon 4", roles: "VO", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "14" },
  { rank: "MAJ", name: "Zachary Tan",     svcId: "*****212D", battalion: "2nd", company: "CC", section: "3", appointment: "-", platoon: "Platoon 4", roles: "VC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
  { rank: "WO",  name: "Gabriel Wong",    svcId: "*****212D", battalion: "3rd", company: "DD", section: "4", appointment: "-", platoon: "Platoon 4", roles: "TC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "14A" },
  { rank: "SGT", name: "Caleb Chan",      svcId: "*****212D", battalion: "5th", company: "AA", section: "5", appointment: "-", platoon: "Platoon 4", roles: "SC", batch: "05/26", course: "IOCC_1(TRX)", unit: "05SIR", callSign: "-" },
];

export const SEED_UPDATED_ON = "17 January 2025";

/** The mock roll every IOS tab starts with (first `count` rows). */
export const seedRoll = (count: number, prefix: string): MSTRollTrainee[] =>
  SEED.slice(0, count).map((t, i) => ({ ...t, id: `${prefix}-${i}`, updatedOn: SEED_UPDATED_ON }));

export const MST_RANKS = ["PTE", "LCP", "CPL", "CFC", "3SG", "2SG", "1SG", "SGT", "SSG", "MSG", "3WO", "2WO", "1WO", "WO", "MWO", "SWO", "CWO", "MAJ"];

/** SERVICE_IDs in the seed are already masked ("*****212A"); compare on the masked form. */
export const maskSvcId = (n: string) => (n.startsWith("*") ? n : `*****${n.slice(-4)}`);

/** Today as "16 October 2026" — Figma's "Last Updated On" format. */
export const todayLong = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
