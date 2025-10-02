import MeasurementImageGroup from './MeasurementImageGroup';

interface MeasurementSectionProps {
  title: string;
  groups: {
    categoryLabel: string;
    images: { src: string; caption: string }[];
  }[];
}

const MeasurementSection = ({ title, groups }: MeasurementSectionProps): JSX.Element => {
  return (
    <>
      <h2 className="guide-section-title">{title}</h2>
      <div className="measurement-image-category">
        {groups.map((group, index) => (
          <MeasurementImageGroup
            key={index}
            categoryLabel={group.categoryLabel}
            images={group.images}
          />
        ))}
      </div>
    </>
  );
};

export default MeasurementSection;
