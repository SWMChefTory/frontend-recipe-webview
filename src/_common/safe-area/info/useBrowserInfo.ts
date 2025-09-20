import {useLayoutEffect, useState } from "react";

export default function useBrowserInfo() {
    const [isBroserChecked, setIsBroserChecked] = useState<boolean>(false);
    const [browserName, setBrowserName] = useState<string>('Unknown');
    const [browserVersion, setBrowserVersion] = useState<string>('Unknown');

    //렌더링 하기 전에 실행
    useLayoutEffect(() => {
        const detectBrowser = async () => {
          let name = 'Unknown', version = 'Unknown';
    
          if ('userAgentData' in navigator && (navigator as any).userAgentData?.getHighEntropyValues) {
            try {
              const userAgentData = (navigator as any).userAgentData;
              const { brands, uaFullVersion, fullVersionList } =
                await userAgentData.getHighEntropyValues(['brands','uaFullVersion','fullVersionList']);
              const list = fullVersionList ?? brands ?? [];
              const found = list.find((b: any) => ['Google Chrome','Microsoft Edge','Opera','Brave','Whale','Chromium'].includes(b.brand)) || list[0];
              if (found) { 
                name = found.brand; 
                version = found.version || uaFullVersion || version; 
              }
            } catch (error) {
              console.warn('UserAgentData API 사용 실패:', error);
            }
          }
          
          // fallback: userAgent 파싱
          if (name === 'Unknown' || version === 'Unknown') {
            const ua = navigator.userAgent;
            const rules = [
              { n:'Microsoft Edge', re:/Edg\/([\d.]+)/ },
              { n:'Opera', re:/OPR\/([\d.]+)/ },
              { n:'Samsung Internet', re:/SamsungBrowser\/([\d.]+)/ },
              { n:'Whale', re:/Whale\/([\d.]+)/ },
              { n:'Firefox', re:/Firefox\/([\d.]+)/ },
              { n:'Chrome (iOS)', re:/CriOS\/([\d.]+)/ },
              { n:'Chrome', re:/Chrome\/([\d.]+)/ },
              { n:'Safari', re:/Version\/([\d.]+).*Safari/ },
            ];
            for (const r of rules) { 
              const m = ua.match(r.re); 
              if (m) { 
                name = r.n; 
                version = m[1]; 
                break; 
              } 
            }
          }
          setBrowserName(name);
          setBrowserVersion(version);
          setIsBroserChecked(true);
        };
    
        detectBrowser();
      }, []);

      return {
        isBroserChecked,
        browserName,
        browserVersion,
      };
}

export {};
