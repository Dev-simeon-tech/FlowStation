import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schema/register.schema";
import s from "../styles/shared.module.css";

export default function Register() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", address: "", password: "" },
  });

  useEffect(() => {
    document.title = "Register / FlowStation";
  }, []);

  async function onSubmit(values: RegisterFormValues) {
    setError("");
    try {
      await registerUser(
        values.name,
        values.email,
        values.password,
        values.address,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  }

  const btnText = isSubmitting ? "Creating account..." : "Register";

  return (
    <div className={s.loginWrap}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}>
          <img src='/favicon.png' alt='' width={40} height={40} />
        </div>
        <h1 className={s.loginTitle}>FlowStation</h1>
        <p className={s.loginSub}>Register your station</p>

        {error && (
          <div
            style={{
              background: "#f87e7e",
              border: "1px solid var(--accent)",
              padding: 10,
              marginBottom: 12,
            }}
          >
            <p
              style={{ color: "#333" }}
              dangerouslySetInnerHTML={{ __html: error }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={s.loginForm}>
          <div className={s.formGroup}>
            <label>Station Name</label>
            <input
              type='text'
              placeholder='e.g. Total Energies GRA'
              autoFocus
              {...register("name")}
            />
            {errors.name && (
              <p className={s.loginError}>{errors.name.message}</p>
            )}
          </div>
          <div className={s.formGroup}>
            <label>Email</label>
            <input
              type='email'
              placeholder='admin@station.com'
              {...register("email")}
            />
            {errors.email && (
              <p className={s.loginError}>{errors.email.message}</p>
            )}
          </div>
          <div className={s.formGroup}>
            <label>Address</label>
            <input
              type='text'
              placeholder='Station address'
              {...register("address")}
            />
            {errors.address && (
              <p className={s.loginError}>{errors.address.message}</p>
            )}
          </div>

          <div className={s.formGroup}>
            <label>Password</label>
            <input
              type='password'
              placeholder='********'
              {...register("password")}
            />
            {errors.password && (
              <p className={s.loginError}>{errors.password.message}</p>
            )}
          </div>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            type='submit'
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: 8 }}
          >
            {btnText}
          </button>
        </form>

        <p
          className={s.loginSub}
          style={{ marginTop: 16, textAlign: "center" }}
        >
          Already have an account?{" "}
          <Link to='/login' style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
