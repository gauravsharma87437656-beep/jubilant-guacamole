"use client";

import React from 'react';

const steps = [
    {
        icon: "search",
        title: "Browse & Select",
        description: "Explore our collection of premium ethnic wear and choose the perfect outfit for your occasion.",
        color: "bg-blue-50 text-blue-600"
    },
    {
        icon: "calendar_month",
        title: "Book Your Dates",
        description: "Select your rental duration. We recommend booking 2-3 days in advance for the best fit.",
        color: "bg-orange-50 text-orange-600"
    },
    {
        icon: "checkroom",
        title: "Wear & Shine",
        description: "Receive the outfit dry-cleaned and ready to wear. Flaunt your style and make memories.",
        color: "bg-purple-50 text-purple-600"
    },
    {
        icon: "laundry",
        title: "Easy Return",
        description: "Pack the outfit in the reusable bag. We'll pick it up from your doorstep. No cleaning needed!",
        color: "bg-green-50 text-green-600"
    }
];

export function HowItWorks() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">Simple Process</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How RentSquire Works</h2>
                    <p className="text-black text-lg">Rent your dream outfit in 4 simple steps and save up to 90% on retail prices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>
                            )}

                            <div className="bg-white rounded-2xl p-6 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 hover:shadow-xl hover:border-transparent h-full">
                                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined">{step.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-black leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
