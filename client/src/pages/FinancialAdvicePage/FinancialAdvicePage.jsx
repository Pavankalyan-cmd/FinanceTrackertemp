import React from "react";
import "./FinancialAdvicePage.css";
import { Button, Chip, LinearProgress, CircularProgress } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useSelector, useDispatch } from "react-redux";
import { fetchAIInsights } from "../../redux/aiInsightsSlice";

const FinancialAdvicePage = () => {
  const dispatch = useDispatch();
  const { data: advice, loading } = useSelector((state) => state.aiInsights);

  const handleRefresh = () => {
    dispatch(fetchAIInsights());
  };

  if (loading || !advice) {
    return (
      <div className="financial-advice-page">
        <CircularProgress />
      </div>
    );
  }

  const { insights, budget, goals, health } = advice;

  return (
    <div className="financial-advice-page">
      <div className="advice-header-row">
        <h2 className="advice-title">Personalized Financial Advice</h2>
        <Button
          variant="outlined"
          className="refresh-btn"
          startIcon={<RefreshOutlinedIcon />}
          onClick={handleRefresh}
        >
          Refresh Insights
        </Button>
      </div>

      {/* Insights */}
      <div className="advice-card">
        <div className="advice-card-header">
          <InfoOutlinedIcon className="advice-info-icon" />
          <span className="advice-card-title">AI-Powered Insights</span>
          <span className="advice-card-count">{insights?.length || 0} new</span>
        </div>
        <div className="advice-insights-list">
          {insights.map((insight, idx) => (
            <div className="advice-insight-row" key={idx}>
              <div className="advice-insight-main">
                <div className="advice-insight-title-row">
                  <span className="advice-insight-title">{insight.title}</span>
                  <Chip
                    label={insight.impact}
                    size="small"
                    className={`advice-impact-badge ${insight.impact
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    style={{
                      backgroundColor: getImpactColor(insight.impact),
                      color: "#fff",
                    }}
                  />
                </div>
                <div className="advice-insight-desc">{insight.description}</div>
                {insight.savings && (
                  <div className="advice-insight-savings">
                    {insight.savings}
                  </div>
                )}
              </div>
              <div className="advice-insight-actions">
                <Button variant="text" className="advice-dismiss-btn">
                  Dismiss
                </Button>
                <Button variant="contained" className="advice-apply-btn">
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="advice-card">
        <div className="advice-card-title">Smart Budget Recommendations</div>
        <div className="advice-budget-list">
          {budget.map((item, idx) => (
            <div className="advice-budget-row" key={idx}>
              <span className="advice-budget-name">{item.name}</span>
              <Chip
                label={item.status}
                size="small"
                className="advice-budget-status"
                style={{
                  backgroundColor: getStatusColor(item.status),
                  color: "#fff",
                }}
              />
              <span className="advice-budget-current">
                Current: ₹{item.current}
              </span>
              <span className="advice-budget-recommended">
                Recommended: ₹{item.recommended}
              </span>
              <span className={`advice-budget-diff`}>{item.diff}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="advice-card advice-goals-card">
        <div className="advice-card-title">Financial Goal Tracking</div>
        <div className="advice-goals-row">
          {goals.map((goal, idx) => (
            <div className="advice-goal-col" key={idx}>
              <div className="advice-goal-title-row">
                <span className="advice-goal-title">{goal.name}</span>
                <span className="advice-goal-percent">
                  {goal.percent}% complete
                </span>
              </div>
              <LinearProgress
                className="advice-goal-bar"
                variant="determinate"
                value={goal.percent}
                sx={{
                  height: 8,
                  borderRadius: 6,
                  backgroundColor: "#f0f1f3",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: goal.barColor || "#1976d2",
                  },
                }}
              />
              <div className="advice-goal-meta">
                ₹{goal.current.toLocaleString()} of ₹
                {goal.total.toLocaleString()} goal
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health */}
      <div className="advice-card advice-health-card">
        <div className="advice-health-row">
          {health.map((stat, idx) => (
            <div className={`advice-health-col ${stat.color}`} key={idx}>
              <div className="advice-health-value">{stat.value}</div>
              <div className="advice-health-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvicePage;

// === Utility Functions ===

function getImpactColor(impact) {
  switch (impact.toLowerCase()) {
    case "high impact":
      return "#e53935";
    case "medium impact":
      return "#fbc02d";
    case "low impact":
      return "#43a047";
    default:
      return "#757575";
  }
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "over budget":
      return "#d32f2f";
    case "within budget":
      return "#388e3c";
    case "under budget":
      return "#1976d2";
    default:
      return "#616161";
  }
}
