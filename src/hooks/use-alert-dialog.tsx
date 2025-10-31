'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  type?: 'alert' | 'confirm';
  onConfirm?: () => void | Promise<void>;
}

export function useAlertDialog() {
  const [state, setState] = useState<AlertDialogState>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'default',
    type: 'alert',
  });

  const showAlert = (description: string, title = 'Notification', variant: 'default' | 'destructive' = 'default') => {
    setState({
      isOpen: true,
      title,
      description,
      variant,
      type: 'alert',
    });
  };

  const showError = (description: string, title = 'Error') => {
    showAlert(description, title, 'destructive');
  };

  const showSuccess = (description: string, title = 'Success') => {
    showAlert(description, title, 'default');
  };

  const showConfirm = (
    description: string,
    onConfirm: () => void | Promise<void>,
    title = 'Confirm Action',
    variant: 'default' | 'destructive' = 'destructive'
  ) => {
    setState({
      isOpen: true,
      title,
      description,
      variant,
      type: 'confirm',
      onConfirm,
    });
  };

  const handleConfirm = async () => {
    if (state.onConfirm) {
      await state.onConfirm();
    }
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const AlertDialogComponent = () => (
    <AlertDialog open={state.isOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isOpen: open }))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={state.variant === 'destructive' ? 'text-red-600 dark:text-red-400' : ''}>
            {state.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {state.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {state.type === 'confirm' ? (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className={state.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700' : ''}
              >
                Confirm
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction>OK</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    showAlert,
    showError,
    showSuccess,
    showConfirm,
    AlertDialog: AlertDialogComponent,
  };
}
