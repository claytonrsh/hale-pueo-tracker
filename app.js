// --- Configuration ---
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXl17fkaqYmdxU7pJ00Z4WWkglWndAJFhyKDz-axqR2u4zeUQOfgFR94eqp5ZipCwGZ3Ycm1eBu7Tl/pub?gid=0&single=true&output=csv';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbajuvOx0cmRpo5KZKxS1Vck644YIlOZCDSizVJ5iTy77qrAVhuVkpoE-GoihKQ-78/exec';

// --- Global Variables ---
let farmData = {};
let assetActivities = {};
let allActivitiesList = [];
let taskListData = [];
let selectedAssetIdForModal = null;
let currentOpenTaskId = null;
let newActivitySelectedFile = null;
let newTaskActivitySelectedFile = null;
let dashboardMap = null;
let markersClusterGroup = null;
let taskLocationPickerMap = null;
let temporaryTaskMarker = null;
let assetTypeVisibility = {};
let recentActivityCurrentPage = 1;
const activitiesPerPage = 10;

// --- DOM Elements (will be cached) ---
let messageBox, successMessageText, loadingBox, errorBox, errorMessageText,
    activityMessageBox, activityMessageText, taskMessageBox, taskMessageText,
    farmMapViewport,
    modalAssetName, modalStaticAssetId,
    modalStaticAssetName, modalStaticAssetType, modalStaticAssetDescription,
    modalStaticAssetLastActivityDate, modalStaticAssetImageContainer,
    modalStaticAssetLatestNotes, modalLatestActivityDisplay,
    modalNewActivityDateTimeInput, modalNewActivityNoteInput,
    modalNewActivityImageFileInput, modalNewActivityImagePreview, saveModalActivityButton,
    recentActivityContainer, recentActivityPageInfo, prevRecentActivityPage, nextRecentActivityPage,
    taskListContainer, newTaskNameInput, newTaskDescriptionInput, newTaskDueDateInput,
    newTaskAssetIdSelect, newTaskMapZoneInput, newTaskPriorityInput,
    showCompletedTasksToggle, saveTaskButton, imageZoomModal, zoomedImage,
    assetInfoModal, taskLocationModal, taskLocationPickerMapElement,
    newTaskLatInput, newTaskLonInput, taskLocationCoordsDisplay,
    assetTypeFilterButtonsContainer,
    taskActivityModal, taskModalTaskName, taskModalTaskId, taskModalDescription, taskModalDueDate,
    taskModalPriority, taskModalRelatedAsset, taskModalLocation, taskModalStatus,
    taskModalCreatedDate, taskModalCompletedDateContainer, taskModalCompletedDate,
    taskSpecificActivityLogDisplay, taskModalNewActivityDateTimeInput,
    taskModalNewActivityNoteInput, taskModalNewActivityImageFileInput,
    taskModalNewActivityImagePreview, saveTaskSpecificActivityButton,
    taskModalCompleteToggle, newTaskAssignedTo, taskAssigneeFilter;


// --- FUNCTION DEFINITIONS ---

/**
 * Caches all necessary DOM elements into global variables for faster access.
 */
function cacheDOMElements() {
    console.log("Attempting to cache DOM elements...");
    messageBox = document.getElementById('messageBox');
    successMessageText = document.getElementById('successMessageText');
    loadingBox = document.getElementById('loadingBox');
    errorBox = document.getElementById('errorBox');
    errorMessageText = document.getElementById('errorMessageText');
    activityMessageBox = document.getElementById('activityMessageBox');
    activityMessageText = document.getElementById('activityMessageText');
    taskMessageBox = document.getElementById('taskMessageBox');
    taskMessageText = taskMessageBox ? taskMessageBox.querySelector('span') : null;

    farmMapViewport = document.getElementById('farmMapViewport');

    modalAssetName = document.getElementById('modalAssetName');
    modalStaticAssetId = document.getElementById('modalStaticAssetId');
    modalStaticAssetName = document.getElementById('modalStaticAssetName');
    modalStaticAssetType = document.getElementById('modalStaticAssetType');
    modalStaticAssetDescription = document.getElementById('modalStaticAssetDescription');
    modalStaticAssetLastActivityDate = document.getElementById('modalStaticAssetLastActivityDate');
    modalStaticAssetImageContainer = document.getElementById('modalStaticAssetImageContainer');
    modalStaticAssetLatestNotes = document.getElementById('modalStaticAssetLatestNotes');
    modalLatestActivityDisplay = document.getElementById('modalLatestActivityDisplay');
    modalNewActivityDateTimeInput = document.getElementById('modalNewActivityDateTime');
    modalNewActivityNoteInput = document.getElementById('modalNewActivityNote');
    modalNewActivityImageFileInput = document.getElementById('modalNewActivityImageFile');
    modalNewActivityImagePreview = document.getElementById('modalNewActivityImagePreview');
    saveModalActivityButton = document.getElementById('saveModalActivityButton');

    recentActivityContainer = document.getElementById('recentActivityContainer');
    recentActivityPageInfo = document.getElementById('recentActivityPageInfo');
    prevRecentActivityPage = document.getElementById('prevRecentActivityPage');
    nextRecentActivityPage = document.getElementById('nextRecentActivityPage');

    taskListContainer = document.getElementById('taskListContainer');
    newTaskNameInput = document.getElementById('newTaskName');
    newTaskDescriptionInput = document.getElementById('newTaskDescription');
    newTaskDueDateInput = document.getElementById('newTaskDueDate');
    newTaskAssetIdSelect = document.getElementById('newTaskAssetId');
    newTaskMapZoneInput = document.getElementById('newTaskMapZone');
    newTaskPriorityInput = document.getElementById('newTaskPriority');
    newTaskAssignedTo = document.getElementById('newTaskAssignedTo');
    showCompletedTasksToggle = document.getElementById('showCompletedTasksToggle');
    taskAssigneeFilter = document.getElementById('taskAssigneeFilter');
    saveTaskButton = document.getElementById('saveTaskButton');

    imageZoomModal = document.getElementById('imageZoomModal');
    zoomedImage = document.getElementById('zoomedImage');
    assetInfoModal = document.getElementById('assetInfoModal');
    taskLocationModal = document.getElementById('taskLocationModal');
    taskLocationPickerMapElement = document.getElementById('taskLocationPickerMap');
    newTaskLatInput = document.getElementById('newTaskLat');
    newTaskLonInput = document.getElementById('newTaskLon');
    taskLocationCoordsDisplay = document.getElementById('taskLocationCoordsDisplay');

    assetTypeFilterButtonsContainer = document.getElementById('assetTypeFilterButtonsContainer');

    taskActivityModal = document.getElementById('taskActivityModal');
    taskModalTaskName = document.getElementById('taskModalTaskName');
    taskModalTaskId = document.getElementById('taskModalTaskId');
    taskModalDescription = document.getElementById('taskModalDescription');
    taskModalDueDate = document.getElementById('taskModalDueDate');
    taskModalPriority = document.getElementById('taskModalPriority');
    taskModalRelatedAsset = document.getElementById('taskModalRelatedAsset');
    taskModalLocation = document.getElementById('taskModalLocation');
    taskModalStatus = document.getElementById('taskModalStatus');
    taskModalCreatedDate = document.getElementById('taskModalCreatedDate');
    taskModalCompletedDateContainer = document.getElementById('taskModalCompletedDateContainer');
    taskModalCompletedDate = document.getElementById('taskModalCompletedDate');
    taskSpecificActivityLogDisplay = document.getElementById('taskSpecificActivityLogDisplay');
    taskModalNewActivityDateTimeInput = document.getElementById('taskModalNewActivityDateTime');
    taskModalNewActivityNoteInput = document.getElementById('taskModalNewActivityNote');
    taskModalNewActivityImageFileInput = document.getElementById('taskModalNewActivityImageFile');
    taskModalNewActivityImagePreview = document.getElementById('taskModalNewActivityImagePreview');
    saveTaskSpecificActivityButton = document.getElementById('saveTaskSpecificActivityButton');
    taskModalCompleteToggle = document.getElementById('taskModalCompleteToggle');
    console.log("DOM element caching complete.");
}

/**
 * Formats an ISO string to a datetime-local input format.
 */
function formatDateTimeForInput(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.warn("Error formatting date for input:", isoString, e);
        return '';
    }
}

/**
 * Formats a date string for display in a more readable format.
 */
function formatDisplayDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch (e) {
        return dateString;
    }
}

/**
 * Shows or hides a loading indicator.
 */
function showLoading(isLoading, message = "Loading Data...") {
    if (!loadingBox) { console.error("loadingBox not found for showLoading"); return; }
    const loaderDiv = loadingBox.querySelector('.flex');
    if (loaderDiv) {
         loaderDiv.innerHTML = `<div class="loader"></div><strong class="font-bold">${message.split('...')[0]}...</strong><span class="block sm:inline">${message.split('...')[1] || ''}</span>`;
    } else {
        loadingBox.innerHTML = `<div class="flex items-center justify-center"><div class="loader"></div><strong class="font-bold">${message.split('...')[0]}...</strong><span class="block sm:inline">${message.split('...')[1] || ''}</span></div>`;
    }
    loadingBox.classList.toggle('hidden', !isLoading);
}

/**
 * Shows a user message (success, error, or info).
 */
function showUserMessage(element, textElement, message, isSuccess = true, duration = 5000) {
    if (!element || !textElement) {
        console.error("showUserMessage: Target element or textElement is null", element, textElement);
        return;
    }
    element.classList.remove('hidden', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-blue-100', 'border-blue-400', 'text-blue-700');
    if (isSuccess === true) {
         element.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
         if (element.querySelector('strong')) element.querySelector('strong').textContent = 'Success!';
    } else if (isSuccess === false) {
        element.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
        if (element.querySelector('strong')) element.querySelector('strong').textContent = 'Error!';
    } else {
         element.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
    }
    textElement.textContent = message;
    setTimeout(() => { element.classList.add('hidden'); }, duration);
}

/**
 * Gets a user-friendly error message from an error object.
 */
function getErrorMessage(error) {
    let errorDetail = "An unknown error occurred. Check console.";
    if (error) {
        if (error.message && error.message.trim() !== '' && error.message !== "[object Object]") {
            errorDetail = error.message;
        } else if (typeof error.toString === 'function') {
            const errStr = error.toString();
            if (errStr.trim() !== '' && errStr !== "[object Object]") {
                errorDetail = errStr;
            } else {
                errorDetail = "Error object found, see console for more details.";
            }
        } else if (typeof error === 'string' && error.trim() !== '') {
            errorDetail = error;
        }
    }
    return errorDetail;
}

/**
 * Handles tab switching logic.
 */
function openTab(event, tabName) {
    let i, tabcontent, tabbuttons;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
    }
    const currentTab = document.getElementById(tabName);
    if (currentTab) {
        currentTab.style.display = "block";
        currentTab.classList.add("active");
    }
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    if (tabName === 'dashboardTab' && dashboardMap) {
         setTimeout(() => dashboardMap.invalidateSize(), 0);
    }
    if (tabName === 'tasksTab' && taskLocationPickerMap && taskLocationModal.classList.contains('active')) {
        setTimeout(() => taskLocationPickerMap.invalidateSize(), 0);
    }
}

/**
 * Converts CSV text to a JSON object keyed by assetId.
 */
function csvToJSON(csvText) {
    const trimmedCsvText = csvText.trim();
    if (!trimmedCsvText) { return {}; }
    const lines = trimmedCsvText.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) { return {}; }
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    const jsonData = {};
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let currentVal = '';
        let inQuotes = false;
        for (const char of lines[i]) {
            if (char === '"' && (lines[i][lines[i].indexOf(char) -1] !== '\\') ) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentVal.trim().replace(/^"|"$/g, ''));
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim().replace(/^"|"$/g, ''));
        while (values.length < headers.length) { values.push('');}
        const entry = {};
        let assetId = '';
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j] || '';
            if (header === 'assetId') assetId = value;
            entry[header] = value;
        }
        if (assetId) { jsonData[assetId] = entry; }
    }
    return jsonData;
}

/**
 * Main initialization function to fetch and populate all data.
 */
async function loadInitialData() {
    console.log("loadInitialData started");
    showLoading(true, "Loading initial asset data...");
    try {
        if (GOOGLE_SHEET_CSV_URL === 'YOUR_GOOGLE_SHEET_PUBLISHED_CSV_URL_HERE' || !GOOGLE_SHEET_CSV_URL) {
            throw new Error("CRITICAL: Google Sheet URL for asset list is not configured.");
        }
        const farmResponse = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!farmResponse.ok) {
            throw new Error(`HTTP error fetching asset list! Status: ${farmResponse.status}.`);
        }
        const farmCsvText = await farmResponse.text();
        farmData = csvToJSON(farmCsvText);
        if (Object.keys(farmData).length === 0 && farmCsvText.trim() !== '') {
           throw new Error("No asset data parsed. Check Asset Sheet CSV format/headers (assetId, name, type, description, lat, lon, etc).");
        } else if (Object.keys(farmData).length === 0 && farmCsvText.trim() === '') {
            throw new Error("Asset Sheet CSV data empty.");
        }
        console.log("Farm data loaded:", Object.keys(farmData).length, "assets");
        showUserMessage(messageBox, successMessageText, "Asset list loaded.", true, 3000);

        populateAssetTypeFilterButtons();
        initializeDashboardMap();
        populateTaskAssetIdDropdown();

        await loadTasksFromSheet();
        await loadActivitiesFromSheet();

        populateRecentActivityLog();
        populateLeafletMapMarkers();
        populateTaskAssigneeFilter();

        console.log("loadInitialData finished successfully");

    } catch (error) {
        console.error("Load initial data error:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to load initial data: ${getErrorMessage(error)}`, false);
    } finally {
        showLoading(false);
    }
}

/**
 * Fetches and processes activity data from the backend.
 */
async function loadActivitiesFromSheet() {
    console.log("loadActivitiesFromSheet started");
     if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' || !GOOGLE_APPS_SCRIPT_URL) {
        return;
    }
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getActivities`);
        if (!response.ok) {
            throw new Error(`HTTP error fetching activities! Status: ${response.status}.`);
        }
        const data = await response.json();

        if (data.status === "success" && data.activities) {
            allActivitiesList = data.activities;
            assetActivities = {};

            allActivitiesList.forEach(activity => {
                if (activity.assetId) {
                    if (!assetActivities[activity.assetId]) {
                        assetActivities[activity.assetId] = [];
                    }
                    if (!assetActivities[activity.assetId].find(a => a.activityId === activity.activityId)) {
                        assetActivities[activity.assetId].push(activity);
                    }
                }
            });

            for (const assetIdKey in assetActivities) {
                assetActivities[assetIdKey].sort((a, b) => new Date(a.userActivityTimestamp || a.timestamp) - new Date(b.userActivityTimestamp || b.timestamp));
            }
            console.log("Activities loaded and processed. Count:", allActivitiesList.length);
            showUserMessage(messageBox, successMessageText, "Activities loaded.", true, 3000);
        } else {
            throw new Error(data.message || "Failed to parse activities.");
        }
    } catch (error) {
        console.error("Load activities error:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to load activities: ${getErrorMessage(error)}`, false);
    }
}

/**
 * Fetches and processes task data from the backend.
 */
async function loadTasksFromSheet() {
    console.log("loadTasksFromSheet started");
     if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' || !GOOGLE_APPS_SCRIPT_URL) {
        if(taskListContainer) taskListContainer.innerHTML = `<p class="text-gray-500">Task loading not configured.</p>`;
        return;
    }
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getTasks`);
        if (!response.ok) {
            throw new Error(`HTTP error fetching tasks! Status: ${response.status}.`);
        }
        const data = await response.json();
        if (data.status === "success" && data.tasks) {
            taskListData = data.tasks;
            console.log("Tasks loaded and processed. Count:", taskListData.length);
            showUserMessage(messageBox, successMessageText, "Tasks loaded successfully.", true, 3000);
            populateTasksDisplay();
        } else {
            throw new Error(data.message || "Failed to parse tasks.");
        }
    } catch (error) {
        console.error("Load tasks error:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to load tasks: ${getErrorMessage(error)}`, false);
        if(taskListContainer) taskListContainer.innerHTML = `<p class="text-red-500">Error loading tasks.</p>`;
    }
}

/**
 * Initializes the Leaflet map.
 */
function initializeDashboardMap() {
    if (dashboardMap) {
        try { dashboardMap.invalidateSize(); } catch(e) { console.warn("Could not invalidate map size on re-init attempt", e); }
        return;
    }

    const mapElement = document.getElementById('farmMapViewport');
    if (!mapElement) {
        console.error("Critical: farmMapViewport element not found for Leaflet initialization!");
        showUserMessage(errorBox, errorMessageText, "Map container not found. Dashboard cannot load.", false);
        return;
    }

    const defaultLat = 20.74065901504538;
    const defaultLon = -155.9872504358726;

    try {
        dashboardMap = L.map('farmMapViewport', {
            maxZoom: 24
        }).setView([defaultLat, defaultLon], 19);

        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: 'Map data © <a href="https://www.google.com/permissions/geoguidelines.html">Google</a>',
            maxZoom: 22,
            subdomains:['mt0','mt1','mt2','mt3']
        }).addTo(dashboardMap);

        markersClusterGroup = L.markerClusterGroup();
        dashboardMap.addLayer(markersClusterGroup);

    } catch (mapError) {
        console.error("Error initializing Leaflet map:", mapError);
        showUserMessage(errorBox, errorMessageText, `Error initializing map: ${getErrorMessage(mapError)}`, false);
    }
}

/**
 * Populates the map with markers based on current data and filters.
 */
function populateLeafletMapMarkers() {
    console.log("Populating map markers. Current visibility state:", JSON.stringify(assetTypeVisibility));
    if (!dashboardMap || !markersClusterGroup) {
        console.warn("populateLeafletMapMarkers called but dashboardMap or markersClusterGroup is not initialized.");
        return;
    }

    markersClusterGroup.clearLayers();

    let markersAddedCount = 0;

    // Populate Asset Markers
    if (Object.keys(farmData).length > 0) {
        Object.keys(farmData).forEach(assetId => {
            const asset = farmData[assetId];
            const lat = parseFloat(asset.lat);
            const lon = parseFloat(asset.lon);
            const assetTypeForFilter = asset.type || 'Other';

            if (assetTypeVisibility[assetTypeForFilter] === true) {
                if (!isNaN(lat) && !isNaN(lon)) {
                    let markerLabel = (asset.type ? asset.type.substring(0,1) : assetId.substring(0,1)).toUpperCase();
                    let markerClassName = 'leaflet-div-icon other-marker';
                    if (asset.type) {
                        const assetTypeLower = asset.type.toLowerCase();
                        if (assetTypeLower.includes('tree')) { markerClassName = 'leaflet-div-icon tree-marker'; }
                        else if (assetTypeLower.includes('plant') || assetTypeLower.includes('vegetable')) { markerClassName = 'leaflet-div-icon plant-marker'; }
                        else if (assetTypeLower.includes('poultry')) { markerClassName = 'leaflet-div-icon poultry-marker'; }
                        else if (assetTypeLower.includes('structure')) { markerClassName = 'leaflet-div-icon structure-marker';}
                    }

                    const divIcon = L.divIcon({
                        className: markerClassName,
                        html: `<span>${markerLabel}</span>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    });

                    const marker = L.marker([lat, lon], { icon: divIcon });

                    let popupContent = `<b>${asset.name || assetId}</b><br>${asset.type || 'N/A'}`;
                    let imageUrlToDisplay = asset.imageUrl || '';
                    let notesToDisplay = asset.description || 'No description.';

                    if (assetActivities[assetId] && assetActivities[assetId].length > 0) {
                        const latestActivity = assetActivities[assetId][assetActivities[assetId].length - 1];
                        if (latestActivity.activityImageUrl) {
                            imageUrlToDisplay = latestActivity.activityImageUrl;
                        }
                        if (latestActivity.noteText) {
                            notesToDisplay = latestActivity.noteText;
                        }
                    }

                    if (imageUrlToDisplay) {
                        popupContent += `<br><img src="${imageUrlToDisplay}" alt="Latest image for ${asset.name || assetId}" class="popup-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><p class="text-red-500 text-xs hidden">Image load failed.</p>`;
                    }
                    popupContent += `<div class="popup-notes">${notesToDisplay.length > 100 ? notesToDisplay.substring(0, 100) + '...' : notesToDisplay}</div>`;
                    popupContent += `<button class="text-blue-500 hover:underline text-xs p-1 mt-1 w-full text-center" onclick="openAssetModal('${assetId}')">View Full Details & Log</button>`;

                    marker.bindPopup(popupContent, {maxWidth: 250});
                    markersClusterGroup.addLayer(marker);
                    markersAddedCount++;
                }
            }
        });
    }

    // Populate Task Markers
    if (assetTypeVisibility['Tasks'] === true && taskListData && taskListData.length > 0) {
        console.log("Attempting to populate task markers. Task visibility is true. Task count:", taskListData.length);
        taskListData.forEach(task => {
            if (task.status === "Completed") return;

            let taskLat, taskLon;
            if (task.taskLat && task.taskLon && !isNaN(parseFloat(task.taskLat)) && !isNaN(parseFloat(task.taskLon))) {
                taskLat = parseFloat(task.taskLat);
                taskLon = parseFloat(task.taskLon);
            } else if (task.assetId && farmData[task.assetId] && !isNaN(parseFloat(farmData[task.assetId].lat)) && !isNaN(parseFloat(farmData[task.assetId].lon))) {
                taskLat = parseFloat(farmData[task.assetId].lat);
                taskLon = parseFloat(farmData[task.assetId].lon);
            }

            if (taskLat && taskLon) {
                const taskIcon = L.divIcon({
                    className: 'leaflet-div-icon task-map-marker',
                    html: '<span>T</span>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });
                const taskMarker = L.marker([taskLat, taskLon], { icon: taskIcon });
                taskMarker.bindPopup(`<b>Task: ${task.displayName}</b><br>Priority: ${task.priority}<br>${task.assetId ? `Asset: ${farmData[task.assetId]?.name || task.assetId}<br>` : ''}Due: ${task.dueDate ? formatDisplayDateTime(task.dueDate) : 'N/A'}<br><button class="text-blue-500 hover:underline text-xs p-1 mt-1 w-full text-center" onclick="openTaskActivityModal('${task.taskId}')">View Task & Log Activity</button>`);
                markersClusterGroup.addLayer(taskMarker);
                markersAddedCount++;
            }
        });
    } else {
         console.log("Skipping task markers. Task visibility:", assetTypeVisibility['Tasks'], "Task list length:", taskListData ? taskListData.length : 'undefined');
    }

    if (markersAddedCount === 0 && (Object.keys(farmData).length > 0 || (taskListData && taskListData.length > 0)) ) {
        console.warn("No markers added to map. Check data and/or filters.");
    }
}

/**
 * Creates and manages the map filter buttons.
 */
function populateAssetTypeFilterButtons() {
    if (!assetTypeFilterButtonsContainer ) return;
    assetTypeFilterButtonsContainer.innerHTML = '';
    assetTypeVisibility = {};

    const types = new Set();
    Object.values(farmData).forEach(asset => {
        types.add(asset.type || 'Other');
    });
    types.add('Tasks');
    types.add('All');

    Array.from(types).sort().forEach(type => {
        assetTypeVisibility[type] = true;
        const button = document.createElement('button');
        button.textContent = type;
        button.className = 'filter-button active';
        button.dataset.type = type;

        button.addEventListener('click', () => {
            if (type === 'All') {
                const activateAll = !assetTypeVisibility['All'];
                 Object.keys(assetTypeVisibility).forEach(key => assetTypeVisibility[key] = activateAll);
            } else {
                assetTypeVisibility[type] = !assetTypeVisibility[type];
                const allIndividualTypesActive = Object.keys(assetTypeVisibility)
                    .filter(k => k !== 'All')
                    .every(key => assetTypeVisibility[key]);
                assetTypeVisibility['All'] = allIndividualTypesActive;
            }
            updateFilterButtonStates();
            populateLeafletMapMarkers();
        });
        assetTypeFilterButtonsContainer.appendChild(button);
    });
    updateFilterButtonStates();
}

function updateFilterButtonStates() {
    const buttons = assetTypeFilterButtonsContainer.querySelectorAll('.filter-button');
    buttons.forEach(button => {
        const type = button.dataset.type;
        if (assetTypeVisibility[type]) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}


/**
 * Populates the paginated recent activity log.
 */
function populateRecentActivityLog() {
    if (!recentActivityContainer) {
        console.error("Recent activity container not found in DOM.");
        return;
    }
    recentActivityContainer.innerHTML = '';
    console.log("Populating recent activity. Total activities available:", allActivitiesList.length, "Current task list length:", taskListData.length);


    if (allActivitiesList.length === 0) {
        recentActivityContainer.innerHTML = '<p class="text-gray-500">No activities logged yet.</p>';
        updateRecentActivityPaginationControls(0);
        return;
    }

    const sortedActivities = [...allActivitiesList].sort((a, b) =>
        new Date(b.userActivityTimestamp || b.timestamp) - new Date(a.userActivityTimestamp || a.timestamp)
    );

    const totalPages = Math.ceil(sortedActivities.length / activitiesPerPage);
    const startIndex = (recentActivityCurrentPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    const activitiesToDisplay = sortedActivities.slice(startIndex, endIndex);


    if (activitiesToDisplay.length === 0 && recentActivityCurrentPage === 1) {
        recentActivityContainer.innerHTML = '<p class="text-gray-500">No activities logged yet.</p>';
    } else if (activitiesToDisplay.length === 0 && recentActivityCurrentPage > 1) {
         recentActivityContainer.innerHTML = '<p class="text-gray-500">No more activities to display.</p>';
    } else {
        activitiesToDisplay.forEach(activity => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'recent-activity-item p-4 border rounded-md bg-gray-50 shadow-sm';

            const activityDateToDisplay = activity.userActivityTimestamp || activity.timestamp;
            let imgHTML = '';
            if (activity.activityImageUrl) {
                imgHTML = `<img src="${activity.activityImageUrl}" alt="Activity Image" class="activity-image my-2"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                           <p class="text-red-500 text-sm hidden">Image load failed for ${activity.activityImageUrl}</p>`;
            }

            let contextName = "General Activity";
            let contextId = activity.activityId;
            let contextButton = '';

            if (activity.taskId) {
                const relatedTask = taskListData.find(t => t.taskId === activity.taskId);
                contextName = relatedTask ? `Task: ${relatedTask.displayName}` : `Task ID: ${activity.taskId}`;
                contextId = activity.taskId;
                contextButton = `<button class="text-blue-500 hover:underline text-xs mt-2" onclick="openTaskActivityModal('${activity.taskId}')">View Task & Activities</button>`;
            } else if (activity.assetId && farmData[activity.assetId]) {
                contextName = farmData[activity.assetId].name || activity.assetId;
                contextId = activity.assetId;
                contextButton = `<button class="text-blue-500 hover:underline text-xs mt-2" onclick="openAssetModal('${activity.assetId}')">View Asset & Full Log</button>`;
            }


            entryDiv.innerHTML = `
                <h4 class="font-semibold text-md">${contextName} <span class="text-xs text-gray-400">(${contextId})</span></h4>
                <p class="text-xs text-gray-500 mb-1">Activity Date: ${formatDisplayDateTime(activityDateToDisplay)}</p>
                ${imgHTML}
                <p class="text-sm whitespace-pre-wrap">${activity.noteText || "No note for this activity."}</p>
                ${contextButton}
            `;
            recentActivityContainer.appendChild(entryDiv);
        });
    }
    updateRecentActivityPaginationControls(totalPages);
}

function updateRecentActivityPaginationControls(totalPages) {
    if (!recentActivityPageInfo || !prevRecentActivityPage || !nextRecentActivityPage) return;

    recentActivityPageInfo.textContent = `Page ${recentActivityCurrentPage} of ${totalPages > 0 ? totalPages : 1}`;
    prevRecentActivityPage.disabled = recentActivityCurrentPage === 1;
    nextRecentActivityPage.disabled = recentActivityCurrentPage === totalPages || totalPages === 0;
}


function populateTaskAssetIdDropdown() {
     if (!newTaskAssetIdSelect) {
        console.warn("newTaskAssetIdSelect not found, cannot populate.");
        return;
    }
    if (Object.keys(farmData).length === 0) {
        console.log("Farm data not yet available for task asset dropdown.");
        return;
    }
    console.log("Populating task asset ID dropdown.");


    while (newTaskAssetIdSelect.options.length > 1) {
        newTaskAssetIdSelect.remove(1);
    }

    Object.keys(farmData).sort((a,b) => (farmData[a].name || a).localeCompare(farmData[b].name || b) ).forEach(assetId => {
        const asset = farmData[assetId];
        const option = document.createElement('option');
        option.value = asset.assetId;
        option.textContent = `${asset.name || 'Unnamed Asset'} (${asset.assetId})`;
        newTaskAssetIdSelect.appendChild(option);
    });
}

function populateTaskAssigneeFilter() {
    if (!taskAssigneeFilter || taskListData.length === 0) return;

    const assignees = new Set(taskListData.map(task => task.assignedTo).filter(Boolean));
    const selectedValue = taskAssigneeFilter.value;

    // Clear existing options except for "All Assignees"
    while (taskAssigneeFilter.options.length > 1) {
        taskAssigneeFilter.remove(1);
    }

    assignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee;
        option.textContent = assignee;
        taskAssigneeFilter.appendChild(option);
    });

    taskAssigneeFilter.value = selectedValue;
}

function openTaskLocationPickerModal() {
    if (!taskLocationModal) return;
    taskLocationModal.classList.add('active');

    if (!taskLocationPickerMap) {
        try {
            taskLocationPickerMap = L.map('taskLocationPickerMap').setView([20.740659, -155.987250], 19);
            L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '© Google',
                maxZoom: 22
            }).addTo(taskLocationPickerMap);

            taskLocationPickerMap.on('click', function(e) {
                if (temporaryTaskMarker) {
                    temporaryTaskMarker.setLatLng(e.latlng);
                } else {
                    temporaryTaskMarker = L.marker(e.latlng).addTo(taskLocationPickerMap);
                }
                temporaryTaskMarker.bindPopup(`Selected: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`).openPopup();
            });
        } catch (e) {
            console.error("Error initializing task location picker map:", e);
            taskLocationPickerMapElement.innerHTML = "Map failed to load.";
        }
    }
    setTimeout(() => taskLocationPickerMap.invalidateSize(), 10);
}

function closeTaskLocationPickerModal() {
    if (taskLocationModal) taskLocationModal.classList.remove('active');
}

function confirmTaskLocation() {
    if (temporaryTaskMarker) {
        const latLng = temporaryTaskMarker.getLatLng();
        newTaskLatInput.value = latLng.lat;
        newTaskLonInput.value = latLng.lng;
        taskLocationCoordsDisplay.textContent = `Lat: ${latLng.lat.toFixed(5)}, Lon: ${latLng.lng.toFixed(5)}`;
    }
    closeTaskLocationPickerModal();
}

function openAssetModal(assetId) {
    selectedAssetIdForModal = assetId;
    const asset = farmData[assetId];
    if (!asset || !assetInfoModal) return;

    modalAssetName.textContent = asset.name || "Asset Details";
    modalStaticAssetId.textContent = asset.assetId;
    modalStaticAssetName.textContent = asset.name;
    modalStaticAssetType.textContent = asset.type;
    modalStaticAssetDescription.textContent = asset.description || 'N/A';
    
    // Reset fields
    modalStaticAssetImageContainer.innerHTML = '';
    modalStaticAssetLastActivityDate.textContent = 'N/A';
    modalStaticAssetLatestNotes.textContent = 'No activities recorded yet.';

    // Populate with latest activity info
    const activities = assetActivities[assetId];
    if (activities && activities.length > 0) {
        const latestActivity = activities[activities.length - 1];
        modalStaticAssetLastActivityDate.textContent = formatDisplayDateTime(latestActivity.userActivityTimestamp || latestActivity.timestamp);
        modalStaticAssetLatestNotes.textContent = latestActivity.noteText || 'No note for this activity.';
        if (latestActivity.activityImageUrl) {
            modalStaticAssetImageContainer.innerHTML = `<img src="${latestActivity.activityImageUrl}" class="asset-image cursor-pointer" onclick="openImageZoomModal('${latestActivity.activityImageUrl}')">`;
        }
    }

    modalNewActivityDateTimeInput.value = formatDateTimeForInput(new Date().toISOString());
    modalNewActivityNoteInput.value = '';
    modalNewActivityImageFileInput.value = '';
    modalNewActivityImagePreview.classList.add('hidden');
    newActivitySelectedFile = null;

    displayModalActivityLog(assetId);
    assetInfoModal.classList.add('active');
}

function closeAssetModal() {
    if (assetInfoModal) assetInfoModal.classList.remove('active');
    selectedAssetIdForModal = null;
}

function displayModalActivityLog(assetIdToDisplay) {
    if (!modalLatestActivityDisplay) return;
    const activities = assetActivities[assetIdToDisplay] || [];
    if (activities.length === 0) {
        modalLatestActivityDisplay.innerHTML = '<p class="text-center text-gray-500">No activities found for this asset.</p>';
        return;
    }

    modalLatestActivityDisplay.innerHTML = '';
    // Display in reverse chronological order
    [...activities].reverse().forEach(activity => {
        const logEntry = document.createElement('div');
        logEntry.className = 'activity-log-entry';
        let imgHtml = activity.activityImageUrl ?
            `<img src="${activity.activityImageUrl}" class="activity-image cursor-pointer" onclick="openImageZoomModal('${activity.activityImageUrl}')">` : '';

        logEntry.innerHTML = `
            <p class="text-xs text-gray-500">${formatDisplayDateTime(activity.userActivityTimestamp || activity.timestamp)}</p>
            <p class="text-sm whitespace-pre-wrap">${activity.noteText || "No note."}</p>
            ${imgHtml}
        `;
        modalLatestActivityDisplay.appendChild(logEntry);
    });
}

async function saveModalActivity() {
    if (!selectedAssetIdForModal) {
        showUserMessage(errorBox, errorMessageText, "No asset selected.", false);
        return;
    }
    const note = modalNewActivityNoteInput.value.trim();
    if (!note) {
        showUserMessage(errorBox, errorMessageText, "Activity note cannot be empty.", false);
        return;
    }

    showLoading(true, "Saving Activity...");
    saveModalActivityButton.disabled = true;

    try {
        const payload = {
            action: 'logActivity',
            assetId: selectedAssetIdForModal,
            noteText: note,
            userActivityTimestamp: modalNewActivityDateTimeInput.value
        };

        if (newActivitySelectedFile) {
            payload.imageFile = newActivitySelectedFile.data.split(',')[1];
            payload.imageFileName = newActivitySelectedFile.name;
            payload.imageMimeType = newActivitySelectedFile.type;
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            showUserMessage(messageBox, successMessageText, "Activity logged successfully!", true);
            await loadActivitiesFromSheet();
            displayModalActivityLog(selectedAssetIdForModal);
            // Optionally, clear the form on success
            modalNewActivityNoteInput.value = '';
            modalNewActivityImageFileInput.value = '';
            modalNewActivityImagePreview.classList.add('hidden');
            newActivitySelectedFile = null;
        } else {
            throw new Error(result.message || 'Unknown error from server.');
        }
    } catch (error) {
        console.error("Error saving activity:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to save activity: ${getErrorMessage(error)}`, false);
    } finally {
        showLoading(false);
        saveModalActivityButton.disabled = false;
    }
}

function populateTasksDisplay() {
    if (!taskListContainer) return;
    taskListContainer.innerHTML = '';

    const showCompleted = showCompletedTasksToggle.checked;
    const assigneeFilter = taskAssigneeFilter.value;

    const filteredTasks = taskListData.filter(task => {
        const isCompleted = task.status === 'Completed';
        const assigneeMatch = !assigneeFilter || task.assignedTo === assigneeFilter;
        return (showCompleted || !isCompleted) && assigneeMatch;
    });

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = '<p class="text-gray-500">No tasks match the current filters.</p>';
        return;
    }

    // Sort by priority and then due date
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    filteredTasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });

    filteredTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        const isCompleted = task.status === 'Completed';
        taskDiv.className = `task-list-item p-3 border rounded-md ${isCompleted ? 'task-completed bg-gray-100' : 'bg-white hover:bg-gray-50'}`;
        taskDiv.dataset.taskId = task.taskId;
        taskDiv.addEventListener('click', () => openTaskActivityModal(task.taskId));

        taskDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="font-semibold">${task.displayName}</span>
                <span class="text-sm font-bold priority-${task.priority}">${task.priority}</span>
            </div>
            <p class="text-sm text-gray-600">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                <span>${task.assignedTo || 'Unassigned'}</span>
            </div>
        `;
        taskListContainer.appendChild(taskDiv);
    });
}


async function handleTaskCompletionChange(taskId, isChecked) {
    showLoading(true, `Updating task status...`);
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateTaskStatus',
                taskId: taskId,
                isCompleted: isChecked
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            showUserMessage(messageBox, successMessageText, 'Task status updated.', true);
            await loadTasksFromSheet(); // This re-fetches and re-populates
            // Re-open the modal if it was open, with updated info
            if(currentOpenTaskId) {
               openTaskActivityModal(currentOpenTaskId);
            }
        } else {
            throw new Error(result.message || 'Server responded with an error.');
        }
    } catch (error) {
        console.error("Error updating task status:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to update task: ${getErrorMessage(error)}`, false);
         // Revert checkbox on failure
        if(taskModalCompleteToggle) taskModalCompleteToggle.checked = !isChecked;
    } finally {
        showLoading(false);
    }
}


async function saveNewTask() {
    const taskName = newTaskNameInput.value.trim();
    if (!taskName) {
        showUserMessage(errorBox, errorMessageText, "Task name is required.", false);
        return;
    }

    showLoading(true, 'Saving new task...');
    saveTaskButton.disabled = true;

    try {
        const payload = {
            action: 'createTask',
            displayName: taskName,
            description: newTaskDescriptionInput.value.trim(),
            assignedTo: newTaskAssignedTo.value.trim(),
            dueDate: newTaskDueDateInput.value,
            assetId: newTaskAssetIdSelect.value,
            mapZone: newTaskMapZoneInput.value.trim(),
            taskLat: newTaskLatInput.value,
            taskLon: newTaskLonInput.value,
            priority: newTaskPriorityInput.value
        };

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            showUserMessage(messageBox, successMessageText, 'New task added successfully!', true);
            // Clear form
            document.getElementById('addTaskForm').reset();
            taskLocationCoordsDisplay.textContent = 'No location set';
            // Reload task data
            await loadTasksFromSheet();
        } else {
            throw new Error(result.message || 'Server responded with an error.');
        }
    } catch (error) {
        console.error("Error saving new task:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to save task: ${getErrorMessage(error)}`, false);
    } finally {
        showLoading(false);
        saveTaskButton.disabled = false;
    }
}

function openImageZoomModal(imageUrl) {
    if (!imageZoomModal || !zoomedImage) return;
    zoomedImage.src = imageUrl;
    imageZoomModal.classList.add('active');
}
function closeImageZoomModal() {
    if (imageZoomModal) imageZoomModal.classList.remove('active');
    if(zoomedImage) zoomedImage.src = "";
}

function openTaskActivityModal(taskId) {
    const task = taskListData.find(t => t.taskId === taskId);
    if (!task || !taskActivityModal) return;

    currentOpenTaskId = taskId;

    // Populate modal with task details
    taskModalTaskName.textContent = task.displayName;
    taskModalTaskId.textContent = task.taskId;
    taskModalDescription.textContent = task.description || 'N/A';
    taskModalDueDate.textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A';
    taskModalPriority.textContent = task.priority;
    taskModalRelatedAsset.textContent = task.assetId && farmData[task.assetId] ? `${farmData[task.assetId].name} (${task.assetId})` : task.assetId || 'None';
    taskModalLocation.textContent = task.taskLat && task.taskLon ? `Lat: ${parseFloat(task.taskLat).toFixed(4)}, Lon: ${parseFloat(task.taskLon).toFixed(4)}` : task.mapZone || 'N/A';
    taskModalStatus.textContent = task.status;
    taskModalCreatedDate.textContent = formatDisplayDateTime(task.timestamp);

    // Handle completion status
    const isCompleted = task.status === 'Completed';
    taskModalCompleteToggle.checked = isCompleted;
    if (isCompleted && task.completedDate) {
        taskModalCompletedDate.textContent = formatDisplayDateTime(task.completedDate);
        taskModalCompletedDateContainer.classList.remove('hidden');
    } else {
        taskModalCompletedDateContainer.classList.add('hidden');
    }
    // Remove old listener before adding a new one
    taskModalCompleteToggle.replaceWith(taskModalCompleteToggle.cloneNode(true));
    taskModalCompleteToggle = document.getElementById('taskModalCompleteToggle'); // Re-cache
    taskModalCompleteToggle.addEventListener('change', (e) => handleTaskCompletionChange(taskId, e.target.checked));


    // Reset activity form
    taskModalNewActivityDateTimeInput.value = formatDateTimeForInput(new Date().toISOString());
    taskModalNewActivityNoteInput.value = '';
    taskModalNewActivityImageFileInput.value = '';
    taskModalNewActivityImagePreview.classList.add('hidden');
    newTaskActivitySelectedFile = null;

    displayTaskSpecificActivityLog(taskId);
    taskActivityModal.classList.add('active');
}

function closeTaskActivityModal() {
    if (taskActivityModal) taskActivityModal.classList.remove('active');
    currentOpenTaskId = null;
}

function displayTaskSpecificActivityLog(taskId) {
    if (!taskSpecificActivityLogDisplay) return;

    const taskActivities = allActivitiesList.filter(act => act.taskId === taskId);

    if (taskActivities.length === 0) {
        taskSpecificActivityLogDisplay.innerHTML = '<p class="text-center text-gray-500">No activities found for this task.</p>';
        return;
    }

    taskSpecificActivityLogDisplay.innerHTML = '';
    [...taskActivities].reverse().forEach(activity => {
        const logEntry = document.createElement('div');
        logEntry.className = 'activity-log-entry';
        let imgHtml = activity.activityImageUrl ?
            `<img src="${activity.activityImageUrl}" class="activity-image cursor-pointer" onclick="openImageZoomModal('${activity.activityImageUrl}')">` : '';

        logEntry.innerHTML = `
            <p class="text-xs text-gray-500">${formatDisplayDateTime(activity.userActivityTimestamp || activity.timestamp)}</p>
            <p class="text-sm whitespace-pre-wrap">${activity.noteText || "No note."}</p>
            ${imgHtml}
        `;
        taskSpecificActivityLogDisplay.appendChild(logEntry);
    });
}

async function saveTaskActivity() {
    if (!currentOpenTaskId) {
        showUserMessage(errorBox, errorMessageText, "No task selected.", false);
        return;
    }
    const note = taskModalNewActivityNoteInput.value.trim();
    if (!note) {
        showUserMessage(errorBox, errorMessageText, "Activity note cannot be empty.", false);
        return;
    }

    showLoading(true, "Saving Task Activity...");
    saveTaskSpecificActivityButton.disabled = true;

    try {
        const task = taskListData.find(t => t.taskId === currentOpenTaskId);
        const payload = {
            action: 'logActivity',
            taskId: currentOpenTaskId,
            assetId: task.assetId || '', // Include related assetId if it exists
            noteText: note,
            userActivityTimestamp: taskModalNewActivityDateTimeInput.value
        };

        if (newTaskActivitySelectedFile) {
            payload.imageFile = newTaskActivitySelectedFile.data.split(',')[1];
            payload.imageFileName = newTaskActivitySelectedFile.name;
            payload.imageMimeType = newTaskActivitySelectedFile.type;
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            showUserMessage(messageBox, successMessageText, "Activity logged for task successfully!", true);
            await loadActivitiesFromSheet();
            displayTaskSpecificActivityLog(currentOpenTaskId);
            // Clear form
            taskModalNewActivityNoteInput.value = '';
            taskModalNewActivityImageFileInput.value = '';
            taskModalNewActivityImagePreview.classList.add('hidden');
            newTaskActivitySelectedFile = null;
        } else {
            throw new Error(result.message || 'Unknown error from server.');
        }
    } catch (error) {
        console.error("Error saving task activity:", error);
        showUserMessage(errorBox, errorMessageText, `Failed to save task activity: ${getErrorMessage(error)}`, false);
    } finally {
        showLoading(false);
        saveTaskSpecificActivityButton.disabled = false;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();

    // Setup Tab Listeners
    document.getElementById('dashboardTabButton').addEventListener('click', (e) => openTab(e, 'dashboardTab'));
    document.getElementById('recentActivityTabButton').addEventListener('click', (e) => openTab(e, 'recentActivityTab'));
    document.getElementById('tasksTabButton').addEventListener('click', (e) => openTab(e, 'tasksTab'));
    document.getElementById('aboutTabButton').addEventListener('click', (e) => openTab(e, 'aboutTab'));

    // Setup Modal Close Listeners
    document.getElementById('closeAssetModalButton').addEventListener('click', closeAssetModal);
    document.getElementById('closeTaskActivityModalButton').addEventListener('click', closeTaskActivityModal);
    document.getElementById('imageZoomModal').addEventListener('click', closeImageZoomModal);
    document.getElementById('closeTaskLocationPickerModalButton').addEventListener('click', closeTaskLocationPickerModal);
    document.getElementById('confirmTaskLocationButton').addEventListener('click', confirmTaskLocation);

    // Setup Form Button Listeners
    saveModalActivityButton.addEventListener('click', saveModalActivity);
    saveTaskSpecificActivityButton.addEventListener('click', saveTaskActivity);
    saveTaskButton.addEventListener('click', saveNewTask);
    document.getElementById('setTaskLocationButton').addEventListener('click', openTaskLocationPickerModal);
    document.getElementById('aboutPageMapImage').addEventListener('click', () => openImageZoomModal(document.getElementById('aboutPageMapImage').src));


    // Setup Filter/Change Listeners
    if(showCompletedTasksToggle) {
        showCompletedTasksToggle.addEventListener('change', populateTasksDisplay);
    }
    if(taskAssigneeFilter) {
        taskAssigneeFilter.addEventListener('change', populateTasksDisplay);
    }

    // Setup File Input Listeners
    if (modalNewActivityImageFileInput) {
        modalNewActivityImageFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newActivitySelectedFile = {
                        name: file.name,
                        type: file.type,
                        data: e.target.result
                    };
                    if(modalNewActivityImagePreview) {
                        modalNewActivityImagePreview.src = e.target.result;
                        modalNewActivityImagePreview.classList.remove('hidden');
                    }
                }
                reader.readAsDataURL(file);
            } else {
                newActivitySelectedFile = null;
                 if(modalNewActivityImagePreview) {
                    modalNewActivityImagePreview.src = "#";
                    modalNewActivityImagePreview.classList.add('hidden');
                }
            }
        });
    }
    if (taskModalNewActivityImageFileInput) {
        taskModalNewActivityImageFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newTaskActivitySelectedFile = {
                        name: file.name,
                        type: file.type,
                        data: e.target.result
                    };
                    if(taskModalNewActivityImagePreview) {
                        taskModalNewActivityImagePreview.src = e.target.result;
                        taskModalNewActivityImagePreview.classList.remove('hidden');
                    }
                }
                reader.readAsDataURL(file);
            } else {
                newTaskActivitySelectedFile = null;
                 if(taskModalNewActivityImagePreview) {
                    taskModalNewActivityImagePreview.src = "#";
                    taskModalNewActivityImagePreview.classList.add('hidden');
                }
            }
        });
    }

    // Setup Pagination Listeners
     if (prevRecentActivityPage && nextRecentActivityPage) {
        prevRecentActivityPage.addEventListener('click', () => {
            if (recentActivityCurrentPage > 1) {
                recentActivityCurrentPage--;
                populateRecentActivityLog();
            }
        });
        nextRecentActivityPage.addEventListener('click', () => {
            const totalPages = Math.ceil(allActivitiesList.length / activitiesPerPage);
            if (recentActivityCurrentPage < totalPages) {
                recentActivityCurrentPage++;
                populateRecentActivityLog();
            }
        });
    }

    // Initial Data Load
    loadInitialData();
});
