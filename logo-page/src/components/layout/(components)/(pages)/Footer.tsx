import React from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";
import { Calendar, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <div className="bg-indigo-950 to-blue-700 bg-gradient-to-b overflow-hidden  relative ">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-col max-w-2/5 p-2">
          <span className="text-2xl font-bold">
            Tham gia để nhận quà ngay từ MyKingDom
          </span>
          <div className="flex-row flex gap-2">
            <Input type="email" id="email" placeholder="Nhập email" />
            <Button className="lego-login-button">Đăng ký</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-col pr-5 mr-5 ">
          <span className="font-semibold">FOLLOW US</span>
          <div className="flex gap-2">
            <div className="border border-gray w-12 h-12 items-center rounded-full justify-center flex bg-black">
              <FaFacebook size={25} />
            </div>
            <div className="border border-gray w-12 h-12 items-center rounded-full justify-center flex bg-black">
              <FaInstagram size={25} />
            </div>
            <div className="border border-gray w-12 h-12 items-center rounded-full justify-center flex bg-black">
              <FaTwitter />
            </div>
            <div className="border border-gray w-12 h-12 items-center rounded-full justify-center flex bg-black">
              <FaTiktok />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-2 border-2  border-white mt-2" />
      <div className="flex  mt-4 justify-between">
        <div className="flex  pl-2 flex-col gap-2 ">
          <span className="text-2xl font-bold">Thông tin liên hệ</span>
          <span className="flex gap-1">
            <MapPin />
            112, Trần Hưng Đạo, Hà Nội
          </span>
          <span className="flex gap-1">
            <Phone />
            0123456789
          </span>
          <span className="flex gap-1">
            <Calendar />
            Giờ mở cửa hàng ngày: 8:00-17:00
          </span>
        </div>
        <div className="text-2xl font-bold">Điều khoản chính sách</div>
        <div className="text-2xl font-bold pr-4">Hệ thống cửa hàng</div>
      </div>
    </div>
  );
}
