interface Props {
  selected: string;
  onChange: (model: string) => void;
}

const STTModelSelector = ({ selected, onChange }: Props): JSX.Element => {
  return (
    <div>
      <select onChange={e => onChange(e.target.value)} value={selected}>
        <option value="VITO">VITO</option>
        <option value="CLOVA">CLOVA</option>
        <option value="OPENAI">OPENAI</option>
      </select>
    </div>
  );
};

export default STTModelSelector;
