import { useState, useEffect } from "react";
import { CUSTOMER_TYPES } from "../constants";
import type { Customer, FuelProduct } from "../types";
import { apiFetch } from "../lib/api";
import s from "../styles/shared.module.css";

type CustomerPurchases = {
  summary: {
    totalPurchases: number;
    totalLitresBought: number;
    totalSpent: number;
  };
  purchases: Purchase[];
};

type Purchase = {
  id: number;
  fuelProductId: number;
  attendantId: number;
  customerId: number;
  litresSold: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: string;
  fuelProduct: FuelProduct;
  attendant: {
    id: number;
    fullName: string;
    employeeId: string;
  };
};
export default function Customers() {
  useEffect(() => {
    document.title = "customers";
  }, []);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [customerPurchases, setCustomerPurchases] =
    useState<CustomerPurchases | null>(null);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    plateNumber: "",
    customerType: "WALK_IN",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Customer[]>("/api/customers")
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function viewPurchases(c: Customer) {
    setSelected(c);
    setLoadingPurchases(true);
    apiFetch<CustomerPurchases>(`/api/customers/${c.id}/purchases`)
      .then(setCustomerPurchases)
      .catch(() => setCustomerPurchases(null))
      .finally(() => setLoadingPurchases(false));
  }

  function resetForm() {
    setForm({
      fullName: "",
      phone: "",
      plateNumber: "",
      customerType: "WALK_IN",
    });
    setEditing(null);
    setError("");
  }

  function handleEdit(c: Customer) {
    setEditing(c);
    setForm({
      fullName: c.fullName,
      phone: c.phone || "",
      plateNumber: c.plateNumber || "",
      customerType: c.customerType,
    });
    setError("");
  }

  async function handleSubmit() {
    if (!form.fullName) return;
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        const updated = await apiFetch<Customer>(
          `/api/customers/edit/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
        );
        setCustomers((prev) =>
          prev.map((c) => (c.id === editing.id ? updated : c)),
        );
        if (selected?.id === editing.id) setSelected(updated);
      } else {
        const created = await apiFetch<Customer>("/api/customers/new", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setCustomers((prev) => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  }

  // const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  // const totalLitres = purchases.reduce((sum, p) => sum + p.litresSold, 0);

  return (
    <div>
      <div className={s.header}>
        <h1>Customer Purchase Record</h1>
        <p>Register customers and view their purchase history</p>
      </div>

      {/* Add / Edit form */}
      <div className={s.card}>
        <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label>Full Name</label>
            <input
              type='text'
              placeholder='Customer name'
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
            />
          </div>
          <div className={s.formGroup}>
            <label>Phone</label>
            <input
              type='text'
              placeholder='0803-XXX-XXXX'
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <div className={s.formGroup}>
            <label>Plate Number</label>
            <input
              type='text'
              placeholder='e.g. ABC-123-XY'
              value={form.plateNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, plateNumber: e.target.value }))
              }
            />
          </div>
          <div className={s.formGroup}>
            <label>Customer Type</label>
            <select
              value={form.customerType}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerType: e.target.value }))
              }
            >
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <p className={s.loginError} style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
        <div className={s.formActions}>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : editing
                ? "Update Customer"
                : "Add Customer"}
          </button>
          {editing && (
            <button className={`${s.btn} ${s.btnDanger}`} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Customer list */}
      <div className={s.card}>
        <h2>Customers</h2>
        {loading ? (
          <div className={s.empty}>
            <p>Loading...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className={s.empty}>
            <p>No customers registered yet. Add one above.</p>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Plate</th>
                <th>Type</th>
                <th>Since</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ cursor: "pointer" }}>
                  <td>{c.fullName}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.plateNumber || "-"}</td>
                  <td>
                    <span
                      className={`${s.badge} ${c.customerType === "REGISTERED" ? s.badgeSuccess : s.badgeInfo}`}
                    >
                      {c.customerType.replace("_", " ")}
                    </span>
                  </td>
                  <td>{c.createdAt?.slice(0, 10)}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button
                      className={`${s.btn} ${s.btnPrimary}`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => viewPurchases(c)}
                    >
                      History
                    </button>
                    <button
                      className={`${s.btn} ${s.btnDanger}`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Purchase history panel */}
      {selected && (
        <div className={s.card}>
          <div className={s.customerHeader}>
            <div>
              <h2>{selected.fullName} - Purchase History</h2>
              <div className={s.customerMeta}>
                {selected.phone && <span>{selected.phone}</span>}
                {selected.plateNumber && <span>🚗 {selected.plateNumber}</span>}
              </div>
            </div>
            <div className={s.customerTotal}>
              <div className={s.customerTotalLabel}>Total Spent</div>
              <div className={s.customerTotalValue}>
                &#8358;{customerPurchases?.summary.totalSpent.toLocaleString()}
              </div>
              <div className={s.customerTotalSub}>
                {customerPurchases?.summary.totalLitresBought.toLocaleString()}{" "}
                L across {customerPurchases?.purchases.length} transaction
                {customerPurchases?.purchases.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {loadingPurchases && !customerPurchases ? (
            <div className={s.empty}>
              <p>Loading...</p>
            </div>
          ) : customerPurchases?.purchases.length === 0 ? (
            <div className={s.empty}>
              <p>No purchases recorded for this customer.</p>
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
                {customerPurchases?.purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.saleDate).toLocaleString()}</td>
                    <td>{p.fuelProduct?.name ?? `ID ${p.fuelProductId}`}</td>
                    <td>{p.litresSold.toLocaleString()}</td>
                    <td>&#8358;{p.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`${s.badge} ${s.badgeInfo}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td>{p.attendant?.fullName ?? `ID ${p.attendantId}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={s.formActions}>
            <button
              className={`${s.btn} ${s.btnDanger}`}
              onClick={() => {
                setSelected(null);
                setCustomerPurchases(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
