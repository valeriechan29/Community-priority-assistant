const opportunities = [
    { id: 1, name: "Help Bristol's Homeless", cause: "homelessness", format: "in-person", time: "half-day", date: "Date to be confirmed", location: "Bristol", description: "Support practical activities such as gardening, painting, cleaning and maintaining accommodation.", source: "Bristol Office" },
    { id: 2, name: "Bristol Avon Rivers Trust", cause: "environment", format: "in-person", time: "half-day", date: "Date to be confirmed", location: "Bristol & South West", description: "Support local river and environmental projects through practical outdoor volunteering.", source: "South-West Community" },
    { id: 3, name: "Care4Calais", cause: "community", format: "in-person", time: "flexible", date: "Date to be confirmed", location: "Bristol", description: "Support refugee communities through practical volunteering and community-based activities.", source: "South-West Community" },
    { id: 4, name: "University Outreach", cause: "education", format: "in-person", time: "short", date: "Date to be confirmed", location: "Bristol", description: "Support students through mentoring, employability activities, careers events and practical skills sessions.", source: "Bristol Office" },
    { id: 5, name: "CleanUpUK Bristol", cause: "environment", format: "in-person", time: "short", date: "Date to be confirmed", location: "Bristol", description: "Join a local community clean-up and help improve public spaces through practical litter-picking.", source: "MakingADifference" },
    { id: 6, name: "Baby Bank Network", cause: "community", format: "in-person", time: "half-day", date: "Date to be confirmed", location: "Bristol", description: "Support local families experiencing poverty or crisis through practical volunteering activities.", source: "South-West Community" }
];

const filters = { cause: "all", format: "all", time: "all" };
let selectedOpportunity = null;
let priorityPreviousPage = "home";

const pageIds = ["homePage", "opportunityPage", "priorityPage", "reflectionPage", "myPrioritiesPage"];
const byId = id => document.getElementById(id);
const readJson = (key, fallback = []) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHtml = text => { const div = document.createElement("div"); div.textContent = text || ""; return div.innerHTML; };

function showPage(id) {
    pageIds.forEach(pageId => byId(pageId)?.classList.toggle("hidden", pageId !== id));
    window.scrollTo(0, 0);
}

function showHomePage() { showPage("homePage"); }
function showOpportunityPage() { showPage("opportunityPage"); clearFilters(); }
function showMyPrioritiesPage() { showPage("myPrioritiesPage"); renderMyPriorities(); }

function showPriorityPage() {
    priorityPreviousPage = "home";
    selectedOpportunity = null;
    showPage("priorityPage");
    clearPriorityForm();
    byId("selectedOpportunityCard").classList.add("hidden");
}

function goBackFromPriority() { showPage(priorityPreviousPage === "opportunities" ? "opportunityPage" : "homePage"); }

function showReflectionPage() {
    showPage("reflectionPage");
    clearReflectionForm();
    loadSavedPriorities();
}

function selectFilter(button) {
    filters[button.dataset.filter] = button.dataset.value;
    document.querySelectorAll(`[data-filter="${button.dataset.filter}"]`).forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    applyFilters();
}

function applyFilters() {
    const search = byId("searchInput").value.trim().toLowerCase();
    const location = byId("locationInput").value.trim().toLowerCase();
    const results = opportunities.filter(item => {
        const text = `${item.name} ${item.description} ${item.source} ${item.cause}`.toLowerCase();
        return (!search || text.includes(search)) &&
            (!location || item.location.toLowerCase().includes(location) || location.includes(item.location.toLowerCase())) &&
            (filters.cause === "all" || item.cause === filters.cause) &&
            (filters.format === "all" || item.format === filters.format) &&
            (filters.time === "all" || item.time === filters.time);
    });
    renderOpportunities(results);
}

function clearFilters() {
    Object.assign(filters, { cause: "all", format: "all", time: "all" });
    if (byId("searchInput")) byId("searchInput").value = "";
    document.querySelectorAll(".filter-chip").forEach(button => button.classList.toggle("active", button.dataset.value === "all"));
    renderOpportunities(opportunities);
}

function getCauseName(value) { return ({ environment: "Environment", education: "Education & Skills", community: "Community Support", homelessness: "Homelessness" })[value] || value; }
function getTimeName(value) { return ({ short: "1–2 hours", "half-day": "Half day", "full-day": "Full day", flexible: "Flexible" })[value] || value; }
function getFormatName(value) { return value === "virtual" ? "Virtual" : "In person"; }
function getFormatIcon(value) { return value === "virtual" ? "💻" : "🏢"; }

function renderOpportunities(items) {
    const grid = byId("opportunitiesGrid");
    if (!grid) return;
    byId("resultCount").textContent = `${items.length} ${items.length === 1 ? "opportunity" : "opportunities"} found`;
    byId("noResults").classList.toggle("hidden", items.length > 0);
    grid.innerHTML = items.map(item => `
        <article class="volunteer-card">
            <div class="card-accent"></div>
            <div class="volunteer-card-content">
                <div class="card-top"><span class="cause-tag">${escapeHtml(getCauseName(item.cause))}</span><span class="source-tag">${escapeHtml(item.source)}</span></div>
                <h3>${escapeHtml(item.name)}</h3>
                <p class="card-description">${escapeHtml(item.description)}</p>
                <div class="card-meta">
                    <div class="meta-item">📅 <span>${escapeHtml(item.date)}</span></div>
                    <div class="meta-item">${getFormatIcon(item.format)} <span>${getFormatName(item.format)}</span></div>
                    <div class="meta-item">⏱ <span>${getTimeName(item.time)}</span></div>
                    <div class="meta-item">📍 <span>${escapeHtml(item.location)}</span></div>
                </div>
                <div class="card-actions"><button class="secondary-button" onclick="viewOpportunity(${item.id})">View Details</button><button class="primary-button" onclick="useOpportunity(${item.id})">Use for My Priority</button></div>
            </div>
        </article>`).join("");
}

function viewOpportunity(id) {
    const item = opportunities.find(x => x.id === id);
    if (!item) return;
    alert(`${item.name}\n\n${item.description}\n\nDate: ${item.date}\nFormat: ${getFormatName(item.format)}\nLocation: ${item.location}\nCommitment: ${getTimeName(item.time)}\nSource: ${item.source}`);
}

function useOpportunity(id) {
    selectedOpportunity = opportunities.find(item => item.id === id);
    if (!selectedOpportunity) return;
    priorityPreviousPage = "opportunities";
    showPage("priorityPage");
    byId("selectedOpportunityCard").classList.remove("hidden");
    byId("selectedOpportunityName").textContent = selectedOpportunity.name;
    byId("selectedOpportunityDescription").textContent = selectedOpportunity.description;
    byId("selectedOpportunityLocation").textContent = `📍 ${selectedOpportunity.location}`;
    byId("selectedOpportunityFormat").textContent = `${getFormatIcon(selectedOpportunity.format)} ${getFormatName(selectedOpportunity.format)}`;
    byId("selectedOpportunityTime").textContent = `⏱ ${getTimeName(selectedOpportunity.time)}`;
    byId("priorityArea").value = getCauseName(selectedOpportunity.cause);
    byId("priorityActivity").value = selectedOpportunity.description;
    byId("priorityImpact").value = "";
    byId("priorityMeasure").value = "";
    byId("generatedPrioritySection").classList.add("hidden");
}

function clearPriorityForm() {
    ["priorityArea", "priorityActivity", "priorityImpact", "priorityMeasure", "generatedPriority"].forEach(id => byId(id).value = "");
    byId("generatedPrioritySection").classList.add("hidden");
    byId("priorityLoadingMessage")?.classList.add("hidden");
}

async function generatePriority() {
    const area = byId("priorityArea").value.trim();
    const activity = byId("priorityActivity").value.trim();
    const impact = byId("priorityImpact").value.trim();
    const measure = byId("priorityMeasure").value.trim();
    if (!area || !activity || !impact) return alert("Please complete the community area, contribution and intended impact.");

    const button = byId("generatePriorityButton");
    const loading = byId("priorityLoadingMessage");
    const original = button.textContent;
    button.textContent = "✨ Creating your priority...";
    button.disabled = true;
    loading?.classList.remove("hidden");

    try {
        const response = await fetch("/api/generate-priority", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ area, activity, impact, measure }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Generation failed.");
        byId("generatedPriority").value = data.priority;
        byId("generatedPrioritySection").classList.remove("hidden");
        byId("generatedPrioritySection").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error(error);
        alert("We couldn't generate your priority. Please try again.");
    } finally {
        button.textContent = original;
        button.disabled = false;
        loading?.classList.add("hidden");
    }
}

function savePriority(goToReflection = false) {
    const text = byId("generatedPriority").value.trim();
    if (!text) return alert("Please create a priority before saving.");
    const priorities = readJson("savedPriorities");
    const record = { id: Date.now(), priority: text, communityArea: byId("priorityArea").value.trim(), activity: byId("priorityActivity").value.trim(), impact: byId("priorityImpact").value.trim(), measure: byId("priorityMeasure").value.trim(), opportunity: selectedOpportunity?.name || null, createdDate: new Date().toLocaleDateString() };
    priorities.push(record);
    writeJson("savedPriorities", priorities);
    if (!goToReflection) return alert("Priority saved successfully.");
    showReflectionPage();
    byId("reflectionPriority").value = String(record.id);
    showSelectedPriority();
}

function loadSavedPriorities() {
    const select = byId("reflectionPriority");
    select.innerHTML = '<option value="">Select a saved priority</option>';
    readJson("savedPriorities").forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.opportunity ? `${item.opportunity} - ` : ""}${item.communityArea || "Community priority"}${item.createdDate ? ` (${item.createdDate})` : ""}`;
        select.appendChild(option);
    });
}

function showSelectedPriority() {
    const preview = byId("selectedReflectionPriority");
    const priority = readJson("savedPriorities").find(item => String(item.id) === String(byId("reflectionPriority").value));
    preview.innerHTML = priority ? `<strong>Selected priority</strong><p>${escapeHtml(priority.priority)}</p>` : "";
    preview.classList.toggle("hidden", !priority);
}

function clearReflectionForm() {
    ["reflectionPriority", "reflectionActivity", "reflectionImpact", "reflectionLearning", "generatedReflection"].forEach(id => byId(id).value = "");
    byId("selectedReflectionPriority").classList.add("hidden");
    byId("generatedReflectionSection").classList.add("hidden");
}

async function generateReflection() {
    const priority = readJson("savedPriorities").find(item => String(item.id) === String(byId("reflectionPriority").value));
    const activity = byId("reflectionActivity").value.trim();
    const impact = byId("reflectionImpact").value.trim();
    const learning = byId("reflectionLearning").value.trim();
    if (!priority || !activity || !impact || !learning) return alert("Please select a priority and complete all three reflection questions.");

    const button = byId("generateReflectionButton");
    const original = button.textContent;
    button.textContent = "✨ Creating your reflection...";
    button.disabled = true;
    try {
        const response = await fetch("/api/generate-reflection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priority: priority.priority, activity, impact, learning }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Generation failed.");
        byId("generatedReflection").value = data.reflection;
        byId("generatedReflectionSection").classList.remove("hidden");
        byId("generatedReflectionSection").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error(error);
        alert("We couldn't generate your reflection. Please try again.");
    } finally {
        button.textContent = original;
        button.disabled = false;
    }
}

function saveReflection() {
    const text = byId("generatedReflection").value.trim();
    const priorityId = byId("reflectionPriority").value;
    if (!text || !priorityId) return alert("Please generate a reflection before saving.");
    const reflections = readJson("savedReflections").filter(item => String(item.priorityId) !== String(priorityId));
    reflections.push({ id: Date.now(), priorityId, reflection: text, activity: byId("reflectionActivity").value.trim(), impact: byId("reflectionImpact").value.trim(), learning: byId("reflectionLearning").value.trim(), createdDate: new Date().toLocaleDateString() });
    writeJson("savedReflections", reflections);
    alert("Your reflection has been saved.");
}

function renderMyPriorities() {
    const container = byId("myPrioritiesContainer");
    const empty = byId("noPrioritiesMessage");
    const priorities = readJson("savedPriorities").slice().reverse();
    const reflections = readJson("savedReflections");
    container.innerHTML = "";
    empty.classList.toggle("hidden", priorities.length > 0);
    priorities.forEach(priority => {
        const reflection = reflections.find(item => String(item.priorityId) === String(priority.id));
        const card = document.createElement("article");
        card.className = "saved-priority-card";
        card.innerHTML = `<div class="saved-priority-top"><span class="saved-priority-label">${escapeHtml(priority.communityArea || "Community")}</span><span class="status ${reflection ? "completed" : "pending"}">${reflection ? "✓ Reflection completed" : "Reflection not completed"}</span></div><h3>${escapeHtml(priority.opportunity || priority.communityArea || "Community Priority")}</h3><p class="saved-priority-text">${escapeHtml(priority.priority)}</p><div class="saved-priority-meta">Created ${escapeHtml(priority.createdDate || "")}</div><div class="saved-priority-actions"><button class="secondary-button" onclick="viewSavedPriority(${priority.id})">View Priority</button>${reflection ? `<button class="secondary-button" onclick="viewSavedReflection(${reflection.id})">View Reflection</button>` : `<button class="primary-button" onclick="writeReflectionForPriority(${priority.id})">Write Reflection →</button>`}</div>`;
        container.appendChild(card);
    });
}

function writeReflectionForPriority(id) { showReflectionPage(); byId("reflectionPriority").value = String(id); showSelectedPriority(); }
function viewSavedPriority(id) { const item = readJson("savedPriorities").find(x => String(x.id) === String(id)); if (item) alert(item.priority); }
function viewSavedReflection(id) { const item = readJson("savedReflections").find(x => String(x.id) === String(id)); if (item) alert(item.reflection); }

document.addEventListener("DOMContentLoaded", () => renderOpportunities(opportunities));
