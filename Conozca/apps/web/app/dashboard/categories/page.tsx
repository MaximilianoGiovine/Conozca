"use client";

import { useState, useEffect } from "react";
import { getCategories } from "../../lib/api";
import type { Category } from "../../lib/types";
import styles from "../dashboard.module.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to API
    console.log("Save category:", formData);
    setShowModal(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Categories</h1>
          <p className={styles.subtitle}>Organize your content by topic</p>
        </div>
        <button onClick={handleNewCategory} className={styles.primaryButton}>
          New Category
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading categories...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.categoryCardHeader}>
                <h3>{category.name}</h3>
                <button onClick={() => handleEdit(category)} className={styles.iconButton}>
                  ✎
                </button>
              </div>
              {category.description && (
                <p className={styles.categoryDescription}>{category.description}</p>
              )}
              <div className={styles.categoryStats}>
                <span className={styles.statLabel}>Articles</span>
                <span className={styles.statValue}>{category._count?.articles || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={styles.textarea}
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.secondaryButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
