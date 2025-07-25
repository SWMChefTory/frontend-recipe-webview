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
    // 웹뷰가 로드될 때 이 useEffect가 실행되는지 확인하는 로그
    console.log('[[WEBVIEW_DEBUG]] App.tsx useEffect running, adding message listener.');

    const handleMessage = (event: MessageEvent) => {
      // 메시지가 웹뷰의 window에 도달했는지 확인하는 로그
      console.log('[[WEBVIEW_DEBUG]] Raw Message Event:', event);
      console.log('[[WEBVIEW_DEBUG]] Event Data (payload):', event.data);
      console.log('[[WEBVIEW_DEBUG]] Event Origin:', event.origin);

      // `event.data`가 이미 파싱된 객체이므로 JSON.parse를 제거합니다.
      const message = event.data; // ✨ 수정된 부분: JSON.parse 제거
      console.log('[[WEBVIEW_DEBUG]] Processed Message Object:', message);

      if (
        typeof message === 'object' &&
        message !== null &&
        message.type === 'ACCESS_TOKEN' &&
        message.token
      ) {
        console.log('[[WEBVIEW_DEBUG]] 웹뷰에서 ACCESS_TOKEN 메시지 수신 확인:', message.token);
        setAccessToken(message.token);
      } else {
        console.log('[[WEBVIEW_DEBUG]] 인식할 수 없는 메시지 타입 또는 토큰 없음:', message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      console.log('[[WEBVIEW_DEBUG]] App.tsx useEffect cleanup, removing message listener.');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
