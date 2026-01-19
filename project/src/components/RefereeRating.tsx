'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RatingData {
  totalRatings: number;
  averageRating: number;
  distribution: Record<number, number>;
  recentComments: Array<{
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  userRating: number | null;
}

interface RefereeRatingProps {
  refereeId: number;
  refereeName: string;
}

export default function RefereeRating({ refereeId, refereeName }: RefereeRatingProps) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(`/api/referees/${refereeId}/ratings`);
      if (res.ok) {
        const data = await res.json();
        setRatingData(data);
        if (data.userRating) {
          setSelectedRating(data.userRating);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refereeId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleSubmitRating = async () => {
    if (selectedRating === 0) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`/api/referees/${refereeId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRatingData(prev => prev ? {
          ...prev,
          totalRatings: data.totalRatings,
          averageRating: data.averageRating,
          userRating: data.rating,
        } : null);
        setSubmitMessage({ type: 'success', text: 'Rating submitted!' });
        setComment('');
        setShowCommentForm(false);
        fetchRatings();
      } else {
        const error = await res.json();
        setSubmitMessage({ type: 'error', text: error.error || 'Failed to submit' });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 w-32 bg-secondary rounded" />
            <div className="h-4 w-48 bg-secondary rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayRating = hoverRating || selectedRating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Community Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-yellow-400">
              {ratingData?.averageRating.toFixed(1) || '0.0'}
            </div>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon key={star} filled={star <= (ratingData?.averageRating || 0)} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {ratingData?.totalRatings || 0} ratings
              </span>
            </div>
          </div>
        </div>

        {ratingData && ratingData.totalRatings > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingData.distribution[star] || 0;
              const percentage = ratingData.totalRatings > 0
                ? (count / ratingData.totalRatings) * 100
                : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-400 fill-yellow-400">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            {ratingData?.userRating ? 'Update your rating:' : `Rate ${refereeName}:`}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setSelectedRating(star);
                    setShowCommentForm(true);
                  }}
                >
                  <StarIcon filled={star <= displayRating} />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </span>
            )}
          </div>

          {showCommentForm && (
            <div className="mt-4 space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                maxLength={500}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{comment.length}/500</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentForm(false);
                      setSelectedRating(ratingData?.userRating || 0);
                      setComment('');
                    }}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-sm rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    disabled={isSubmitting || selectedRating === 0}
                    className="px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {submitMessage && (
            <div className={`mt-3 text-sm ${submitMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {submitMessage.text}
            </div>
          )}
        </div>

        {ratingData && ratingData.recentComments.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">Recent Comments</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {ratingData.recentComments.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          viewBox="0 0 24 24"
                          className={`w-3 h-3 ${star <= c.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
