import { SanPham } from '@/components/types/product.type'
import { sanPhamService } from '@/service/sanPhamService'
import { useQuery } from '@tanstack/react-query'

export  function useSanPham() {
return useQuery<SanPham[] , Error>({
queryKey:['sanPhams'],
queryFn: sanPhamService.getSanPhams,
})
  
}
