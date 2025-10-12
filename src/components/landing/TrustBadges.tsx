import { Shield, Zap, HeartHandshake, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your projects',
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Average project completion in 2-4 weeks',
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: '24/7 client communication and updates',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Unlimited revisions until perfect',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <badge.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
