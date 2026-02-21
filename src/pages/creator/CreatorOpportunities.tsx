import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Clock, ChevronRight, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { useScheduling, type Opportunity, type AvailabilitySlot } from "@/context/SchedulingContext";

const statusStyle: Record<string, string> = {
  New: "bg-accent/15 text-accent border-accent/30",
  "Slot Selected": "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const CreatorOpportunities = () => {
  const { opportunities, reserveSlot, getConflicts } = useScheduling();

  const [pickerOpen, setPickerOpen] = useState<Opportunity | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastReserved, setLastReserved] = useState<{ slot: AvailabilitySlot; restaurant: string } | null>(null);

  const handleReserve = () => {
    if (!pickerOpen || !selectedSlot) return;
    reserveSlot(pickerOpen.id, selectedSlot.id, note);
    setLastReserved({ slot: selectedSlot, restaurant: pickerOpen.restaurantName });
    setPickerOpen(null);
    setSelectedSlot(null);
    setNote("");
    setConfirmOpen(true);
  };

  const conflicts = selectedSlot ? getConflicts(selectedSlot.date) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-serif text-foreground">Opportunities</h1>
      </div>

      {opportunities.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No new opportunities right now. Check back soon!
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => (
          <Card key={opp.id} className="hover:border-accent/40 transition-colors">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground text-lg">{opp.restaurantName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {opp.restaurantCity}
                  </div>
                </div>
                <Badge variant="outline" className={statusStyle[opp.status]}>
                  {opp.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {opp.deliverables.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {d}
                  </Badge>
                ))}
              </div>

              {opp.status === "New" ? (
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    setPickerOpen(opp);
                    setSelectedSlot(null);
                    setNote("");
                  }}
                >
                  Choose a Time <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {opp.availabilitySlots.find((s) => s.id === opp.selectedSlotId)?.day}{" "}
                  {opp.availabilitySlots.find((s) => s.id === opp.selectedSlotId)?.timeRange}
                  {opp.status === "Slot Selected" && (
                    <Badge variant="outline" className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-200">
                      Pending confirmation
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Availability Picker Dialog ────────────────────────────── */}
      <Dialog open={!!pickerOpen} onOpenChange={(open) => !open && setPickerOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Choose a Visit Time</DialogTitle>
            <DialogDescription>
              Pick an available slot at <span className="font-medium text-foreground">{pickerOpen?.restaurantName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {pickerOpen?.availabilitySlots.map((slot) => {
                const slotConflicts = getConflicts(slot.date);
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      !slot.available
                        ? "opacity-40 cursor-not-allowed border-border bg-muted/30"
                        : isSelected
                          ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                          : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">{slot.day}</span>
                        <span className="text-sm text-muted-foreground ml-2">{slot.timeRange}</span>
                      </div>
                      {!slot.available && (
                        <Badge variant="outline" className="text-xs">Taken</Badge>
                      )}
                    </div>
                    {slot.available && slotConflicts.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Conflict: visit at {slotConflicts.join(", ")} on this day
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Note (optional)</label>
              <Textarea
                placeholder="e.g. I'll arrive around 6:30pm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(null)}>
              Cancel
            </Button>
            <Button disabled={!selectedSlot} onClick={handleReserve}>
              Reserve Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation Modal ────────────────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="font-serif text-lg">Slot Reserved!</DialogTitle>
            <DialogDescription className="text-sm">
              You reserved <span className="font-medium text-foreground">{lastReserved?.slot.day} {lastReserved?.slot.timeRange}</span> at{" "}
              <span className="font-medium text-foreground">{lastReserved?.restaurant}</span>.
              <br />
              Pending restaurant confirmation.
            </DialogDescription>
            <Button className="mt-2 w-full" onClick={() => setConfirmOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatorOpportunities;
