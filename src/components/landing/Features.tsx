import {
  Sparkles,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for database icon names
const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
};

async function getFeatures() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/features`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch features');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching features:', error);
    return [];
  }
}

export default async function Features() {
  const features = await getFeatures();

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Lunaxcode?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern project management powered by AI, designed for Filipino businesses
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <div
                key={feature.id || index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
