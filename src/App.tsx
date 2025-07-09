import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import './modules/core/styles/global.css';
import { CookingPage, RecipePage } from './pages';

/**
 * 메인 App 컴포넌트 - React Router 기반 (HashRouter 사용)
 * @returns JSX 엘리먼트
 */
const App: React.FC = () => {
    return (
    <Router>
      <Routes>
        {/* 레시피 정보 페이지 */}
        <Route path="/recipeId/:id" element={<RecipePage />} />
        
        {/* 조리 모드 페이지 */}
        <Route path="/recipeId/:id/cooking" element={<CookingPage />} />
      </Routes>
    </Router>
  );
};

export default App; 
