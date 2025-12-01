import React, { useState } from 'react';
import { ThumbsUp, Edit, Trash2, MoreVertical, CheckCircle, Shield } from 'lucide-react';
import StarRating from '../ui/StarRating';
import UserAvatar from '../ui/UserAvatar';
import { Review } from '../../../utils/reviewApi';

interface ReviewCardProps {
  review: Review;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  onToggleHelpful?: (reviewId: number) => Promise<{ helpful_count: number; is_helpful: boolean }>;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onToggleHelpful
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const isOwnReview = currentUserId === review.user_id;

  const handleToggleHelpful = async () => {
    if (!onToggleHelpful || isOwnReview) return;

    setHelpfulLoading(true);
    try {
      const result = await onToggleHelpful(review.id);
      setIsHelpful(result.is_helpful);
      setHelpfulCount(result.helpful_count);
    } catch (error) {
      console.error('Error toggling helpful:', error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            name={review.user_name}
            profilePicture={review.user?.profile_picture}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
              {review.is_verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified Purchase
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwnReview && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(review);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Edit Review</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(review.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Review</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Review Text */}
      {review.review_text && (
        <p className="text-gray-700 leading-relaxed mb-4">{review.review_text}</p>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {review.time_ago}
        </div>

        {/* Helpful Button */}
        {!isOwnReview && onToggleHelpful && (
          <button
            onClick={handleToggleHelpful}
            disabled={helpfulLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isHelpful
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {helpfulLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
            )}
            <span>Helpful {helpfulCount > 0 && `(${helpfulCount})`}</span>
          </button>
        )}

        {isOwnReview && (
          <div className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
            <Shield className="w-4 h-4" />
            Your Review
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;