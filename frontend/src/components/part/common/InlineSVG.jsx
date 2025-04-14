import { useEffect, useState } from 'react';

const InlineSVG = ({ src, alt, className }) => {
    const [svgContent, setSvgContent] = useState(null);

    useEffect(() => {
        const fetchSVG = async () => {
            try {
                const response = await fetch(src);
                const svgText = await response.text();
                setSvgContent(svgText);
            } catch (error) {
                console.error(`Error loading SVG: ${src}`, error);
            }
        };
        fetchSVG();
    }, [src]);

    return (
        <div
            className={className}
            role='img'
            aria-label={alt}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

export default InlineSVG;