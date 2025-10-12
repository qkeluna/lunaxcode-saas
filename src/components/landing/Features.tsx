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
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered PRD Generation',
      description: 'Get a comprehensive Project Requirements Document in under 30 seconds using advanced AI technology.',
    },
    {
      icon: FileText,
      title: 'Automated Task Breakdown',
      description: 'Your project is automatically broken down into 15-25 structured tasks with time estimates and priorities.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Communication',
      description: 'Stay connected with our team through built-in messaging. Get updates and provide feedback instantly.',
    },
    {
      icon: CreditCard,
      title: 'Flexible Payment Options',
      description: 'Pay with GCash, PayMaya, or credit card. Secure payment processing through PayMongo.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your project status in real-time with detailed analytics and completion metrics.',
    },
    {
      icon: Shield,
      title: 'Secure File Management',
      description: 'Upload and share project files securely with Cloudflare R2 storage infrastructure.',
    },
    {
      icon: Zap,
      title: 'Fast Turnaround',
      description: 'Most projects completed within 2-4 weeks. We prioritize efficiency without sacrificing quality.',
    },
    {
      icon: Users,
      title: 'Dedicated Team',
      description: 'Work with experienced Filipino developers who understand local business needs.',
    },
    {
      icon: Clock,
      title: '24/7 Dashboard Access',
      description: 'Access your project dashboard anytime, anywhere. Full transparency throughout the development process.',
    },
  ];

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
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
