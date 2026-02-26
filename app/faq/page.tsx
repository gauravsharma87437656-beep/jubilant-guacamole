import React from 'react';

const faqs = [
    {
        question: "1. How does renting a lehenga online work?",
        answer: "Renting a lehenga online is simple. Browse your favorite style, select your size, choose rental dates, and place the order. The outfit is delivered to your doorstep before your event and picked up after your rental period ends."
    },
    {
        question: "2. Is renting clothes better than buying for weddings?",
        answer: "Yes, renting is cost-effective and practical, especially for weddings and one-time events. You can wear premium designer outfits at a fraction of the purchase price without worrying about storage or repeat usage."
    },
    {
        question: "3. How much does it cost to rent a designer lehenga?",
        answer: "The rental cost depends on the brand, design, and occasion. Typically, lehenga rentals start from affordable price ranges and go up for premium designer collections."
    },
    {
        question: "4. Can I rent a gown for a wedding or cocktail party?",
        answer: "Yes, you can rent gowns for weddings, receptions, cocktail nights, engagements, and formal parties. We offer a wide collection suitable for different occasions."
    },
    {
        question: "5. Where can I find lehenga on rent near me?",
        answer: "You can browse our platform to find verified rental shops and designers in your city. Simply search by location and filter by occasion or size."
    },
    {
        question: "6. How many days can I keep a rented outfit?",
        answer: "Most rentals are for 3–4 days, which gives you enough time for delivery, event use, and return. Extended rental options are available if needed."
    },
    {
        question: "7. What happens if rented dress doesn’t fit?",
        answer: "We provide detailed size charts and size recommendations to minimize fitting issues. In some cases, trial or backup size options are available."
    },
    {
        question: "8. Is it safe and hygienic to rent clothes?",
        answer: "Yes, all outfits are professionally dry-cleaned and sanitized before every rental to ensure hygiene and safety."
    },
    {
        question: "9. Can I rent clothes for pre-wedding photoshoot?",
        answer: "Yes, we offer stylish lehengas, gowns, ethnic wear, and designer outfits perfect for pre-wedding shoots and engagement photography."
    },
    {
        question: "10. Do you provide same-day delivery for rental outfits?",
        answer: "Same-day or urgent delivery depends on availability and your location. Contact our support team for urgent bookings."
    },
    {
        question: "11. Can I rent outfits for college farewell or prom night?",
        answer: "Yes, we offer trendy gowns, sarees, and designer outfits perfect for college farewell, prom nights, and annual functions."
    },
    {
        question: "12. Do you offer plus size lehenga on rent?",
        answer: "Yes, we offer inclusive sizing including plus-size lehengas and gowns. You can filter by size while browsing."
    },
    {
        question: "13. Is there a security deposit for rental outfits?",
        answer: "Some premium outfits may require a refundable security deposit. The amount is clearly mentioned on the product page before booking."
    },
    {
        question: "14. What if I damage a rented dress?",
        answer: "Minor wear is acceptable, but major damage like burns or permanent stains may attract additional charges depending on the severity."
    },
    {
        question: "15. How early should I book a rental outfit for a wedding?",
        answer: "We recommend booking at least 7–14 days before your event to ensure availability of your preferred style and size."
    },
    {
        question: "16. Can I cancel my outfit rental booking?",
        answer: "Yes, cancellations are allowed before the cut-off period. Cancellation policies are mentioned clearly during checkout."
    },
    {
        question: "17. Can I rent matching accessories with lehenga?",
        answer: "Yes, many outfits offer optional add-ons like dupattas, jewelry, belts, and clutches for a complete look."
    },
    {
        question: "18. Why are rental outfits cheaper than buying?",
        answer: "Rental outfits are shared across customers for different events, which allows you to wear premium fashion at a much lower cost compared to buying."
    },
    {
        question: "19. Is renting clothes sustainable and eco-friendly?",
        answer: "Yes, fashion rental promotes sustainable fashion by reducing textile waste and encouraging reuse of high-quality garments."
    },
    {
        question: "20. Which is the best website for renting outfits in India?",
        answer: "Our platform connects you with trusted local rental boutiques and designers, offering a wide range of outfits for weddings, parties, and special occasions in India."
    }
];

export default function FAQPage() {
    return (
        <div className="bg-white min-h-screen text-black">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
                <p className="text-gray-600 text-lg mb-12 text-center">
                    Everything you need to know about renting with Rentsquire.
                </p>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold mb-3 flex items-start">
                                <span className="text-blue-600 mr-3 hidden sm:inline">Q.</span>
                                {faq.question}
                            </h2>
                            <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg flex items-start">
                                <span className="text-green-600 font-bold mr-3 hidden sm:inline">A.</span>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 bg-blue-50 rounded-2xl text-center border border-blue-100">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900">Still have questions?</h2>
                    <p className="text-blue-800 mb-6">We're here to help you find the perfect outfit for your special day.</p>
                    <a
                        href="https://wa.me/yournumberhere"
                        className="inline-flex items-center px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors shadow-lg shadow-green-200"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.046 0-4.047-.527-5.822-1.53L0 24zm11.287-19.797c-4.43 0-8.04 3.611-8.04 8.04 0 1.556.447 3.057 1.291 4.35l.185.284-1.026 3.742 3.845-.992.277.164c1.238.734 2.655 1.12 4.108 1.12 4.43 0 8.04-3.611 8.04-8.04 0-2.147-.833-4.164-2.345-5.678-1.512-1.514-3.529-2.347-5.679-2.347zm4.623 11.5c-.253-.127-1.5-.74-1.733-.822-.234-.082-.405-.127-.575.127-.17.255-.658.822-.806.993-.149.17-.297.19-.55.064-.253-.126-1.07-.394-2.038-1.258-.752-.67-1.259-1.5-1.407-1.754-.149-.255-.016-.392.112-.518.115-.115.253-.298.381-.447.127-.149.169-.254.254-.424.084-.17.042-.319-.022-.446-.064-.127-.575-1.385-.788-1.894-.207-.506-.417-.436-.575-.444-.148-.008-.318-.01-.488-.01-.17 0-.446.064-.68.32-.234.254-.892.871-.892 2.126 0 1.254.914 2.464 1.042 2.634.127.169 1.798 2.747 4.357 3.851.608.263 1.083.42 1.453.538.61.194 1.165.167 1.604.102.489-.072 1.5-.611 1.711-1.201.21-.591.21-1.096.147-1.201-.065-.105-.234-.17-.487-.296z" />
                        </svg>
                        Chat with us on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
