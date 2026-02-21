import React, { createContext, useContext, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────
export type SchedulingStatus = "Proposed" | "Reserved" | "Confirmed" | "Completed";

export interface AvailabilitySlot {
  id: string;
  day: string;        // e.g. "Tue, Feb 24"
  date: string;       // ISO "2026-02-24"
  timeRange: string;  // "6:00 – 8:00 PM"
  available: boolean; // false once locked
}

export interface Opportunity {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  contactPerson: string;
  deliverables: string[];
  instructions: string;
  status: "New" | "Slot Selected" | "Confirmed";
  availabilitySlots: AvailabilitySlot[];
  selectedSlotId?: string;
  creatorNote?: string;
}

export interface ScheduledVisit {
  id: string;
  opportunityId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  contactPerson: string;
  creatorName: string;
  creatorHandle: string;
  date: string;
  time: string;
  status: SchedulingStatus;
  deliverables: string[];
  notes: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

// ── Initial data ───────────────────────────────────────────────────
const initialOpportunities: Opportunity[] = [
  {
    id: "opp1",
    restaurantName: "Lebanese Grill",
    restaurantAddress: "810 West Ave",
    restaurantCity: "Austin, TX 78701",
    contactPerson: "Ahmad Khoury",
    deliverables: ["1 IG Reel", "2 Stories"],
    instructions: "Focus on the mezze platter and grill section. Tag @lebanese_grill_atx.",
    status: "New",
    availabilitySlots: [
      { id: "s1", day: "Tue, Feb 24", date: "2026-02-24", timeRange: "6:00 – 8:00 PM", available: true },
      { id: "s2", day: "Wed, Feb 25", date: "2026-02-25", timeRange: "12:00 – 2:00 PM", available: true },
      { id: "s3", day: "Thu, Feb 26", date: "2026-02-26", timeRange: "7:00 – 9:00 PM", available: true },
    ],
  },
  {
    id: "opp2",
    restaurantName: "Coastal Tacos",
    restaurantAddress: "220 South Lamar Blvd",
    restaurantCity: "Austin, TX 78704",
    contactPerson: "Maria Delgado",
    deliverables: ["1 TikTok Video", "1 Reel", "2 Stories"],
    instructions: "Highlight the shrimp tacos and house margarita. Casual vibe, no dress code.",
    status: "New",
    availabilitySlots: [
      { id: "s4", day: "Mon, Mar 2", date: "2026-03-02", timeRange: "12:00 – 2:00 PM", available: true },
      { id: "s5", day: "Wed, Mar 4", date: "2026-03-04", timeRange: "5:00 – 7:00 PM", available: true },
      { id: "s6", day: "Fri, Mar 6", date: "2026-03-06", timeRange: "6:00 – 8:00 PM", available: true },
    ],
  },
  {
    id: "opp3",
    restaurantName: "Spice Route",
    restaurantAddress: "1400 Congress Ave",
    restaurantCity: "Austin, TX 78701",
    contactPerson: "Deepa Nair",
    deliverables: ["1 Reel", "3 Stories"],
    instructions: "Tasting menu walkthrough. Chef will prepare a special 5-course experience.",
    status: "Slot Selected",
    availabilitySlots: [
      { id: "s7", day: "Sat, Mar 1", date: "2026-03-01", timeRange: "7:00 – 9:00 PM", available: false },
      { id: "s8", day: "Sun, Mar 2", date: "2026-03-02", timeRange: "12:00 – 2:00 PM", available: true },
      { id: "s9", day: "Tue, Mar 4", date: "2026-03-04", timeRange: "6:00 – 8:00 PM", available: true },
    ],
    selectedSlotId: "s7",
    creatorNote: "I'll arrive around 6:45 PM. Looking forward to it!",
  },
];

const initialScheduledVisits: ScheduledVisit[] = [
  {
    id: "sv1",
    opportunityId: "opp3",
    restaurantName: "Spice Route",
    restaurantAddress: "1400 Congress Ave",
    restaurantCity: "Austin, TX 78701",
    contactPerson: "Deepa Nair",
    creatorName: "Mia Rodriguez",
    creatorHandle: "@mia.eats.atx",
    date: "2026-03-01",
    time: "7:00 – 9:00 PM",
    status: "Reserved",
    deliverables: ["1 Reel", "3 Stories"],
    notes: "I'll arrive around 6:45 PM. Looking forward to it!",
  },
];

const initialNotifications: Notification[] = [
  { id: "n1", text: "New opportunity available: Lebanese Grill", time: "1 hour ago", read: false },
  { id: "n2", text: "New opportunity available: Coastal Tacos", time: "3 hours ago", read: false },
  { id: "n3", text: "Your slot is confirmed at Spice Route", time: "1 day ago", read: true },
  { id: "n4", text: "Message from Sarah Mitchell", time: "1 day ago", read: true },
];

// ── Context ────────────────────────────────────────────────────────
interface SchedulingContextValue {
  opportunities: Opportunity[];
  scheduledVisits: ScheduledVisit[];
  notifications: Notification[];
  unreadCount: number;
  reserveSlot: (opportunityId: string, slotId: string, note: string) => ScheduledVisit;
  getConflicts: (date: string) => string[];
}

const SchedulingContext = createContext<SchedulingContextValue | null>(null);

export const useScheduling = () => {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error("useScheduling must be inside SchedulingProvider");
  return ctx;
};

export const SchedulingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>(initialScheduledVisits);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Check for existing visits on a given date (creator's own visits)
  const getConflicts = useCallback(
    (date: string): string[] => {
      const existing = [
        // from creator mock data (static)
        ...([
          { date: "2026-02-25", name: "The Olive Garden Kitchen" },
          { date: "2026-03-15", name: "The Olive Garden Kitchen" },
          { date: "2026-03-08", name: "Sakura Bistro" },
        ].filter((v) => v.date === date).map((v) => v.name)),
        // from scheduled visits
        ...scheduledVisits.filter((v) => v.date === date).map((v) => v.restaurantName),
      ];
      return existing;
    },
    [scheduledVisits],
  );

  const reserveSlot = useCallback(
    (opportunityId: string, slotId: string, note: string): ScheduledVisit => {
      const opp = opportunities.find((o) => o.id === opportunityId)!;
      const slot = opp.availabilitySlots.find((s) => s.id === slotId)!;

      // Update opportunity
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? {
                ...o,
                status: "Slot Selected" as const,
                selectedSlotId: slotId,
                creatorNote: note,
                availabilitySlots: o.availabilitySlots.map((s) =>
                  s.id === slotId ? { ...s, available: false } : s,
                ),
              }
            : o,
        ),
      );

      const newVisit: ScheduledVisit = {
        id: `sv-${Date.now()}`,
        opportunityId,
        restaurantName: opp.restaurantName,
        restaurantAddress: opp.restaurantAddress,
        restaurantCity: opp.restaurantCity,
        contactPerson: opp.contactPerson,
        creatorName: "Mia Rodriguez",
        creatorHandle: "@mia.eats.atx",
        date: slot.date,
        time: slot.timeRange,
        status: "Reserved",
        deliverables: opp.deliverables,
        notes: note,
      };

      setScheduledVisits((prev) => [...prev, newVisit]);

      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          text: `You reserved ${slot.day} ${slot.timeRange} at ${opp.restaurantName}. Pending restaurant confirmation.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      return newVisit;
    },
    [opportunities],
  );

  return (
    <SchedulingContext.Provider
      value={{ opportunities, scheduledVisits, notifications, unreadCount, reserveSlot, getConflicts }}
    >
      {children}
    </SchedulingContext.Provider>
  );
};
