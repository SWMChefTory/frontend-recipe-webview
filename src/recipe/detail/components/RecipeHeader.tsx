// recipe/detail/components/RecipeHeader.tsx
import { Clock, Minus, Plus, Users } from 'lucide-react';
import { memo } from 'react';

type Props = {
  analysisId: string | number;
  title: string;
  description: string;
  tags: string[];
  cookingTimeMin: number;
  originalServings: number;
  currentServings: number;
  onDecreaseServings: () => void;
  onIncreaseServings: () => void;
};

const formatMinutes = (min: number) => {
  const minutes = Math.max(0, Math.floor(min ?? 0));
  const hour = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hour > 0) {
    // 시간 단위는 그대로 두고, 남은 분을 5분 단위로 올림
    const roundedMinutes = remainingMinutes > 0 ? Math.ceil(remainingMinutes / 5) * 5 : 0;
    return `${hour}시간${roundedMinutes > 0 ? ` ${roundedMinutes}분 이내` : ''}`.trim();
  }

  // 분 단위만 있을 때도 5분 단위로 올림
  const rounded = Math.max(5, Math.ceil(minutes / 5) * 5);
  return `${rounded}분 이내`;
};

function RecipeHeader({
  analysisId,
  title,
  description,
  tags = [],
  cookingTimeMin = 0,
  originalServings = 0,
  currentServings,
  onDecreaseServings,
  onIncreaseServings,
}: Props) {
  return (
    <header className="recipe-header">
      <div className="recipe-header-card" data-recipe-id={analysisId}>
        <h1 className="recipe-title">{title}</h1>

        {!!description && <p className="recipe-description">{description}</p>}

        <div className="recipe-meta">
          {cookingTimeMin > 0 && (
            <div className="meta-item" title="조리 시간">
              <Clock size={16} className="meta-icon" />
              <span className="meta-label">{formatMinutes(cookingTimeMin)}</span>
            </div>
          )}
          {originalServings > 0 && (
            <div className="meta-item serving-adjuster" title="인분 조절">
              <Users size={16} className="meta-icon" />
              <div className="serving-controls">
                <button
                  className="serving-btn"
                  onClick={onDecreaseServings}
                  disabled={currentServings <= 1}
                  aria-label="인분 줄이기"
                >
                  <Minus size={12} />
                </button>
                <span className="serving-count">{currentServings}인분</span>
                <button
                  className="serving-btn"
                  onClick={onIncreaseServings}
                  disabled={currentServings >= 10}
                  aria-label="인분 늘리기"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="tag-row" role="list">
            {tags.map((t, i) => (
              <span key={`${t}-${i}`} className="tag-chip" role="listitem">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(RecipeHeader);
