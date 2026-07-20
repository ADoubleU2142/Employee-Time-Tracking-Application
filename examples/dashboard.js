import { dom } from "../../dom/dom.js";
import { state } from "../../core/state.js";
import { loadView } from "../../ui.js";
import { loadSummaryYear } from "./summary.js";
import { renderCalendar } from "../../components/calendar.js";
import { showAlert, hideAlert, showConfirm } from "../../alerts.js";
import { changeMonth, clearDate, formatDate, nameDate } from "../../utilities/date.js";
import { submitHours, removeHours, getEntriesForMonth } from "../../services/entryService.js";
import { renderHourPicker } from "../../components/hourPicker.js";
import { getEntryClass, getEntryText, clearEntryClasses } from "../../utilities/entryUtilities.js";

export async function loadDashboard() {

    await loadMonthEntries();

    await renderHourPicker();

    renderGreeting();

    renderEntry();

    renderMonthSum();

    await renderCalendar(state.dashboard.selectedDate);
}

async function loadMonthEntries(){

    state.dashboard.monthEntries = await getEntriesForMonth(state.user.id,state.dashboard.selectedDate.getFullYear(),state.dashboard.selectedDate.getMonth() + 1);
    state.dashboard.monthEntriesMap = Object.fromEntries(
    state.dashboard.monthEntries.map(hours => [hours.date, hours]));
}

export function renderGreeting(){

    dom.common.greeting.textContent = `Witaj, ${state.user.name}!`;
    dom.common.todayDate.textContent = state.currentDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"});
}

function renderMonthSum(){

    const month = state.dashboard.selectedDate.getMonth();
    const year = state.dashboard.selectedDate.getFullYear();
    state.dashboard.monthTotal = 0;

    state.dashboard.monthEntries.forEach(row => {
        const d = new Date(row.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
            state.dashboard.monthTotal += Number(row.hours);
        }
    });

    const monthDisplay = state.dashboard.selectedDate.toLocaleDateString("pl-PL", {month: "long",});

    dom.user.dashboard.monthTitle.textContent = `${monthDisplay} (${state.dashboard.monthTotal} h)`;
}

function renderEntry(){

    clearEntryClasses(dom.user.dashboard.selectedEntryBox);

    const entry = state.dashboard.monthEntriesMap[clearDate(state.dashboard.selectedDate)];

    renderSelectedDate();

    if(entry){
        renderExistingEntry(entry);
    }
    else{
        renderEmptyEntry();
    }
}

function renderSelectedDate(){

    dom.user.dashboard.selectedDate.textContent = `${nameDate(state.dashboard.selectedDate)} ${formatDate(state.dashboard.selectedDate)}`;
}

function renderExistingEntry(entry){

    dom.user.dashboard.selectedEntryBox.classList.add("selected-entry");
    dom.user.dashboard.selectedEntryBox.classList.add(getEntryClass(entry.entry_type));
    dom.user.dashboard.selectedEntry.textContent = getEntryText(entry);

    setDeleteButton(entry);
    disableAddHours();
}

function renderEmptyEntry(){

    dom.user.dashboard.selectedEntry.textContent = "Brak wpisu.";
    dom.user.dashboard.selectedEntryBox.classList.remove("selected-entry");
    dom.user.dashboard.deleteHoursButton.disabled = true;
    dom.user.dashboard.deleteHoursButton.classList.add("d-none");

    const isFuture = clearDate(state.dashboard.selectedDate) > clearDate(state.currentDate);

    if(isFuture){
        disableFutureEntry();
    }
    else{
        enableAddHours();
    }
}

function disableFutureEntry(){

    dom.user.dashboard.addHoursButton.textContent = "Nie można dodać godzin przyszłości";
    dom.user.dashboard.addHoursButton.disabled = true;
    dom.user.dashboard.addHoursButton.className = "btn btn-light btn-lg w-100 text-primary";
    dom.user.dashboard.hoursList.classList.add("d-none");
}

function setDeleteButton(entry){

    if(entry.entry_type === "work"){
        dom.user.dashboard.deleteHoursButton.disabled = false;
        dom.user.dashboard.deleteHoursButton.classList.remove("d-none");
    }
    else{
        dom.user.dashboard.deleteHoursButton.disabled = true;
        dom.user.dashboard.deleteHoursButton.classList.add("d-none");
    }
}

function disableAddHours(){

    dom.user.dashboard.addHoursButton.textContent = "Wpis już dodany.";
    dom.user.dashboard.addHoursButton.disabled = true;
    dom.user.dashboard.addHoursButton.className = "btn btn-light btn-lg w-100 text-primary";
    dom.user.dashboard.hoursList.classList.add("d-none");
}

function enableAddHours(){

    dom.user.dashboard.addHoursButton.textContent = `Dodaj ${state.dashboard.selectedHours} • ${formatDate(state.dashboard.selectedDate)}`;
    dom.user.dashboard.addHoursButton.disabled = false;
    dom.user.dashboard.addHoursButton.className = "btn btn-primary btn-lg w-100";
    dom.user.dashboard.hoursList.classList.remove("d-none");
}

export async function showSummaryYear(){

    state.summary.year = state.currentDate.getFullYear();

    await loadView("user/userSummary", false);
    await loadSummaryYear(state.user);
}

export async function changeDashboardMonth(dir){

    state.dashboard.selectedDate = changeMonth(state.dashboard.selectedDate, dir);

    await loadDashboard();
}

// Submitting Hours
export async function addHours(){

    await submitHours(state.user);
    await loadView("user/userDashboard", false);
    await loadDashboard();
};

// Deleting
export async function deleteHours(){
    
    if (await showConfirm("Usuwanie wpisu", `Czy usunąć wpis z dnia ${formatDate(state.dashboard.selectedDate)}`)){
        await removeHours(state.user);
        await loadView("user/userDashboard", false);
        await loadDashboard();
    }
};
