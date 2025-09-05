// InventorySale.test.js
// Adjust the import path to your file (e.g., './Service/InventorySale')
import {
    totalPresentInventorySale,
    totalPresentCostInventory,
    revenueByTimeRangee,
    refundAmounts,
    profitForAllSale,
    LowStockManager,
    totalExpenses,
    grandProfit,
  } from './Components/Admin/components/Service/InventorySale';

  
  describe('InventorySale helpers', () => {
    describe('totalPresentInventorySale', () => {
      it('sums sale_price * quantity with 2-decimal rounding', () => {
        const products = [
          { sale_price: '10', quantity: '2' }, // 20
          { sale_price: 3.333, quantity: 3 },  // 9.999 -> rounds to 30.00 total
        ];
        expect(totalPresentInventorySale(products)).toBe(30);
      });
  
      it('handles empty/invalid inputs', () => {
        expect(totalPresentInventorySale()).toBe(0);
        const products = [
          { sale_price: 'abc', quantity: 5 },
          { sale_price: 12, quantity: null },
        ];
        expect(totalPresentInventorySale(products)).toBe(0);
      });
    });
  
    describe('totalPresentCostInventory', () => {
      it('sums cost_price * quantity with 2-decimal rounding', () => {
        const products = [
          { cost_price: '4.5', quantity: 2 },  // 9
          { cost_price: 1.111, quantity: 3 },  // 3.333 -> total 12.333 -> 12.33
        ];
        expect(totalPresentCostInventory(products)).toBe(12.33);
      });
  
      it('handles empty/invalid inputs', () => {
        expect(totalPresentCostInventory()).toBe(0);
        const products = [{ cost_price: 'x', quantity: 2 }];
        expect(totalPresentCostInventory(products)).toBe(0);
      });
    });
  
    describe('revenueByTimeRangee', () => {
      it('sums total_paid minus refunded_amount across sales', () => {
        const sales = [
          { total_paid: '100', refunded_amount: '10' }, // 90
          { total_paid: 50, refunded_amount: 0 },       // 50
        ];
        expect(revenueByTimeRangee(sales)).toBe(140);
      });
  
      it('returns 0 for non-arrays', () => {
        expect(revenueByTimeRangee(null)).toBe(0);
        expect(revenueByTimeRangee({})).toBe(0);
      });
    });
  
    describe('refundAmounts', () => {
      it('sums order.total_paid for each refund record (per current implementation)', () => {
        const refund = [
          { order: { total_paid: "5" } },
          { order: { total_paid: 7 } },
          { somethingElse: true }, // missing order => treated as 0
        ];
        expect(refundAmounts(refund)).toBe(12);
      });
  
      it('returns 0 for non-arrays', () => {
        expect(refundAmounts(null)).toBe(0);
        expect(refundAmounts({})).toBe(0);
      });
    });
  
    describe('profitForAllSale', () => {
      it('computes total profit from items (supports array or JSON string)', () => {
        const sales = [
          {
            // (10 - 4) * 2 = 12 ; (3 - 1) * 5 = 10 ; subtotal = 22
            items: JSON.stringify([
              { amount: '10', costPrice: '4', quantity: 2 },
              { amount: 3, costPrice: 1, quantity: 5 },
            ]),
          },
          {
            // (7.5 - 2.5) * 1 = 5 ; total = 27
            items: [{ amount: 7.5, costPrice: 2.5, quantity: 1 }],
          },
        ];
        expect(profitForAllSale(sales)).toBe(27);
      });
  
      it('handles invalid/missing items gracefully', () => {
        const sales = [
          { items: 'not json' },
          { items: null },
          { items: [] },
        ];
        expect(profitForAllSale(sales)).toBe(0);
      });
    });
  
    describe('LowStockManager', () => {
      it('returns items with quantity <= threshold (numeric compare)', () => {
        const products = [
          { quantity: 2, threshold: 3 },      // include
          { quantity: 3, threshold: 3 },      // include
          { quantity: 4, threshold: 3 },      // exclude
          { quantity: '0', threshold: '1' },  // include (0 <= 1)
        ];
        const low = LowStockManager(products);
        expect(low).toHaveLength(3);
        expect(low).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ quantity: 2, threshold: 3 }),
            expect.objectContaining({ quantity: 3, threshold: 3 }),
            expect.objectContaining({ quantity: '0', threshold: '1' }),
          ])
        );
      });
  
      it('handles empty/undefined safely', () => {
        expect(LowStockManager()).toEqual([]);
        expect(LowStockManager([])).toEqual([]);
      });
    });
  
    describe('totalExpenses', () => {
      it('sums total_gross fields', () => {
        const expenses = [
          { total_gross: '13.98' },
          { total_gross: 2 },
          { total_gross: null }, // 0
        ];
        expect(totalExpenses(expenses)).toBeCloseTo(15.98, 2);
      });
  
      it('returns 0 for non-arrays', () => {
        expect(totalExpenses(null)).toBe(0);
        expect(totalExpenses({})).toBe(0);
      });
    });
  
    describe('grandProfit', () => {
      it('computes profit - expenses - refunds', () => {
        expect(
          grandProfit({
            profitForAllSale: 100,
            totalExpenses: 30,
            refundAmounts: 20,
          })
        ).toBe(50);
      });
    });
  });
  