/**
 * TestManager
 * Handles persistence of simulations in LocalStorage.
 */
export class TestManager {
    static STORAGE_KEY = 'smac_tests';

    static getTests() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse tests from localStorage", e);
            return [];
        }
    }

    static saveTest(testData) {
        const tests = this.getTests();
        const newTest = {
            id: crypto.randomUUID(),
            name: testData.name || `Simulation ${new Date().toLocaleString()}`,
            createdAt: new Date().toISOString(),
            configId: testData.configId,
            initialContext: testData.initialContext,
            transitions: testData.transitions, // Array of {event, input}
        };
        tests.push(newTest);
        this.persist(tests);
        return newTest;
    }

    static updateTest(id, updates) {
        const tests = this.getTests();
        const index = tests.findIndex(t => t.id === id);
        if (index !== -1) {
            tests[index] = { ...tests[index], ...updates };
            this.persist(tests);
            return true;
        }
        return false;
    }

    static deleteTest(id) {
        let tests = this.getTests();
        tests = tests.filter(t => t.id !== id);
        this.persist(tests);
    }

    static persist(tests) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tests));
    }
}
