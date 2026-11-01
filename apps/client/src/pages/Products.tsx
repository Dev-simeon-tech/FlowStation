import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateFuelProductSchema,
  type CreateFuelProductInput,
} from "@flowstation/schemas";
import { FUEL_TYPES } from "@flowstation/constants";
import type { FuelProduct } from "@flowstation/types";
import { apiFetch } from "../lib/api";
import { Select } from "../components/ui/select";

export default function Products() {
  useEffect(() => {
    document.title = "fuel products";
  }, []);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [editing, setEditing] = useState<FuelProduct | null>(null);
  const [message, setMessage] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<
    z.input<typeof CreateFuelProductSchema>,
    unknown,
    CreateFuelProductInput
  >({
    resolver: zodResolver(CreateFuelProductSchema),
    defaultValues: { name: "", type: "PETROL", pricePerLitre: "" },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<FuelProduct[]>("/api/products")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    reset({ name: "", type: "PETROL", pricePerLitre: "" });
    setEditing(null);
    setError("");
  }
  const deleteFuelProduct = async (id: string) => {
    try {
      const res = await apiFetch<{ message: "" }>(`/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage(res.message);
      setTimeout(() => setMessage(""), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product");
    }
  };

  function handleEdit(p: FuelProduct) {
    setEditing(p);
    reset({
      name: p.name,
      type: p.type,
      pricePerLitre: String(p.pricePerLitre),
    });
    setError("");
  }

  async function onSubmit(values: CreateFuelProductInput) {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        const updated = await apiFetch<FuelProduct>(
          `/api/products/edit/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name: values.name,
              type: values.type,
              pricePerLitre: values.pricePerLitre,
            }),
          },
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? updated : p)),
        );
        setMessage("Product updated successfully");
        setTimeout(() => setMessage(""), 5000);
      } else {
        const created = await apiFetch<{
          message: string;
          newFuelProduct: FuelProduct;
        }>("/api/products/setup", {
          method: "POST",
          body: JSON.stringify({
            name: values.name,
            type: values.type,
            pricePerLitre: values.pricePerLitre,
          }),
        });
        setMessage(created.message);
        setProducts((prev) => [...prev, created.newFuelProduct]);
        setTimeout(() => setMessage(""), 5000);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save product");
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
        <h1>Fuel Product Setup</h1>
        <p>Add and edit fuel types and prices</p>
      </div>

      <div className="card">
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formGrid">
          <div className="formGroup">
            <label>Name</label>
            <input
              type='text'
              placeholder='e.g. Premium Motor Spirit'
              {...register("name")}
            />
            {fieldErrors.name && <p className="loginError">{fieldErrors.name.message}</p>}
          </div>
          <div className="formGroup">
            <label>Fuel Type</label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  aria-label="Fuel Type"
                  options={FUEL_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              )}
            />
            {fieldErrors.type && <p className="loginError">{fieldErrors.type.message}</p>}
          </div>
          <div className="formGroup">
            <label>Price per Litre (&#8358;)</label>
            <input
              type='number'
              step='0.01'
              min='0'
              placeholder='0.00'
              {...register("pricePerLitre")}
            />
            {fieldErrors.pricePerLitre && <p className="loginError">{fieldErrors.pricePerLitre.message}</p>}
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
                ? "Update Product"
                : "Add Product"}
          </button>
          {editing && (
            <button type='button' className={`btn btnDanger`} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        </form>
      </div>

      <div className="card">
        <h2>Products</h2>
        {loading ? (
          <div className="empty">
            <p>Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            <p>No products yet. Add one above.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Price/Litre</th>
                <th>Unit</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <span
                      className={`badge ${(["PETROL", "DIESEL", "KEROSENE"].includes(p.type) ? `badge${p.type}` : "badgeInfo")}`}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td>&#8358;{p.pricePerLitre.toFixed(2)}</td>
                  <td>{p.unit}</td>
                  <td>{p.createdAt?.slice(0, 10)}</td>
                  <td
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <button
                      className={`btn btnDanger`}
                      style={{ fontSize: 12, padding: "4px 15px" }}
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>

                    <button
                      className={`btn btnPrimary`}
                      style={{ background: "red", color: "#fff" }}
                      onClick={() => deleteFuelProduct(p.id)}
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
