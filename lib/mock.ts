// Mock data for the app screens. Replace each export with the matching API call (see docs/API.md).

export interface Trip {
  id: string;
  rideId: string;
  operator: string;
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  seat: number;
  price: number;
  status: "upcoming" | "past";
}

export const TRIPS: Trip[] = [
  { id: "bk_1", rideId: "greenline", operator: "Greenline Travels", from: "Lagos", to: "Kaduna", date: "2026-10-27", seat: 12, price: 18000, status: "upcoming" },
  { id: "bk_0", rideId: "swift", operator: "SwiftRides", from: "Kaduna", to: "Lagos", date: "2026-03-14", seat: 5, price: 16500, status: "past" },
];

export interface Member {
  id: string;
  firstName: string;
  initials: string;
  optedIn: boolean; // only opted-in members show their first name
}

export const SQUAD: Member[] = [
  { id: "m1", firstName: "Amina", initials: "AB", optedIn: true },
  { id: "m2", firstName: "Chidi", initials: "CO", optedIn: true },
  { id: "m3", firstName: "Tobi", initials: "TA", optedIn: true },
  { id: "m4", firstName: "Hauwa", initials: "HM", optedIn: false },
  { id: "m5", firstName: "Emeka", initials: "EN", optedIn: false },
  { id: "m6", firstName: "Ifeoma", initials: "IE", optedIn: true },
];

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  mine?: boolean;
}

export const CHAT: ChatMessage[] = [
  { id: "c1", from: "Amina", text: "Hi everyone, is anyone leaving from Ikeja park?" },
  { id: "c2", from: "Chidi", text: "I am. Meeting at 5:30 am so we do not rush." },
  { id: "c3", from: "Tobi", text: "Same here. I will carry a power bank for anyone who needs it." },
];

export interface Buddy {
  id: string;
  firstName: string;
  state: string;
  bio: string;
  languages: string[];
  whatsapp: string; // digits only, released after the first message
}

export const BUDDIES: Buddy[] = [
  { id: "b1", firstName: "Zainab", state: "Kaduna", bio: "Serving in Kaduna South. Happy to explain camp registration and the first week.", languages: ["English", "Hausa"], whatsapp: "2348000000001" },
  { id: "b2", firstName: "Samson", state: "Kaduna", bio: "Knows the best places to stay near camp and how transport works around town.", languages: ["English", "Yoruba"], whatsapp: "2348000000002" },
  { id: "b3", firstName: "Grace", state: "Kaduna", bio: "Ask me about PPA placement and what to pack for camp.", languages: ["English"], whatsapp: "2348000000003" },
  { id: "b4", firstName: "Tunde", state: "Oyo", bio: "Serving in Ibadan. Can help with the camp journey and accommodation.", languages: ["English", "Yoruba"], whatsapp: "2348000000004" },
  { id: "b5", firstName: "Ngozi", state: "Lagos", bio: "Serving in Lagos Mainland. Ask me about getting around and PPA hunting.", languages: ["English", "Igbo"], whatsapp: "2348000000005" },
];