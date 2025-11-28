import { useEffect, useState } from 'react';
// Sanitize SVG; prevent XSS attacks (probably not needed here, but hey, thinking ahead)
// Needed here since this component uses dangerouslySetInnerHTML
import DOMPurify from 'dompurify';

const SVG = ({ name, className, cursor = "pointer", ...props }) => {
  const [svgContent, setSvgContent] = useState("");
  const SVGClass = className ? `icon ${className}` : `icon`;

  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const response = await fetch(`${name}.svg`);
        const svgText = await response.text();
        setSvgContent(svgText);
      } catch (error) {
        console.error(`Error loading SVG: ${name}.svg`, error);
      }
    };
    fetchSVG();
  }, [name]);

  return (
    <button
      {...props}
      role='img'
      aria-label={`${name} icon`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgContent) }}
      className={SVGClass}
      style={{ cursor }}
    />
  );
};

export default SVG;
