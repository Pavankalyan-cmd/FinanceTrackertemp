import React, { useRef, useState, useEffect } from "react";
import "./OverviewPage.css";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import WalletIcon from "@mui/icons-material/Wallet";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { uploadBankStatement } from "../services/services";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { getAuth } from "firebase/auth"; // Only used to get UID
import { useDispatch, useSelector } from "react-redux";
import { loadTransactions } from "../../redux/transactionsSlice";

const OverviewPage = () => {
  const fileInputRef = useRef();
  const dispatch = useDispatch();

  // 🗂 Transactions from Redux
  const transactions = useSelector((state) => state.transactions.data || []);
  const loading = useSelector((state) => state.transactions.loading);
  console.log("Transactions from Redux:", transactions);


  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlySpending: 0,
    categoryCount: 0,
  });

  // 📊 Compute summary when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      computeSummary(transactions);
    }
  }, [transactions]);

  // 📊 Summary Calculation
  function computeSummary(transactions) {
    let creditTotal = 0;
    let debitTotal = 0;
    let monthlySpending = 0;
    const categories = new Set();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let tx of transactions) {
      const amt = parseFloat(tx.amount || 0);
      const txDate = new Date(tx.date);

      if (tx.type === "credit") creditTotal += amt;

      if (tx.type === "debit") {
        debitTotal += amt;
        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          monthlySpending += amt;
        }
      }

      if (tx.category) categories.add(tx.category);
    }

    setSummary({
      totalBalance: creditTotal - debitTotal,
      monthlySpending,
      categoryCount: categories.size,
    });
  }

  // 📁 Upload logic
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleUpload = async (file) => {
    const password = prompt("Enter PDF password (if any):") || "";
    setIsUploading(true);
    try {
      const result = await uploadBankStatement(file, password);
      toast.success(`✅ Uploaded ${result.data.length} transactions`);

      // 🔄 Refresh from backend via Redux
      const user = getAuth().currentUser;
      if (user) {
        dispatch(loadTransactions(user.uid));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("❌ Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  // 🧠 Render
  return (
    <div className="categories-page">
      <ToastContainer position="top-right" autoClose={4000} />

      {loading ? (
        <div className="loading-container">
          <ClipLoader size={50} color="#4CAF50" />
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* 🔢 Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-content">
                <div>
                  <div className="summary-title">Total Balance</div>
                  <div className="summary-value green">
                    ₹{summary.totalBalance.toFixed(2)}
                  </div>
                </div>
                <div className="summary-icon green-bg">
                  <AttachMoneyIcon fontSize="large" />
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-content">
                <div>
                  <div className="summary-title">Monthly Spending</div>
                  <div className="summary-value red">
                    ₹{summary.monthlySpending.toFixed(2)}
                  </div>
                </div>
                <div className="summary-icon red-bg">
                  <BarChartIcon fontSize="large" />
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-content">
                <div>
                  <div className="summary-title">Categories</div>
                  <div className="summary-value blue">
                    {summary.categoryCount}
                  </div>
                </div>
                <div className="summary-icon blue-bg">
                  <WalletIcon fontSize="large" />
                </div>
              </div>
            </div>
          </div>

          {/* 📤 Upload Section */}
          <div className="upload-section">
            <h2 className="upload-title">Upload Bank Statement</h2>
            <p className="upload-desc">
              Upload your PDF bank or credit card statements for AI-powered
              transaction extraction
            </p>

            <div
              className="upload-box"
              onClick={handleUploadClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <ClipLoader size={40} color="#4CAF50" />
              ) : (
                <>
                  <InsertDriveFileOutlinedIcon
                    className="upload-file-icon"
                    fontSize="large"
                  />
                  <div className="upload-box-text">
                    Drop your PDF statements here
                  </div>
                  <div className="upload-box-subtext">
                    or click to browse files
                  </div>
                  <button className="choose-files-btn">Choose Files</button>
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* 🤖 Features Section */}
          <div className="features-row">
            <div className="feature-card">
              <div className="feature-icon green-bg">
                <SmartToyOutlinedIcon fontSize="large" />
              </div>
              <div className="feature-title">AI Extraction</div>
              <div className="feature-desc">
                Automatically extract transactions from PDFs
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue-bg">
                <WalletIcon fontSize="large" />
              </div>
              <div className="feature-title">Smart Categorization</div>
              <div className="feature-desc">
                Auto-categorize spending with machine learning
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon red-bg">
                <BarChartIcon fontSize="large" />
              </div>
              <div className="feature-title">Instant Insights</div>
              <div className="feature-desc">
                Get personalized financial insights and advice
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
