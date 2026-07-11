/**
 * SpecDataText — wrapper component that renders data (prices, specs,
 * quantities) in IBM Plex Mono. A core part of the visual identity:
 * spec data should look like "data," not regular prose.
 */
export default function SpecDataText({ children, className = '', as: Tag = 'span' }) {
  return (
    <Tag className={`font-mono ${className}`}>
      {children}
    </Tag>
  );
}
