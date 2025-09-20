import { useSafeArea } from '_common/safe-area/useSafeArea';

function SafeArea({
  children,
  isTopApplied = true,
  isLeftApplied = true,
  isRightApplied = true,
  isBottomApplied = true,
  isLandscape = false,
}: {
  children: React.ReactNode;
  isTopApplied?: boolean;
  isLeftApplied?: boolean;
  isRightApplied?: boolean;
  isBottomApplied?: boolean;
  isLandscape?: boolean;
}) {
  const safeArea = useSafeArea();
  console.log(isLandscape,"isLandscape");
  return (
    <div
      style={{
        paddingTop: isTopApplied ? safeArea?.top : 0,
        paddingLeft: isLeftApplied ? safeArea?.left : 0,
        paddingRight: isRightApplied ? safeArea?.right : 0,
        paddingBottom: isBottomApplied ? safeArea?.bottom : 0,
        ...(isLandscape
          ? {
              paddingTop: isTopApplied ? safeArea?.right : 0,
              paddingLeft: isLeftApplied ? safeArea?.top : 0,
              paddingRight: isRightApplied ? safeArea?.bottom : 0,
              paddingBottom: isBottomApplied ? safeArea?.left : 0,
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}

export default SafeArea;
