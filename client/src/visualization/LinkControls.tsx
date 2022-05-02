const controlStyles = { fontSize: 10, marginBottom: "17px", color: "white" };

type Props = {
  layout: string;
  setLayout: (layout: string) => void;
};

export default function LinkControls({ layout, setLayout }: Props) {
  return (
    <div style={controlStyles}>
      <label>구조 </label>&nbsp;
      <select
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setLayout(e.target.value)}
        value={layout}
      >
        <option value="cartesian">트리 구조</option>
        <option value="polar">원형 트리 구조</option>
      </select>
      &nbsp;&nbsp;
    </div>
  );
}
