import { useBodyScrollLock, useTransition } from '_common';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import RecipeStep from 'recipe/step/components/RecipeStep';

/**
 * 조리 모드 페이지
 * URL: /recipes/:id
 */
const RecipeStepPage = (): JSX.Element => {
  const location = useLocation();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { recipeData } = location.state as {
    recipeData: any;
  };

  // 화면 전환 애니메이션
  const { transitioning, fadeIn } = useTransition();

  // 레시피로 돌아가기 핸들러 - 라우터로 네비게이션
  const handleBackToRecipe = (): void => {
    navigate(`/recipes/${id}`, { replace: true });
  };

  // 조리 모드일 때 body 스크롤 방지
  useBodyScrollLock(true);

  return (
    <div
      className={`app cooking-mode ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}
    >
      <RecipeStep recipeData={recipeData} onBackToRecipe={handleBackToRecipe} />
    </div>
  );
};

export default RecipeStepPage;
