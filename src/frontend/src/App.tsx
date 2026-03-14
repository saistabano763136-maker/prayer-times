import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHijriDate,
  usePrayerTimes,
  useSelectedCity,
  useSetCity,
} from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const queryClient = new QueryClient();

const CITIES = ["Mecca", "Medina", "Cairo", "Istanbul", "London"] as const;

const PRAYERS = [
  { key: "Fajr", arabic: "الفجر", icon: "🌙", description: "Pre-dawn" },
  { key: "Dhuhr", arabic: "الظهر", icon: "☀️", description: "Midday" },
  { key: "Asr", arabic: "العصر", icon: "🌤", description: "Afternoon" },
  { key: "Maghrib", arabic: "المغرب", icon: "🌅", description: "Sunset" },
  { key: "Isha", arabic: "العشاء", icon: "✨", description: "Night" },
] as const;

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return -1;
  let hours = Number.parseInt(match[1]);
  const mins = Number.parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

function getNextPrayerIndex(times: string[]): number {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < times.length; i++) {
    const t = parseTime(times[i]);
    if (t > currentMins) return i;
  }
  return 0;
}

function getCountdown(timeStr: string): string {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  let prayerMins = parseTime(timeStr);
  if (prayerMins <= currentMins) prayerMins += 24 * 60;
  const diff = prayerMins - currentMins;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function CrescentMoon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="crescent-glow"
      aria-hidden="true"
    >
      <path
        d="M 24 6 A 14 14 0 1 0 24 34 A 10 10 0 1 1 24 6 Z"
        fill="oklch(78 0.18 75)"
        opacity="0.9"
      />
    </svg>
  );
}

function MosqueSilhouette() {
  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full opacity-[0.07]"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="30" y="20" width="12" height="80" fill="currentColor" />
      <ellipse cx="36" cy="20" rx="6" ry="10" fill="currentColor" />
      <rect x="358" y="20" width="12" height="80" fill="currentColor" />
      <ellipse cx="364" cy="20" rx="6" ry="10" fill="currentColor" />
      <rect x="80" y="50" width="60" height="50" fill="currentColor" />
      <ellipse cx="110" cy="50" rx="30" ry="25" fill="currentColor" />
      <rect x="260" y="50" width="60" height="50" fill="currentColor" />
      <ellipse cx="290" cy="50" rx="30" ry="25" fill="currentColor" />
      <rect x="130" y="40" width="140" height="60" fill="currentColor" />
      <ellipse cx="200" cy="40" rx="70" ry="50" fill="currentColor" />
      <rect x="0" y="100" width="400" height="20" fill="currentColor" />
    </svg>
  );
}

function StarOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2 L13.5 8.5 L20 7 L15.5 12 L20 17 L13.5 15.5 L12 22 L10.5 15.5 L4 17 L8.5 12 L4 7 L10.5 8.5 Z"
        fill="oklch(78 0.18 75)"
        opacity="0.6"
      />
    </svg>
  );
}

function PrayerApp() {
  const { data: hijriDate, isLoading: hijriLoading } = useHijriDate();
  const { data: selectedCity } = useSelectedCity();
  const { data: prayerTimes, isLoading: timesLoading } = usePrayerTimes();
  const setCity = useSetCity();

  const [nextPrayerIdx, setNextPrayerIdx] = useState(0);

  // Update clock every 30s to refresh countdown
  useEffect(() => {
    const tick = () => {
      if (prayerTimes && prayerTimes.length === 5) {
        setNextPrayerIdx(getNextPrayerIndex(prayerTimes));
      }
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const handleCityChange = useCallback(
    (city: string) => {
      setCity.mutate(city);
    },
    [setCity],
  );

  const isLoading = timesLoading;
  const nextPrayer = prayerTimes?.[nextPrayerIdx];
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen islamic-pattern text-foreground flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      {/* Header */}
      <header className="relative px-6 pt-8 pb-4 text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 text-foreground pointer-events-none">
          <MosqueSilhouette />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <StarOrnament />
            <CrescentMoon size={32} />
            <h1
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: "oklch(88 0.14 75)" }}
            >
              Mawaqit
            </h1>
            <CrescentMoon size={32} />
            <StarOrnament />
          </div>
          <p
            className="font-body text-sm"
            style={{ color: "oklch(65 0.06 255)" }}
          >
            Prayer Times
          </p>
        </motion.div>

        {/* Hijri date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          data-ocid="hijri.section"
          className="relative z-10 mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full border"
          style={{
            background: "oklch(24 0.06 255 / 0.7)",
            borderColor: "oklch(78 0.18 75 / 0.3)",
          }}
        >
          <StarOrnament className="w-4 h-4" />
          {hijriLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span
              className="font-arabic text-sm"
              style={{ color: "oklch(82 0.12 75)" }}
            >
              {hijriDate || "1447 AH"}
            </span>
          )}
          <StarOrnament className="w-4 h-4" />
        </motion.div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 pb-8 max-w-lg mx-auto w-full">
        {/* City selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 mb-5"
        >
          <Select
            value={selectedCity || "Mecca"}
            onValueChange={handleCityChange}
          >
            <SelectTrigger
              data-ocid="city.select"
              aria-label="Select city"
              className="w-full border font-body text-sm"
              style={{
                background: "oklch(22 0.06 255 / 0.8)",
                borderColor: "oklch(78 0.18 75 / 0.3)",
                color: "oklch(88 0.1 75)",
              }}
            >
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(22 0.07 255)",
                borderColor: "oklch(78 0.18 75 / 0.3)",
              }}
            >
              {CITIES.map((city) => (
                <SelectItem
                  key={city}
                  value={city}
                  className="font-body text-sm"
                  style={{ color: "oklch(85 0.06 255)" }}
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Next prayer countdown */}
        <AnimatePresence>
          {!isLoading && prayerTimes && nextPrayer && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mb-5 p-4 rounded-2xl text-center border"
              style={{
                background: "oklch(20 0.06 255 / 0.7)",
                borderColor: "oklch(78 0.18 75 / 0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest font-body mb-1"
                style={{ color: "oklch(60 0.06 255)" }}
              >
                Next prayer · {PRAYERS[nextPrayerIdx].key}
              </p>
              <p className="font-display text-2xl font-bold countdown-shimmer">
                in {getCountdown(nextPrayer)}
              </p>
              <p
                className="font-arabic text-lg mt-1"
                style={{ color: "oklch(70 0.1 75)" }}
              >
                {PRAYERS[nextPrayerIdx].arabic}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prayer times list */}
        <div data-ocid="prayer.list">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-ocid="prayer.loading_state"
                className="space-y-3"
              >
                {SKELETON_KEYS.map((sk) => (
                  <Skeleton
                    key={sk}
                    className="h-20 w-full rounded-2xl"
                    style={{ background: "oklch(24 0.05 255 / 0.6)" }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="times"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {PRAYERS.map((prayer, index) => {
                  const timeStr = prayerTimes?.[index] ?? "--:--";
                  const isNext = index === nextPrayerIdx;
                  const ocidMap = [
                    "prayer.item.1",
                    "prayer.item.2",
                    "prayer.item.3",
                    "prayer.item.4",
                    "prayer.item.5",
                  ] as const;

                  return (
                    <motion.div
                      key={prayer.key}
                      data-ocid={ocidMap[index]}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      className={[
                        "relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300",
                        isNext ? "prayer-active" : "",
                      ].join(" ")}
                      style={{
                        background: isNext
                          ? "oklch(22 0.08 255 / 0.9)"
                          : "oklch(20 0.05 255 / 0.6)",
                        borderColor: isNext
                          ? "oklch(78 0.18 75 / 0.6)"
                          : "oklch(32 0.06 255 / 0.5)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {isNext && (
                        <div
                          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                          style={{ background: "oklch(78 0.18 75)" }}
                        />
                      )}

                      {/* Prayer icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{
                          background: isNext
                            ? "oklch(78 0.18 75 / 0.15)"
                            : "oklch(26 0.06 255 / 0.6)",
                          border: `1px solid ${
                            isNext
                              ? "oklch(78 0.18 75 / 0.4)"
                              : "oklch(35 0.06 255 / 0.5)"
                          }`,
                        }}
                      >
                        <span role="img" aria-label={prayer.key}>
                          {prayer.icon}
                        </span>
                      </div>

                      {/* Prayer info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-body font-semibold text-sm"
                            style={{
                              color: isNext
                                ? "oklch(88 0.12 75)"
                                : "oklch(80 0.04 255)",
                            }}
                          >
                            {prayer.key}
                          </span>
                          {isNext && (
                            <span
                              className="text-xs font-body px-2 py-0.5 rounded-full"
                              style={{
                                background: "oklch(78 0.18 75 / 0.2)",
                                color: "oklch(82 0.14 75)",
                                border: "1px solid oklch(78 0.18 75 / 0.3)",
                              }}
                            >
                              Next
                            </span>
                          )}
                        </div>
                        <div
                          className="font-arabic text-base mt-0.5"
                          style={{ color: "oklch(65 0.08 75)" }}
                        >
                          {prayer.arabic}
                        </div>
                        <div
                          className="text-xs font-body mt-0.5"
                          style={{ color: "oklch(52 0.05 255)" }}
                        >
                          {prayer.description}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right flex-shrink-0">
                        <span
                          className="font-display text-xl font-bold tabular-nums"
                          style={{
                            color: isNext
                              ? "oklch(82 0.16 75)"
                              : "oklch(72 0.05 255)",
                          }}
                        >
                          {timeStr}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-5 text-center border-t"
        style={{ borderColor: "oklch(28 0.05 255)" }}
      >
        <div
          className="flex items-center justify-center gap-1 text-xs font-body"
          style={{ color: "oklch(48 0.04 255)" }}
        >
          © {currentYear}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "oklch(65 0.1 75)" }}
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrayerApp />
    </QueryClientProvider>
  );
}
