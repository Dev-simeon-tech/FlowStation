import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateCustomerSchema,
  type CreateCustomerInput,
} from "@flowstation/schemas";
import { CUSTOMER_TYPES } from "@flowstation/constants";
import type { Customer, Purchase } from "@flowstation/types";
import { apiFetch } from "../lib/api";
import { Select } from "../components/ui/select";

type CustomerPurchases = {
  summary: {
    totalPurchases: number;
    totalLitresBought: number;
    totalSpent: number;
  };
  purchases: Purchase[];
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
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<
    z.input<typeof CreateCustomerSchema>,
    unknown,
    CreateCustomerInput
  >({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      plateNumber: "",
      customerType: "WALK_IN",
    },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
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
    reset({
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
    reset({
      fullName: c.fullName,
      phone: c.phone || "",
      plateNumber: c.plateNumber || "",
      customerType: c.customerType,
    });
    setError("");
  }

  async function onSubmit(values: CreateCustomerInput) {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        const updated = await apiFetch<Customer>(
          `/api/customers/edit/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(values),
          },
        );
        setCustomers((prev) =>
          prev.map((c) => (c.id === editing.id ? updated : c)),
        );
        setMessage("Customer updated successfully");
        setTimeout(() => setMessage(""), 5000);
        if (selected?.id === editing.id) setSelected(updated);
      } else {
        const created = await apiFetch<Customer>("/api/customers/new", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setCustomers((prev) => [...prev, created]);
        setMessage("Customer registered successfully");
        setTimeout(() => setMessage(""), 5000);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {message && (
        <div
          className="card"
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
      <div className="header">
        <h1>Customer Purchase Record</h1>
        <p>Register customers and view their purchase history</p>
      </div>

      {/* Add / Edit form */}
      <div className="card">
        <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formGrid">
          <div className="formGroup">
            <label>Full Name</label>
            <input
              type='text'
              placeholder='Customer name'
              {...register("fullName")}
            />
            {fieldErrors.fullName && <p className="loginError">{fieldErrors.fullName.message}</p>}
          </div>
          <div className="formGroup">
            <label>Phone</label>
            <input
              type='text'
              placeholder='0803-XXX-XXXX'
              {...register("phone")}
            />
            {fieldErrors.phone && <p className="loginError">{fieldErrors.phone.message}</p>}
          </div>
          <div className="formGroup">
            <label>Plate Number</label>
            <input
              type='text'
              placeholder='e.g. ABC-123-XY'
              {...register("plateNumber")}
            />
            {fieldErrors.plateNumber && <p className="loginError">{fieldErrors.plateNumber.message}</p>}
          </div>
          <div className="formGroup">
            <label>Customer Type</label>
            <Controller
              control={control}
              name="customerType"
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  aria-label="Customer Type"
                  options={CUSTOMER_TYPES.map((type) => ({
                    value: type,
                    label: type.replace("_", " "),
                  }))}
                />
              )}
            />
            {fieldErrors.customerType && <p className="loginError">{fieldErrors.customerType.message}</p>}
          </div>
        </div>
        {error && (
          <p className="loginError" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
        <div className="formActions">
          <button
            className={`btn btnPrimary`}
            type='submit'
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : editing
                ? "Update Customer"
                : "Add Customer"}
          </button>
          {editing && (
            <button type='button' className={`btn btnDanger`} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        </form>
      </div>

      {/* Customer list */}
      <div className="card">
        <h2>Customers</h2>
        {loading ? (
          <div className="empty">
            <p>Loading...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty">
            <p>No customers registered yet. Add one above.</p>
          </div>
        ) : (
          <table className="table">
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
                      className={`badge ${c.customerType === "REGISTERED" ? "badgeSuccess" : "badgeInfo"}`}
                    >
                      {c.customerType.replace("_", " ")}
                    </span>
                  </td>
                  <td>{c.createdAt?.slice(0, 10)}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button
                      className={`btn btnPrimary`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => viewPurchases(c)}
                    >
                      History
                    </button>
                    <button
                      className={`btn btnDanger`}
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
        <div className="card">
          <div className="customerHeader">
            <div>
              <h2>{selected.fullName} - Purchase History</h2>
              <div className="customerMeta">
                {selected.phone && <span>{selected.phone}</span>}
                {selected.plateNumber && <span>🚗 {selected.plateNumber}</span>}
              </div>
            </div>
            <div className="customerTotal">
              <div className="customerTotalLabel">Total Spent</div>
              <div className="customerTotalValue">
                &#8358;{customerPurchases?.summary.totalSpent.toLocaleString()}
              </div>
              <div className="customerTotalSub">
                {customerPurchases?.summary.totalLitresBought.toLocaleString()}{" "}
                L across {customerPurchases?.purchases.length} transaction
                {customerPurchases?.purchases.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {loadingPurchases && !customerPurchases ? (
            <div className="empty">
              <p>Loading...</p>
            </div>
          ) : customerPurchases?.purchases.length === 0 ? (
            <div className="empty">
              <p>No purchases recorded for this customer.</p>
            </div>
          ) : (
            <table className="table">
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
                      <span className={`badge badgeInfo`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td>{p.attendant?.fullName ?? `ID ${p.attendantId}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="formActions">
            <button
              className={`btn btnDanger`}
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
