"use client";

import { useState, type FormEvent } from "react";
import styles from "../dashboard.module.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

interface NewArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; category: string }) => void;
}

export function NewArticleModal({ isOpen, onClose, onSubmit }: NewArticleModalProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ title, category });
        setTitle("");
        setCategory("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Article">
            <form onSubmit={handleSubmit} className={styles.modalForm}>
                <label>
                    <span>Article Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The quiet advantage of slow media..."
                        required
                    />
                </label>
                <label>
                    <span>Category</span>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Culture">Culture</option>
                        <option value="Business">Business</option>
                        <option value="Design">Design</option>
                        <option value="Ideas">Ideas</option>
                        <option value="Operations">Operations</option>
                    </select>
                </label>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={styles.ghostButton}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                        Create Draft
                    </button>
                </div>
            </form>
        </Modal>
    );
}

interface NewAuthorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; bio: string }) => void;
}

export function NewAuthorModal({ isOpen, onClose, onSubmit }: NewAuthorModalProps) {
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ name, bio });
        setName("");
        setBio("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Author">
            <form onSubmit={handleSubmit} className={styles.modalForm}>
                <label>
                    <span>Author Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        required
                    />
                </label>
                <label>
                    <span>Bio</span>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Editorial director with a focus on digital media..."
                        rows={4}
                    />
                </label>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={styles.ghostButton}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                        Add Author
                    </button>
                </div>
            </form>
        </Modal>
    );
}
