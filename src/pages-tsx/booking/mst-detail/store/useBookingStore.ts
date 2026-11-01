import { create } from "zustand";
import type { Booking } from "../types";

interface BookingStore {
  booking: Booking | null;
  setBooking: (booking: Booking) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  booking: null,
  setBooking: (booking) => set({ booking }),
  resetBooking: () => set({ booking: null }),
}));
