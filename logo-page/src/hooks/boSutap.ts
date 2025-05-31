import { BoSuTap } from "@/components/types/product.type";
import { boSuuTapService } from "@/services/boSutapService";
import { useQuery } from "@tanstack/react-query";

export function useBoSutap(){
    return useQuery<BoSuTap[], Error>({
        queryKey:['boSuTaps'],
        queryFn: boSuuTapService.getBoSutap,
    })
}