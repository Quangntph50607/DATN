import { LichSuLog } from "@/components/types/lichsulog.type";
import { lichSuLogService } from "@/services/lichSuLogService";
import { useQuery } from "@tanstack/react-query";

export function useAllLichSuLog() {
  return useQuery<LichSuLog[]>({
    queryKey: ["lichSuLog", "all"],
    queryFn: () => lichSuLogService.getAllLogs(),
  });
}

export function useLichSuLogByBang(bang: string) {
  return useQuery<LichSuLog[]>({
    queryKey: ["lichSuLog", bang],
    queryFn: () => lichSuLogService.lichSuLogByBang(bang),
    enabled: Boolean(bang),
  });
}
