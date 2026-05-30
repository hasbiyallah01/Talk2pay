'use client';
import { JSX, useEffect, useState } from 'react';
import { useTranslation } from './useTranslation';

type Props = {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
};

export function T({ text, as: Tag = 'span', className }: Props) {
  const { langCode, t } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let cancelled = false;
    t(text).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => { cancelled = true; };
  }, [text, langCode, t]);

  return <Tag className={className}>{translated}</Tag>;
}