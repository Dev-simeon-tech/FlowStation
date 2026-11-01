import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CreateAttendantSchema,
  type CreateAttendantInput,
} from "@flowstation/schemas";
import type { Attendant } from "@flowstation/types";
import { apiFetch } from "../lib/api";

export default function Attendants() {
  useEffect(() => {
    document.title = "attendants";
  }, []);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [editing, setEditing] = useState<Attendant | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<CreateAttendantInput>({
    resolver: zodResolver(CreateAttendantSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      pumpAssigned: "",
      phone: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch<Attendant[]>("/api/attendants")
      .then(setAttendants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    reset({ fullName: "", employeeId: "", pumpAssigned: "", phone: "" });
    setEditing(null);
    setError("");
  }

  function handleEdit(a: Attendant) {
    setEditing(a);
    reset({
      fullName: a.fullName,
      employeeId: a.employeeId,
      pumpAssigned: a.pumpAssigned || "",
      phone: a.phone,
    });
    setError("");
  }

  async function onSubmit(values: CreateAttendantInput) {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        const updated = await apiFetch<Attendant>(
          `/api/attendants/edit/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(values),
          },
        );
        setAttendants((prev) =>
          prev.map((a) => (a.id === editing.id ? updated : a)),
        );
        setMessage("Attendant updated successfully");
        setTimeout(() => setMessage(""), 5000);
      } else {
        const created = await apiFetch<Attendant>("/api/attendants/new", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setAttendants((prev) => [...prev, created]);
        setMessage("Attendant registered successfully");
        setTimeout(() => setMessage(""), 5000);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save attendant");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(a: Attendant) {
    try {
      const updated = await apiFetch<Attendant>(
        `/api/attendants/status/${a.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: !a.isActive }),
        },
      );
      setAttendants((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
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
        <h1>Attendant Registration</h1>
        <p>Register and manage pump staff</p>
      </div>

      <div className="card">
        <h2>{editing ? "Edit Attendant" : "Register Attendant"}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formGrid">
          <div className="formGroup">
            <label>Full Name</label>
            <input
              type='text'
              placeholder='Full name'
              {...register("fullName")}
            />
            {fieldErrors.fullName && <p className="loginError">{fieldErrors.fullName.message}</p>}
          </div>
          <div className="formGroup">
            <label>Employee ID</label>
            <input
              type='text'
              placeholder='e.g. ATT-004'
              {...register("employeeId")}
            />
            {fieldErrors.employeeId && <p className="loginError">{fieldErrors.employeeId.message}</p>}
          </div>
          <div className="formGroup">
            <label>Pump Assigned</label>
            <input
              type='text'
              placeholder='e.g. Pump 4'
              {...register("pumpAssigned")}
            />
          </div>
          <div className="formGroup">
            <label>Phone</label>
            <input
              type='text'
              placeholder='0804-XXX-XXXX'
              {...register("phone")}
            />
            {fieldErrors.phone && <p className="loginError">{fieldErrors.phone.message}</p>}
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
                ? "Update Attendant"
                : "Register Attendant"}
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
        <h2>Attendants</h2>
        {loading ? (
          <div className="empty">
            <p>Loading...</p>
          </div>
        ) : attendants.length === 0 ? (
          <div className="empty">
            <p>No attendants registered yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Pump</th>
                <th>Phone</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attendants.map((a) => (
                <tr key={a.id} style={{ opacity: a.isActive ? 1 : 0.5 }}>
                  <td>{a.fullName}</td>
                  <td>{a.employeeId}</td>
                  <td>{a.pumpAssigned || "-"}</td>
                  <td>{a.phone}</td>
                  <td>{a.hireDate?.slice(0, 10)}</td>
                  <td>
                    <span
                      className={`badge ${a.isActive ? "badgeSuccess" : "badgeDanger"}`}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {/* FIX: was btnDanger — Edit should be the primary action */}
                    <button
                      className={`btn btnPrimary`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => handleEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btnDanger`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => toggleActive(a)}
                    >
                      {a.isActive ? "Deactivate" : "Activate"}
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
