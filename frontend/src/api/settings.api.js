import axios from './axios';

const API_URL = '/api/settings';

const settingsApi = {
  getSettings: () => axios.get(API_URL),
  updateSetting: (key, value) => axios.put(`${API_URL}/${key}`, { settingValue: value })
};

export default settingsApi;
