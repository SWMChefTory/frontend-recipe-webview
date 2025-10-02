import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ingredient, RecipeBriefing, RecipeDetailMeta, RecipeStep, RecipeTag } from '../types';
import './RecipeBottomSheet.css';

interface RecipeBottomSheetProps {
  steps: RecipeStep[];
  ingredients: Ingredient[];
  onTimeClick: (time: number) => void;
  onStartCooking: () => void;
  recipe_summary: RecipeDetailMeta;
  tags?: RecipeTag[];
  briefings?: RecipeBriefing[];
}

const RecipeBottomSheet = ({
  steps,
  ingredients,
  onTimeClick,
  onStartCooking,
  recipe_summary,
  tags = [],
  briefings = [],
}: RecipeBottomSheetProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'recipe' | 'ingredients'>('summary');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [showTooltip, setShowTooltip] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const navigate = useNavigate();

  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const overscrollStartY = useRef<number>(0);
  const overscrollActive = useRef<boolean>(false);
  const overscrollStartHeight = useRef<number>(0);

  const calculateMinHeight = () => {
    const totalHeight = window.innerHeight / 16;

    const pageHeaderHeight = 3.5;
    const videoHeightPx = (window.innerWidth * 9) / 16;
    const videoHeight = videoHeightPx / 16;

    return totalHeight - (pageHeaderHeight + videoHeight);
  };

  const [minHeight, setMinHeight] = useState(calculateMinHeight());
  const [sheetHeight, setSheetHeight] = useState(calculateMinHeight());
  const maxHeight = window.innerHeight / 16;

  useEffect(() => {
    const updateHeights = () => {
      const newMinHeight = calculateMinHeight();
      setMinHeight(newMinHeight);
      setSheetHeight(prev => (prev < newMinHeight ? newMinHeight : prev));
    };
    updateHeights();
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, []);

  useEffect(() => {
    if (activeTab !== 'ingredients' || selectedIngredients.size > 0) return;
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, [activeTab, selectedIngredients.size]);

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleIngredient = (index: number) => {
    setSelectedIngredients(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
    setShowTooltip(false);
  };

  const selectAllIngredients = () => {
    if (selectedIngredients.size === ingredients.length) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(ingredients.map((_, idx) => idx)));
    }
  };

  const handlePrepareComplete = () => {
    setSelectedIngredients(new Set());
    setActiveTab('summary');
    setSheetHeight(minHeight);
  };

  const formatMinutes = (min?: number) => {
    const minutes = Math.max(0, Math.floor(min ?? 0));
    const hour = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hour > 0) {
      const roundedMinutes = remainingMinutes > 0 ? Math.ceil(remainingMinutes / 5) * 5 : 0;
      return `${hour}시간${roundedMinutes > 0 ? ` ${roundedMinutes}분 이내` : ''}`;
    }
    const rounded = Math.max(5, Math.ceil(minutes / 5) * 5);
    return `${rounded}분 이내`;
  };

  useEffect(() => {
    const handleElement = handleRef.current;
    if (!handleElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setStartHeight(sheetHeight);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaY = startY - e.touches[0].clientY;
      const deltaRem = deltaY / 16;
      setSheetHeight(Math.min(Math.max(startHeight + deltaRem, minHeight), maxHeight));
    };
    const handleTouchEnd = () => {
      setIsDragging(false);
      const midPoint = (minHeight + maxHeight) / 2;
      setSheetHeight(sheetHeight < midPoint ? minHeight : maxHeight);
    };

    handleElement.addEventListener('touchstart', handleTouchStart);
    handleElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    handleElement.addEventListener('touchend', handleTouchEnd);
    return () => {
      handleElement.removeEventListener('touchstart', handleTouchStart);
      handleElement.removeEventListener('touchmove', handleTouchMove);
      handleElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startY, startHeight, sheetHeight, minHeight, maxHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const deltaRem = deltaY / 16;
      setSheetHeight(Math.min(Math.max(startHeight + deltaRem, minHeight), maxHeight));
    };
    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const midPoint = (minHeight + maxHeight) / 2;
      setSheetHeight(sheetHeight < midPoint ? minHeight : maxHeight);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startHeight, sheetHeight, minHeight, maxHeight]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const OVERSCROLL_THRESHOLD = 50;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = contentElement.scrollTop;
      const scrollHeight = contentElement.scrollHeight;
      const clientHeight = contentElement.clientHeight;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

      if (isAtTop || isAtBottom) {
        overscrollStartY.current = e.touches[0].clientY;
        overscrollStartHeight.current = sheetHeight;
      } else {
        overscrollStartY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (overscrollStartY.current === 0) return;

      const scrollTop = contentElement.scrollTop;
      const scrollHeight = contentElement.scrollHeight;
      const clientHeight = contentElement.clientHeight;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

      const currentY = e.touches[0].clientY;
      const deltaY = overscrollStartY.current - currentY;

      if (isAtTop && deltaY < -OVERSCROLL_THRESHOLD && scrollTop === 0) {
        if (!overscrollActive.current) {
          overscrollActive.current = true;
          setSheetHeight(minHeight);
          try {
            e.preventDefault();
          } catch {}
        }
      } else if (isAtBottom && deltaY > OVERSCROLL_THRESHOLD) {
        if (!overscrollActive.current) {
          overscrollActive.current = true;
          setSheetHeight(maxHeight);
          try {
            e.preventDefault();
          } catch {}
        }
      }
    };

    const handleTouchEnd = () => {
      overscrollActive.current = false;
      overscrollStartY.current = 0;
    };

    contentElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    contentElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      contentElement.removeEventListener('touchstart', handleTouchStart);
      contentElement.removeEventListener('touchmove', handleTouchMove);
      contentElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sheetHeight, minHeight, maxHeight]);

  const cookingTime = recipe_summary?.cookingTime ?? 0;
  const description = recipe_summary?.description ?? '';
  const servings = Math.max(0, Number(recipe_summary?.servings ?? 0));

  const showBriefings = Array.isArray(briefings) && briefings.length > 0;

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${sheetHeight === maxHeight ? 'visible' : ''}`}
        onClick={() => setSheetHeight(minHeight)}
      />

      <div
        ref={sheetRef}
        className={`recipe-bottom-sheet${isDragging ? ' dragging' : ''}`}
        style={{ height: `${sheetHeight}rem` }}
      >
        <div className="bottom-sheet-header">
          <div
            ref={handleRef}
            className="handle-area"
            onMouseDown={e => {
              e.preventDefault();
              setIsDragging(true);
              setStartY(e.clientY);
              setStartHeight(sheetHeight);
            }}
          >
            <div className="handle" />
          </div>

          <div className="tab-group">
            <button
              className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              요약
              {activeTab === 'summary' && <div className="tab-indicator" />}
            </button>
            <button
              className={`tab ${activeTab === 'recipe' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipe')}
            >
              레시피
              {activeTab === 'recipe' && <div className="tab-indicator" />}
            </button>
            <button
              className={`tab ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              재료
              {activeTab === 'ingredients' && <div className="tab-indicator" />}
            </button>
          </div>
        </div>

        <div className="bottom-sheet-content" ref={contentRef}>
          {activeTab === 'summary' && (
            <div className="summary-content-area">
              <div className="ai-disclaimer">
                <svg
                  className="ai-disclaimer-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  이 레시피 정보는 AI로 생성되었으며 부정확할 수 있습니다. 조리 전 확인해주세요.
                </span>
              </div>

              {(!!description || cookingTime > 0 || servings > 0 || (tags?.length ?? 0) > 0) && (
                <section className="summary-card">
                  {!!description && <p className="summary-desc">{description}</p>}

                  {(cookingTime > 0 || servings > 0) && (
                    <div className="summary-meta-row">
                      {cookingTime > 0 && (
                        <span className="meta-pill">⏱ {formatMinutes(cookingTime)}</span>
                      )}
                      {servings > 0 && <span className="meta-pill">{servings}인분 기준</span>}
                    </div>
                  )}

                  {(tags?.length ?? 0) > 0 && (
                    <div className="summary-tags">
                      {tags!.map((t, i) => {
                        const tagName = t?.name ?? '';
                        if (!tagName) return null;
                        return (
                          <span key={`${tagName}-${i}`} className="tag-chip">
                            #{tagName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {showBriefings && (
                <section className="briefings-card">
                  <h4 className="briefings-card-title">💡 요리 팁</h4>
                  <ul className="briefings-list">
                    {briefings.map((b, i) => {
                      const text = b?.content ?? '';
                      if (!text) return null;
                      return (
                        <li key={`${i}-${text.slice(0, 12)}`} className="briefing-item">
                          <span className="briefing-dot" aria-hidden="true" />
                          <span className="briefing-text">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* 레시피 탭 */}
          {activeTab === 'recipe' && (
            <div className="recipe-content-area">
              {steps.map((step, stepIndex) => (
                <div key={step.id} className="recipe-section">
                  <div className="section-title">
                    <div className="step-badge">{String.fromCharCode(65 + stepIndex)}</div>
                    <div className="title-text">
                      <h3>{step.subtitle}</h3>
                    </div>
                    <button className="toggle-button" onClick={() => toggleStep(stepIndex)}>
                      <svg
                        className={expandedSteps.has(stepIndex) ? 'rotated' : ''}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M6 9L12 15L18 9" stroke="#111111" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>

                  {expandedSteps.has(stepIndex) && (
                    <div className="sub-steps">
                      {step.details.map((detail, detailIndex) => (
                        <button
                          key={detailIndex}
                          className="sub-step-button"
                          onClick={() => {
                            onTimeClick(detail.start);
                            setSheetHeight(minHeight);
                          }}
                        >
                          <div className="sub-step-content">
                            <span className="sub-step-number">{detailIndex + 1}</span>
                            <p className="sub-step-text">{detail.text}</p>
                          </div>
                          <svg
                            className="chevron-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path d="M9 18L15 12L9 6" stroke="#7E7E7E" strokeWidth="2" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 재료 탭 */}
          {activeTab === 'ingredients' && (
            <div
              className={`ingredients-content-area ${selectedIngredients.size > 0 ? 'has-selection' : ''}`}
            >
              {showTooltip && selectedIngredients.size === 0 && (
                <div className="tooltip">
                  <div className="tooltip-tail"></div>
                  <div className="tooltip-message">
                    <span>재료를 준비했다면 눌러주세요</span>
                  </div>
                </div>
              )}
              <div className="ingredients-title">
                <div className="title-left">
                  {selectedIngredients.size > 0 ? (
                    <>
                      <span className="prepared-count">준비 {selectedIngredients.size}개</span>
                      <span className="total-count">/{ingredients.length}개</span>
                    </>
                  ) : (
                    <span className="prepared-count">전체 {ingredients.length}개</span>
                  )}
                </div>
                <button
                  className="category-button"
                  onClick={() => navigate(`/recipes/measurement`)}
                >
                  <span>계량법</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#4B4B4B" strokeWidth="2" />
                  </svg>
                </button>
              </div>
              <div className="ingredients-grid">
                {ingredients.map((ingredient, index) => (
                  <button
                    key={index}
                    className={`ingredient-item ${selectedIngredients.has(index) ? 'selected' : ''}`}
                    onClick={() => toggleIngredient(index)}
                  >
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-amount">
                      {ingredient.amount}
                      {ingredient.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bottom-sheet-footer">
          {activeTab === 'ingredients' ? (
            selectedIngredients.size > 0 && (
              <div className="button-group">
                <button
                  className={`select-all-button ${selectedIngredients.size === ingredients.length ? 'all-selected' : ''}`}
                  onClick={selectAllIngredients}
                >
                  {selectedIngredients.size === ingredients.length ? '전체 해제' : '전체 선택'}
                </button>
                <button
                  className="prepare-complete-button"
                  onClick={handlePrepareComplete}
                  disabled={selectedIngredients.size !== ingredients.length}
                >
                  준비 완료
                </button>
              </div>
            )
          ) : (
            <div className="button-group">
              <button className="start-cooking-button" onClick={onStartCooking}>
                요리 시작
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipeBottomSheet;
