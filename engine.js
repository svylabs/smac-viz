/**
 * Custom Simulation Engine
 * Handles JSON state machines, Mermaid generation, and context-driven transitions.
 */

class VisualizerEngine {
    constructor() {
        this.config = null;
        this.currentStateId = null;
        this.previousStateId = null;
        this.context = {};
        this.history = [];
        this.listeners = [];
        this.lastEventId = null;
    }

    /**
     * Load a simulation configuration
     * @param {Object} config 
     */
    load(config) {
        console.log("VisualizerEngine: Loading config", config?.id);
        if (!config || !config.states) {
            console.error("VisualizerEngine: Invalid config provided");
            return;
        }
        this.config = config;
        this.context = JSON.parse(JSON.stringify(config.context || {}));
        this.currentStateId = config.initialState;
        this.previousStateId = null;
        this.lastEventId = null;
        this.history = [];
        this.recordHistory('Initial State');
        this.notify();
        console.log("VisualizerEngine: Load complete. Current state:", this.currentStateId);
    }

    /**
     * Subscribe to engine changes
     */
    subscribe(fn) {
        this.listeners.push(fn);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.getState()));
    }

    /**
     * Send an event to trigger a transition
     * @param {string} eventId 
     * @param {Object} input 
     */
    send(eventId, input = {}) {
        const currentState = this.config.states[this.currentStateId];
        const transition = currentState.on[eventId];

        if (!transition) {
            console.error(`No transition found for event ${eventId} in state ${this.currentStateId}`);
            return false;
        }

        // Execute action if exists
        if (transition.action) {
            try {
                // Actions have access to 'context' and 'input'
                const actionFn = new Function('context', 'input', `
                    ${transition.action};
                    return context;
                `);
                this.context = actionFn(JSON.parse(JSON.stringify(this.context)), input);
            } catch (err) {
                console.error(`Action error for ${eventId}:`, err);
                // We return the error so the UI can handle it (e.g. show an alert)
                return { error: err.message };
            }
        }

        // Move to next state
        this.previousStateId = this.currentStateId;
        this.currentStateId = transition.to;
        this.lastEventId = eventId;
        this.recordHistory(eventId, input);
        this.notify();
        return true;
    }

    recordHistory(event, input = {}) {
        this.history.push({
            timestamp: new Date().toLocaleTimeString(),
            state: this.currentStateId,
            event: event,
            context: JSON.parse(JSON.stringify(this.context)),
            input: JSON.parse(JSON.stringify(input))
        });
    }

    /**
     * Generate Mermaid source string automatically from config
     */
    generateMermaid() {
        if (!this.config) return '';

        let m = 'flowchart LR\n';

        // Styling
        m += '    classDef current fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff\n';
        m += '    classDef previous fill:#10b981,stroke:#fff,stroke-width:1px,color:#fff\n\n';

        // States
        Object.entries(this.config.states).forEach(([id, data]) => {
            const label = data.label || id;
            m += `    ${id}("${label}")\n`;
            if (id === this.currentStateId) {
                m += `    class ${id} current\n`;
            } else if (id === this.previousStateId) {
                m += `    class ${id} previous\n`;
            }
        });

        m += '\n';

        // Transitions
        let edgeIndex = 0;
        let activeEdgeIndex = -1;

        Object.entries(this.config.states).forEach(([sourceId, stateData]) => {
            if (stateData.on) {
                Object.entries(stateData.on).forEach(([eventId, trans]) => {
                    const label = trans.label || eventId;
                    m += `    ${sourceId} -->|"${label}"| ${trans.to}\n`;

                    if (sourceId === this.previousStateId && eventId === this.lastEventId) {
                        activeEdgeIndex = edgeIndex;
                    }
                    edgeIndex++;
                });
            }
        });

        if (activeEdgeIndex !== -1) {
            m += `    linkStyle ${activeEdgeIndex} stroke:#6366f1,stroke-width:4px,color:#6366f1\n`;
        }

        return m;
    }

    getState() {
        const stateData = this.config ? this.config.states[this.currentStateId] : null;
        if (!stateData && this.config) {
            console.warn(`VisualizerEngine: State ${this.currentStateId} not found in config`);
        }
        return {
            id: this.currentStateId,
            data: stateData,
            context: this.context,
            availableEvents: stateData ? stateData.on : {},
            mermaid: this.generateMermaid(),
            history: this.history
        };
    }

    /**
     * Undo the last transition
     */
    undo() {
        if (this.history.length <= 1) return; // Can't undo initial state

        this.history.pop(); // Remove current state
        const restored = this.history[this.history.length - 1];

        this.currentStateId = restored.state;
        this.context = JSON.parse(JSON.stringify(restored.context));
        this.lastEventId = restored.event === 'Initial State' ? null : restored.event;

        // Recover previous state if history allows
        this.previousStateId = this.history.length > 1
            ? this.history[this.history.length - 2].state
            : null;

        console.log("VisualizerEngine: Undo to", this.currentStateId);
        this.notify();
    }

    /**
     * Replay a sequence of events
     * @param {Array<{event: string, input: Object}>} sequence 
     */
    async replay(sequence, delay = 500) {
        console.log("VisualizerEngine: Starting replay of", sequence.length, "events");
        this.reset();

        for (const item of sequence) {
            await new Promise(resolve => setTimeout(resolve, delay));
            this.send(item.event, item.input);
        }
        console.log("VisualizerEngine: Replay complete");
    }

    reset() {
        if (this.config) {
            console.log("VisualizerEngine: Resetting");
            this.load(this.config);
        }
    }
}

export { VisualizerEngine };
