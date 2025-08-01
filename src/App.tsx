import 'features/common/styles/global.css';
import RecipeDetailPage from 'features/recipe/detail/RecipeDetailPage';
import RecipeStepPage from 'features/recipe/step/RecipeStepPage';
import { useEffect, useState } from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

type AccessTokenMessage = {
  type: 'ACCESS_TOKEN';
  token: string;
};

const isAccessTokenMessage = (message: unknown): message is AccessTokenMessage => {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    'token' in message &&
    (message as AccessTokenMessage).type === 'ACCESS_TOKEN' &&
    typeof (message as AccessTokenMessage).token === 'string'
  );
};

/**
 * 메인 App 컴포넌트 - React Router 기반 (HashRouter 사용)
 * @returns JSX 엘리먼트
 */
const App = (): JSX.Element => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    console.log('[웹뷰] 메시지 수신 대기 시작');

    const handleMessage = (event: MessageEvent) => {
      let message: unknown;

      try {
        message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (error) {
        console.warn('[웹뷰] JSON 파싱 실패:', event.data);
        return;
      }

      if (isAccessTokenMessage(message)) {
        console.log('[웹뷰] 액세스 토큰 수신:', message.token);
        setAccessToken(message.token);
      } else {
        console.log('[웹뷰] 무시된 메시지:', message);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      console.log('[웹뷰] 메시지 리스너 해제');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage accessToken={accessToken} />} />
        <Route path="/recipes/:id/steps" element={<RecipeStepPage accessToken={accessToken} />} />
      </Routes>
    </Router>
  );
};

export default App;
