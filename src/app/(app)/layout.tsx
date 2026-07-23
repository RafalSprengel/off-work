import AppShellClient from './components/AppShellClient/AppShellClient';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <AppShellClient>
                {children}
            </AppShellClient>

        </div>
    )
}