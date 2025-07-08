import { getAuth } from "firebase/auth";
import axios from "axios";

const API_BASE = "http://localhost:8000"; // or your deployed backend URL

export async function uploadBankStatement(file, password = "") {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  console.log("Uploading file:", file);

  console.log(password)
  console.log(idToken)
  const response = await fetch(
    "http://localhost:8000/upload-bank-statement-cot",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to upload");
  }

  return data;
}

export async function fetchTransactions() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch transactions");
  }

  const data = await res.json();
  return data.transactions; 
}



export const fetchFinancialAdviceAPI = async (transactions) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const res = await fetch("http://localhost:8000/ai/financial-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`, // 🔐 Secure with Firebase auth
    },
    body: JSON.stringify({ transactions }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch AI financial advice");
  }

  const data = await res.json();
  return data;
};