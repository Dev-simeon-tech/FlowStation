import { useState, useEffect } from "react";
import { PAYMENT_METHODS } from "../constants";
import type { FuelSale, FuelProduct, Attendant, Customer } from "../types";
import NumberInput from "../components/NumberInput";
import { apiFetch } from "../lib/api";
import s from "../styles/shared.module.css";

export default function Sales() {
  useEffect(() => {
    document.title = "Sales / FlowStation";
  }, []);
  const [tab, setTab] = useState<"sale" | "payments">("sale");
  const [sales, setSales] = useState<FuelSale[]>([]);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fuelProductId: "",
    attendantId: "",
    customerId: "",
    litresSold: "",
    paymentMethod: "CASH",
  });

  function loadAll(signal?: AbortSignal) {
    setLoading(true);
    Promise.all([
      apiFetch<FuelProduct[]>("/api/products"),
      apiFetch<Attendant[]>("/api/attendants"),
      apiFetch<Customer[]>("/api/customers"),
      apiFetch<FuelSale[]>("/api/sales"),
    ])
      .then(([prods, atts, custs, salesData]) => {
        if (signal?.aborted) return;
        setProducts(prods);
        setAttendants(atts);
        setCustomers(custs);
        setSales(salesData);
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

  async function handleSubmit() {
    if (!form.fuelProductId || !form.attendantId || !form.litresSold) return;
    const litres = parseFloat(form.litresSold);
    if (isNaN(litres) || litres <= 0) return;

    setSubmitting(true);
    setError("");
    try {
      const sale = await apiFetch<FuelSale>("/api/sales/new", {
        method: "POST",
        body: JSON.stringify({
          fuelProductId: parseInt(form.fuelProductId),
          attendantId: parseInt(form.attendantId),
          customerId: form.customerId ? parseInt(form.customerId) : null,
          litresSold: litres,
          paymentMethod: form.paymentMethod,
        }),
      });
      setSales((prev) => [sale, ...prev]);
      const product = products.find(
        (p) => p.id === parseInt(form.fuelProductId),
      );
      setMessage(
        `Sale recorded: ${litres.toLocaleString()}L${product ? ` of ${product.name}` : ""} for &#8358;${sale.totalAmount.toLocaleString()}`,
      );
      setForm({
        fuelProductId: "",
        attendantId: "",
        customerId: "",
        litresSold: "",
        paymentMethod: "CASH",
      });
      setTimeout(() => setMessage(""), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={s.topBar}>
        <div className={s.header}>
          <h1>Sales</h1>
          <p>Record sales and view payment history</p>
        </div>
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === "sale" ? s.tabActive : ""}`}
            onClick={() => setTab("sale")}
          >
            New Sale
          </button>
          <button
            className={`${s.tab} ${tab === "payments" ? s.tabActive : ""}`}
            onClick={() => setTab("payments")}
          >
            Payments
          </button>
        </div>
      </div>

      {message && (
        <div
          className={s.card}
          style={{
            background: "#0d2817",
            border: "1px solid var(--accent)",
            marginBottom: 12,
          }}
        >
          <p
            style={{ color: "#3ecf8e" }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
      )}
      {error && (
        <p className={s.loginError} style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {tab === "sale" && (
        <>
          <div className={s.card}>
            <h2>New Sale</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label>Fuel Product</label>
                <select
                  value={form.fuelProductId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fuelProductId: e.target.value }))
                  }
                >
                  <option value=''>
                    {products.length === 0
                      ? "No products - add one first"
                      : "Select product..."}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (&#8358;{p.pricePerLitre}/L)
                    </option>
                  ))}
                </select>
              </div>
              <div className={s.formGroup}>
                <label>Attendant</label>
                <select
                  value={form.attendantId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, attendantId: e.target.value }))
                  }
                >
                  <option value=''>
                    {attendants.filter((a) => a.isActive).length === 0
                      ? "No active attendants"
                      : "Select attendant..."}
                  </option>
                  {attendants
                    .filter((a) => a.isActive)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.employeeId})
                      </option>
                    ))}
                </select>
              </div>
              <div className={s.formGroup}>
                <label>Customer (optional)</label>
                <select
                  value={form.customerId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerId: e.target.value }))
                  }
                >
                  <option value=''>Walk-in / Anonymous</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                      {c.plateNumber ? ` (${c.plateNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <NumberInput
                label='Litres Sold'
                step='0.01'
                min='0'
                placeholder='0'
                value={form.litresSold}
                onChange={(e) =>
                  setForm((f) => ({ ...f, litresSold: e.target.value }))
                }
              />
              <div className={s.formGroup}>
                <label>Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentMethod: e.target.value }))
                  }
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={s.formActions}>
              <button
                className={`${s.btn} ${s.btnPrimary}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Recording..." : "Record Sale"}
              </button>
            </div>
          </div>

          <div className={s.card}>
            <h2>Recent Sales</h2>
            {loading ? (
              <div className={s.empty}>
                <p>Loading...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className={s.empty}>
                <p>No sales recorded yet.</p>
              </div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Litres</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Attendant</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.saleDate).toLocaleString("en-GB")}</td>
                      <td>
                        {sale.fuelProduct?.name ?? `ID ${sale.fuelProductId}`}
                      </td>
                      <td>{sale.litresSold.toLocaleString()}</td>
                      <td>&#8358;{sale.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`${s.badge} ${s.badgeInfo}`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td>
                        {sale.attendant?.fullName ?? `ID ${sale.attendantId}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "payments" && <PaymentsTab sales={sales} loading={loading} />}
    </div>
  );
}

function PaymentsTab({
  sales,
  loading,
}: {
  sales: FuelSale[];
  loading: boolean;
}) {
  const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const cash = sales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const card = sales
    .filter((s) => s.paymentMethod === "CARD")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const transfer = sales
    .filter((s) => s.paymentMethod === "TRANSFER")
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <>
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Collected</div>
          <div className={s.kpiValue}>&#8358;{total.toLocaleString()}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Cash</div>
          <div className={s.kpiValue}>&#8358;{cash.toLocaleString()}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Card</div>
          <div className={s.kpiValue}>&#8358;{card.toLocaleString()}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Transfer</div>
          <div className={s.kpiValue}>&#8358;{transfer.toLocaleString()}</div>
        </div>
      </div>

      <div className={s.card}>
        <h2>All Payments</h2>
        {loading ? (
          <div className={s.empty}>
            <p>Loading...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className={s.empty}>
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Product</th>
                <th>Litres</th>
                <th>Amount</th>
                <th>Attendant</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.saleDate).toLocaleString("en-GB")}</td>
                  <td>
                    <span className={`${s.badge} ${s.badgeInfo}`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td>
                    {sale.fuelProduct?.name ?? `ID ${sale.fuelProductId}`}
                  </td>
                  <td>{sale.litresSold.toLocaleString()}</td>
                  <td>&#8358;{sale.totalAmount.toLocaleString()}</td>
                  <td>
                    {sale.attendant?.fullName ?? `ID ${sale.attendantId}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
