import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Truck, Sparkles, ArrowRight, CheckCircle, Calendar } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: "Browse & Select",
      description: "Explore our curated collection of designer dresses, shoes, and accessories for any occasion. Filter by size, color, and event type to find your perfect look.",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    },
    {
      step: 2,
      title: "Choose Your Dates",
      description: "Select your rental dates that work for your schedule. We offer flexible daily and weekly rental options. Plus, choose your delivery preferenc",
      icon: Calendar,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    },
    {
      step: 3,
      title: "Receive & Wear",
      description: "Your rental will be delivered to your door with care instructions. Rock your stunning look for your special event and make memories!",
      icon: Truck,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop",
    },
    {
      step: 4,
      title: "Easy Returns",
      description: "Simply pack up your rental in our reusable bag and schedule a pickup. We handle the rest, including professional cleaning for the next renter.",
      icon: Shield,
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop",
    },
  ];

  const benefits = [
    "Free delivery on orders over ₹100",
    "Professional cleaning between rentals",
    "Full deposit refund on return",
    "24/7 customer support",
    "Size exchange available",
    "Rental insurance included",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white">How It Works</h1>
          <p className="mt-4 text-xl text-rose-100">
            Renting fashion has never been easier
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-rose-600" />
                  </div>
                  <span className="ml-4 text-sm font-medium text-rose-600">
                    Step {step.step}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="mt-4 text-lg text-gray-600">{step.description}</p>
              </div>
              <div className="flex-1">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose RentSquare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-rose-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Renting?</h2>
          <p className="mt-4 text-lg text-rose-100">
            Join thousands of happy customers who found their perfect look
          </p>
          <div className="mt-8">
            <Link href="/categories">
              <Button size="lg" variant="secondary" className="bg-white text-rose-600 hover:bg-gray-100">
                Browse Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
