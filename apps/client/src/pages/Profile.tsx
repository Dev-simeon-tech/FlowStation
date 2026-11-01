import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  UpdateOrganisationProfileSchema,
  type UpdateOrganisationProfileInput,
} from "@flowstation/schemas";
import type {
  OrganisationProfile,
  UpdateOrganisationProfileResponse,
} from "@flowstation/types";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";

export default function Profile() {
  const { user, updateUserOrg } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof UpdateOrganisationProfileSchema>,
    unknown,
    UpdateOrganisationProfileInput
  >({
    resolver: zodResolver(UpdateOrganisationProfileSchema),
    defaultValues: {
      name: user?.org.name ?? "",
      address: user?.org.address ?? "",
    },
  });

  useEffect(() => {
    document.title = "Profile / FlowStation";
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        name: user.org.name,
        address: user.org.address ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(values: UpdateOrganisationProfileInput) {
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const result = await apiFetch<UpdateOrganisationProfileResponse>(
        "/api/profile",
        {
          method: "PUT",
          body: JSON.stringify(values),
        },
      );
      const profile: OrganisationProfile = result.profile;
      updateUserOrg({ name: profile.name, address: profile.address });
      reset({ name: profile.name, address: profile.address ?? "" });
      setSuccess("Profile updated successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to update profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="topBar">
        <div className="header">
          <h1>Profile</h1>
          <p>Edit your organisation name and address</p>
        </div>
      </div>

      {error && (
        <p className="loginError" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}
      {success && (
        <p
          className="successMsg"
          role="status"
          style={{ marginBottom: 16, color: "var(--success)" }}
        >
          {success}
        </p>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="formGrid">
            <div className="formGroup">
              <label htmlFor="organisation-name">Organisation Name</label>
              <input
                id="organisation-name"
                type="text"
                {...register("name")}
                required
              />
              {errors.name && (
                <p className="loginError">{errors.name.message}</p>
              )}
            </div>
            <div className="formGroup">
              <label htmlFor="organisation-address">Address</label>
              <input
                id="organisation-address"
                type="text"
                {...register("address")}
              />
              {errors.address && (
                <p className="loginError">{errors.address.message}</p>
              )}
            </div>
          </div>

          <div
            className="formActions"
            style={{ justifyContent: "center", marginTop: 28 }}
          >
            <button
              type="submit"
              className="btn btnPrimary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
