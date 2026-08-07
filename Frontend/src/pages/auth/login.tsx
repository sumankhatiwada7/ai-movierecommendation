import {useState, type ChangeEvent, type FormEvent} from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../hooks/useauth";






export default function Login() {
  const { login } = useAuth();
    const navigate = useNavigate();
    const [form,setform]=useState({
        email:"",
        password:"",
    })
    const [loading,setloading]=useState(false);
    const [error,seterror]=useState("");

    const handlechange= (e:ChangeEvent<HTMLInputElement>)=>{
        setform({...form,[e.target.name]:e.target.value});

    }
   async function handlesubmit(e:FormEvent<HTMLFormElement>){

    e.preventDefault();
      seterror("");
   setloading(true);
  try{
     await login({
        email:form.email,
        password:form.password
     })
     navigate("/dashboard");
    }catch(error: any){
      seterror(error?.response?.data?.message || "Registration failed.");
    
  }
  finally{
    setloading(false);
  }

   }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handlesubmit}
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow"
      >
        <h1 className="text-3xl font-bold text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <div>
          <label>Email</label>

          <input
            type="email"
            className="w-full rounded border p-2"
            name="email"
            value={form.email}
            onChange={handlechange}
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            className="w-full rounded border p-2"
            name="password"
            value={form.password}
            onChange={handlechange}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

