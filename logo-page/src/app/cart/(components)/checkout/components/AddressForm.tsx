"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useAddThongTinNguoiNhan,
  useUpdateThongTinNguoiNhan,
  useThongTinNguoiNhan,
} from "@/hooks/useThongTinNguoiNhan";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  thongTinNguoiNhanSchema,
  ThongTinNguoiNhanForm,
} from "@/lib/thongTinNguoiNhanSchema";
import {
  DTOThongTinNguoiNhan,
  Province,
  ThongTinNguoiNhan,
  Ward,
} from "@/components/types/thongTinTaiKhoan-types";
import { useUserStore } from "@/context/authStore.store";
import {
  User,
  Phone,
  MapPin,
  Home,
  Navigation,
  Check,
  X,
  Plus,
  Mail,
} from "lucide-react";

export default function AddressForm({
  editing,
  setEditing,
  onSuccess,
  isGuestMode = false,
}: {
  editing: ThongTinNguoiNhan | null;
  setEditing: (data: ThongTinNguoiNhan | null) => void;
  onSuccess?: (data?: ThongTinNguoiNhan) => void;
  isGuestMode?: boolean;
}) {
  const { user } = useUserStore();
  const currentUserId = user?.id ?? 0;

  const { refetch } = useThongTinNguoiNhan(currentUserId);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const createMutation = useAddThongTinNguoiNhan();
  const updateMutation = useUpdateThongTinNguoiNhan();

  const form = useForm<ThongTinNguoiNhanForm>({
    resolver: zodResolver(thongTinNguoiNhanSchema),
    defaultValues: {
      hoTen: "",
      sdt: "",
      duong: "",
      xa: "",
      thanhPho: "",
      isMacDinh: false,
      idUser: currentUserId,
      email: "",
    },
  });

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
  };

  // Load provinces & wards
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const provinceRes = await fetch("/data/province.json");
        const provinceData: Record<string, { name: string }> =
          await provinceRes.json();

        const wardRes = await fetch("/data/ward.json");
        const wardData: Record<string, Ward> = await wardRes.json();

        const wardsByProvince: Record<string, Ward[]> = {};
        Object.entries(wardData).forEach(([code, ward]) => {
          const provinceCode = ward.parent_code;
          if (!wardsByProvince[provinceCode]) {
            wardsByProvince[provinceCode] = [];
          }
          wardsByProvince[provinceCode].push({ ...ward, code });
        });

        const filteredProvinces: Province[] = Object.entries(provinceData)
          .filter(([code]) => wardsByProvince[code]?.length > 0)
          .map(([code, info]) => ({
            code,
            name: info.name,
            wards: wardsByProvince[code] || [],
          }));

        setProvinces(filteredProvinces);
      } catch (error) {
        console.error("Error loading address data:", error);
        toast.error("Không thể tải dữ liệu địa chỉ");
      }
    };

    loadAddressData();
  }, []);

  // Update wards khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      const selectedProvinceData = provinces.find(
        (p) => p.code === selectedProvince
      );
      setWards(selectedProvinceData?.wards || []);
    } else {
      setWards([]);
    }
    setSelectedWard("");
  }, [selectedProvince, provinces]);

  // Update idUser khi user thay đổi
  useEffect(() => {
    if (currentUserId) {
      form.setValue("idUser", currentUserId);
    }
  }, [currentUserId, form]);

  useEffect(() => {
    if (editing && provinces.length > 0) {
      console.log("data", editing);

      // Tìm code của tỉnh theo tên
      const provinceCode =
        provinces.find((p) => p.name === editing.thanhPho)?.code || "";

      // Lấy danh sách xã/phường theo tỉnh
      const wardsList =
        provinces.find((p) => p.code === provinceCode)?.wards || [];

      // Tìm code xã/phường theo tên
      const wardCode = wardsList.find((w) => w.name === editing.xa)?.code || "";

      // Set state cho Select hiển thị
      setSelectedProvince(provinceCode);
      setSelectedWard(wardCode);
      setWards(wardsList); // để hiển thị danh sách xã ngay khi mở form edit

      // Reset form với dữ liệu cũ
      form.reset({
        hoTen: editing.hoTen,
        sdt: editing.sdt,
        duong: editing.duong,
        xa: editing.xa, // vẫn lưu tên để submit
        thanhPho: editing.thanhPho,
        isMacDinh: editing.isMacDinh === 1,
        idUser: editing.idUser,
      });
    }
  }, [editing, provinces, form]);

  const onSubmit = (data: ThongTinNguoiNhanForm) => {
    console.log("data:", data);

    // Nếu là guest mode, chỉ lưu thông tin local không gửi lên server
    if (isGuestMode) {
      const guestAddressData: ThongTinNguoiNhan = {
        id: 0, // Temporary ID for guest
        hoTen: data.hoTen,
        sdt: data.sdt,
        duong: data.duong,
        xa: data.xa,
        thanhPho: data.thanhPho,
        isMacDinh: 0,
        idUser: 0, // Guest user
        email: data.email || "", // Thêm email cho guest
      };

      toast.success("Địa chỉ đã được lưu!");
      form.reset();
      setSelectedProvince("");
      setSelectedWard("");
      onSuccess?.(guestAddressData);
      return;
    }

    const payload: DTOThongTinNguoiNhan = {
      ...data,
      idUser: currentUserId,
      isMacDinh: data.isMacDinh ? 1 : 0,
    };

    if (editing?.id !== undefined) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật địa chỉ thành công!");
            setEditing(null);
            form.reset({
              hoTen: "",
              sdt: "",
              duong: "",
              xa: "",
              thanhPho: "",
              isMacDinh: false,
              idUser: currentUserId,
            });
            setSelectedProvince(""); // Reset dropdown
            setSelectedWard("");
            onSuccess?.();
            refetch();
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Thêm địa chỉ thành công!");
          form.reset({
            hoTen: "",
            sdt: "",
            duong: "",
            xa: "",
            thanhPho: "",
            isMacDinh: false,
            idUser: currentUserId,
          });
          setSelectedProvince(""); // Reset dropdown
          setSelectedWard("");
          onSuccess?.();
          refetch();
        },
        onError: () => toast.error("Thêm địa chỉ thất bại"),
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4 "
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Validation errors", errors);
        })}
      >
        {/* Họ tên và Số điện thoại */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <FormField
            control={form.control}
            name="hoTen"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Họ tên người nhận *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Nhập họ tên"
                      {...field}
                      className="border-gray-300 h-10 pl-9 focus:border-orange-500 focus-visible:ring-orange-500"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sdt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Số điện thoại *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Nhập số điện thoại"
                      {...field}
                      className="border-gray-300 h-10 pl-9 focus:border-orange-500 focus-visible:ring-orange-500"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email cho guest mode */}
        {isGuestMode && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Email (tùy chọn)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Nhập email để nhận thông tin đơn hàng"
                      {...field}
                      className="border-gray-300 h-10 pl-9 focus:border-orange-500 focus-visible:ring-orange-500"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Địa chỉ */}
        <FormField
          control={form.control}
          name="duong"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Địa chỉ (Tên đường, số nhà)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ví dụ: 123 Lê Lợi"
                    {...field}
                    className="border-gray-300 h-10 pl-9 focus:border-orange-500 focus-visible:ring-orange-500"
                  />
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thành phố và Phường/Xã */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thanhPho"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Thành phố / Tỉnh
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Select
                      value={selectedProvince}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleProvinceChange(value);
                        const name =
                          provinces.find((p) => p.code === value)?.name || "";
                        form.setValue("thanhPho", name);
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10 w-full pl-9 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="top" className="bg-white max-w-[400px] max-h-72 overflow-auto z-[2000]">
                        {provinces.map((province) => (
                          <SelectItem
                            key={province.code}
                            value={province.code}
                            className="text-gray-900"
                          >
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="xa"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Phường / Xã
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Select
                      value={selectedWard}
                      disabled={!selectedProvince}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleWardChange(value);
                        const name =
                          wards.find((w) => w.code === value)?.name || "";
                        form.setValue("xa", name);
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10 w-full pl-9 disabled:bg-gray-50 disabled:text-gray-400 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="Chọn xã/phường" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="top" className="bg-white max-w-[400px] max-h-72 overflow-auto z-[2000]">
                        {wards.map((ward) => (
                          <SelectItem
                            key={ward.code}
                            value={ward.code}
                            className="text-gray-900"
                          >
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkbox - chỉ hiển thị khi không phải guest mode */}
        {!isGuestMode && (
          <FormField
            control={form.control}
            name="isMacDinh"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                </FormControl>
                <FormLabel className="flex items-center gap-2">
                  Đặt làm địa chỉ mặc định
                </FormLabel>
              </FormItem>
            )}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 pt-4 md:pt-5 border-t">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1 h-9 md:h-11 font-medium shadow-sm hover:shadow-md transition-shadow text-sm md:text-base"
          >
            {editing ? (
              <>
                <Check
                  className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2"
                  strokeWidth={2.5}
                />
                Cập nhật
              </>
            ) : (
              <>
                <Plus
                  className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2"
                  strokeWidth={2.5}
                />
                {isGuestMode ? "Xác nhận địa chỉ" : "Thêm địa chỉ"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            className="h-9 md:h-11 font-medium flex-1 border-gray-300 hover:bg-gray-400 text-sm md:text-base"
            onClick={() => {
              setEditing(null);
              form.reset();
              setSelectedProvince("");
              setSelectedWard("");
              onSuccess?.();
            }}
          >
            <X
              className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2"
              strokeWidth={2.5}
            />
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  );
}
