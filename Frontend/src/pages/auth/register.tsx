import {useState,type FormEvent} from "react";
import {register } from "../../api/authapi";

import { Link, useNavigate } from "react-router-dom";



export const Register = () => {
    const navigate = useNavigate();
    const [form,setForm]=useState({
        name:"",
        email:"",
        password:"",
        confirmpassword:"",
        role:"user",
    });
    const [loading,setloading]=useState(false);
    const [error,setError]=useState("");
    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
     setForm({...form,[e.target.name]:e.target.value});
    };
    async function handleSubmit(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmpassword){
            setError("Password and Confirm Password do not match");
            return;

        }
         setloading(true);
        try{
            await register({
                name:form.name,
                email:form.email,
                password:form.password,
                role:form.role
            })
            navigate("/login");

        }catch(error){
            setError("An error occurred while registering");
        }finally{
            setloading(false);
        }
    }
return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Create Account
        </h1>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="mb-1 block">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block">Confirm Password</label>
          <input
            name="confirmpassword"
            type="password"
            value={form.confirmpassword}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;


