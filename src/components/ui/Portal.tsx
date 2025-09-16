import React from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: Element | DocumentFragment | null;
}

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;
  return createPortal(children, target);
};

export default Portal;


