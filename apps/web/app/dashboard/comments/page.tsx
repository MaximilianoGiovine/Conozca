"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";

// Mock data - replace with API call
const mockComments = [
  {
    id: 1,
    author: "María González",
    email: "maria@example.com",
    content: "Excelente artículo, muy bien investigado y escrito.",
    article: "The Future of Digital Journalism",
    createdAt: "2026-02-10T14:30:00Z",
    status: "approved",
  },
  {
    id: 2,
    author: "Carlos Ruiz",
    email: "carlos@example.com",
    content: "Me encantaría ver más análisis sobre este tema.",
    article: "Understanding Modern Media",
    createdAt: "2026-02-09T10:15:00Z",
    status: "pending",
  },
  {
    id: 3,
    author: "Laura Mendoza",
    email: "laura@example.com",
    content: "Gran trabajo del equipo editorial!",
    article: "The Evolution of Storytelling",
    createdAt: "2026-02-08T16:45:00Z",
    status: "approved",
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState(mockComments);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredComments = comments.filter(
    (comment) => statusFilter === "all" || comment.status === statusFilter
  );

  const handleApprove = (id: number) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
    );
    alert("✅ Comment approved!");
  };

  const handleReject = (id: number) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c))
    );
    alert("🚫 Comment rejected");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Comments</h1>
          <p className={styles.subtitle}>Moderate reader feedback</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <button
            className={statusFilter === "all" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={statusFilter === "pending" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={statusFilter === "approved" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </button>
          <button
            className={statusFilter === "rejected" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className={styles.commentsList}>
        {filteredComments.map((comment) => (
          <div key={comment.id} className={styles.commentCard}>
            <div className={styles.commentHeader}>
              <div className={styles.commentAuthor}>
                <strong>{comment.author}</strong>
                <span className={styles.commentEmail}>{comment.email}</span>
              </div>
              <span className={`${styles.statusBadge} ${styles[`status${comment.status}`]}`}>
                {comment.status}
              </span>
            </div>
            <p className={styles.commentContent}>{comment.content}</p>
            <div className={styles.commentMeta}>
              <span className={styles.commentArticle}>On: {comment.article}</span>
              <span className={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {comment.status === "pending" && (
              <div className={styles.commentActions}>
                <button onClick={() => handleApprove(comment.id)} className={styles.approveButton}>
                  Approve
                </button>
                <button onClick={() => handleReject(comment.id)} className={styles.rejectButton}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <div className={styles.emptyState}>
          <p>No comments found</p>
        </div>
      )}
    </div>
  );
}
