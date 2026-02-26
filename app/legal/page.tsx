import Link from 'next/link';
import React from 'react';

const policies = [
    {
        title: 'Privacy Policy',
        description: 'Learn how we collect, use, and protect your personal data.',
        href: '/legal/privacy',
    },
    {
        title: 'Refund Policy',
        description: 'Information about cancellations, returns, and refunds.',
        href: '/legal/refund',
    },
    {
        title: 'Terms & Conditions',
        description: 'The legal terms governing your use of our platform.',
        href: '/legal/terms-conditions',
    },
    {
        title: 'Partner Terms',
        description: 'Legal agreement for shops, designers, and rental businesses.',
        href: '/legal/partner-terms',
    },
];

export default function LegalIndex() {
    return (
        <div className="bg-white min-h-screen text-black">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-4">Legal Center</h1>
                <p className="text-gray-600 text-lg mb-12">
                    Find all our legal documents, policies, and terms of service below.
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {policies.map((policy) => (
                        <Link
                            key={policy.href}
                            href={policy.href}
                            className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-blue-500 flex flex-col h-full"
                        >
                            <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                {policy.title}
                            </h2>
                            <p className="text-gray-500 text-sm flex-grow">
                                {policy.description}
                            </p>
                            <div className="mt-4 text-blue-600 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                                Read More
                                <span className="ml-1">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
