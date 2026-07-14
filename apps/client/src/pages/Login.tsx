import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginSchema, type LoginFormValues } from "../schema/login.schema";
import s from "../styles/shared.module.css";

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    document.title = "Login / FlowStation";
  }, []);

  async function onSubmit(values: LoginFormValues) {
    setError("");
    try {
      await login(values.email, values.password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    }
  }

  const btnText = isSubmitting ? "Signing in..." : "Sign in";

  return (
    <div className={s.loginWrap}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}>
          <img src='/favicon.png' alt='' width={40} height={40} />
        </div>
        <h1 className={s.loginTitle}>FlowStation</h1>
        <p className={s.loginSub}>Sign in to your station dashboard</p>
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
            <label>Email</label>
            <input
              type='email'
              placeholder='admin@flowstation.com'
              autoFocus
              {...register("email")}
            />
            {errors.email && (
              <p className={s.loginError}>{errors.email.message}</p>
            )}
          </div>
          <div className={s.formGroup}>
            <label>Password</label>
            <input
              type='password'
              placeholder='••••••••'
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
          Don&apos;t have an account?{" "}
          <Link to='/register' style={{ color: "var(--accent)" }}>
            Register your station
          </Link>
        </p>
      </div>
    </div>
  );
}
