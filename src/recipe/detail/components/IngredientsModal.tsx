import React from 'react';
import 'recipe/detail/components/IngredientsModal.css';

type Props = {
  checkedCount: number;
  totalCount: number;
  onClose: () => void;
  onProceed: () => void;
};

const IngredientsModal: React.FC<Props> = ({ checkedCount, totalCount, onClose, onProceed }) => {
  const remaining = Math.max(0, totalCount - checkedCount);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>재료 준비 확인</h2>
        <p>
          아직 체크되지 않은 재료가 <strong>{remaining}</strong>개 있습니다.
          <br />
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{ background: 'var(--bg)', color: 'var(--text-strong)' }}
          >
            계속 준비할게요
          </button>
          <button onClick={onProceed}>바로 시작할래요</button>
        </div>
      </div>
    </div>
  );
};

export default IngredientsModal;
