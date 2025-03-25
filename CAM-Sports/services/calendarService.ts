import axios from 'axios';

import { BACKEND_URL } from '@/globalVariables';


// ------------------------------
// Calendar Services
// ------------------------------

// IMPORTENT NOTE: WHEN CREATING A USER WITH TYPE COACH OR SOMETHING CREATE A CALENDAR FOR IT
// const data = {
//     "summary": "Team Calendar 1"
// }
const createCalendar = async (data: JSON) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/calendar/create_team_calendar`, data);
        if (response.data.status === 'success') {
            return response.data.calendar;
        }
    } catch (error) {
        console.log('Something went wrong with creating the calendar: ' + error);
    }
};

const getCalendarByID = async (calendar_id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/calendar/get_team_calendar?calendar_id=${calendar_id}`);
        if (response.data.status === 'success') {
            return response.data.calendar;
        }
    } catch (error) {
        console.log('Something went wrong with getting the calendar: ' + error);
    }
};

const listCalendars = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/calendar/list_team_calendars`);
        if (response.data.status === 'success') {
            return response.data.calendars;
        }
    } catch (error) {
        console.log('Something went wrong with listing the calendars: ' + error);
    }
};

const deleteCalendar = async (calendar_id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/calendar/delete_team_calendar`, {
            data: { calendar_id }
        });
        return response.data;
    } catch (error) {
        console.log('Something went wrong with deleting the calendar: ' + error);
    }
};

// ADD this to new user that added a team.

// Share a calendar with a user
const shareCalendar = async (
    calendar_id: string, 
    email: string, 
    role: string = "reader"
) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/calendar/share_calendar`, {
        calendar_id,
        email,
        role
      });
      return response.data;
    } catch (error) {
      console.log('Something went wrong with sharing the calendar: ' + error);
    }
};


// ------------------------------
// Events Services
// ------------------------------

// Create an event for a given calendar
const createEvent = async (data: any) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/events/create`, data);
        if (response.data.status === 'success') {
            return response.data.event;
        }
    } catch (error) {
        console.log('Something went wrong with creating the event: ' + error);
    }
};

// Get a specific event by calendar_id and event_id
const getEvent = async (calendar_id: string, event_id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/events/get?calendar_id=${calendar_id}&event_id=${event_id}`);
        if (response.data.status === 'success') {
            return response.data.event;
        }
    } catch (error) {
        console.log('Something went wrong with getting the event: ' + error);
    }
};

// List all events for a given calendar
const listEvents = async (calendar_id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/events/list?calendar_id=${calendar_id}`);
        if (response.data.status === 'success') {
            return response.data.events;
        }
    } catch (error) {
        console.log('Something went wrong with listing the events: ' + error);
    }
};

// Update an event (pass calendar_id, event_id, and the fields to update)
const updateEvent = async (data: any) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/events/update`, data);
        if (response.data.status === 'success') {
            return response.data.event;
        }
    } catch (error) {
        console.log('Something went wrong with updating the event: ' + error);
    }
};

// Delete an event given calendar_id and event_id
const deleteEvent = async (calendar_id: string, event_id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/events/delete`, {
            data: { calendar_id, event_id }
        });
        return response.data;
    } catch (error) {
        console.log('Something went wrong with deleting the event: ' + error);
    }
};

  
// ------------------------------
// RSVP Services
// ------------------------------

const rsvpEvent = async (
    calendar_id: string, 
    event_id: string, 
    email: string, 
    status: string = "accepted"
  ) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/events/rsvp`, {
        calendar_id,
        event_id,
        email,
        status
      });
      return response.data;
    } catch (error) {
      console.log('Something went wrong with RSVP event: ' + error);
    }
};

const showAttendance = async (calendar_id: string, event_id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/events/attendance?calendar_id=${calendar_id}&event_id=${event_id}`);
        return response.data;
    } catch (error) {
        console.log('Something went wrong with showing attendance: ' + error);
    }
};

const removeRSVP = async (calendar_id: string, event_id: string, email: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/events/remove_rsvp`, {
        data: { calendar_id, event_id, email }
        });
        return response.data;
    } catch (error) {
        console.log('Something went wrong with removing RSVP: ' + error);
    }
};
  


export {
    createCalendar,
    getCalendarByID,
    listCalendars,
    deleteCalendar,
    shareCalendar,
    createEvent,
    getEvent,
    listEvents,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    showAttendance,
    removeRSVP 
};
