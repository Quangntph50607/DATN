import {  SanPham } from '@/components/types/product.type'

import { sanPhamService } from '@/services/sanPhamService'
import { useQuery } from '@tanstack/react-query'

export  function useSanPham() {
return useQuery<SanPham[] , Error>({
queryKey:['sanPhams'],
queryFn: sanPhamService.getSanPhams,
}) 
}

 export function useSanPhamID(id:number){
    return useQuery<SanPham>({
        queryKey:['sanPhams', id],
        queryFn: () => sanPhamService.getSanPhamID(id),
        enabled: !!id
    })
 }