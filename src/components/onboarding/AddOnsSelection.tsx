'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatPrice } from '@/lib/utils/pricing';

interface AddOn {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
}

interface GroupedAddOns {
  [category: string]: AddOn[];
}

interface AddOnsSelectionProps {
  selectedAddOnIds?: number[];
  onSelectionChange: (addOnIds: number[], totalPrice: number) => void;
  basePrice: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  analytics: 'Analytics & Tracking',
  marketing: 'Marketing & Lead Capture',
  communication: 'Communication',
  social: 'Social & Community',
  payment: 'Payment & E-commerce',
  other: 'Other Services',
};

const CATEGORY_ORDER = ['analytics', 'marketing', 'communication', 'social', 'payment', 'other'];

export function AddOnsSelection({ selectedAddOnIds = [], onSelectionChange, basePrice }: AddOnsSelectionProps) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [groupedAddOns, setGroupedAddOns] = useState<GroupedAddOns>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(selectedAddOnIds));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAddOns();
  }, []);

  useEffect(() => {
    calculateAndNotify();
  }, [selectedIds]);

  async function fetchAddOns() {
    try {
      const response = await fetch('/api/add-ons');
      if (!response.ok) throw new Error('Failed to fetch add-ons');

      const data = await response.json();
      setAddOns(data.addOns || []);
      setGroupedAddOns(data.grouped || {});
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateAndNotify() {
    const selected = addOns.filter(addon => selectedIds.has(addon.id));
    const addOnsTotal = selected
      .filter(addon => !addon.isFree)
      .reduce((sum, addon) => sum + addon.price, 0);

    onSelectionChange(Array.from(selectedIds), addOnsTotal);
  }

  function toggleAddOn(addOnId: number) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(addOnId)) {
      newSelected.delete(addOnId);
    } else {
      newSelected.add(addOnId);
    }
    setSelectedIds(newSelected);
  }

  function getSelectedTotal(): number {
    return addOns
      .filter(addon => selectedIds.has(addon.id) && !addon.isFree)
      .reduce((sum, addon) => sum + addon.price, 0);
  }

  function getSelectedCount(): number {
    return selectedIds.size;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
          <CardDescription>Base price + selected add-ons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base Price:</span>
            <span className="font-medium">{formatPrice(basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Add-ons ({getSelectedCount()} selected):</span>
            <span className="font-medium">{formatPrice(getSelectedTotal())}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(basePrice + getSelectedTotal())}</span>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            50% deposit: {formatPrice((basePrice + getSelectedTotal()) / 2)}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons by Category */}
      <Accordion type="multiple" className="space-y-4">
        {CATEGORY_ORDER.map(category => {
          const categoryAddOns = groupedAddOns[category] || [];
          if (categoryAddOns.length === 0) return null;

          const freeCount = categoryAddOns.filter(a => a.isFree).length;
          const paidCount = categoryAddOns.length - freeCount;

          return (
            <AccordionItem key={category} value={category} className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <h3 className="text-lg font-semibold">{CATEGORY_LABELS[category] || category}</h3>
                  <div className="flex gap-2">
                    {freeCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {freeCount} FREE
                      </Badge>
                    )}
                    {paidCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {paidCount} Paid
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {categoryAddOns.map(addon => (
                    <div
                      key={addon.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedIds.has(addon.id)}
                        onCheckedChange={() => toggleAddOn(addon.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <label
                            htmlFor={`addon-${addon.id}`}
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                          >
                            {addon.name}
                          </label>
                          {addon.isFree && (
                            <Badge variant="secondary" className="text-xs">
                              FREE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                      {!addon.isFree && (
                        <div className="text-right min-w-[80px]">
                          <div className="font-bold text-primary">{formatPrice(addon.price)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Help Text */}
      <div className="rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium mb-2">💡 About Add-ons</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• FREE add-ons are included at no extra cost</li>
          <li>• Select only the integrations you need</li>
          <li>• You can add more integrations later</li>
          <li>• Final price shown is before any discounts</li>
        </ul>
      </div>
    </div>
  );
}
