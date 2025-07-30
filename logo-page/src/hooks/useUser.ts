import { useQuery } from "@tanstack/react-query";
import { accountService } from "@/services/accountService";
import { DTOUser } from "@/components/types/account.type";

export const useUser = (userId?: number) => {
    return useQuery<DTOUser>({
        queryKey: ["user", userId],
        queryFn: () => accountService.getUserById(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 phút
        cacheTime: 10 * 60 * 1000, // 10 phút
    });
}; 