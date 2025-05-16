export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <h1 className="text-3xl font-bold text-foreground">
        Chào mừng đến với Dashboard!
      </h1>
      <p className="text-muted-foreground mt-2">
        Giờ hiện tại:{" "}
        {new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
      </p>
    </div>
  );
}
