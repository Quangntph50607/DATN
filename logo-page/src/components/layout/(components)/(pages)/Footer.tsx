"use client"

import React from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";
import { Calendar, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white overflow-hidden relative px-4 pt-10 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex gap-2 flex-col max-w-2/5 p-2 md:p-4"
        >
          <span className="text-2xl font-bold">
            Tham gia để nhận quà ngay từ MyKingDom
          </span>
          <div className="flex-row flex gap-2">
            <Input type="email" id="email" placeholder="Nhập email" />
            <Button className="lego-login-button">Đăng ký</Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex gap-2 flex-col pr-5 mr-5 md:items-end"
        >
          <span className="font-semibold">FOLLOW US</span>
          <div className="flex gap-3 mt-2">
            <div className="border border-white/30 w-12 h-12 items-center rounded-full justify-center flex bg-black hover:bg-blue-600 transition-all shadow-md">
              <FaFacebook size={25} />
            </div>
            <div className="border border-white/30 w-12 h-12 items-center rounded-full justify-center flex bg-black hover:bg-pink-600 transition-all shadow-md">
              <FaInstagram size={25} />
            </div>
            <div className="border border-white/30 w-12 h-12 items-center rounded-full justify-center flex bg-black hover:bg-blue-400 transition-all shadow-md">
              <FaTwitter />
            </div>
            <div className="border border-white/30 w-12 h-12 items-center rounded-full justify-center flex bg-black hover:bg-gray-700 transition-all shadow-md">
              <FaTiktok />
            </div>
          </div>
        </motion.div>
      </div>
      <div className="flex-2 border-t border-white/30 mt-6 mb-4" />
      <div className="flex flex-col md:flex-row mt-4 justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex pl-2 flex-col gap-2 md:w-1/3"
        >
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
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl font-bold md:w-1/3 text-center"
        >
          Điều khoản chính sách
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-2xl font-bold pr-4 md:w-1/3 text-right"
        >
          Hệ thống cửa hàng
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="border-t border-white/30 pt-8 mt-10 text-center text-white text-base"
      >
        <p>&copy; {new Date().getFullYear()} LEGO MYKINGDOM. Một sản phẩm của The LEGO Group. LEGO® là thương hiệu của The LEGO Group.</p>
      </motion.div>
    </footer>
  );
}
