import { supabaseClient } from "../supabase.js";
import { showAlert, hideAlert} from "../alerts.js";
import { state } from "../core/state.js";
import { loadDashboard } from "../views/user/dashboard.js";
import { clearDate, formatDate } from "../utilities/date.js";
import { dom } from "../dom/dom.js";

export async function submitHours(user) {

    const entryDate = clearDate(state.dashboard.selectedDate);
    const { error } = await supabaseClient
        .from("Hours")
        .insert([{
            worker_id: user.id,
            date: entryDate,
            hours: state.dashboard.selectedHours,
            entry_type: "work"
        }]);

    if (error) {
        console.error(error);
        // fallback jak UNIQUE constraint zadziała
        showAlert({
          message: "Już wpisałeś godziny w ten dzień",
          type: "danger",
          timeout: 5000
        });
        return;
    }
    else {
      const alertDate = clearDate(state.dashboard.selectedDate);
      showAlert({
          message: `Wpisano ${state.dashboard.selectedHours} godzin, w dzień ${formatDate(alertDate)}`,
          type: "success",
          timeout: 4000
        });
    }
}

export async function removeHours(user) {

    const entryDate = clearDate(state.dashboard.selectedDate);
    const { error } = await supabaseClient
        .from("Hours")
        .delete()
        .eq("worker_id", user.id)
        .eq("date", entryDate);

    if (error) {
        console.error(error);
        // fallback jak UNIQUE constraint zadziała
        showAlert({
          message: "Coś poszło nie tak",
          type: "danger",
          timeout: 5000
        });
        return;
    }
    else {
      const alertDate = clearDate(state.dashboard.selectedDate);
      showAlert({
          message: `Usunięto wpis z dnia ${formatDate(alertDate)}`,
          type: "success",
          timeout: 4000
        });
    }
}

export async function getEntriesForMonth(userId, year, month) {

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const { data, error } = await supabaseClient
        .from("Hours")
        .select("*")
        .eq("worker_id", userId)
        .gte("date", clearDate(start))
        .lt("date", clearDate(end))
        .order("date", { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

export async function getMonthlyHoursSum(user){
  
    const { data, error } = await supabaseClient
        .rpc("get_month_summary", { uid: user.id });
    if (error) {
        console.error(error);
        return [];
    }
    return data;
}