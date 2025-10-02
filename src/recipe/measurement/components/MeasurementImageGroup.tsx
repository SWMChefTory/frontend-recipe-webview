interface ImageItem {
  src: string;
  caption: string;
}

interface MeasurementImageGroupProps {
  categoryLabel: string;
  images: ImageItem[];
}

const MeasurementImageGroup = ({
  categoryLabel,
  images,
}: MeasurementImageGroupProps): JSX.Element => {
  return (
    <>
      <div className="measurement-image-category-title">{categoryLabel}</div>
      <div className="measurement-image-section">
        {images.map((img, idx) => (
          <div className="measurement-image-box" key={idx}>
            <img src={img.src} alt={img.caption} className="measurement-image" />
            <div className="measurement-caption">{img.caption}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MeasurementImageGroup;
