import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { useLichSuLogByBang } from "@/hooks/uselichSuLog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User } from "lucide-react";

interface Props {
  bang: string;
  title?: string;
}

export default function LichSuLogTimeline({
  bang,
  title = "Lịch sử thay đổi",
}: Props) {
  const { data, isLoading } = useLichSuLogByBang(bang);

  return (
    <Card className="mt-6 bg-white dark:bg-gray-600 shadow-lg rounded-xl overflow-y-auto  w-full max-w-6xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 sticky top-0 z-10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 ">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full">
            {data?.map((log, index) => (
              <div
                key={log.id}
                className={`relative px-6 py-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  index !== data.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 sticky top-0 z-10">
                  <div className="relative mt-1">
                    <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-blue-500" />
                    {index !== data.length - 1 && (
                      <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        Hành động: {log.hanhDong}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDateFlexible(log.thoiGian)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {log.moTa}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 flex items-center"
                      >
                        <User className="w-4 h-4 mr-1.5" />
                        User thay đổi:
                        <span>{log.userId ?? "Không rõ"}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data?.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Không có lịch sử thay đổi
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
