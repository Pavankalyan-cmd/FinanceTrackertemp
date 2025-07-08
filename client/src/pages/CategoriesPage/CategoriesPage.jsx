import React, { useState } from "react";
import "./CategoriesPage.css";
import { Button, TextField, Chip, LinearProgress } from "@mui/material";
import { useSelector } from "react-redux";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

const iconMap = {
  Dining: <RestaurantOutlinedIcon />,
  Shopping: <ShoppingCartOutlinedIcon />,
  Groceries: <LocalGroceryStoreOutlinedIcon />,
  Transportation: <DirectionsCarOutlinedIcon />,
  Utilities: <FlashOnOutlinedIcon />,
  Healthcare: <LocalHospitalOutlinedIcon />,
  Entertainment: <EmojiEmotionsOutlinedIcon />,
  Salary: <AttachMoneyOutlinedIcon />,
  Income: <AttachMoneyOutlinedIcon />,
};

const getCategoryBadgeClass = (color) => `category-badge ${color || ""}`;
const getPercentBadgeClass = (color) => `percent-badge ${color || ""}`;

const CategoriesPage = () => {
  const [newCategory, setNewCategory] = useState("");
  const aiData = useSelector((state) => state.aiInsights.data);

  const pendingTransactions = aiData?.category_suggestions || [];
  const learningPerformance = aiData?.category_learning || [];
  const trainingInsightsRaw = aiData?.training_insights || {};

  const trainingInsights = [
    {
      value: trainingInsightsRaw.overall_accuracy || "N/A",
      label: "Overall Accuracy",
      sub: `↑ ${trainingInsightsRaw.accuracy_delta || "0%"}`,
      color: "green",
    },
    {
      value: trainingInsightsRaw.corrections_made || 0,
      label: "Corrections Made",
      sub: "Learning from feedback",
      color: "blue",
    },
    {
      value: trainingInsightsRaw.new_patterns || 0,
      label: "New Patterns",
      sub: "Identified recently",
      color: "yellow",
    },
  ];

  return (
    <div className="category-management-page">
      <div className="category-header-row">
        <h2 className="category-title">Category Management</h2>
        <div className="category-header-actions">
          <TextField
            className="add-category-input"
            size="small"
            placeholder="Add new category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" className="add-category-btn">
            Add Category
          </Button>
        </div>
      </div>

      <div className="category-card">
        <div className="pending-review-header">
          <WarningAmberOutlinedIcon
            className="pending-warning-icon"
            fontSize="small"
          />
          <span className="pending-title">Transactions Pending Review</span>
          <span className="pending-count">{pendingTransactions.length}</span>
        </div>
        <div className="pending-list">
          {pendingTransactions.map((tx, idx) => (
            <div className="pending-row" key={idx}>
              <div className="pending-info">
                <div className="pending-name">{tx.title}</div>
                <div className="pending-meta">
                  ₹{tx.amount?.toFixed(2)} · {tx.confidence || "?"}% confidence
                </div>
              </div>
              <div className="pending-actions">
                <span
                  className={getCategoryBadgeClass(
                    tx.categoryColor || "orange"
                  )}
                >
                  {tx.category || "Uncategorized"}
                </span>
                <Button variant="outlined" className="approve-btn">
                  Approve
                </Button>
                <Button variant="outlined" className="edit-btn">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="category-card ai-learning-performance">
        <div className="ai-learning-title">AI Learning Performance</div>
        <div className="ai-learning-grid">
          {learningPerformance.map((cat, idx) => (
            <div className="ai-learning-card" key={idx}>
              <div className="ai-learning-header">
                <span className="ai-learning-icon">
                  {iconMap[cat.category] || "📊"}
                </span>
                <span className="ai-learning-name">{cat.category}</span>
                <span className={getPercentBadgeClass("blue")}>
                  {cat.accuracy}
                </span>
              </div>
              <div className="ai-learning-tx">
                {cat.transactions} transactions
              </div>
              <LinearProgress
                className="ai-learning-bar"
                variant="determinate"
                value={parseFloat(cat.accuracy?.replace("%", "") || 0)}
                color="primary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="category-card ai-training-insights">
        <div className="ai-training-insights-row">
          {trainingInsights.map((insight, idx) => (
            <div
              className={`ai-training-insight-card ${insight.color}`}
              key={idx}
            >
              <div className="ai-training-insight-value">{insight.value}</div>
              <div className="ai-training-insight-label">{insight.label}</div>
              <div className="ai-training-insight-sub">{insight.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
