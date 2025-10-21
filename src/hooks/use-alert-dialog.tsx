'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
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
}

export function useAlertDialog() {
  const [state, setState] = useState<AlertDialogState>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'default',
  });

  const showAlert = (description: string, title = 'Notification', variant: 'default' | 'destructive' = 'default') => {
    setState({
      isOpen: true,
      title,
      description,
      variant,
    });
  };

  const showError = (description: string, title = 'Error') => {
    showAlert(description, title, 'destructive');
  };

  const showSuccess = (description: string, title = 'Success') => {
    showAlert(description, title, 'default');
  };

  const AlertDialogComponent = () => (
    <AlertDialog open={state.isOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isOpen: open }))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={state.variant === 'destructive' ? 'text-red-600' : ''}>
            {state.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {state.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    showAlert,
    showError,
    showSuccess,
    AlertDialog: AlertDialogComponent,
  };
}
