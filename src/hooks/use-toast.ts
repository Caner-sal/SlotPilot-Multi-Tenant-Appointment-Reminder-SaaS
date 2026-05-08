"use client";

import * as React from "react";

export type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string };

interface ToastState {
  toasts: Toast[];
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST":
      return {
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
  }
}

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function toast(props: Omit<Toast, "id">) {
  const id = genId();
  const duration = props.duration ?? 5000;

  dispatch({ type: "ADD_TOAST", toast: { ...props, id } });

  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", id });
  }, duration);

  return id;
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "REMOVE_TOAST", id }),
  };
}

export { useToast, toast };
