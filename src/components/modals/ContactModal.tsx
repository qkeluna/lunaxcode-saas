'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { User, Building2, Mail, Phone, MessageSquare } from 'lucide-react';
import { contactModalSchema, type ContactModalInput } from '@/lib/validations/schemas';
import { useEmailValidator } from '@/hooks/useEmailValidation';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateEmailField = useEmailValidator({ normalize: true });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactModalInput>({
    resolver: zodResolver(contactModalSchema),
  });

  const onSubmit = async (data: ContactModalInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error Response:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);

      toast.success('Message sent successfully!', {
        description: 'We will get back to you within 24 hours.',
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Custom Quote</DialogTitle>
          <DialogDescription>
            Fill out the form below and we&apos;ll get back to you with a personalized quote within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <User />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="fullName"
                placeholder="Juan dela Cruz"
                {...register('fullName')}
                disabled={isSubmitting}
                aria-invalid={!!errors.fullName}
              />
            </InputGroup>
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Building2 />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="companyName"
                placeholder="ABC Company Inc."
                {...register('companyName')}
                disabled={isSubmitting}
                aria-invalid={!!errors.companyName}
              />
            </InputGroup>
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Mail />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...register('email')}
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
            </InputGroup>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Contact Number (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Phone />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="contactNumber"
                type="tel"
                placeholder="+63 912 345 6789"
                {...register('contactNumber')}
                disabled={isSubmitting}
                aria-invalid={!!errors.contactNumber}
              />
            </InputGroup>
            {errors.contactNumber && (
              <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <InputGroupAddon align="block-start">
                <InputGroupText>
                  <MessageSquare />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupTextarea
                id="message"
                placeholder="Tell us about your project requirements..."
                rows={4}
                {...register('message')}
                disabled={isSubmitting}
                aria-invalid={!!errors.message}
              />
            </InputGroup>
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
