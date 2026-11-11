from flask import Flask, jsonify, request, send_from_directory
from foundry_local_sdk import Configuration, FoundryLocalManager

APP_NAME = "CommunityPriorityAssistant"
MODEL_ALIAS = "phi-4-mini"

app = Flask(__name__, static_folder=None)

print("Starting Foundry Local...")
config = Configuration(app_name=APP_NAME)
FoundryLocalManager.initialize(config)
manager = FoundryLocalManager.instance
model = manager.catalog.get_model(MODEL_ALIAS)
print("Model found:", model.alias)

if not model.is_cached:
    print("Downloading model...")
    model.download()
    print("Model download complete.")
else:
    print("Model is already downloaded.")

print("Loading model...")
model.load()
print("Model loaded successfully.")
client = model.get_chat_client()
client.settings.temperature = 0.1


def clean_model_text(value):
    return (value or "").replace("**Final Priority:**", "").replace("Final Priority:", "").replace("**", "").strip()


def text_field(data, name):
    return str(data.get(name, "")).strip()


@app.get("/")
def home():
    return send_from_directory(".", "index.html")


@app.post("/api/generate-priority")
def generate_priority():
    try:
        data = request.get_json(silent=True) or {}
        area = text_field(data, "area")
        activity = text_field(data, "activity")
        impact = text_field(data, "impact")
        measure = text_field(data, "measure")
        if not area or not activity or not impact:
            return jsonify(error="Community area, contribution and intended impact are required."), 400

        prompt = f"""Create one concise professional community goal using only the facts below.

Community area: {area}
Contribution: {activity}
Intended impact: {impact}
Progress measure: {measure or 'Not provided'}

Requirements:
- Write in first person and future tense.
- Begin with 'I will'.
- Write one paragraph, maximum 65 words.
- Preserve the supplied activities, skills, impact and measures.
- Correct grammar and improve flow.
- Do not invent benefits, activities, roles, organisations, outcomes, skills, numbers, evidence, mentoring, guidance or training.
- Return only the final priority."""

        client.settings.max_tokens = 120
        response = client.complete_chat([
            {"role": "system", "content": "You are a strict professional writing editor. Never add facts."},
            {"role": "user", "content": prompt},
        ])
        priority = clean_model_text(response.choices[0].message.content)
        if not priority:
            return jsonify(error="The model returned an empty response."), 500
        return jsonify(priority=priority)
    except Exception as error:
        print("Priority generation error:", error)
        return jsonify(error="The priority could not be generated. Please try again."), 500


@app.post("/api/generate-reflection")
def generate_reflection():
    try:
        data = request.get_json(silent=True) or {}
        priority = text_field(data, "priority")
        activity = text_field(data, "activity")
        impact = text_field(data, "impact")
        learning = text_field(data, "learning")
        if not all([priority, activity, impact, learning]):
            return jsonify(error="Please complete all reflection questions."), 400

        prompt = f"""Write one concise professional reflection using only the information below.

Original priority: {priority}
What I did: {activity}
Impact and outcomes: {impact}
Learning and improvement: {learning}

Requirements:
- Write in first person as one continuous paragraph without headings or bullets.
- Use past tense for completed activities.
- Connect the reflection to the original priority.
- Cover what I did, the observed impact, what I learned and what I will build on.
- Write approximately 100 to 140 words.
- Do not invent or exaggerate activities, numbers, outcomes, feedback, skills or achievements.
- Return only the final paragraph."""

        client.settings.max_tokens = 400
        response = client.complete_chat([
            {"role": "system", "content": "You are a professional reflection editor. Use only supplied facts."},
            {"role": "user", "content": prompt},
        ])
        reflection = clean_model_text(response.choices[0].message.content)
        if not reflection:
            return jsonify(error="The model returned an empty reflection."), 500
        return jsonify(reflection=reflection)
    except Exception as error:
        print("Reflection generation error:", error)
        return jsonify(error="The reflection could not be generated. Please try again."), 500


@app.get("/<path:filename>")
def serve_file(filename):
    return send_from_directory(".", filename)


if __name__ == "__main__":
    print("\nCommunity Priority Assistant is ready.")
    print("Open http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
