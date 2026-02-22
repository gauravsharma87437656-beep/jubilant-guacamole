"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowLeft, Loader2, X, Package } from "lucide-react";

interface ReviewableItem {
  rentalItemId: string;
  rentalId: string;
  productId: string;
  productName: string;
  productImage: string;
  orderNumber: string;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  content: string | null;
  status: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
    slug: string;
  };
}

export default function CustomerReviewsPage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchReviews();
    }
  }, [status]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/user/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setReviewableItems(data.reviewableItems || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || rating === 0) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedItem.productId,
          rating,
          title: reviewTitle || null,
          content: reviewContent || null,
        }),
      });

      if (response.ok) {
        setShowReviewForm(false);
        setSelectedItem(null);
        setRating(0);
        setReviewTitle("");
        setReviewContent("");
        fetchReviews();
      } else {
        const data = await response.json();
        setSubmitError(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewForm = (item: ReviewableItem) => {
    setSelectedItem(item);
    setRating(0);
    setHoverRating(0);
    setReviewTitle("");
    setReviewContent("");
    setSubmitError("");
    setShowReviewForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (count: number, size: string = "h-4 w-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
      />
    ));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
          <Link href="/profile" className="absolute left-0 text-gray-900 p-2 -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">My Reviews</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
          <p className="mt-2 text-base text-gray-500">Rate and review your rentals</p>
        </div>

        {/* Pending Reviews Section */}
        {reviewableItems.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h2 className="text-[14px] md:text-[15px] font-bold text-gray-900 mb-3 uppercase tracking-wide">Pending Reviews</h2>
            <div className="space-y-2">
              {reviewableItems.map((item) => (
                <div
                  key={item.rentalItemId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-[12px] text-gray-400">Order #{item.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => openReviewForm(item)}
                    className="px-4 py-2 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Reviews */}
        {reviews.length > 0 ? (
          <div>
            <h2 className="text-[14px] md:text-[15px] font-bold text-gray-900 mb-3 uppercase tracking-wide">Your Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review) => {
                const images = review.product.images as string[];
                return (
                  <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {images?.[0] ? (
                          <img src={images[0]} alt={review.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${review.product.id}`} className="text-[14px] font-semibold text-gray-900 hover:text-primary truncate block">
                          {review.product.name}
                        </Link>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-[12px] text-gray-400 ml-1">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {(review.title || review.content) && (
                      <div className="mt-3 pl-0 md:pl-[62px]">
                        {review.title && (
                          <p className="text-[14px] font-semibold text-gray-900">{review.title}</p>
                        )}
                        {review.content && (
                          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{review.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : reviewableItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No Reviews Yet</h2>
            <p className="text-[14px] text-gray-500">Your reviews will appear here after you review delivered orders.</p>
          </div>
        ) : null}

        {/* Review Bottom Sheet (Mobile) / Modal (Desktop) */}
        {showReviewForm && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={() => setShowReviewForm(false)}>
            <div
              className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto animate-slide-up md:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-white z-10">
                <h2 className="text-[18px] font-bold text-gray-900">Write a Review</h2>
                <button onClick={() => setShowReviewForm(false)} className="p-1 text-gray-500 hover:text-gray-900">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="px-5 pb-6">
                {/* Product Info */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {selectedItem.productImage ? (
                      <img src={selectedItem.productImage} alt={selectedItem.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{selectedItem.productName}</p>
                    <p className="text-[12px] text-gray-400">Order #{selectedItem.orderNumber}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold text-gray-900 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating === 0 && submitError === "" && (
                    <p className="text-[12px] text-gray-400 mt-1">Tap a star to rate</p>
                  )}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-[14px] font-semibold text-gray-900 mb-1.5">Title (optional)</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 text-[15px]"
                    placeholder="Summarize your experience"
                  />
                </div>

                {/* Content */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold text-gray-900 mb-1.5">Review (optional)</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 text-[15px] resize-none"
                    placeholder="Tell others about your experience..."
                  />
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                    {submitError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl text-[15px] hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
