import { GoogleCalendarService } from '../services/googleCalendar';

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;

  beforeEach(() => {
    service = new GoogleCalendarService();
  });

  test('should throw error when fetching without access token', async () => {
    await expect(service.getEvents()).rejects.toThrow('Access token not set');
  });

  test('should set access token', () => {
    expect(() => service.setAccessToken('test-token')).not.toThrow();
  });
});
