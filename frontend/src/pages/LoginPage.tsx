import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../api/client";

type FormValues = { email: string; password: string };

const LoginPage = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setLocalError(null);
    try {
      await login(values.email, values.password);
      navigate(next);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setLocalError(e.body?.message ?? e.message ?? "Login failed");
      } else {
        setLocalError("Login failed");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-neutral-800 p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Inloggen</h1>

      {(localError || error) && (
        <div className="bg-red-900/40 border border-red-700 p-3 rounded-lg mb-4">
          <p className="text-red-200">{localError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <label className="text-sm text-neutral-300">Email</label>
        <input
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
          type="email"
          {...register("email", { required: true })}
        />

        <label className="text-sm text-neutral-300">Wachtwoord</label>
        <input
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
          type="password"
          {...register("password", { required: true })}
        />

        <button
          disabled={isSubmitting}
          className="mt-2 bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? "Inloggen…" : "Inloggen"}
        </button>
      </form>

      <p className="text-neutral-400 mt-4">
        Nog geen account?{" "}
        <Link to={`/register?next=${encodeURIComponent(next)}`} className="text-green-500 underline">
          Registreren
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
