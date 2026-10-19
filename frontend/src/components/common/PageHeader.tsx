interface PageHeaderProps {
    title: string
    description: string
    // Shown at the right end, e.g. an "Add User" button
    actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {actions}
        </div>
    )
}
