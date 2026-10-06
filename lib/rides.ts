export interface Ride {
  id: string;
  operator: string;
  rating: number;
  reviews: number;
  verified: boolean;
  vehicle: string;
  seatsLeft: number;
  price: number;
  booked: number;
  bookedBy: string[]; // initials, swap for avatar URLs later
}

// Mock data, replace with API data
export const RIDES: Ride[] = [
  { id: "greenline", operator: "Greenline Travels", rating: 4.8, reviews: 1300, verified: true, vehicle: "Luxury Bus (AC)", seatsLeft: 42, price: 18000, booked: 12, bookedBy: ["AO", "CE", "FB"] },
  { id: "metro", operator: "Metro Express", rating: 4.6, reviews: 642, verified: true, vehicle: "Executive Van (AC)", seatsLeft: 18, price: 20500, booked: 12, bookedBy: ["TA", "NK"] },
  { id: "swift", operator: "SwiftRides", rating: 4.4, reviews: 642, verified: true, vehicle: "Bus (AC)", seatsLeft: 45, price: 16500, booked: 9, bookedBy: ["MI", "OS"] },
];