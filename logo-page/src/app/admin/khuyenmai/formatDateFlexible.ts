import { format, parse } from "date-fns";

export function formatDateFlexible(
  date: string | number[] | undefined | null,
  withTime: boolean = true
): string {
  if (!date) return "";

  let dt: Date;

  if (Array.isArray(date)) {
    // Xử lý kiểu mảng số
    const [y, m, d, h = 0, min = 0, s = 0, nano = 0] = date;
    dt = new Date(y, m - 1, d, h, min, s, Math.floor(nano / 1_000_000));
  } else {
    // Xử lý kiểu string
    dt = new Date(date);
    if (isNaN(dt.getTime())) return "";
  }

  // format theo withTime
  return format(dt, withTime ? "dd-MM-yyyy HH:mm:ss" : "dd-MM-yyyy");
}
// Chuyển chuỗi ngày 'dd/MM/yyyy' -> Date chỉ có phần ngày
export function parseInputDate(str: string): Date {
  const parsed = parse(str, "dd/MM/yyyy", new Date());
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

// Chuyển mảng [year, month, day, hour, minute] -> Date chỉ có phần ngày
export function parseArrayDateToDateOnly(arr: number[]): Date | null {
  if (!Array.isArray(arr) || arr.length < 3) return null;
  const [y, m, d] = arr;
  return new Date(y, m - 1, d); // bỏ giờ phút giây
}
