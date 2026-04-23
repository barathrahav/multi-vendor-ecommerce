import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar";
import { ME_QUERY } from "../graphql/auth.queries";
import { REGISTER_MUTATION } from "../graphql/auth.mutations";
import type {
  RegisterResponse,
  RegisterVariables,
} from "../types/auth.types";

const RegisterPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [register, { loading }] = useMutation<
    RegisterResponse,
    RegisterVariables
  >(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      localStorage.setItem(
        "token",
        data.register.token
      );

      await apolloClient.clearStore();
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: {
          me: data.register.user,
        },
      });

      navigate("/");
    },
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await register({
      variables: {
        ...form,
        role: "CUSTOMER",
      },
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
            type="text"
            placeholder="Name"
            className="w-full rounded border p-3"
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

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
            {loading
              ? "Registering..."
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
