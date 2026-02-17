"use client";

import React from 'react';
import Image from 'next/image';

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Bride",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "Renting my wedding lehenga was the best decision! The quality was impeccable, and I saved so much money for my honeymoon.",
        rating: 5
    },
    {
        name: "Rahul Verma",
        role: "Software Engineer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "Needed a Sherwani for my cousin's wedding urgently. RentSquare delivered it within 24 hours, perfectly fitted. Highly recommended!",
        rating: 5
    },
    {
        name: "Anjali Gupta",
        role: "Fashion Blogger",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "As someone who needs new outfits constantly for shoots, this platform is a lifesaver. The collection is trendy and always fresh.",
        rating: 4
    }
];

export function Testimonials() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">What Our Clients Say</h2>
                    <p className="text-black text-lg">Real stories from happy customers across India.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 relative">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        fill
                                        sizes="56px"
                                        priority={index < 2}
                                        fetchPriority={index === 0 ? "high" : "auto"}
                                        loading={index < 2 ? "eager" : "lazy"}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-xs text-black uppercase tracking-wider">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex text-yellow-400 mb-4 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined fill-current">
                                        {i < testimonial.rating ? 'star' : 'star_border'}
                                    </span>
                                ))}
                            </div>

                            <p className="text-black italic leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
