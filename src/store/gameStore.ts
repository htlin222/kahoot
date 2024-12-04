class GameStore {
  private static instance: GameStore;

  private constructor() {
    // If no PIN exists in sessionStorage, create one
    if (!sessionStorage.getItem('currentPin')) {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      sessionStorage.setItem('currentPin', newPin);
      console.log('New PIN created:', newPin);
    }
    console.log('GameStore initialized with PIN:', sessionStorage.getItem('currentPin'));
  }

  public static getInstance(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore();
    }
    return GameStore.instance;
  }

  getPin(): string {
    const pin = sessionStorage.getItem('currentPin');
    console.log('Getting PIN:', pin);
    return pin || '';
  }

  validatePin(inputPin: string): boolean {
    const currentPin = sessionStorage.getItem('currentPin');
    console.log('Validating:', inputPin, 'against:', currentPin);
    return inputPin === currentPin;
  }

  resetPin(): void {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    sessionStorage.setItem('currentPin', newPin);
    console.log('PIN reset to:', newPin);
  }
}

// Export a singleton instance
export const gameStore = GameStore.getInstance();
