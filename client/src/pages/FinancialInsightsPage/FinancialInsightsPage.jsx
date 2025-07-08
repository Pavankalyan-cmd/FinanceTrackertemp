import React, { useEffect, useState } from "react";
import "./FinancialInsightsPage.css";
import {
  Button,
  ButtonGroup,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { isSameMonth, isSameYear, subDays } from "date-fns";
import { useSelector } from "react-redux";

const FinancialInsightsPage = () => {
  const transactions = useSelector((state) => state.transactions.data);
  const loading = useSelector((state) => state.transactions.loading);

  const [filteredTx, setFilteredTx] = useState([]);
  const [period, setPeriod] = useState("Monthly");
  const [categorySummary, setCategorySummary] = useState([]);
  const [trends, setTrends] = useState([]);
  const [healthScore, setHealthScore] = useState(75);

  useEffect(() => {
    if (transactions.length) filterAndAnalyze(period);
  }, [period, transactions]);

  const filterAndAnalyze = (period) => {
    const now = new Date();
    let filtered = [];

    switch (period) {
      case "Weekly":
        filtered = transactions.filter(
          (tx) => new Date(tx.date) >= subDays(now, 7)
        );
        break;
      case "Monthly":
        filtered = transactions.filter((tx) =>
          isSameMonth(new Date(tx.date), now)
        );
        break;
      case "Yearly":
        filtered = transactions.filter((tx) =>
          isSameYear(new Date(tx.date), now)
        );
        break;
      default:
        filtered = transactions;
    }

    setFilteredTx(filtered);
    computeCategoryStats(filtered);
    computeTrends(filtered);
    computeHealthScore(filtered);
  };

  const computeCategoryStats = (txs) => {
    const categoryMap = {};
    let total = 0;

    for (let tx of txs) {
      if (tx.type !== "debit") continue;
      const cat = tx.category || "Others";
      const amt = parseFloat(tx.amount || 0);
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += amt;
      total += amt;
    }

    const summary = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      percent: total ? ((amount / total) * 100).toFixed(1) : 0,
    }));

    setCategorySummary(summary);
  };

  const computeTrends = (txs) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return (
        d.getMonth() === lastMonth.getMonth() &&
        d.getFullYear() === lastMonth.getFullYear()
      );
    });

    const currentSpend = txs
      .filter((tx) => tx.type === "debit")
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const lastSpend = lastMonthTx
      .filter((tx) => tx.type === "debit")
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

    const largestExpense = txs
      .filter((tx) => tx.type === "debit")
      .reduce(
        (max, tx) =>
          parseFloat(tx.amount) > parseFloat(max.amount || 0) ? tx : max,
        {}
      );

    const avgSpend =
      transactions
        .filter((tx) => tx.type === "debit")
        .reduce((acc, tx) => acc + parseFloat(tx.amount), 0) / 6;

    const diff = currentSpend - lastSpend;
    const percentChange =
      lastSpend > 0 ? ((diff / lastSpend) * 100).toFixed(1) : 0;

    setTrends([
      {
        value: `${diff >= 0 ? "+" : "-"}₹${Math.abs(diff).toFixed(0)}`,
        label: "vs. Last Month",
        sub:
          lastSpend > 0
            ? `${diff >= 0 ? "↑" : "↓"} ${Math.abs(percentChange)}% change`
            : "-",
        color: diff >= 0 ? "red" : "green",
      },
      {
        value: `₹${avgSpend.toFixed(0)}`,
        label: "Average Monthly",
        sub: "Last 6 months",
        color: "blue",
      },
      {
        value: `₹${parseFloat(largestExpense.amount || 0).toFixed(0)}`,
        label: "Largest Expense",
        sub: largestExpense?.title || "N/A",
        color: "yellow",
      },
    ]);
  };

  const computeHealthScore = (txs) => {
    const income = txs
      .filter((tx) => tx.type === "credit")
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const expense = txs
      .filter((tx) => tx.type === "debit")
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    let score = 50;

    if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;

    if (expense < income) score += 10;

    setHealthScore(Math.min(100, Math.max(0, score)));
  };

  const healthScoreLabel =
    healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Fair";

  return (
    <div className="financial-insights-page">
      <div className="insights-header-row">
        <h2 className="insights-title">Financial Insights</h2>
        <ButtonGroup className="insights-toggle-group">
          {["Weekly", "Monthly", "Yearly"].map((label) => (
            <Button
              key={label}
              variant={period === label ? "contained" : "outlined"}
              onClick={() => setPeriod(label)}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="insights-main-row">
        <div className="insights-card spending-by-category">
          <div className="insights-card-title">Spending by Category</div>
          {categorySummary.length ? (
            categorySummary.map((cat) => (
              <div className="spending-category-row" key={cat.name}>
                <div className="spending-category-label">{cat.name}</div>
                <div className="spending-category-amount">
                  ₹{cat.amount.toFixed(2)}
                </div>
                <div
                  className={`spending-category-percent ${
                    cat.percent < 0 ? "green" : "red"
                  }`}
                >
                  {cat.percent > 0 ? "+" : ""}
                  {cat.percent}%
                </div>
                <LinearProgress
                  className="spending-category-bar"
                  variant="determinate"
                  value={Math.min(100, cat.percent)}
                  color="primary"
                />
              </div>
            ))
          ) : (
            <div>No spending data</div>
          )}
        </div>

        <div className="insights-card health-score-card">
          <div className="insights-card-title">Financial Health Score</div>
          <div className="health-score-circle">
            <CircularProgress
              variant="determinate"
              value={healthScore}
              size={150}
              thickness={3}
              style={{
                color: "#1ecb6b",
                background: "#f5f7fa",
                borderRadius: "50%",
              }}
            />
            <div className="health-score-value">
              <div className="health-score-number">{healthScore}</div>
              <div className="health-score-label">{healthScoreLabel}</div>
            </div>
          </div>
          <div className="health-score-metrics">
            <div className="health-score-metric green">
              Savings Rate: {((healthScore - 50) / 2).toFixed(1)}%
            </div>
            <div className="health-score-metric orange">
              Debt-to-Income: {`${Math.max(0, 100 - healthScore)}%`}
            </div>
            <div className="health-score-metric red">
              Emergency Fund: 2.1 mo
            </div>
          </div>
        </div>
      </div>

      <div className="insights-card spending-trends">
        <div className="insights-card-title">Spending Trends</div>
        <div className="spending-trends-row">
          {trends.map((trend, idx) => (
            <div className={`spending-trend-card ${trend.color}`} key={idx}>
              <div className="spending-trend-value">{trend.value}</div>
              <div className="spending-trend-label">{trend.label}</div>
              <div className="spending-trend-sub">{trend.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsightsPage;
