import { useLocation } from 'react-router-dom';

interface HeroSectionProps {
  title: string;
  highlightText: string;
  description: string;
  highlightColor?: string;
}

export default function HeroSection({ 
  title, 
  highlightText, 
  description,
  highlightColor = 'text-blue-600'
}: HeroSectionProps) {
  const location = useLocation();
  
  return (
    <div className="text-center space-y-4 py-12">
      <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-6xl">
        {title}
        <span className={highlightColor}>{highlightText}</span>
      </h2>
      <p className="mx-auto text-2xl text-gray-500">
        {description}
      </p>
    </div>
  );
}