import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFinancialAdviceAPI,
  fetchTransactions,
} from "../pages/services/services";

export const fetchAIInsights = createAsyncThunk(
  "aiInsights/fetch",
  async (transactions, thunkAPI) => {
    try {
      console.log("transactions sending to backend: ", transactions);
      const aiInsights = await fetchFinancialAdviceAPI(transactions);
      console.log("ai insight data", aiInsights);
      return aiInsights;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "AI fetch failed");
    }
  }
);

const aiInsightsSlice = createSlice({
  name: "aiInsights",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default aiInsightsSlice.reducer;
