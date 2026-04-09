interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-gray-600">{title}</span>
        {icon && <div className="text-indigo-600">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {change && (
        <div className={`text-sm font-medium ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </div>
      )}
    </Card>
  );
}
