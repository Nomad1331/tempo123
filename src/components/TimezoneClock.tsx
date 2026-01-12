import { useState, useEffect } from "react";
import { Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { toast } from "@/hooks/use-toast";

// All timezones organized by UTC offset for easy scrolling selection
const TIMEZONES = [
  { offset: "UTC-11:00", zones: ["Pacific/Midway", "Pacific/Niue"] },
  { offset: "UTC-10:00", zones: ["Pacific/Honolulu", "Pacific/Tahiti"] },
  { offset: "UTC-09:30", zones: ["Pacific/Marquesas"] },
  { offset: "UTC-09:00", zones: ["America/Anchorage", "America/Juneau"] },
  { offset: "UTC-08:00", zones: ["America/Los_Angeles", "America/Vancouver"] },
  { offset: "UTC-07:00", zones: ["America/Denver", "America/Phoenix"] },
  { offset: "UTC-06:00", zones: ["America/Chicago", "America/Mexico_City"] },
  { offset: "UTC-05:00", zones: ["America/New_York", "America/Toronto"] },
  { offset: "UTC-04:00", zones: ["America/Santiago", "America/Caracas"] },
  { offset: "UTC-03:30", zones: ["America/St_Johns"] },
  { offset: "UTC-03:00", zones: ["America/Sao_Paulo", "America/Argentina/Buenos_Aires"] },
  { offset: "UTC-02:00", zones: ["Atlantic/South_Georgia"] },
  { offset: "UTC-01:00", zones: ["Atlantic/Azores", "Atlantic/Cape_Verde"] },
  { offset: "UTC+00:00", zones: ["Europe/London", "Africa/Casablanca"] },
  { offset: "UTC+01:00", zones: ["Europe/Paris", "Europe/Berlin"] },
  { offset: "UTC+02:00", zones: ["Europe/Athens", "Africa/Cairo"] },
  { offset: "UTC+03:00", zones: ["Europe/Moscow", "Africa/Nairobi"] },
  { offset: "UTC+03:30", zones: ["Asia/Tehran"] },
  { offset: "UTC+04:00", zones: ["Asia/Dubai", "Asia/Baku"] },
  { offset: "UTC+04:30", zones: ["Asia/Kabul"] },
  { offset: "UTC+05:00", zones: ["Asia/Karachi", "Asia/Tashkent"] },
  { offset: "UTC+05:30", zones: ["Asia/Kolkata", "Asia/Colombo"] },
  { offset: "UTC+05:45", zones: ["Asia/Kathmandu"] },
  { offset: "UTC+06:00", zones: ["Asia/Dhaka", "Asia/Almaty"] },
  { offset: "UTC+06:30", zones: ["Asia/Yangon"] },
  { offset: "UTC+07:00", zones: ["Asia/Bangkok", "Asia/Jakarta"] },
  { offset: "UTC+08:00", zones: ["Asia/Singapore", "Asia/Hong_Kong", "Asia/Shanghai"] },
  { offset: "UTC+08:45", zones: ["Australia/Eucla"] },
  { offset: "UTC+09:00", zones: ["Asia/Tokyo", "Asia/Seoul"] },
  { offset: "UTC+09:30", zones: ["Australia/Adelaide", "Australia/Darwin"] },
  { offset: "UTC+10:00", zones: ["Australia/Sydney", "Australia/Brisbane"] },
  { offset: "UTC+10:30", zones: ["Australia/Lord_Howe"] },
  { offset: "UTC+11:00", zones: ["Pacific/Guadalcanal", "Pacific/Noumea"] },
  { offset: "UTC+12:00", zones: ["Pacific/Auckland", "Pacific/Fiji"] },
  { offset: "UTC+12:45", zones: ["Pacific/Chatham"] },
  { offset: "UTC+13:00", zones: ["Pacific/Tongatapu", "Pacific/Apia"] },
  { offset: "UTC+14:00", zones: ["Pacific/Kiritimati"] },
];

export const TimezoneClock = () => {
  const { userSettings, updateSettings } = useCloudChallenges();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(userSettings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync timezone from cloud settings
  useEffect(() => {
    if (userSettings?.timezone) {
      setTimezone(userSettings.timezone);
    }
  }, [userSettings?.timezone]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const saveTimezone = async () => {
    await updateSettings({ timezone });
    setIsDialogOpen(false);
    toast({
      title: "⏰ Timezone Updated",
      description: `Your timezone is now set to ${timezone}`,
    });
  };

  const formatTime = (date: Date, tz: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date, tz: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
        <Clock className="h-4 w-4 text-neon-cyan" />
        <div className="flex flex-col">
          <span className="font-mono font-bold text-neon-cyan text-lg">
            {formatTime(currentTime, timezone)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(currentTime, timezone)}
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="border-border">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-neon-cyan">Set Your Timezone</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Choose your timezone by UTC offset for accurate habit tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Current Time Preview</Label>
              <div className="p-4 bg-background border border-border rounded-lg">
                <div className="text-2xl font-mono font-bold text-neon-cyan mb-1">
                  {formatTime(currentTime, timezone)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(currentTime, timezone)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Timezone: {timezone}
                </div>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
              {TIMEZONES.map((group) => (
                <div key={group.offset} className="flex items-center gap-3 py-1">
                  <div className="text-xs font-mono text-muted-foreground w-20 text-right flex-shrink-0">
                    {group.offset}
                  </div>
                  <div className="flex-1 flex gap-2 flex-wrap">
                    {group.zones.map((tz) => (
                      <Button
                        key={tz}
                        variant={timezone === tz ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          timezone === tz
                            ? "bg-neon-cyan text-background hover:bg-neon-cyan/80"
                            : "border-border hover:bg-muted"
                        }`}
                        onClick={() => setTimezone(tz)}
                      >
                        {tz.split("/")[1]?.replace(/_/g, " ") || tz}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={saveTimezone} 
              className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/80"
            >
              Save Timezone
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
