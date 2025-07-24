import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import './features/common/styles/global.css';
import RecipeDetailPage from './features/recipeDetail/RecipeDetailPage';
import RecipeStepPage from './features/recipeStep/RecipeStepPage';

/**
 * 메인 App 컴포넌트 - React Router 기반 (HashRouter 사용)
 * @returns JSX 엘리먼트
 */
const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        {/* 레시피 정보 페이지 */}
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />

        {/* 조리 모드 페이지 */}
        <Route path="/recipes/:id/steps" element={<RecipeStepPage />} />
      </Routes>
    </Router>
  );
};

export default App;
