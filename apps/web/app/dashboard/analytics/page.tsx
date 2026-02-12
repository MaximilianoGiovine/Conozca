"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data - replace with API calls
  const stats = {
    pageViews: 45230,
    visitors: 12780,
    avgTimeOnPage: "3m 24s",
    bounceRate: "42%",
  };

  const topArticles = [
    { title: "The Future of Digital Journalism", views: 8420, change: "+12%" },
    { title: "Understanding Modern Media", views: 6350, change: "+8%" },
    { title: "The Evolution of Storytelling", views: 5670, change: "-3%" },
    { title: "Investigative Reporting in 2026", views: 4820, change: "+15%" },
    { title: "Data-Driven Journalism", views: 3910, change: "+5%" },
  ];

  const trafficSources = [
    { source: "Direct", visitors: 4520, percentage: 35 },
    { source: "Google Search", visitors: 3840, percentage: 30 },
    { source: "Social Media", visitors: 2560, percentage: 20 },
    { source: "Referral", visitors: 1280, percentage: 10 },
    { source: "Email", visitors: 580, percentage: 5 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Analytics</h1>
          <p className={styles.subtitle}>Track your editorial performance</p>
        </div>
        <div className={styles.filterGroup}>
          <button
            className={timeRange === "7d" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setTimeRange("7d")}
          >
            Last 7 days
          </button>
          <button
            className={timeRange === "30d" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setTimeRange("30d")}
          >
            Last 30 days
          </button>
          <button
            className={timeRange === "90d" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setTimeRange("90d")}
          >
            Last 90 days
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Page Views</span>
          <span className={styles.statValue}>{stats.pageViews.toLocaleString()}</span>
          <span className={styles.statChange}>+12% vs previous period</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Unique Visitors</span>
          <span className={styles.statValue}>{stats.visitors.toLocaleString()}</span>
          <span className={styles.statChange}>+8% vs previous period</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg. Time on Page</span>
          <span className={styles.statValue}>{stats.avgTimeOnPage}</span>
          <span className={styles.statChange}>+15s vs previous period</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Bounce Rate</span>
          <span className={styles.statValue}>{stats.bounceRate}</span>
          <span className={styles.statChange}>-2% vs previous period</span>
        </div>
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.panel}>
          <h2>Top Articles</h2>
          <div className={styles.rankingList}>
            {topArticles.map((article, index) => (
              <div key={index} className={styles.rankingItem}>
                <div className={styles.rankingRank}>{index + 1}</div>
                <div className={styles.rankingInfo}>
                  <span className={styles.rankingTitle}>{article.title}</span>
                  <span className={styles.rankingMeta}>
                    {article.views.toLocaleString()} views
                  </span>
                </div>
                <span
                  className={`${styles.rankingChange} ${
                    article.change.startsWith("+") ? styles.positive : styles.negative
                  }`}
                >
                  {article.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Traffic Sources</h2>
          <div className={styles.trafficList}>
            {trafficSources.map((source, index) => (
              <div key={index} className={styles.trafficItem}>
                <div className={styles.trafficInfo}>
                  <span className={styles.trafficSource}>{source.source}</span>
                  <span className={styles.trafficVisitors}>
                    {source.visitors.toLocaleString()} visitors
                  </span>
                </div>
                <div className={styles.trafficBar}>
                  <div
                    className={styles.trafficBarFill}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <span className={styles.trafficPercentage}>{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
