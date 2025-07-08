import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTransactions } from "../pages/services/services";

export const loadTransactions = createAsyncThunk(
  "transactions/loadTransactions",
  async (userId, thunkAPI) => {
    try {

      const data = await fetchTransactions(userId); // or use token if needed\
      console.log("from redux fecthing transactions")
      console.log("data from redux",data)
      return data;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  } 
);
const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    data: [], // ✅ was items
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // ✅ was items
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
  console.log(transactionsSlice);


export default transactionsSlice.reducer;
