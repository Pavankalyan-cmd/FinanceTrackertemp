import React, { useEffect, useState } from "react";
import "./TransactionsPage.css";
import Button from "@mui/material/Button";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const getCategoryColor = (category) => {
  switch (category) {
    case "Dining":
      return "orange";
    case "Groceries":
      return "green";
    case "Shopping":
      return "purple";
    case "Utilities":
      return "blue";
    case "Transportation":
      return "yellow";
    case "Entertainment":
      return "red";
    case "Healthcare":
      return "teal";
    case "Salary":
    case "Income":
      return "green";
    default:
      return "gray";
  }
};

const TransactionsPage = () => {
  const { data: transactions, loading } = useSelector(
    (state) => state.transactions
  );

  const [filteredTxns, setFilteredTxns] = useState([]);
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");

  // Sort & set on initial load
  useEffect(() => {
    if (transactions?.length > 0) {
      const sorted = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setFilteredTxns(sorted);
    }
  }, [transactions]);

  const handleFilter = () => {
    let filtered = [...transactions];

    if (month) {
      filtered = filtered.filter((tx) => tx.date.slice(0, 7) === month);
    }

    if (category) {
      filtered = filtered.filter((tx) => tx.category === category);
    }

    setFilteredTxns(filtered);
  };

  const handleReset = () => {
    setMonth("");
    setCategory("");
    setFilteredTxns(transactions);
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Date,Amount,Type,Category,Payment Method"]
        .concat(
          filteredTxns.map((tx) =>
            [
              tx.title,
              tx.date,
              tx.amount,
              tx.type,
              tx.category,
              tx.payment_method || "Unknown",
            ].join(",")
          )
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className="transactions-page">
      {loading ? (
        <div className="loading-container">
          <CircularProgress />
          <p>Loading transactions...</p>
        </div>
      ) : (
        <>
          <div className="transactions-header-row">
            <h2 className="transactions-title">Recent Transactions</h2>
            <div className="transactions-actions">
              <Box sx={{ minWidth: 140, marginRight: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={month}
                    label="Month"
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {[
                      ...new Set(transactions.map((t) => t.date.slice(0, 7))),
                    ].map((m) => (
                      <MenuItem key={m} value={m}>
                        {new Date(m + "-01").toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minWidth: 140, marginRight: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {[...new Set(transactions.map((t) => t.category))].map(
                      (c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Button variant="contained" onClick={handleFilter}>
                Filter
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ marginLeft: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                onClick={handleExport}
                sx={{ marginLeft: 1 }}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="transactions-list">
            {filteredTxns.map((tx, idx) => {
              const isCredit = tx.type === "credit";
              const color = getCategoryColor(tx.category);
              const icon = isCredit ? <AttachMoneyIcon /> : <CreditCardIcon />;

              return (
                <div className="transaction-row" key={idx}>
                  <div className="transaction-main">
                    <div className="transaction-icon">{icon}</div>
                    <div className="transaction-info">
                      <div className="transaction-name">{tx.title}</div>
                      <div className="transaction-date">{tx.date}</div>
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div
                      className={`transaction-amount ${
                        isCredit ? "green" : "red"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{parseFloat(tx.amount).toFixed(2)}
                    </div>
                    <div className="transaction-confidence">
                      {tx.payment_method || "Unknown"}
                    </div>
                    <div className={`category-badge ${color}`}>
                      {tx.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsPage;
