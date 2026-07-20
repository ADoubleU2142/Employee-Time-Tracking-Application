import { state } from "../core/state.js";
import { clearDate } from "../utilities/date.js";
import { loadDashboard } from "../views/user/dashboard.js";
import { dom } from "../dom/dom.js";
import { getEntryClass } from "../utilities/entryUtilities.js";

export async function renderCalendar(date) {

    const weekDays = ["Pn","Wt","Śr","Cz","Pt","So","Nd"];
    const root = dom.user.dashboard.calendar;

    root.innerHTML = "";

    const header = document.createElement("div");
    header.className = "calendar-grid header";
    const body = document.createElement("div");
    body.className = "calendar-grid";

    // HEADER
    weekDays.forEach(day=>{
        const el = document.createElement("div");
        el.textContent = day;
        header.appendChild(el);
    });

    // BODY
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = clearDate(state.currentDate);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;

    for(let i=0;i<startDay;i++){
        body.appendChild(document.createElement("div"));
    }

    for(let d=1; d<=lastDay.getDate(); d++){
        const dayDate = new Date(year, month, d);
        const day = clearDate(dayDate);
        const el = document.createElement("div");
        el.className = "day";
        el.textContent = d;

        if(day > today){
            el.classList.add("future");
        }

        if (clearDate(state.dashboard.selectedDate) === clearDate(dayDate)) {
        el.classList.add("selected");
        }

        const entry = state.dashboard.monthEntriesMap[clearDate(dayDate)];
        if (entry) {
        el.classList.add(getEntryClass(entry.entry_type));
        }

        el.addEventListener("click", () => {
        state.dashboard.selectedDate = dayDate;
        loadDashboard();
        });

        body.appendChild(el);
    }

    root.appendChild(header);
    root.appendChild(body);
    }