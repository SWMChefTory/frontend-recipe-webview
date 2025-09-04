interface Props {
  onClick: () => void;
}

const StartCookingButton = ({ onClick }: Props): JSX.Element => {
  return (
    <div className="button-container">
      <button
        className="start-cooking-btn"
        onClick={onClick}
        type="button"
        aria-label="조리 시작하기"
      >
        조리 시작하기
      </button>
    </div>
  );
};

export default StartCookingButton;
