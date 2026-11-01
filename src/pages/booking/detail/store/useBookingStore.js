import { create } from "zustand";
export const useBookingStore = create((set) => ({
    booking: null,
    setBooking: (booking) => set({ booking }),
    resetBooking: () => set({ booking: null }),
}));
