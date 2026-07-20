export const state = {
    currentDate: null,                // Dzisiejsza data

    user: null,

    dashboard: {
        selectedDate: null,             // Wybrana data w panelu dodawania godzin
        selectedHours: null,            // Wybrane godziny
        monthEntries: null,             // Dane w wybranym miesiącu
        monthEntriesMap: null,          // Mapa danych
        monthTotal: null                // Suma miesiąca
    },

    summary: {
        year: null,                     // Wybrany rok w panelu podsumowania
        yearData: null,                 // Dane w wybranym roku
        yearTotal: null,                // Suma godzin w roku
        month: null,                    // Aktualnie oglądany miesiąc
        monthEntries: null              // Dane w wybranym miesiącu podsumowania
    }
};