import { Component, computed, effect, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';


interface Product {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-signal-demo',
  imports: [DecimalPipe],
  templateUrl: './signal-demo.component.html',
  styleUrl: './signal-demo.component.scss'
})
export class SignalDemoComponent {
  // 1. WRITABLE SIGNALS
  // These hold the state that can change directly.
  availableProducts = signal<Product[]>([
    { id: 1, name: 'Angular Course', price: 50 },
    { id: 2, name: 'RxJS Handbook', price: 30 },
    { id: 3, name: 'Signal Coffee Mug', price: 15 }
  ]);

  cart = signal<CartItem[]>([]);
  applyDiscount = signal<boolean>(false);
  latestLogMessage = signal<string>('Initializing cart effect...');

  // 2. COMPUTED SIGNALS
  // These automatically recalculate ONLY when their dependencies (tracked signals) change.
  totalItems = computed(() => {
    // Tracks 'cart' signal
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  subtotal = computed(() => {
    // Tracks 'cart' signal
    return this.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  finalTotal = computed(() => {
    // Tracks both 'subtotal' AND 'applyDiscount' signals!
    const baseTotal = this.subtotal();
    return this.applyDiscount() ? baseTotal * 0.9 : baseTotal;
  });

  constructor() {
    // 3. EFFECTS
    // Effects are for side-effects (like syncing with localStorage, logging, or DOM manipulation outside Angular).
    // They are executed immediately and then re-execute whenever a read signal changes.
    effect(() => {
      // Because we read this.finalTotal() and this.totalItems() here,
      // this effect tracks them automatically.
      const msg = `Cart updated: ${this.totalItems()} items, Total: $${this.finalTotal()}`;
      console.log('EFFECT FIRED:', msg);

      // Using setTimeout to write to a signal inside an effect
      // without causing an infinite loop (writing in effect is generally discouraged, we do it for demo!)
      setTimeout(() => this.latestLogMessage.set(msg), 0);
    });
  }

  // ==== ACTIONS THAT MUTATE SIGNALS ====

  addToCart(product: Product) {
    // Using update() safely accesses the previous value and computes the next value.
    this.cart.update(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        // Return new array reference and new item reference to ensure immutability
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  }

  updateQuantity(id: number, delta: number) {
    this.cart.update(currentCart => {
      return currentCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  }

  removeFromCart(id: number) {
    this.cart.update(currentCart => currentCart.filter(item => item.id !== id));
  }

  toggleDiscount() {
    // We can also toggle boolean signals easily using update
    this.applyDiscount.update(val => !val);
  }

  clearCart() {
    // Using set() to completely overwrite the old value
    this.cart.set([]);
    this.applyDiscount.set(false);
  }
}
