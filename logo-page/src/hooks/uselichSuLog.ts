import { LichSuLog } from "@/components/types/lichsulog.type";
import { lichSuLogService } from "@/services/lichSuLogService";
import { useQuery } from "@tanstack/react-query";

export function useAllLichSuLog() {
  return useQuery<LichSuLog[]>({
    queryKey: ["lichSuLog", "all"],
    queryFn: async () => {
      const items = await lichSuLogService.getAllLogs();
      return items.sort((a, b) => compareTimeDesc(a.thoiGian, b.thoiGian));
    },
  });
}

export function useLichSuLogByBang(bang: string) {
  return useQuery<LichSuLog[]>({
    queryKey: ["lichSuLog", bang],
    queryFn: async () => {
      const items = await lichSuLogService.lichSuLogByBang(bang);
      return items.sort((a, b) => compareTimeDesc(a.thoiGian, b.thoiGian));
    },
    enabled: Boolean(bang),
  });
}

function compareTimeDesc(a: number[] | undefined, b: number[] | undefined) {
  // thoiGian từ backend là mảng [year, month, day, hour, minute, second, ...]
  // Fallback: nếu thiếu, coi như 0
  const toMillis = (arr?: number[]) => {
    if (!arr || arr.length < 3) return 0;
    const [y, m = 1, d = 1, h = 0, mi = 0, s = 0] = arr;
    return new Date(y, (m - 1), d, h, mi, s).getTime();
  };
  return toMillis(b) - toMillis(a);
}
