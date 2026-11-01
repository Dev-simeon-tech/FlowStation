import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { LoginSchema, type LoginFormInput } from "@flowstation/schemas";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  if (user) {
    navigate("/dashboard", { replace: true });
  }

  useEffect(() => {
    document.title = "Login / FlowStation";
  }, []);

  async function onSubmit(values: LoginFormInput) {
    setError("");
    try {
      await login(values.email, values.password);
      const redirect = searchParams.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/dashboard", {
        replace: true,
      });
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
    <div className='loginWrap'>
      <div className='loginCard'>
        <div className='loginLogo'>
          <img src='/favicon.png' alt='' width={40} height={40} />
        </div>
        <h1 className='loginTitle'>FlowStation</h1>
        <p className='loginSub'>Sign in to your station dashboard</p>
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
        <form onSubmit={handleSubmit(onSubmit)} className='loginForm'>
          <div className='formGroup'>
            <label>Email</label>
            <input
              type='email'
              placeholder='admin@flowstation.com'
              autoFocus
              {...register("email")}
            />
            {errors.email && (
              <p className='loginError'>{errors.email.message}</p>
            )}
          </div>
          <div className='formGroup'>
            <label>Password</label>
            <input
              type='password'
              placeholder='••••••••'
              {...register("password")}
            />
            {errors.password && (
              <p className='loginError'>{errors.password.message}</p>
            )}
          </div>

          <button
            className={`btn btnPrimary`}
            type='submit'
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: 8 }}
          >
            {btnText}
          </button>
        </form>

        <p className='loginSub' style={{ marginTop: 16, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link to='/register' style={{ color: "var(--accent)" }}>
            Register your station
          </Link>
        </p>
      </div>
    </div>
  );
}
