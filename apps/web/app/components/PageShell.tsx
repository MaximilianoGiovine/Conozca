import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import styles from "./site-shell.module.css";

type PageShellProps = {
  className?: string;
  children: ReactNode;
};

export default function PageShell({ className, children }: PageShellProps) {
  return (
    <div className={`${styles.shell} ${className ?? ""}`.trim()}>
      <SiteHeader />
      <div className={styles.content}>{children}</div>
      <SiteFooter />
    </div>
  );
}
