import Slider from 'react-slick';
import { RecipeData } from 'recipe/detail/types/recipe';
import StepCard from 'recipe/step/components/carousel/StepCard';
import 'recipe/step/components/carousel/Carousel.css';
import { useOrientation } from '_common/orientation/useOrientation';

export default function Carousel({
  recipeData,
  sliderRef,
  afterChange,
  onInit,
}: {
  recipeData: RecipeData;
  sliderRef: React.RefObject<Slider>;
  afterChange: (index: number) => void;
  onInit: () => void;
}) {
  const { isPortrait } = useOrientation();

  const slickSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    centerMode: isPortrait()? true:false,
    centerPadding: isPortrait() ? '10%' : '0%',
    afterChange: afterChange,
    arrows: false,
    adaptiveHeight: true, // 높이 적응 비활성화
    draggable: true,
    onInit: onInit,
  };

  let stepCount = 1;
  return (
    <div className={isPortrait() ? `carousel-container` : `carousel-container-landscape`}>
      <Slider className="carousel" ref={sliderRef} {...slickSettings}>
        {recipeData.recipe_steps.flatMap((step, idx) =>
          step.details.map((detail, detailIdx) => (
            <StepCard
              key={`step-${idx}-${detailIdx}`}
              step={`${step.subtitle}(${detailIdx + 1}/${step.details.length})`}
              detail={detail.text}
              index={stepCount++}
            />
          )),
        )}
      </Slider>
    </div>
  );
}
