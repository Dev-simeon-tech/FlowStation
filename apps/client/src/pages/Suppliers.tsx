import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateSupplierSchema,
  type CreateSupplierInput,
} from "@flowstation/schemas";
import type { Supplier } from "@flowstation/types";
import { apiFetch } from "../lib/api";

export default function Suppliers() {
  useEffect(() => {
    document.title = "Suppliers / FlowStation";
  }, []);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<
    z.input<typeof CreateSupplierSchema>,
    unknown,
    CreateSupplierInput
  >({
    resolver: zodResolver(CreateSupplierSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Supplier[]>("/api/suppliers")
      .then(setSuppliers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    reset({
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    });
    setError("");
  }

  async function deleteSupplier(id: string) {
    try {
      const res = await apiFetch<{ message: string }>(`/api/suppliers/${id}`, {
        method: "DELETE",
      });
      setMessage(res.message);
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to save supplier",
      );
    }
  }
  async function onSubmit(values: CreateSupplierInput) {
    setSubmitting(true);
    setError("");
    try {
      const created = await apiFetch<Supplier>("/api/suppliers/new", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSuppliers((prev) => [...prev, created]);
      setMessage("Supplier added successfully");
      setTimeout(() => setMessage(""), 5000);
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save supplier");
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
        <h1>Supplier Management</h1>
        <p>Add and edit fuel suppliers</p>
      </div>

      <div className="card">
        <h2>Add Supplier</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formGrid">
          <div className="formGroup">
            <label>Company Name</label>
            <input
              type='text'
              placeholder='e.g. Oando PLC'
              {...register("companyName")}
            />
            {fieldErrors.companyName && <p className="loginError">{fieldErrors.companyName.message}</p>}
          </div>
          <div className="formGroup">
            <label>Contact Person</label>
            <input
              type='text'
              placeholder='Full name'
              {...register("contactPerson")}
            />
            {fieldErrors.contactPerson && <p className="loginError">{fieldErrors.contactPerson.message}</p>}
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
            <label>Email</label>
            <input
              type='email'
              placeholder='email@company.com'
              {...register("email")}
            />
            {fieldErrors.email && <p className="loginError">{fieldErrors.email.message}</p>}
          </div>
          <div className="formGroup">
            <label>Address</label>
            <input
              type='text'
              placeholder='Office address'
              {...register("address")}
            />
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
            {submitting ? "Saving..." : "Add Supplier"}
          </button>
        </div>
        </form>
      </div>

      <div className="card">
        <h2>Suppliers</h2>
        {loading ? (
          <div className="empty">
            <p>Loading...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="empty">
            <p>No suppliers yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((p) => (
                <tr key={p.id}>
                  <td>{p.companyName}</td>
                  <td>{p.contactPerson}</td>
                  <td>{p.phone}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.address || "-"}</td>
                  <td>{p.createdAt?.slice(0, 10)}</td>
                  <td>
                    <button
                      className={`btn`}
                      style={{ background: "red", color: "#fff" }}
                      onClick={() => deleteSupplier(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
