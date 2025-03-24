import axios from 'axios';

import { BACKEND_URL } from '@/globalVariables';

// IMPORTENT NOTE: WHEN CREATING A USER WITH TYPE COACH OR SOMETHING CREATE A CALENDAR FOR IT
// const data = {
//     "summary": "Team Calendar 1"
// }
const createCalendar = async (data: JSON) => {
    try {

        const response = await axios.post(`${BACKEND_URL}/calendar/create_team_calendar`, data);

        if(response.data.status === 'success') {
            return response.data.calander;
        }
        
    } catch (error) {
        console.log('Something went wrong with creating the calendar: ' + error);
    }
};

const getCalendarByID = async (calendar_id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/calendar/get_team_calendar?calendar_id=${calendar_id}`);

        if(response.data.status === 'success') {
            return response.data.calendar;
        }
    } catch (error) {
        console.log('Something went wrong with getting the calendar: ' + error);
    }
};

const listCalendars = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/calendar/list_team_calendars`);

        if(response.data.status === 'success') {
            return response.data.calendars;
        }
    } catch (error) {
        console.log('Something went wrong with listing the calendars: ' + error);
    }
};

const deleteCalendar = async (calendar_id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/calendar/delete_team_calendar`, {
            data: {
                calendar_id: calendar_id
            }
        });
        
        return response.data;

    } catch (error) {
        console.log('Something went wrong with deleting the calendar: ' + error);
    }
};


export { 
    createCalendar,
    getCalendarByID,
    listCalendars,
    deleteCalendar
}; 