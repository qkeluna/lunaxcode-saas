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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center backdrop-blur-sm bg-white/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
              style={{ padding: 'var(--sp-space-6)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)`
                }}
              >
                <badge.icon className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white"
                style={{ marginBottom: 'var(--sp-space-2)' }}
              >
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
