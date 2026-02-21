import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { visits, CreatorVisit } from "@/data/mockPartnerData";
import { useScheduling, type ScheduledVisit } from "@/context/SchedulingContext";
import { X, CalendarPlus } from "lucide-react";

type UnifiedVisit = {
  id: string;
  creatorName: string;
  creatorHandle: string;
  date: string;
  time: string;
  status: string;
  deliverables: string[];
  notes: string;
};

const statusColor: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Completed: "bg-blue-100 text-blue-800 border-blue-200",
  Rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
  Reserved: "bg-amber-100 text-amber-800 border-amber-200",
};

const PartnerCalendar = () => {
  const { scheduledVisits } = useScheduling();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedVisit, setSelectedVisit] = useState<UnifiedVisit | null>(null);
  const [view, setView] = useState<"month" | "week">("month");

  // Merge mock partner visits with scheduled visits
  const allVisits: UnifiedVisit[] = [
    ...visits.map((v) => ({ ...v })),
    ...scheduledVisits.map((sv): UnifiedVisit => ({
      id: sv.id,
      creatorName: sv.creatorName,
      creatorHandle: sv.creatorHandle,
      date: sv.date,
      time: sv.time,
      status: sv.status,
      deliverables: sv.deliverables,
      notes: sv.notes,
    })),
  ];

  const visitDates = allVisits.map((v) => new Date(v.date));

  const visitsOnDate = selectedDate
    ? allVisits.filter((v) => v.date === selectedDate.toISOString().split("T")[0])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-serif text-foreground">Calendar</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "month" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={view === "week" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <CalendarPlus className="h-4 w-4 mr-1" /> Schedule Visit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedVisit(null);
              }}
              modifiers={{ hasVisit: visitDates }}
              modifiersClassNames={{ hasVisit: "bg-accent/20 font-bold text-accent" }}
              className="w-full"
            />
            {selectedDate && (
              <div className="mt-4 border-t border-border pt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                {visitsOnDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visits scheduled.</p>
                ) : (
                  visitsOnDate.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVisit(v)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{v.creatorName}</span>
                        <Badge variant="outline" className={`text-xs ${statusColor[v.status] || ""}`}>
                          {v.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.time}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          {selectedVisit ? (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-sans font-medium">Visit Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedVisit(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{selectedVisit.creatorName}</p>
                  <p className="text-sm text-muted-foreground">{selectedVisit.creatorHandle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor[selectedVisit.status] || ""}>
                    {selectedVisit.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{selectedVisit.time}</span>
                </div>
                {selectedVisit.status === "Reserved" && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    Reserved by {selectedVisit.creatorName} — awaiting your confirmation.
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Deliverables</p>
                  <ul className="space-y-1">
                    {selectedVisit.deliverables.map((d, i) => (
                      <li key={i} className="text-sm text-foreground">• {d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-sm text-foreground">{selectedVisit.notes}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Select a date with a visit to see details.
              </CardContent>
            </Card>
          )}

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans font-medium">Upcoming Visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allVisits
                .filter((v) => v.status !== "Completed")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedDate(new Date(v.date));
                      setSelectedVisit(v);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{v.creatorName}</span>
                      <Badge variant="outline" className={`text-xs ${statusColor[v.status] || ""}`}>
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {v.time}
                    </p>
                  </button>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerCalendar;
