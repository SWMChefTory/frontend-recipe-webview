import { MockRecipes, RecipeData } from '../../types/recipe';

/**
 * Mock 레시피 데이터베이스
 * 실제 애플리케이션에서는 API 호출로 대체될 예정
 */
export const mockRecipes: MockRecipes = {
  "1": {
    id: 1,
    title: "백종원의 제육볶음",
    description: "매콤달콤한 양념으로 밥도둑 제육볶음을 완성해보세요.",
    total_time_sec: 1500, // 25분
    youtubeEmbedId: "j7s9VRsrm9o",
    ingredients: [
      { name: "돼지고기 앞다리살", amount: 300, unit: "g" },
      { name: "양파", amount: 1, unit: "개" },
      { name: "대파", amount: 2, unit: "대" },
      { name: "고추장", amount: 2, unit: "큰술" },
      { name: "고춧가루", amount: 1, unit: "큰술" },
      { name: "간장", amount: 2, unit: "큰술" },
      { name: "설탕", amount: 1, unit: "큰술" },
      { name: "다진 마늘", amount: 1, unit: "큰술" },
      { name: "참기름", amount: 1, unit: "큰술" },
      { name: "후추", amount: 1, unit: "꼬집" }
    ],
    steps: [
      {
        subtitle: "재료 준비",
        details: [
          "돼지고기는 적당한 크기로 썰어 준비합니다.",
          "양파는 채썰기 해주세요.",
          "대파는 어슷하게 썰어 준비합니다."
        ],
        start: 0,
        end: 120
      },
      {
        subtitle: "고기 볶기",
        details: [
          "팬에 기름을 두르고 돼지고기를 넣어 중간 불에서 볶아줍니다.",
          "고기가 익으면 양파와 마늘을 넣고 함께 볶아주세요."
        ],
        start: 120,
        end: 300
      },
      {
        subtitle: "양념 추가",
        details: [
          "고추장 2큰술, 고춧가루 1큰술을 넣습니다.",
          "간장 2큰술, 설탕 1큰술을 넣고 잘 섞어줍니다."
        ],
        start: 300,
        end: 480
      },
      {
        subtitle: "마무리 볶기",
        details: [
          "대파와 청양고추를 넣고 1분 정도 더 볶아줍니다.",
          "마지막에 참기름을 넣고 마무리하세요."
        ],
        start: 480,
        end: 600
      },
      {
        subtitle: "완성 및 플레이팅",
        details: [
          "완성된 제육볶음을 그릇에 담습니다.",
          "따뜻한 밥과 함께 맛있게 드시면 됩니다!"
        ],
        start: 600,
        end: 720
      }
    ]
  },
  "2": {
    id: 2,
    title: "백종원의 김치찌개",
    description: "집에서 쉽게 만드는 얼큰한 김치찌개입니다.",
    total_time_sec: 1800, // 30분
    youtubeEmbedId: "lqKMiQi2Lpo",
    ingredients: [
      { name: "김치", amount: 200, unit: "g" },
      { name: "돼지고기", amount: 150, unit: "g" },
      { name: "두부", amount: 1, unit: "모" },
      { name: "양파", amount: 0.5, unit: "개" },
      { name: "대파", amount: 1, unit: "대" },
      { name: "마늘", amount: 3, unit: "쪽" },
      { name: "고춧가루", amount: 1, unit: "큰술" },
      { name: "참기름", amount: 1, unit: "큰술" },
      { name: "육수", amount: 600, unit: "ml" },
      { name: "간장", amount: 1, unit: "큰술" }
    ],
    steps: [
      {
        subtitle: "재료 준비",
        details: [
          "김치는 한입 크기로 썰어 준비합니다.",
          "돼지고기도 적당한 크기로 썰어 준비합니다.",
          "두부는 먹기 좋은 크기로 썰어둡니다."
        ],
        start: 0,
        end: 180
      },
      {
        subtitle: "고기 볶기",
        details: [
          "팬에 참기름을 두르고 돼지고기를 먼저 볶아줍니다.",
          "고기가 어느 정도 익을 때까지 볶아주세요."
        ],
        start: 180,
        end: 360
      },
      {
        subtitle: "김치 볶기",
        details: [
          "고기가 익으면 김치를 넣고 함께 볶아줍니다.",
          "김치의 신맛을 날려주기 위해 충분히 볶아주세요."
        ],
        start: 360,
        end: 600
      },
      {
        subtitle: "끓이기",
        details: [
          "육수를 부어 끓이기 시작합니다.",
          "두부와 양파를 넣고 더 끓여줍니다."
        ],
        start: 600,
        end: 1200
      },
      {
        subtitle: "마무리",
        details: [
          "마지막에 대파를 넣고 간을 맞춰 완성합니다.",
          "맛을 보고 부족한 간을 조절해주세요."
        ],
        start: 1200,
        end: 1440
      }
    ]
  },
  "3": {
    id: 3,
    title: "백종원의 계란볶음밥",
    description: "간단하지만 맛있는 계란볶음밥 레시피입니다.",
    total_time_sec: 900, // 15분
    youtubeEmbedId: "dQw4w9WgXcQ",
    ingredients: [
      { name: "밥", amount: 2, unit: "공기" },
      { name: "계란", amount: 3, unit: "개" },
      { name: "양파", amount: 0.5, unit: "개" },
      { name: "당근", amount: 0.3, unit: "개" },
      { name: "대파", amount: 1, unit: "대" },
      { name: "간장", amount: 2, unit: "큰술" },
      { name: "참기름", amount: 1, unit: "큰술" },
      { name: "소금", amount: 1, unit: "꼬집" },
      { name: "후추", amount: 1, unit: "꼬집" },
      { name: "식용유", amount: 2, unit: "큰술" }
    ],
    steps: [
      {
        subtitle: "야채 준비",
        details: [
          "양파와 당근은 잘게 다져 준비합니다.",
          "대파는 송송 썰어 준비합니다."
        ],
        start: 0,
        end: 180
      },
      {
        subtitle: "스크램블 에그 만들기",
        details: [
          "계란을 풀어서 스크램블 에그를 만듭니다.",
          "완성된 스크램블 에그는 따로 담아둡니다."
        ],
        start: 180,
        end: 360
      },
      {
        subtitle: "야채 볶기",
        details: [
          "팬에 기름을 두르고 양파와 당근을 볶아줍니다.",
          "야채가 부드러워질 때까지 볶아주세요."
        ],
        start: 360,
        end: 540
      },
      {
        subtitle: "밥 볶기",
        details: [
          "밥을 넣고 야채와 함께 볶습니다.",
          "간장으로 간을 맞춰주세요."
        ],
        start: 540,
        end: 720
      },
      {
        subtitle: "완성",
        details: [
          "스크램블 에그와 대파를 넣습니다.",
          "마지막에 참기름을 넣어 완성합니다."
        ],
        start: 720,
        end: 900
      }
    ]
  }
} as const;

/**
 * 레시피 ID로 레시피 데이터를 가져오는 함수
 * @param recipeId - 레시피 ID
 * @returns 레시피 데이터 또는 undefined
 */
export const getRecipeById = (recipeId: string): RecipeData | undefined => {
  return mockRecipes[recipeId];
};

/**
 * 모든 레시피 목록을 가져오는 함수
 * @returns 레시피 데이터 배열
 */
export const getAllRecipes = (): RecipeData[] => {
  return Object.values(mockRecipes);
};

/**
 * 레시피 ID 목록을 가져오는 함수
 * @returns 레시피 ID 배열
 */
export const getRecipeIds = (): string[] => {
  return Object.keys(mockRecipes);
};

/**
 * 레시피가 존재하는지 확인하는 함수
 * @param recipeId - 레시피 ID
 * @returns 존재 여부
 */
export const hasRecipe = (recipeId: string): boolean => {
  return recipeId in mockRecipes;
}; 