import { useQuery } from "@tanstack/react-query";
import { hangThanhLyService } from "@/services/hangThanhLyService";
import { HangThanhLyItem } from "@/components/types/hangthanhly.type";

export function useHangThanhLy() {
  return useQuery<HangThanhLyItem[], Error>({
    queryKey: ["hangThanhLy"],
    queryFn: hangThanhLyService.getAll,
  });
}




