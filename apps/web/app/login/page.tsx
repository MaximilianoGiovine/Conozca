"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "../components/PageShell";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <PageShell className={styles.page}>
      <main className={styles.layout}>
        <section className={styles.brandPanel}>
          <span className={styles.kicker}>Conozca Editorial</span>
          <h1>Welcome back</h1>
          <p>
            Access the editorial dashboard, manage issues, and publish with calm
            confidence.
          </p>
          <div className={styles.brandCard}>
            <p>Issue No. 12</p>
            <h3>Slow media for fast markets</h3>
            <span>Drafts: 4 · Scheduled: 2</span>
          </div>
        </section>

        <section className={styles.formCard}>
          <h2>Login</h2>
          <p className={styles.subtitle}>
            Use your editorial account to continue.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" placeholder="you@conozca.com" required />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" required />
            </label>
            <div className={styles.formActions}>
              <label className={styles.remember}>
                <input type="checkbox" />
                Remember me
              </label>
              <Link href="#" className={styles.textButton}>
                Forgot password?
              </Link>
            </div>
            <button className={styles.primaryButton} type="submit">
              Sign in
            </button>
          </form>
          <div className={styles.footerNote}>
            <span>New here?</span>
            <Link href="#" className={styles.textButton}>
              Request access
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
