import '_common/styles/global.css';
import { AccessTokenProvider } from 'bridge';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import RecipeDetailPage from 'recipe/detail/RecipeDetailPage';
import { MeasurementPage } from 'recipe/measurement/MeasurementPage';
import RecipeStepPage from 'recipe/step/RecipeStepPage';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const App = (): React.ReactNode => (
  <QueryClientProvider client={queryClient}>
    <AccessTokenProvider>
      <Router>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/measurement" element={<MeasurementPage />} />
          <Route path="/recipes/:id/steps" element={<RecipeStepPage />} />
        </Routes>
      </Router>
    </AccessTokenProvider>
  </QueryClientProvider>
);

export default App;
