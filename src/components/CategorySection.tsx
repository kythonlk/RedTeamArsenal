import * as Icons from 'lucide-react';
import ToolCard from './ToolCard';

interface Tool {
  name: string;
  description: string;
  commands: string[];
}

interface CategorySectionProps {
  name: string;
  icon: string;
  tools: Tool[];
  target: string;
}

export default function CategorySection({ name, icon, tools, target }: CategorySectionProps) {
  const IconComponent = Icons[icon as keyof typeof Icons] as React.FC<{ className?: string }>;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-700">
        {IconComponent && <IconComponent className="w-6 h-6 text-cyan-400" />}
        <h2 className="text-2xl font-bold text-white">{name}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            name={tool.name}
            description={tool.description}
            commands={tool.commands}
            target={target}
          />
        ))}
      </div>
    </section>
  );
}
