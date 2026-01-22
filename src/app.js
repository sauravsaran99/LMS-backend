const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test.routes");
const doctorRoutes = require("./routes/doctor.routes");
const customerRoutes = require("./routes/customer.routes");
const discountRoutes = require("./routes/discount.routes");
const bookingRoutes = require("./routes/booking.routes");
const authRoutes = require("./routes/auth.routes");
const branchRoutes = require("./routes/branch.routes");
const userRoutes = require("./routes/user.routes");
const technicianRoutes = require("./routes/technician.routes");
const paymentRoutes = require("./routes/payment.routes");
const reportRoutes = require("./routes/report.routes");
const auditLogRoutes = require("./routes/auditLog.routes");
const branchAdminRoutes = require("./routes/branchAdmin.routes");
const refundRoutes = require("./routes/refund.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: [
      "https://lms-frontend-git-main-thisissauravkumars-projects.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true, // 🔥 REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "LMS Backend is running" });
});
app.use("/tests", testRoutes);
app.use("/doctors", doctorRoutes);
app.use("/customers", customerRoutes);
app.use("/discounts", discountRoutes);
app.use("/bookings", bookingRoutes);
app.use("/auth", authRoutes);
app.use("/branches", branchRoutes);
app.use("/users", userRoutes);
app.use("/technician", technicianRoutes);
app.use("/payments", paymentRoutes);
app.use("/reports", reportRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/branch-admin", branchAdminRoutes);
app.use("/refunds", refundRoutes);
app.use("/dashboard", dashboardRoutes);

module.exports = app;
