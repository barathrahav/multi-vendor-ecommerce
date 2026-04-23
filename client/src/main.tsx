import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <ApolloProvider client={apolloClient}>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: "20px",
          padding: "14px 16px",
          background: "#111827",
          color: "#ffffff",
          boxShadow: "0 20px 50px -20px rgba(15, 23, 42, 0.55)",
        },
        success: {
          duration: 3200,
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
          style: {
            background: "#052e16",
            color: "#dcfce7",
            border: "1px solid #166534",
          },
        },
        error: {
          duration: 4200,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
          style: {
            background: "#450a0a",
            color: "#fee2e2",
            border: "1px solid #991b1b",
          },
        },
        loading: {
          style: {
            background: "#172554",
            color: "#dbeafe",
            border: "1px solid #1d4ed8",
          },
        },
      }}
    />
  </ApolloProvider>
);
