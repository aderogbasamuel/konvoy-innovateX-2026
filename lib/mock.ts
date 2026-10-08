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

export interface VerificationItem {
  label: string;
  detail: string;
  verified: boolean;
}

export const VERIFICATION: VerificationItem[] = [
  { label: "Operating licence", detail: "Checked 12 Sep 2026, valid to 11 Sep 2027", verified: true },
  { label: "Vehicle inspection", detail: "Checked 12 Sep 2026, valid to 11 Mar 2027", verified: true },
  { label: "Driver ID", detail: "Checked 12 Sep 2026", verified: true },
];

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string; // YYYY-MM-DD
}

export const REVIEWS: Review[] = [
  { id: "r1", name: "Amina", rating: 5, text: "Left on time and the driver was careful with my luggage.", date: "2026-09-02" },
  { id: "r2", name: "Chidi", rating: 4, text: "Comfortable bus. Arrived about 40 minutes later than planned because of traffic.", date: "2026-08-19" },
  { id: "r3", name: "Tobi", rating: 5, text: "Felt safe the whole way, and my family could follow the trip.", date: "2026-07-30" },
];

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Trip reminder", body: "Your trip to Kaduna is on 27 Oct. Check your seat and share your tracking link.", time: "2 hours ago", read: false },
  { id: "n2", title: "Payment received", body: "Your payment to Greenline Travels went through.", time: "Yesterday", read: false },
  { id: "n3", title: "New message in your squad", body: "Chidi: Meeting at 5:30 am so we do not rush.", time: "2 days ago", read: true },
  { id: "n4", title: "Zainab replied", body: "Your State Buddy answered your question.", time: "3 days ago", read: true },
];