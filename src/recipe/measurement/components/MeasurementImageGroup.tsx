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
      <div className="image-category-title">{categoryLabel}</div>
      <div className="image-section">
        {images.map((img, idx) => (
          <div className="image-box" key={idx}>
            <img src={img.src} alt={img.caption} className="image" />
            <div className="caption">{img.caption}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MeasurementImageGroup;
