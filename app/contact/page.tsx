"use client";

import React from 'react';
import { Mail, MapPin, Clock, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen text-black">
            {/* Hero Section */}
            <div className="bg-gray-50 py-12 md:py-20 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">Contact Us</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Have questions? We're here to help you find the perfect outfit for your special occasion.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email Us</p>
                                        <a href="mailto:Rentsquire.in@gmail.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                                            Rentsquire.in@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Our Location</p>
                                        <p className="text-gray-600">
                                            Paliwal Global Enterprise<br />
                                            Bus stand, Knauta, Sujangarh,<br />
                                            Churu, Rajasthan 331507
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Business Hours</p>
                                        <p className="text-gray-600">Monday - Saturday: 10 AM - 7 PM</p>
                                        <p className="text-gray-600">Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="font-bold mb-2">Support Note</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Our team typically responds to all inquiries within 24-48 business hours. For urgent booking queries, please mention your order ID in the email.
                            </p>
                        </div>
                    </div>

                    {/* Simple Contact Form */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="hello@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="How can we help you?"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                                ></textarea>
                            </div>
                            <button className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
