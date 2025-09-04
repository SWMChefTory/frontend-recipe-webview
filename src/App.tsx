import '_common/styles/global.css';
import { AccessTokenProvider } from 'bridge';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import RecipeDetailPage from 'recipe/detail/RecipeDetailPage';
import RecipeStepPage from 'recipe/step/RecipeStepPage';
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
