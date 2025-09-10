// recipe/detail/components/RecipeHeader.tsx
import { memo } from "react";
import { Clock, Users, Minus, Plus } from "lucide-react";

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
  const m = Math.max(0, Math.floor(min ?? 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0) return `${h}시간 ${r > 0 ? `${r}분` : ""}`.trim();
  return `${m}분`;
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
          {cookingTimeMin > 0 && (
            <div className="meta-item" title="조리 시간">
              <Clock size={16} className="meta-icon" />
              <span className="meta-label">{formatMinutes(cookingTimeMin)}</span>
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