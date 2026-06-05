'use client';

/*
 * ToastProvider
 * React replacement for the prototype's global toast() function.
 * Wrap the app once (in layout) and call useToast() anywhere.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type ToastFn = (msg: string) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string) => {
    setMsg(message);
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={'toast' + (show ? ' show' : '')} role="status" aria-live="polite">
        <span className="dot" />
        {msg}
      </div>
    </ToastContext.Provider>
  );
}
