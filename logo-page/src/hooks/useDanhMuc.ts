import { DanhMuc } from "@/components/types/product.type";
import { danhMucService } from "@/services/danhMucService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDanhMuc(){
    return useQuery<DanhMuc[], Error>({
    queryKey:['danhMucs'],
    queryFn:danhMucService.getDanhMuc,
    })
}
export function useDanhMucID(id:number){
    return useQuery<DanhMuc>({
        queryKey:['danhMucs',id],
        queryFn: () => danhMucService.getDanhMucId(id),
        enabled: !!id
    })
 }

 //Add 
 export function useAddSDanhMuc(){
    const queryClient= useQueryClient();
    return useMutation({
        mutationFn: danhMucService.addDanhmuc,
        onSuccess() {
            queryClient.invalidateQueries({queryKey:['danhMucs']})
        },
    })
 }
 // Sửa
 export function useEditDanhMuc(){
    const queryClient= useQueryClient();
    return useMutation({
        mutationFn:({id, data}: {id:number; data:DanhMuc}) =>
             danhMucService.editDanhmuc(id, data),
        onSuccess:() =>{
            queryClient.invalidateQueries({queryKey:['danhMucs']})
        }
    })
 }

//  Xóa
export function useXoaDanhMuc(){
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:(id:number) => danhMucService.xoaDanhMuc(id),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['danhMucs']})
        }
    })
}