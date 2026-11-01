import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { RegisterSchema, type RegisterFormInput } from "@flowstation/schemas";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register: registerUser, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", address: "", password: "" },
  });
  if (user) {
    navigate("/dashboard", { replace: true });
  }

  useEffect(() => {
    document.title = "Register / FlowStation";
  }, []);

  async function onSubmit(values: RegisterFormInput) {
    setError("");
    try {
      await registerUser(
        values.name,
        values.email,
        values.password,
        values.address ?? "",
      );
      const redirect = searchParams.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/dashboard", {
        replace: true,
      });
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
    <div className='loginWrap'>
      <div className='loginCard'>
        <div className='loginLogo'>
          <img src='/favicon.png' alt='' width={40} height={40} />
        </div>
        <h1 className='loginTitle'>FlowStation</h1>
        <p className='loginSub'>Register your station</p>

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
            <label>Station Name</label>
            <input
              type='text'
              placeholder='e.g. Total Energies GRA'
              autoFocus
              {...register("name")}
            />
            {errors.name && <p className='loginError'>{errors.name.message}</p>}
          </div>
          <div className='formGroup'>
            <label>Email</label>
            <input
              type='email'
              placeholder='admin@station.com'
              {...register("email")}
            />
            {errors.email && (
              <p className='loginError'>{errors.email.message}</p>
            )}
          </div>
          <div className='formGroup'>
            <label>Address</label>
            <input
              type='text'
              placeholder='Station address'
              {...register("address")}
            />
            {errors.address && (
              <p className='loginError'>{errors.address.message}</p>
            )}
          </div>

          <div className='formGroup'>
            <label>Password</label>
            <input
              type='password'
              placeholder='********'
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
          Already have an account?{" "}
          <Link to='/login' style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
