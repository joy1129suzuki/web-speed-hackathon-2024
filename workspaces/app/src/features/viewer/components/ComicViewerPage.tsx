import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

import { getImageUrl } from '../../../lib/image/getImageUrl';

const _Canvas = styled.canvas`
  height: 100%;
  width: auto;
  flex-grow: 0;
  flex-shrink: 0;
`;

type Props = {
  pageImageId: string;
};

export const ComicViewerPage = ({ pageImageId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 画像がビューポートに入ったら読み込みを開始
          image.src = getImageUrl({
            format: 'avif',
            imageId: pageImageId,
          });
          observer.unobserve(canvas);
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.1 // 10%の部分が見えたらトリガー
    });

    if (canvas) {
      observer.observe(canvas);
    }

    image.onload = () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
      }
    };

    return () => {
      observer.disconnect();
    };
  }, [pageImageId]);

  return <_Canvas ref={canvasRef} />;
};