import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const RegisterPage = () => {
  const { register: doRegister, error } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setLocalError(null);
    try {
      await doRegister(values);
      navigate(next);
    } catch (e: any) {
      setLocalError(e?.body?.message ?? e?.message ?? "Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-neutral-800 p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Register</h1>

      {(localError || error) && (
        <div className="bg-red-900/40 border border-red-700 p-3 rounded-lg mb-4">
          <p className="text-red-200">{localError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <label className="text-sm text-neutral-300">First name</label>
        <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("firstName", { required: true })} />

        <label className="text-sm text-neutral-300">Last name</label>
        <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("lastName", { required: true })} />

        <label className="text-sm text-neutral-300">Email</label>
        <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" type="email" {...register("email", { required: true })} />

        <label className="text-sm text-neutral-300">Password (min 12 chars)</label>
        <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" type="password" {...register("password", { required: true, minLength: 12 })} />

        <button disabled={isSubmitting} className="mt-2 bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-4 py-2 rounded-lg disabled:opacity-50">
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-neutral-400 mt-4">
        Heb je al een account?{" "}
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-green-500 underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
