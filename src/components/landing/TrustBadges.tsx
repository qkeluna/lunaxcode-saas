import { Shield, Zap, HeartHandshake, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: '2-4 week turnaround',
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: '24/7 communication',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Unlimited revisions',
    },
  ];

  return (
    <section className="py-16 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <badge.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
