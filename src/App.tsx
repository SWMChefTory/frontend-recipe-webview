import 'features/_common/styles/global.css';
import { AccessTokenProvider } from 'features/bridge';
import RecipeDetailPage from 'features/recipe/detail/RecipeDetailPage';
import RecipeStepPage from 'features/recipe/step/RecipeStepPage';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

const App = (): React.ReactNode => (
  <AccessTokenProvider>
    <Router>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/steps" element={<RecipeStepPage />} />
      </Routes>
    </Router>
  </AccessTokenProvider>
);

export default App;
