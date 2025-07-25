// App.tsx
import { useEffect, useState } from 'react'; // React, useEffect, useState를 import 합니다.
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import './features/common/styles/global.css';
import RecipeDetailPage from './features/recipeDetail/RecipeDetailPage';
import RecipeStepPage from './features/recipeStep/RecipeStepPage';

interface PageProps {
  accessToken: string | null;
}

const RecipeDetailRoute = ({ accessToken }: PageProps) => {
  return <RecipeDetailPage accessToken={accessToken} />;
};

const RecipeStepRoute = ({ accessToken }: PageProps) => {
  return <RecipeStepPage accessToken={accessToken} />;
};

/**
 * 메인 App 컴포넌트 - React Router 기반 (HashRouter 사용)
 * @returns JSX 엘리먼트
 */
const App = (): JSX.Element => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message in App.tsx handleMessage:', event); // 추가
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ACCESS_TOKEN' && message.token) {
          console.log('웹뷰에서 받은 액세스 토큰:', message.token);
          setAccessToken(message.token);
          // 여기에 토큰을 localStorage에 저장하거나, API 클라이언트 설정에 사용하는 로직을 추가할 수 있습니다.
        }
      } catch (error) {
        console.error('메시지 처리 중 오류:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  return (
    <Router>
      <Routes>
        {/* 레시피 정보 페이지에 accessToken을 prop으로 전달 */}
        <Route path="/recipes/:id" element={<RecipeDetailRoute accessToken={accessToken} />} />

        {/* 조리 모드 페이지에 accessToken을 prop으로 전달 */}
        <Route path="/recipes/:id/steps" element={<RecipeStepRoute accessToken={accessToken} />} />
      </Routes>
    </Router>
  );
};

export default App;
