import { DanhMuc } from "@/components/types/product.type";
import { danhMucService } from "@/services/danhMucService";
import { useQuery } from "@tanstack/react-query";

export function useDanhMuc(){
    return useQuery<DanhMuc[], Error>({
    queryKey:['danhMucs'],
    queryFn:danhMucService.getDanhMuc,
    })
}
