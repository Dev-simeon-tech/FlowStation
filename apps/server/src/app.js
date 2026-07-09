import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import SupplierRoutes from "./routes/supplier.route.js";
import stockRoutes from "./routes/stock.route.js";
import attendantRoutes from "./routes/attendant.route.js";
import customerRoutes from "./routes/customer.route.js";
import salesRoutes from "./routes/sales.route.js";
import summaryRoutes from "./routes/summary.route.js";

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", SupplierRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/attendants", attendantRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/summaries", summaryRoutes);

export default app;
