# smacthat | State Machine Visualizer

`smacthat` is a standalone, browser-based tool for visualizing and simulating state machines defined in JSON. It uses **Mermaid.js** for diagram generation and **Monaco Editor** for real-time JSON editing.

![smacthat Preview](https://raw.githubusercontent.com/mermaid-js/mermaid/develop/docs/public/img/state.png) *(Placeholder image, replace with your actual screenshot)*

## Features

- **Live JSON Editor**: Modify your state machine configuration and see changes instantly.
- **Interactive Visualizer**: High-quality Mermaid diagrams with pan and zoom capabilities.
- **Simulation Controls**: Walk through states, send events with inputs, and view history/context.
- **Undo & Replay**: Revert transitions or replay your entire simulation sequence.
- **Expandable Layout**: Flexible panel sizes with a draggable resizer.
- **GitHub Pages Ready**: Optimized for static hosting with a modern build process.

## 🚀 Deployment (GitHub Pages)

This project is configured for automated deployment via **GitHub Actions**.

### 1. Enable GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.

### 2. Push to Main
Once GitHub Actions is enabled, every push to the `main` branch will automatically build and deploy the application.

### 3. Manual Build (Optional)
If you want to build locally and deploy manually:
```bash
npm install
npm run build
```
Upload the contents of the `dist/` folder to your hosting provider.

## State Machine Configuration

The simulator uses a simple JSON format. Example:

```json
{
  "id": "coffee-machine",
  "initialState": "idle",
  "context": { "water": 100 },
  "states": {
    "idle": {
      "label": "Ready",
      "on": {
        "BREW": {
          "to": "brewing",
          "action": "context.water -= 10"
        }
      }
    },
    "brewing": {
      "on": {
        "FINISH": { "to": "idle" }
      }
    }
  }
}
```

## License

MIT
