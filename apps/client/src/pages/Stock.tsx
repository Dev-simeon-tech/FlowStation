import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateStockEntrySchema,
  type CreateStockEntryInput,
} from "@flowstation/schemas";
import type {
  FuelStock,
  FuelProduct,
  Supplier,
  StockBalance,
} from "@flowstation/types";
import NumberInput from "../components/NumberInput";
import { apiFetch } from "../lib/api";
import { Select } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";

export default function Stock() {
  useEffect(() => {
    document.title = "Stock / FlowStation";
  }, []);
  const [tab, setTab] = useState<"balance" | "entry">("balance");
  const [stocks, setStocks] = useState<FuelStock[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<
    z.input<typeof CreateStockEntrySchema>,
    unknown,
    CreateStockEntryInput
  >({
    resolver: zodResolver(CreateStockEntrySchema),
    defaultValues: {
      fuelProductId: "",
      supplierId: "",
      quantityLitres: "",
      costPerLitre: "",
      invoiceNumber: "",
      deliveryDate: new Date().toISOString().slice(0, 10),
    },
  });

  function loadAll(signal?: AbortSignal) {
    setLoading(true);
    Promise.all([
      apiFetch<FuelProduct[]>("/api/products"),
      apiFetch<Supplier[]>("/api/suppliers"),
      apiFetch<FuelStock[]>("/api/stock"),
      apiFetch<StockBalance[]>("/api/stock/balance"),
    ])
      .then(([prods, sups, stockData, stockBalance]) => {
        if (signal?.aborted) return;
        setProducts(prods);
        setSuppliers(sups);
        setStocks(stockData);
        setBalances(stockBalance);
      })
      .catch((e) => {
        if (!signal?.aborted) setError(e.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ctrl = new AbortController();
    loadAll(ctrl.signal);
    return () => ctrl.abort();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function onSubmit(values: CreateStockEntryInput) {
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/api/stock/new", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setMessage(`Stock entry recorded: ${values.quantityLitres.toLocaleString()}L`);
      reset({
        fuelProductId: "",
        supplierId: "",
        quantityLitres: "",
        costPerLitre: "",
        invoiceNumber: "",
        deliveryDate: new Date().toISOString().slice(0, 10),
      });
      setTimeout(() => setMessage(""), 4000);
      loadAll();
      setTab("balance");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record delivery");
    } finally {
      setSubmitting(false);
    }
  }

  const totalStock = balances.reduce((sum, b) => sum + b.currentBalance, 0);

  return (
    <div>
      <div className="topBar">
        <div className="header">
          <h1>Stock</h1>
          <p>Current levels and delivery records</p>
        </div>
        <div className="tabs">
          <button
            className={`tab ${tab === "balance" ? "tabActive" : ""}`}
            onClick={() => setTab("balance")}
          >
            Balance
          </button>
          <button
            className={`tab ${tab === "entry" ? "tabActive" : ""}`}
            onClick={() => setTab("entry")}
          >
            Entry
          </button>
        </div>
      </div>

      <div className="kpiGrid">
        <div className="kpiCard">
          <div className="kpiLabel">Current Stock</div>
          <div className="kpiValue">{totalStock.toLocaleString()} L</div>
          <div className="kpiSub">
            {balances.length} product{balances.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="kpiCard">
          <div className="kpiLabel">Deliveries</div>
          <div className="kpiValue">{stocks.length}</div>
          <div className="kpiSub">total recorded</div>
        </div>
      </div>

      {message && (
        <div
          className="card"
          style={{
            background: "#0d2817",
            border: "1px solid var(--accent)",
            marginBottom: 12,
          }}
        >
          <p style={{ color: "#3ecf8e" }}>{message}</p>
        </div>
      )}
      {error && (
        <p className="loginError" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {tab === "balance" && (
        <>
          <div className="card">
            <h2>Current Balances</h2>
            {loading ? (
              <div className="empty">
                <p>Loading...</p>
              </div>
            ) : balances.length === 0 ? (
              <div className="empty">
                <p>No stock on record. Record a delivery first.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Delivered (L)</th>
                    <th>Sold (L)</th>
                    <th>Balance (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b) => (
                    <tr key={b.fuelProductId}>
                      <td>{b.fuelProductName}</td>
                      <td>
                        <span
                          className={`badge ${(["PETROL", "DIESEL", "KEROSENE"].includes(b.fuelType) ? `badge${b.fuelType}` : "badgeInfo")}`}
                        >
                          {b.fuelType}
                        </span>
                      </td>
                      <td>{b.totalDelivered.toLocaleString()}</td>
                      <td>{b.totalSold.toLocaleString()}</td>
                      <td>
                        <strong>{b.currentBalance.toLocaleString()}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Recent Deliveries</h2>
            {loading ? (
              <div className="empty">
                <p>Loading...</p>
              </div>
            ) : stocks.length === 0 ? (
              <div className="empty">
                <p>No deliveries recorded yet.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Quantity (L)</th>
                    <th>Cost/L</th>
                    <th>Total Cost</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.deliveryDate).toLocaleDateString()}</td>
                      <td>{r.fuelProduct?.name ?? `ID ${r.fuelProductId}`}</td>
                      <td>{r.supplier?.companyName ?? `ID ${r.supplierId}`}</td>
                      <td>{r.quantityLitres.toLocaleString()}</td>
                      <td>&#8358;{r.costPerLitre.toFixed(2)}</td>
                      <td>
                        &#8358;
                        {(r.quantityLitres * r.costPerLitre).toLocaleString()}
                      </td>
                      <td>{r.invoiceNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "entry" && (
        <div className="card">
          <h2>New Delivery</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
          <div className="formGrid">
            <div className="formGroup">
              <label>Fuel Product</label>
              <Controller
                control={control}
                name="fuelProductId"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={typeof field.value === "string" ? field.value : ""}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    aria-label="Fuel Product"
                    placeholder="Select product..."
                    options={products.map((product) => ({
                      value: product.id,
                      label: `${product.name} (${product.type})`,
                    }))}
                  />
                )}
              />
              {fieldErrors.fuelProductId && <p className="loginError">{fieldErrors.fuelProductId.message}</p>}
            </div>
            <div className="formGroup">
              <label>Supplier</label>
              <Controller
                control={control}
                name="supplierId"
                render={({ field }) => (
                  <Select
                    value={typeof field.value === "string" ? field.value : ""}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    aria-label="Supplier"
                    placeholder="Select supplier..."
                    options={suppliers.map((supplier) => ({
                      value: supplier.id,
                      label: supplier.companyName,
                    }))}
                  />
                )}
              />
              {fieldErrors.supplierId && <p className="loginError">{fieldErrors.supplierId.message}</p>}
            </div>
            <NumberInput
              label='Quantity (Litres)'
              step='0.01'
              min='0'
              placeholder='0'
              {...register("quantityLitres")}
            />
            {fieldErrors.quantityLitres && <p className="loginError">{fieldErrors.quantityLitres.message}</p>}
            <NumberInput
              label='Cost per Litre (&#8358;)'
              step='0.01'
              min='0'
              placeholder='0.00'
              {...register("costPerLitre")}
            />
            {fieldErrors.costPerLitre && <p className="loginError">{fieldErrors.costPerLitre.message}</p>}
            <div className="formGroup">
              <label>Invoice Number</label>
              <input
                type='text'
                placeholder='e.g. INV-005'
                {...register("invoiceNumber")}
              />
            </div>
            <div className="formGroup">
              <label>Delivery Date</label>
              <Controller
                control={control}
                name="deliveryDate"
                render={({ field }) => (
                  <DatePicker
                    value={typeof field.value === "string" ? field.value : ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    aria-label="Delivery Date"
                  />
                )}
              />
              {fieldErrors.deliveryDate && <p className="loginError">{fieldErrors.deliveryDate.message}</p>}
            </div>
          </div>
          <div className="formActions">
            <button
              className={`btn btnPrimary`}
              type='submit'
              disabled={submitting}
            >
              {submitting ? "Recording..." : "Record Delivery"}
            </button>
          </div>
          </form>
        </div>
      )}
    </div>
  );
}
