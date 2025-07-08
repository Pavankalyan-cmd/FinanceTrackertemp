import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import LoginPage from "../LoginPage/LoginPage";
import SignupPage from "../SignupPage/SignupPage";
import LandingPage from "../LandingPage/LandingPage";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { fetchAIInsights } from "../../redux/aiInsightsSlice";
import { loadTransactions } from "../../redux/transactionsSlice";

export default function MainPage() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions.items); // ✅ get from redux

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // ✅ Load transactions first
          const result = await dispatch(loadTransactions()).unwrap();

          // ✅ Only then dispatch insights
          dispatch(fetchAIInsights(result.transactions || result)); // if using payload.transactions
          // or dispatch(fetchAIInsights(result)); depending on your backend structure
        } catch (err) {
          console.error("Failed to load data for AI Insights:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="*" element={<DashboardLayout />} />
      </Routes>
    </div>
  );
}
