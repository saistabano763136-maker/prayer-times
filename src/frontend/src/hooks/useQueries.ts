import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useHijriDate() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["hijriDate"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getTodaysHijriDate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSelectedCity() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["selectedCity"],
    queryFn: async () => {
      if (!actor) return "Mecca";
      return actor.getSelectedCity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePrayerTimes() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["prayerTimes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPrayerTimes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (city: string) => {
      if (!actor) return;
      await actor.setSelectedCity(city);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selectedCity"] });
      queryClient.invalidateQueries({ queryKey: ["prayerTimes"] });
    },
  });
}
