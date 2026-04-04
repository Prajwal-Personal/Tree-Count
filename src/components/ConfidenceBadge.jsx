import { getConfidenceLevel, getConfidencePercent } from '../utils/helpers';

export default function ConfidenceBadge({ score, showLabel = false }) {
  const { level, label, color } = getConfidenceLevel(score);
  const percent = getConfidencePercent(score);

  return (
    <span className={`badge badge-${color}`} title={`AI Confidence: ${percent}%`}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
      }}></span>
      {percent}%
      {showLabel && ` ${label}`}
    </span>
  );
}
