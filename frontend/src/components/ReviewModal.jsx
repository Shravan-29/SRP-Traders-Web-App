import { useState } from 'react'
import { Star, X, Loader2, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ReviewModal = ({ orderItems, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewedIds, setReviewedIds] = useState([])

  if (!orderItems || orderItems.length === 0) return null

  const currentItem = orderItems[currentIndex]
  const isLastItem = currentIndex === orderItems.length - 1

  const resetForm = () => {
    setRating(0)
    setHoverRating(0)
    setComment('')
  }

  const handleSkip = () => {
    if (isLastItem) {
      onClose()
    } else {
      resetForm()
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    setLoading(true)
    try {
      await api.post('/reviews', {
        productId: currentItem.productId,
        rating,
        comment: comment.trim() || null,
      })
      toast.success('Thank you for your review!')
      setReviewedIds([...reviewedIds, currentItem.productId])

      if (isLastItem) {
        setTimeout(() => onClose(), 800)
      } else {
        resetForm()
        setCurrentIndex(currentIndex + 1)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review'
      if (msg.includes('already reviewed')) {
        toast.error('You already reviewed this product')
        handleSkip()
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-sky-500 px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-white mb-1">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Order Placed Successfully!</span>
          </div>
          <p className="text-sky-100 text-sm">
            How was your experience with this product?
          </p>
          {orderItems.length > 1 && (
            <p className="text-sky-100 text-xs mt-1">
              {currentIndex + 1} of {orderItems.length} products
            </p>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <img
              src={currentItem.productImage || 'https://placehold.co/80x80/e0f2fe/0284c7?text=P'}
              alt={currentItem.productName}
              onError={(e) => e.target.src = 'https://placehold.co/80x80/e0f2fe/0284c7?text=P'}
              className="w-16 h-16 object-contain bg-slate-50 rounded-xl p-1.5 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {currentItem.productName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Qty: {currentItem.quantity}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center mb-5">
            <p className="text-sm font-medium text-slate-700 mb-3">Rate this product</p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product (optional)"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm resize-none"
          />
          <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/500</p>

          {/* Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm"
            >
              {isLastItem ? 'Skip & Close' : 'Skip'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
