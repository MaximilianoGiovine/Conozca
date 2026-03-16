import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function DashboardHeader({
    title,
    subtitle,
    actionLabel,
    onAction,
}: DashboardHeaderProps) {
    const router = useRouter();

    const handleSignOut = () => {
        // In demo mode, just redirect to login
        router.push("/login");
    };

    return (
        <div className="dashboard-header">
            <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div className="header-actions">
                {actionLabel && onAction && (
                    <button onClick={onAction} className="primary-button">
                        {actionLabel}
                    </button>
                )}
                <button onClick={handleSignOut} className="ghost-button">
                    Sign out
                </button>
            </div>
            <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        p {
          color: var(--ink-soft);
        }
      `}</style>
        </div>
    );
}
