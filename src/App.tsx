import { AccessTokenProvider } from 'app/AccessTokenProvider';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import RecipeDetailPage from 'recipe/detail/RecipeDetailPage';
import MeasurementPage from 'recipe/measurement/MeasurementPage';
import RecipeStepPage from 'recipe/step/RecipeStepPage';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import useInitSafeArea from '_common/safe-area/useSafeArea';
import { useInitScreenSize } from '_common/size/useScreenSize';

// 예시 반환값: { top: 44, bottom: 34 }

const App = (): React.ReactNode => {
  useInitSafeArea();
  useInitScreenSize();
  console.log('screen size');

  return (
    <>
        <AccessTokenProvider>
          <Router>
            <Routes>
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/recipes/:id/measurement" element={<MeasurementPage />} />
              <Route path="/recipes/:id/steps" element={<RecipeStepPage />} />
            </Routes>
          </Router>
        </AccessTokenProvider>
    </>
  );
};

export default App;
