import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import styles from "./dashboard.module.css";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopNav />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
