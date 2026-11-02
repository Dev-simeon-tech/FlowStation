import { Router } from "express";

import { router as authRouter } from "@/modules/auth/auth.router";
import { router as productRouter } from "@/modules/product/product.router";
import { router as supplierRouter } from "@/modules/supplier/supplier.router";
import { router as customerRouter } from "@/modules/customer/customer.router";
import { router as stockRouter } from "@/modules/stock/stock.router";
import { router as salesRouter } from "@/modules/sales/sales.router";
import { router as attendantRouter } from "@/modules/attendant/attendant.router";
import { router as summaryRouter } from "@/modules/summary/summary.router";
import { router as profileRouter } from "@/modules/profile/profile.router";

export const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/products", productRouter);
mainRouter.use("/suppliers", supplierRouter);
mainRouter.use("/customers", customerRouter);
mainRouter.use("/stock", stockRouter);
mainRouter.use("/sales", salesRouter);
mainRouter.use("/attendants", attendantRouter);
mainRouter.use("/summaries", summaryRouter);
mainRouter.use("/profile", profileRouter);
