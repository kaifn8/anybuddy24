import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, type PricingConfig } from '@/store/useAppStore';
import { toast } from 'sonner';
import type { TrustLevel } from '@/types/anybuddy';

interface PricingField {
  key: keyof PricingConfig;
  label: string;
  description: string;
  unit: string;
}

const PRICING_FIELDS: PricingField[] = [
  { key: 'base', label: 'Base cost to create', description: 'Default credit cost to create a plan', unit: 'credit' },
  { key: 'now', label: 'Right Now surcharge', description: 'Extra cost for urgent "now" plans', unit: 'credit' },
  { key: 'today', label: 'Today surcharge', description: 'Extra cost for same-day plans', unit: 'credit' },
  { key: 'week', label: 'This Week surcharge', description: 'Extra cost for weekly plans', unit: 'credit' },
  { key: 'joinEarn', label: 'Join earn rate', description: 'Credits earned when joining a plan', unit: 'credit' },
  { key: 'signupBonus', label: 'Signup bonus', description: 'Credits given to new users', unit: 'credits' },
  { key: 'referral', label: 'Referral bonus', description: 'Credits for each referred user', unit: 'credit' },
];

const TRUST_LEVELS: { level: TrustLevel; label: string; color: string }[] = [
  { level: 'seed', label: 'Seed', color: 'text-muted-foreground' },
  { level: 'solid', label: 'Solid', color: 'text-secondary' },
  { level: 'trusted', label: 'Trusted', color: 'text-primary' },
  { level: 'anchor', label: 'Anchor', color: 'text-warning' },
];

export default function AdminPricing() {
  const { pricingConfig, trustDiscounts, updatePricingConfig, updateTrustDiscounts } = useAppStore();
  const [localPricing, setLocalPricing] = useState<PricingConfig>(pricingConfig);
  const [localDiscounts, setLocalDiscounts] = useState<Record<TrustLevel, number>>(trustDiscounts);
  const [pricingEdited, setPricingEdited] = useState(false);
  const [discountsEdited, setDiscountsEdited] = useState(false);

  useEffect(() => { setLocalPricing(pricingConfig); }, [pricingConfig]);
  useEffect(() => { setLocalDiscounts(trustDiscounts); }, [trustDiscounts]);

  const handlePricingChange = (key: keyof PricingConfig, value: number) => {
    setLocalPricing(p => ({ ...p, [key]: value }));
    setPricingEdited(true);
  };

  const handleDiscountChange = (level: TrustLevel, value: number) => {
    setLocalDiscounts(d => ({ ...d, [level]: Math.min(100, Math.max(0, value)) }));
    setDiscountsEdited(true);
  };

  const savePricing = () => {
    updatePricingConfig(localPricing);
    setPricingEdited(false);
    toast('💰 Pricing updated successfully');
  };

  const saveDiscounts = () => {
    updateTrustDiscounts(localDiscounts);
    setDiscountsEdited(false);
    toast('🛡️ Trust discounts updated');
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Credit Pricing</h2>
        <p className="text-sm text-muted-foreground">Configure credit costs and earn rates</p>
      </div>

      {/* Pricing rules */}
      <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm divide-y divide-border/15">
        {PRICING_FIELDS.map((field) => (
          <div key={field.key} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{field.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{field.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                value={localPricing[field.key]}
                onChange={(e) => handlePricingChange(field.key, parseFloat(e.target.value) || 0)}
                step={0.25}
                min={0}
                className="w-16 h-8 rounded-lg border border-border/30 bg-background text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-[10px] text-muted-foreground w-10">{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {pricingEdited && (
        <div className="flex gap-2">
          <Button
            onClick={() => { setLocalPricing(pricingConfig); setPricingEdited(false); }}
            variant="outline"
            className="flex-1 h-10"
          >
            Reset
          </Button>
          <Button
            onClick={savePricing}
            className="flex-1 h-10"
          >
            Save Pricing
          </Button>
        </div>
      )}

      {/* Trust level discounts — editable */}
      <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trust Level Discounts</h3>
        <div className="space-y-3">
          {TRUST_LEVELS.map((item) => (
            <div key={item.level} className="flex items-center justify-between">
              <span className={cn('text-sm font-medium capitalize', item.color)}>{item.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localDiscounts[item.level]}
                  onChange={(e) => handleDiscountChange(item.level, parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-14 h-7 rounded-lg border border-border/30 bg-background text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground w-24">% off creation</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {discountsEdited && (
        <div className="flex gap-2">
          <Button
            onClick={() => { setLocalDiscounts(trustDiscounts); setDiscountsEdited(false); }}
            variant="outline"
            className="flex-1 h-10"
          >
            Reset
          </Button>
          <Button
            onClick={saveDiscounts}
            className="flex-1 h-10"
          >
            Save Discounts
          </Button>
        </div>
      )}
    </div>
  );
}
