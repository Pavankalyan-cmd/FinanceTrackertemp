import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "./transactionsSlice";
import aiInsightsReducer from "./aiInsightsSlice";


export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    aiInsights: aiInsightsReducer,
  },
});
