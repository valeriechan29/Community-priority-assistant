# Community Priority Assistant

Community Priority Assistant is an AI-enabled prototype that helps colleagues discover volunteering opportunities, turn community involvement into meaningful priorities, and reflect on their impact.

## Features

- Browse and filter volunteering opportunities
- Create a community priority manually or from a selected opportunity
- Generate professional priority statements using locally hosted AI
- Save and manage community priorities
- Generate reflections against saved priorities
- Track whether reflections have been completed

## AI

The prototype uses Microsoft Foundry Local with Phi-4 Mini.

The model runs locally on the device, allowing priority and reflection generation without requiring an external AI API key.

## User Journey

Discover → Create Priority → Save → Participate → Reflect

## Technology

- HTML
- CSS
- JavaScript
- Python
- Flask
- Microsoft Foundry Local
- Phi-4 Mini

## Run Locally

### 1. Create a Python virtual environment

```bash
python -m venv venv
```

### 2. Activate it on Windows

```bash
venv\Scripts\activate.bat
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the application

```bash
python app.py
```

Once ready, the terminal will display:

```text
Community Priority Assistant is ready.
Open http://127.0.0.1:5000
```

### 5. Open the application

Open the following address in your browser:

http://127.0.0.1:5000

On first use, Microsoft Foundry Local may need to download the Phi-4 Mini model.
