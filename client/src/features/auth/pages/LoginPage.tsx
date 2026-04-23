import { useState } from "react";
import { LOGIN_MUTATION } from "../graphql/auth.mutations";
import { useNavigate } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client/react";
import Navbar from "../../../components/layout/Navbar";
import { ME_QUERY } from "../graphql/auth.queries";
import type {
  LoginResponse,
  LoginVariables,
} from "../types/auth.types";

const LoginPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [login, { loading }] = useMutation<
  LoginResponse,
  LoginVariables
>(LOGIN_MUTATION, {
  onCompleted: async (data) => {
    localStorage.setItem(
      "token",
      data.login.token
    );

    await apolloClient.clearStore();
    apolloClient.writeQuery({
      query: ME_QUERY,
      data: {
        me: data.login.user,
      },
    });

    if (data.login.user.role === "VENDOR") {
      navigate("/vendor");
      return;
    }

    if (data.login.user.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    navigate("/");
  },
});

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await login({
      variables: form,
    });
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto mt-20 max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-3"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-3"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="w-full rounded bg-black p-3 text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
