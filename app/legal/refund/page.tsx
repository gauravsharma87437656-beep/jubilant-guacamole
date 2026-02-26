import React from 'react';

export default function RefundPolicy() {
    return (
        <div className="bg-white min-h-screen text-black">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-2 uppercase">REFUND, CANCELLATION, SHIPPING, DELIVERY & DAMAGE POLICY</h1>
                <p className="text-lg font-medium text-gray-600 mb-8">Rentsquire - Operated by Paliwal Global Enterprise</p>

                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-100">
                    <p><strong>Effective Date:</strong> 1 March 2026</p>
                    <p><strong>Legal Entity:</strong> Paliwal Global Enterprise</p>
                    <p><strong>Brand Name:</strong> Rentsquire</p>
                    <p><strong>Registered Address:</strong> Bus stand, Knauta, Sujangarh, Churu, Rajasthan 331507</p>
                    <p><strong>Email:</strong> <a href="mailto:Rentsquire.in@gmail.com" className="text-blue-600 hover:underline">Rentsquire.in@gmail.com</a></p>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b pb-2">1. INTRODUCTION</h2>
                        <p>
                            This policy governs refunds, cancellations, shipping, delivery, returns, damages, and liability for all bookings made through Rentsquire (“Platform”).
                        </p>
                        <p className="mt-2">By placing a booking on Rentsquire, you agree to this policy.</p>
                        <p className="mt-2 text-sm italic">Rentsquire acts as a marketplace connecting customers with independent Rental Partners.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-6 text-blue-900 border-t pt-8">PART A – CANCELLATION & REFUND POLICY</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">2. CUSTOMER CANCELLATION</h3>
                                <p className="mb-2">2.1 Cancellation requests must be made through the Platform.</p>
                                <p className="mb-2">2.2 Refund eligibility depends on timing:</p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Cancellation more than <strong>[7 days]</strong> before delivery → Full refund (excluding convenience fee, if applicable)</li>
                                    <li>Cancellation between <strong>[3–7 days]</strong> before delivery → Partial refund ([X]%)</li>
                                    <li>Cancellation less than <strong>[72 hours]</strong> before delivery → No refund</li>
                                    <li>Same-day cancellation → No refund</li>
                                </ul>
                                <p className="mt-4"><strong>2.3 Refund timelines:</strong> Refunds will be processed within <strong>[7–10 working days]</strong> to the original payment method.</p>
                                <p className="mt-2 text-sm text-gray-600">2.4 Convenience fees, payment gateway charges, and platform service fees may be non-refundable.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">3. PARTNER CANCELLATION</h3>
                                <p>If a Rental Partner cancels a confirmed booking:</p>
                                <ul className="list-disc ml-6 mt-2 space-y-1">
                                    <li>Customer will receive a full refund.</li>
                                    <li>Rentsquire may assist in providing alternative outfit options (subject to availability).</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">4. NON-REFUNDABLE SITUATIONS</h3>
                                <p>Refunds will not be provided in case of:</p>
                                <ul className="list-disc ml-6 mt-2 space-y-1">
                                    <li>Incorrect size selection by customer.</li>
                                    <li>Failure to accept delivery.</li>
                                    <li>Change of mind after dispatch.</li>
                                    <li>Minor fit issues.</li>
                                    <li>Event cancellation by customer.</li>
                                    <li>Late cancellations outside eligible window.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-6 text-blue-900 border-t pt-8">PART B – SHIPPING & DELIVERY POLICY</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">5. DELIVERY PROCESS</h3>
                                <p>5.1 Delivery timelines are estimated and may vary due to logistics conditions.</p>
                                <p>5.2 Customers must provide accurate delivery details.</p>
                                <p>5.3 In case of incorrect address or unreachable contact number: Re-delivery charges may apply & refunds may not be issued.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">6. DELIVERY INSPECTION</h3>
                                <p>6.1 Customers must inspect the outfit at the time of delivery.</p>
                                <p>6.2 Any issues (damage, hygiene concerns, missing items) must be reported within <strong>2 hours</strong> of delivery with clear photos and videos.</p>
                                <p>6.3 Complaints made after usage or after the event date may not be entertained.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">7. RETURN PROCESS</h3>
                                <p>7.1 Outfits must be returned on or before the agreed return date.</p>
                                <p>7.2 Late returns will attract additional charges on a per-day basis.</p>
                                <p>7.3 The outfit must be returned in original condition, unwashed, and with all accessories.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-6 text-blue-900 border-t pt-8">PART C – DAMAGE & LIABILITY POLICY</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">8. CUSTOMER RESPONSIBILITY</h3>
                                <p>The customer is responsible for maintaining the outfit in proper condition during the rental period. Normal wear and tear is acceptable.</p>
                                <p className="mt-2 font-semibold">The following are considered chargeable damages:</p>
                                <ul className="list-disc ml-6 mt-1 space-y-1">
                                    <li>Permanent stains (wine, oil, ink, makeup, etc.)</li>
                                    <li>Fabric tears or burns</li>
                                    <li>Missing embellishments</li>
                                    <li>Missing accessories (dupatta, belt, etc.)</li>
                                    <li>Unauthorized alterations</li>
                                    <li>Irreversible damage</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">9. DAMAGE CHARGES</h3>
                                <p>9.1 If damage is repairable: Repair cost will be deducted from the security deposit.</p>
                                <p>9.2 If damage is irreparable or item is lost: Customer may be charged up to 100% of the product’s retail value.</p>
                                <p>9.3 Security deposit (if applicable) will be adjusted accordingly.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">10. SECURITY DEPOSIT REFUND</h3>
                                <p>10.1 Security deposit will be refunded within <strong>[5–10 working days]</strong> after inspection.</p>
                                <p>10.2 Refund may be adjusted for damages, late return charges, or excessive cleaning fees.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6 pt-8 border-t border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold mb-2">11. LIMITATION OF LIABILITY</h2>
                            <p>Maximum liability shall not exceed the rental amount paid for the booking. We are not liable for event cancellations or indirect damages.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">12. FORCE MAJEURE</h2>
                            <p>Rentsquire is not responsible for delays caused by natural disasters, government restrictions, or strikes.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">13. DISPUTE RESOLUTION</h2>
                            <p>Disputes shall first be addressed through customer support. Final decisions made by Rentsquire shall be binding.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">14. GOVERNING LAW</h2>
                            <p>This policy is governed by the laws of India. Disputes subject to exclusive jurisdiction of Indian courts.</p>
                        </div>
                    </section>

                    <section className="pt-8 border-t border-gray-100">
                        <h2 className="text-xl font-bold mb-3">15. CONTACT INFORMATION</h2>
                        <div className="mt-4">
                            <p className="font-bold">Paliwal Global Enterprise</p>
                            <p>Brand: Rentsquire</p>
                            <p>Email: <a href="mailto:Rentsquire.in@gmail.com" className="text-blue-600 hover:underline">Rentsquire.in@gmail.com</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
